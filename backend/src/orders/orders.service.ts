import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConnectionPool, Decimal, Int, NVarChar, Transaction } from 'mssql';
import { DATABASE_POOL } from '../db/db.module';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpsertOrderDto } from './dto/upsert-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { NotificationsService } from '../notifications/notifications.service';

type OrderRow = {
    Id: number;
    TableId: number | null;
    TableName?: string | null;
    CreatedByUserId?: number | null;
    CreatedByName?: string | null;
    ItemCount?: number;
    Status: string;
    Total: number;
    CreatedAt: Date;
};

type OrderItemRow = {
    Id: number;
    MenuItemId: number;
    Name: string;
    Qty: number;
    Price: number;
};

@Injectable()
export class OrdersService {
    constructor(
        @Inject(DATABASE_POOL) private readonly pool: ConnectionPool,
        private readonly notificationsService: NotificationsService,
    ) {}

    private orderTablesReady: boolean | null = null;

    private async ensureOrderTables() {
        if (this.orderTablesReady) return true;
        try {
            await this.pool.request().query(`
                IF OBJECT_ID('dbo.OrderTables', 'U') IS NULL
                BEGIN
                    CREATE TABLE OrderTables (
                        OrderId INT NOT NULL,
                        TableId INT NOT NULL,
                        PRIMARY KEY (OrderId, TableId),
                        FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
                        FOREIGN KEY (TableId) REFERENCES DiningTables(Id)
                    );
                END
            `);
            this.orderTablesReady = true;
            return true;
        } catch {
            this.orderTablesReady = false;
            return false;
        }
    }

    async getAll() {
        const orderTablesAvailable = await this.ensureOrderTables();
        if (orderTablesAvailable) {
            try {
                const res = await this.pool.request().query(`
                    WITH TableAgg AS (
                        SELECT
                            ot.OrderId,
                            STRING_AGG(CAST(ot.TableId as nvarchar(20)), ',') as TableIds,
                            STRING_AGG(
                                COALESCE(
                                    t2.Name,
                                    CASE WHEN t2.TableNo IS NOT NULL THEN CONCAT('Bàn ', t2.TableNo) END,
                                    CONCAT('Bàn ', t2.Id)
                                ),
                                ', '
                            ) as TableNames
                        FROM OrderTables ot
                        LEFT JOIN DiningTables t2 ON t2.Id = ot.TableId
                        GROUP BY ot.OrderId
                    )
                    SELECT
                        o.Id,
                        o.TableId,
                        t.Name as TableName,
                        o.CreatedByUserId,
                        u.FullName as CreatedByName,
                        o.Status,
                        o.Total,
                        o.CreatedAt,
                        COUNT(oi.Id) as ItemCount,
                        ta.TableIds,
                        ta.TableNames
                    FROM Orders o
                    LEFT JOIN TableAgg ta ON ta.OrderId = o.Id
                    LEFT JOIN DiningTables t ON t.Id = o.TableId
                    LEFT JOIN Users u ON u.Id = o.CreatedByUserId
                    LEFT JOIN OrderItems oi ON oi.OrderId = o.Id
                    GROUP BY
                        o.Id,
                        o.TableId,
                        t.Name,
                        o.CreatedByUserId,
                        u.FullName,
                        o.Status,
                        o.Total,
                        o.CreatedAt,
                        ta.TableIds,
                        ta.TableNames
                    ORDER BY o.Id DESC
                `);
                return res.recordset;
            } catch {
                // fallback below
            }
        }
        const res = await this.pool
            .request()
            .query(
                'SELECT o.Id, o.TableId, t.Name as TableName, o.CreatedByUserId, u.FullName as CreatedByName, \
                        o.Status, o.Total, o.CreatedAt, COUNT(oi.Id) as ItemCount \
                 FROM Orders o \
                 LEFT JOIN DiningTables t ON t.Id = o.TableId \
                 LEFT JOIN Users u ON u.Id = o.CreatedByUserId \
                 LEFT JOIN OrderItems oi ON oi.OrderId = o.Id \
                 GROUP BY o.Id, o.TableId, t.Name, o.CreatedByUserId, u.FullName, o.Status, o.Total, o.CreatedAt \
                 ORDER BY o.Id DESC',
            );
        return res.recordset;
    }

