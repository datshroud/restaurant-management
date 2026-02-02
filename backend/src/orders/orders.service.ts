import { Inject, Injectable } from '@nestjs/common';
import { ConnectionPool, Decimal, Int, Transaction } from 'mssql';
import { DATABASE_POOL } from 'src/db/db.module';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @Inject(DATABASE_POOL) private readonly pool: ConnectionPool,
    ) {}

    async getAll(){
        const res = await this.pool
            .request()
            .query('select * from Orders');
        return res.recordset;

    }

    async create(data: CreateOrderDto){
        const tx = new Transaction(this.pool);
        await tx.begin();
        try {
            const orderRes = await this.pool
            .request()
            .input('TableId', Int, data.tableId)
            .query('INSERT INTO Orders (TableId) \
                    output INSERTED.Id VALUES (@TableId)');
            
            const orderId = orderRes.recordset[0]?.Id as number;
            let tot = 0;

            for (const itemId of data.itemIds) {
                const itemRes = await this.pool
                    .request()
                    .input('OrderId', Int, orderId)
                    .input('MenuItemId', Int, itemId)
                    .query('INSERT INTO OrderItems (OrderId, MenuItemId) \
                            VALUES (@OrderId, @MenuItemId)');
                const price = itemRes.recordset[0]?.Price as number;
                tot += price;

                await tx
                    .request()
                    .input('Id', Int, orderId)
                    .input('MenuItemId', Int, itemId)
                    .input('Qty', Int, 1)
                    .input('Price', Decimal(18, 2), price)
                    .query('INSERT INTO OrderItems (OrderId, MenuItemId, Qty, Price) \
                            VALUES (@Id, @MenuItemId, @Qty, @Price)');
            }
            
            await tx
                .request()
                .input('Total', Decimal(18, 2), tot)
                .input('OrderId', Int, orderId)
                .query('UPDATE Orders SET TotalAmount = @Total WHERE Id = @OrderId');
            
            await tx.commit();
            return { ok: true, id: orderId, tot };
        } catch (error) {
            await tx.rollback();
            throw error;
        }
        
    }
}