    async create(data: CreateOrderDto) {
        const orderTablesAvailable = await this.ensureOrderTables();
        const tx = new Transaction(this.pool);
        await tx.begin();

        try {
            const orderRes = await tx
                .request()
                .input('TableId', Int, data.tableId)
                .input('CreatedByUserId', Int, data.createdByUserId ?? null)
                .query('INSERT INTO Orders (TableId, CreatedByUserId) \
                    OUTPUT INSERTED.Id VALUES (@TableId, @CreatedByUserId)');

            const orderId = orderRes.recordset[0]?.Id as number;

            if (orderTablesAvailable) {
                await tx
                    .request()
                    .input('OrderId', Int, orderId)
                    .input('TableId', Int, data.tableId)
                    .query('INSERT INTO OrderTables (OrderId, TableId) VALUES (@OrderId, @TableId)');
            }
            let total = 0;

            for (const itemId of data.itemIds) {
                const itemRes = await tx
                    .request()
                    .input('MenuItemId', Int, itemId)
                    .query('SELECT Price FROM MenuItems WHERE Id = @MenuItemId');

                if (itemRes.recordset.length === 0) {
                    continue;
                }

                const price = itemRes.recordset[0].Price as number;
                total += price;

                await tx
                    .request()
                    .input('OrderId', Int, orderId)
                    .input('MenuItemId', Int, itemId)
                    .input('Qty', Int, 1)
                    .input('Price', Decimal(18, 2), price)
                    .query(
                        'INSERT INTO OrderItems (OrderId, MenuItemId, Qty, Price) \
                         VALUES (@OrderId, @MenuItemId, @Qty, @Price)',
                    );
            }

            await tx
                .request()
                .input('Total', Decimal(18, 2), total)
                .input('OrderId', Int, orderId)
                .query('UPDATE Orders SET Total = @Total WHERE Id = @OrderId');

            await tx
                .request()
                .input('TableId', Int, data.tableId)
                .input('Status', NVarChar, 'dine in')
                .query('UPDATE DiningTables SET Status = @Status WHERE Id = @TableId');

            await tx.commit();
            this.notificationsService.emit({
                id: `order-created-${orderId}-${Date.now()}`,
                type: 'order_created',
                orderId,
                total,
                tableIds: [data.tableId],
                createdAt: new Date().toISOString(),
            });
            return { ok: true, id: orderId, total };
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    }

    async upsert(data: UpsertOrderDto) {
        const orderTablesAvailable = await this.ensureOrderTables();
        const tx = new Transaction(this.pool);
        await tx.begin();

        try {
            const rawTableIds = [
                data.tableId,
                ...(Array.isArray(data.tableIds) ? data.tableIds : []),
            ]
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id) && id > 0);

            const tableIds = Array.from(new Set(rawTableIds));
            tableIds.sort((a, b) => a - b);
            if (!tableIds.length) {
                throw new Error('Thiếu thông tin bàn.');
            }
            const primaryTableId = tableIds[0];

            const tableIdParams = tableIds.map((_, idx) => `@TableId${idx}`).join(', ');

            let existingId: number | null = null;

            if (orderTablesAvailable) {
                const existingReq = tx.request().input('CompletedStatus', NVarChar, 'completed');
                tableIds.forEach((id, idx) => {
                    existingReq.input(`TableId${idx}`, Int, id);
                });

                const existingRes = await existingReq.query<{ Id: number }>(
                    `SELECT TOP 1 o.Id FROM Orders o \
                     JOIN OrderTables ot ON ot.OrderId = o.Id \
                     WHERE ot.TableId IN (${tableIdParams}) AND o.Status <> @CompletedStatus \
                     ORDER BY o.Id DESC`,
                );
                existingId = (existingRes.recordset[0]?.Id as number | undefined) ?? null;
            }

            if (!existingId) {
                const existingReq = tx.request().input('CompletedStatus', NVarChar, 'completed');
                tableIds.forEach((id, idx) => {
                    existingReq.input(`TableId${idx}`, Int, id);
                });

                const existingRes = await existingReq.query<{ Id: number }>(
                    `SELECT TOP 1 Id FROM Orders WHERE TableId IN (${tableIdParams}) AND Status <> @CompletedStatus ORDER BY Id DESC`,
                );
                existingId = (existingRes.recordset[0]?.Id as number | undefined) ?? null;
            }

            let orderId: number;
            let mode: 'create' | 'update';

            if (!existingId) {
                mode = 'create';
                const orderRes = await tx
                    .request()
                    .input('TableId', Int, primaryTableId)
                    .input('CreatedByUserId', Int, data.createdByUserId ?? null)
                    .query(
                        'INSERT INTO Orders (TableId, CreatedByUserId) OUTPUT INSERTED.Id VALUES (@TableId, @CreatedByUserId)',
                    );

                orderId = orderRes.recordset[0]?.Id as number;
            } else {
                mode = 'update';
                orderId = existingId;

                if (data.createdByUserId) {
                    await tx
                        .request()
                        .input('OrderId', Int, orderId)
                        .input('CreatedByUserId', Int, data.createdByUserId)
                        .query(
                            'UPDATE Orders SET CreatedByUserId = COALESCE(CreatedByUserId, @CreatedByUserId) WHERE Id = @OrderId',
                        );
                }
            }

            if (orderTablesAvailable) {
                for (const tableId of tableIds) {
                    await tx
                        .request()
                        .input('OrderId', Int, orderId)
                        .input('TableId', Int, tableId)
                        .query(
                            'IF NOT EXISTS (SELECT 1 FROM OrderTables WHERE OrderId = @OrderId AND TableId = @TableId) \
                             INSERT INTO OrderTables (OrderId, TableId) VALUES (@OrderId, @TableId)',
                        );
                }
            }

            for (const item of data.items) {
                const itemRes = await tx
                    .request()
                    .input('MenuItemId', Int, item.menuItemId)
                    .query('SELECT Price FROM MenuItems WHERE Id = @MenuItemId');

                if (itemRes.recordset.length === 0) {
                    continue;
                }

                const price = itemRes.recordset[0].Price as number;

                const existingItemRes = await tx
                    .request()
                    .input('OrderId', Int, orderId)
                    .input('MenuItemId', Int, item.menuItemId)
                    .query<{ Id: number }>(
                        'SELECT TOP 1 Id FROM OrderItems WHERE OrderId = @OrderId AND MenuItemId = @MenuItemId ORDER BY Id',
                    );

                const existingOrderItemId = (existingItemRes.recordset[0]?.Id as number | undefined) ?? null;

                if (existingOrderItemId) {
                    await tx
                        .request()
                        .input('Id', Int, existingOrderItemId)
                        .input('Qty', Int, item.qty)
                        .query('UPDATE OrderItems SET Qty = Qty + @Qty WHERE Id = @Id');
                } else {
                    await tx
                        .request()
                        .input('OrderId', Int, orderId)
                        .input('MenuItemId', Int, item.menuItemId)
                        .input('Qty', Int, item.qty)
                        .input('Price', Decimal(18, 2), price)
                        .query(
                            'INSERT INTO OrderItems (OrderId, MenuItemId, Qty, Price) VALUES (@OrderId, @MenuItemId, @Qty, @Price)',
                        );
                }
            }

            const totalRes = await tx
                .request()
                .input('OrderId', Int, orderId)
                .query<{ Total: number }>(
                    'SELECT COALESCE(SUM(CAST(Qty AS DECIMAL(18,2)) * Price), 0) as Total FROM OrderItems WHERE OrderId = @OrderId',
                );

            const total = Number(totalRes.recordset[0]?.Total ?? 0);

            await tx
                .request()
                .input('Total', Decimal(18, 2), total)
                .input('OrderId', Int, orderId)
                .query('UPDATE Orders SET Total = @Total WHERE Id = @OrderId');

            let linkedTableIds = tableIds;
            if (orderTablesAvailable) {
                const linkedRes = await tx
                    .request()
                    .input('OrderId', Int, orderId)
                    .query<{ TableId: number }>('SELECT TableId FROM OrderTables WHERE OrderId = @OrderId');
                if (linkedRes.recordset.length) {
                    linkedTableIds = Array.from(
                        new Set(linkedRes.recordset.map((row) => Number(row.TableId)).filter((id) => id > 0)),
                    );
                }
            }

            if (linkedTableIds.length) {
                const tableParams = linkedTableIds.map((_, idx) => `@Id${idx}`).join(', ');
                const tableReq = tx.request().input('Status', NVarChar, 'dine in');
                linkedTableIds.forEach((id, idx) => {
                    tableReq.input(`Id${idx}`, Int, id);
                });
                await tableReq.query(
                    `UPDATE DiningTables SET Status = @Status WHERE Id IN (${tableParams})`,
                );
            }

            await tx.commit();
            this.notificationsService.emit({
                id: `order-${mode}-${orderId}-${Date.now()}`,
                type: mode === 'create' ? 'order_created' : 'order_updated',
                orderId,
                total,
                tableIds: linkedTableIds,
                createdAt: new Date().toISOString(),
            });
            return { ok: true, id: orderId, total, mode };
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    }

    async updateOrder(orderId: number, data: UpdateOrderDto) {
        const orderTablesAvailable = await this.ensureOrderTables();
        const tx = new Transaction(this.pool);
        await tx.begin();

        try {
            const orderRes = await tx
                .request()
                .input('OrderId', Int, orderId)
                .query<{ Id: number; TableId: number | null; Status: string; CreatedByUserId?: number | null }>(
                    'SELECT Id, TableId, Status, CreatedByUserId FROM Orders WHERE Id = @OrderId',
                );

            if (orderRes.recordset.length === 0) {
                throw new BadRequestException('Đơn hàng không tồn tại');
            }

            const currentOrder = orderRes.recordset[0];
            if (String(currentOrder.Status ?? '').toLowerCase() === 'completed') {
                throw new BadRequestException('Đơn hàng đã hoàn thành');
            }

            const resolvedTableIds = (() => {
                const raw = Array.isArray(data.tableIds) && data.tableIds.length
                    ? data.tableIds
                    : data.tableId
                        ? [data.tableId]
                        : currentOrder.TableId
                            ? [currentOrder.TableId]
                            : [];
                const normalized = raw
                    .map((id) => Number(id))
                    .filter((id) => Number.isFinite(id) && id > 0);
                const unique = Array.from(new Set(normalized));
                unique.sort((a, b) => a - b);
                return unique;
            })();

            if (!resolvedTableIds.length) {
                throw new BadRequestException('Thiếu thông tin bàn.');
            }

            const primaryTableId = data.tableId
                ? Number(data.tableId)
                : resolvedTableIds[0];

            if (data.createdByUserId) {
                await tx
                    .request()
                    .input('OrderId', Int, orderId)
                    .input('CreatedByUserId', Int, data.createdByUserId)
                    .query(
                        'UPDATE Orders SET CreatedByUserId = COALESCE(CreatedByUserId, @CreatedByUserId) WHERE Id = @OrderId',
                    );
            }

            await tx
                .request()
                .input('OrderId', Int, orderId)
                .input('TableId', Int, primaryTableId)
                .query('UPDATE Orders SET TableId = @TableId WHERE Id = @OrderId');

            let previousTableIds: number[] = currentOrder.TableId ? [Number(currentOrder.TableId)] : [];

            if (orderTablesAvailable) {
                const prevRes = await tx
                    .request()
                    .input('OrderId', Int, orderId)
                    .query<{ TableId: number }>('SELECT TableId FROM OrderTables WHERE OrderId = @OrderId');
                const prevIds = Array.from(
                    new Set(
                        prevRes.recordset
                            .map((row) => Number(row.TableId))
                            .filter((id) => Number.isFinite(id) && id > 0),
                    ),
                );
                if (prevIds.length) {
                    previousTableIds = prevIds;
                }
            }

            if (orderTablesAvailable) {
                const keepParams = resolvedTableIds.map((_, idx) => `@KeepId${idx}`).join(', ');
                const deleteReq = tx.request().input('OrderId', Int, orderId);
                resolvedTableIds.forEach((id, idx) => {
                    deleteReq.input(`KeepId${idx}`, Int, id);
                });
                await deleteReq.query(
                    `DELETE FROM OrderTables WHERE OrderId = @OrderId AND TableId NOT IN (${keepParams})`,
                );

                for (const tableId of resolvedTableIds) {
                    await tx
                        .request()
                        .input('OrderId', Int, orderId)
                        .input('TableId', Int, tableId)
                        .query(
                            'IF NOT EXISTS (SELECT 1 FROM OrderTables WHERE OrderId = @OrderId AND TableId = @TableId) \
                             INSERT INTO OrderTables (OrderId, TableId) VALUES (@OrderId, @TableId)',
                        );
                }
            }

            const removedTableIds = previousTableIds.filter((id) => !resolvedTableIds.includes(id));

            if (removedTableIds.length) {
                for (const tableId of removedTableIds) {
                    let isUsed = false;
                    try {
                        if (orderTablesAvailable) {
                            const usedRes = await tx
                                .request()
                                .input('OrderId', Int, orderId)
                                .input('TableId', Int, tableId)
                                .input('CompletedStatus', NVarChar, 'completed')
                                .query<{ Cnt: number }>(
                                    'SELECT COUNT(*) as Cnt FROM OrderTables ot \
                                     JOIN Orders o ON o.Id = ot.OrderId \
                                     WHERE ot.TableId = @TableId AND o.Status <> @CompletedStatus AND o.Id <> @OrderId',
                                );
                            isUsed = Number(usedRes.recordset[0]?.Cnt ?? 0) > 0;
                        } else {
                            const usedRes = await tx
                                .request()
                                .input('OrderId', Int, orderId)
                                .input('TableId', Int, tableId)
                                .input('CompletedStatus', NVarChar, 'completed')
                                .query<{ Cnt: number }>(
                                    'SELECT COUNT(*) as Cnt FROM Orders WHERE TableId = @TableId AND Status <> @CompletedStatus AND Id <> @OrderId',
                                );
                            isUsed = Number(usedRes.recordset[0]?.Cnt ?? 0) > 0;
                        }
                    } catch {
                        isUsed = false;
                    }

                    if (!isUsed) {
                        await tx
                            .request()
                            .input('TableId', Int, tableId)
                            .input('Status', NVarChar, 'available')
                            .query('UPDATE DiningTables SET Status = @Status WHERE Id = @TableId');
                    }
                }
            }

            if (resolvedTableIds.length) {
                const tableParams = resolvedTableIds.map((_, idx) => `@Id${idx}`).join(', ');
                const tableReq = tx.request().input('Status', NVarChar, 'dine in');
                resolvedTableIds.forEach((id, idx) => {
                    tableReq.input(`Id${idx}`, Int, id);
                });
                await tableReq.query(
                    `UPDATE DiningTables SET Status = @Status WHERE Id IN (${tableParams})`,
                );
            }

            await tx
                .request()
                .input('OrderId', Int, orderId)
                .query('DELETE FROM OrderItems WHERE OrderId = @OrderId');

            let total = 0;

            for (const item of data.items) {
                const itemRes = await tx
                    .request()
                    .input('MenuItemId', Int, item.menuItemId)
                    .query('SELECT Price FROM MenuItems WHERE Id = @MenuItemId');

                if (itemRes.recordset.length === 0) {
                    continue;
                }

                const price = itemRes.recordset[0].Price as number;
                total += price * item.qty;

                await tx
                    .request()
                    .input('OrderId', Int, orderId)
                    .input('MenuItemId', Int, item.menuItemId)
                    .input('Qty', Int, item.qty)
                    .input('Price', Decimal(18, 2), price)
                    .query(
                        'INSERT INTO OrderItems (OrderId, MenuItemId, Qty, Price) VALUES (@OrderId, @MenuItemId, @Qty, @Price)',
                    );
            }

            await tx
                .request()
                .input('Total', Decimal(18, 2), total)
                .input('OrderId', Int, orderId)
                .query('UPDATE Orders SET Total = @Total WHERE Id = @OrderId');

            await tx.commit();
            this.notificationsService.emit({
                id: `order-updated-${orderId}-${Date.now()}`,
                type: 'order_updated',
                orderId,
                total,
                tableIds: resolvedTableIds,
                createdAt: new Date().toISOString(),
            });
            return { ok: true, id: orderId, total };
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    }

    async getById(id: number) {
        const res = await this.pool
            .request()
            .input('Id', Int, id)
            .query<OrderRow>('SELECT o.Id, o.TableId, t.Name as TableName, o.CreatedByUserId, u.FullName as CreatedByName, \
                     o.Status, o.Total, o.CreatedAt \
                     FROM Orders o \
                     LEFT JOIN DiningTables t ON t.Id = o.TableId \
                     LEFT JOIN Users u ON u.Id = o.CreatedByUserId \
                     WHERE o.Id = @Id');
        if (res.recordset.length === 0) {
            return null;
        }

        const itemsRes = await this.pool
            .request()
            .input('Id', Int, id)
            .query<OrderItemRow>('select oi.Id, oi.MenuItemId, mi.Name, oi.Qty, oi.Price \
                   from OrderItems oi \
                   join MenuItems mi on oi.MenuItemId = mi.Id \
                   where oi.OrderId = @Id');

        const orderTablesAvailable = await this.ensureOrderTables();
        let tables: Array<{ Id: number; Name: string | null; TableNo?: number | null }> = [];
        if (orderTablesAvailable) {
            try {
                const tablesRes = await this.pool
                    .request()
                    .input('Id', Int, id)
                    .query<{ Id: number; Name: string | null; TableNo?: number | null }>(
                        'select t.Id, t.Name, t.TableNo \
                         from OrderTables ot \
                         join DiningTables t on t.Id = ot.TableId \
                         where ot.OrderId = @Id \
                         order by t.TableNo, t.Id',
                    );
                tables = tablesRes.recordset;
            } catch {
                // fallback below
            }
        }
        if (!tables.length) {
            const fallbackTableId = res.recordset[0]?.TableId ?? null;
            if (fallbackTableId) {
                tables = [
                    {
                        Id: Number(fallbackTableId),
                        Name: (res.recordset[0] as OrderRow).TableName ?? null,
                    },
                ];
            }
        }
        
        return {
            ...res.recordset[0],
            items: itemsRes.recordset,
            tableIds: tables.map((t) => t.Id),
            tables,
        };
    }
}
