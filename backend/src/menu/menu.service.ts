import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Bit, ConnectionPool, Decimal, Int, NVarChar } from "mssql";

@Injectable()
export class MenuService {
    constructor(
        @Inject('DATABASE_POOL') private readonly pool: ConnectionPool,
    ) {}

    async getItems() {
        const res = await this.pool
            .request()
            .query('select * from MenuItems \
                    where IsActive = 1 \
                    order by Id desc');
        return res.recordset;
    }

    async getAllItems() {
        const res = await this.pool
            .request()
            .query('select * from MenuItems order by Id desc');
        return res.recordset;
    }

    async getCategories() {
        const res = await this.pool
            .request()
            .query('select * from Categories order by Id');
        return res.recordset;
    }

    async createCategory(name: string) {
        const exist = await this.pool
            .request()
            .input('Name', NVarChar, name)
            .query('select Id from Categories where Name = @Name');
        if (exist.recordset.length > 0) {
            throw new BadRequestException('Tên danh mục đã tồn tại');
        }
        const res = await this.pool
            .request()
            .input('Name', NVarChar, name)
            .query('insert into Categories (Name) output INSERTED.Id values (@Name)');
        return { ok: true, id: res.recordset[0]?.Id as number };
    }

    async updateCategory(id: number, name: string) {
        const exist = await this.pool
            .request()
            .input('Id', Int, id)
            .input('Name', NVarChar, name)
            .query('select Id from Categories where Name = @Name and Id <> @Id');
        if (exist.recordset.length > 0) {
            throw new BadRequestException('Tên danh mục đã tồn tại');
        }
        const res = await this.pool
            .request()
            .input('Id', Int, id)
            .input('Name', NVarChar, name)
            .query('update Categories set Name = @Name where Id = @Id');
        return { ok: true, rows: res.rowsAffected[0] ?? 0 };
    }

    async deleteCategory(id: number) {
        const res = await this.pool
            .request()
            .input('Id', Int, id)
            .query('delete from Categories where Id = @Id');
        return { ok: true, rows: res.rowsAffected[0] ?? 0 };
    }

    async getPopular(limit = 5) {
        const res = await this.pool
            .request()
            .input('Limit', Int, limit)
            .query(
                'select top (@Limit) mi.Id, mi.Name, mi.ImageUrl, count(oi.Id) as OrdersCount \
                 from MenuItems mi \
                 left join OrderItems oi on oi.MenuItemId = mi.Id \
                 group by mi.Id, mi.Name, mi.ImageUrl \
                 order by count(oi.Id) desc',
            );
        return res.recordset;
    }

    async getOutOfStock(limit = 5) {
        const res = await this.pool
            .request()
            .input('Limit', Int, limit)
            .query(
                'select top (@Limit) Id, Name, ImageUrl \
                 from MenuItems \
                 where IsActive = 0 \
                 order by Id desc',
            );
        return res.recordset;
    }

    async createItem(data: {
        categoryId: number;
        name: string;
        description?: string | null;
        price: number;
        imageUrl?: string | null;
        stockQty?: number | null;
        stockUnit?: string | null;
        isActive?: boolean | null;
    }) {
        const dupRes = await this.pool
            .request()
            .input('Name', NVarChar, data.name)
            .query('select count(1) as Cnt from MenuItems where lower(Name) = lower(@Name)');
        if ((dupRes.recordset[0]?.Cnt ?? 0) > 0) {
            throw new BadRequestException('Tên món đã tồn tại');
        }
        const res = await this.pool
            .request()
            .input('CategoryId', Int, data.categoryId)
            .input('Name', NVarChar, data.name)
            .input('Description', NVarChar, data.description ?? null)
            .input('Price', Decimal(18, 2), data.price)
            .input('ImageUrl', NVarChar, data.imageUrl ?? null)
            .input('StockQty', Int, data.stockQty ?? null)
            .input('StockUnit', NVarChar, data.stockUnit ?? null)
            .input('IsActive', Bit, data.isActive === false ? 0 : 1)
            .query('INSERT INTO MenuItems (CategoryId, Name, Description, Price, ImageUrl, StockQty, StockUnit, IsActive) \
                    OUTPUT INSERTED.Id VALUES (@CategoryId, @Name, @Description, @Price, @ImageUrl, @StockQty, @StockUnit, @IsActive)');
        return { ok: true, id: res.recordset[0]?.Id as number };
    }

    async updateItem(id: number, data: {
        categoryId: number;
        name: string;
        description?: string | null;
        price: number;
        imageUrl?: string | null;
        stockQty?: number | null;
        stockUnit?: string | null;
        isActive?: boolean | null;
    }) {
        const currentRes = await this.pool
            .request()
            .input('Id', Int, id)
            .query<{ Name: string }>('select Name from MenuItems where Id = @Id');

        const currentName = currentRes.recordset[0]?.Name ?? '';
        const incomingName = data.name ?? '';
        if (currentName.toLowerCase() !== incomingName.toLowerCase()) {
            const dupRes = await this.pool
                .request()
                .input('Id', Int, id)
                .input('Name', NVarChar, data.name)
                .query('select count(1) as Cnt from MenuItems where lower(Name) = lower(@Name) and Id <> @Id');
            if ((dupRes.recordset[0]?.Cnt ?? 0) > 0) {
                throw new BadRequestException('Tên món đã tồn tại');
            }
        }
        await this.pool
            .request()
            .input('Id', Int, id)
            .input('CategoryId', Int, data.categoryId)
            .input('Name', NVarChar, data.name)
            .input('Description', NVarChar, data.description ?? null)
            .input('Price', Decimal(18, 2), data.price)
            .input('ImageUrl', NVarChar, data.imageUrl ?? null)
            .input('StockQty', Int, data.stockQty ?? null)
            .input('StockUnit', NVarChar, data.stockUnit ?? null)
            .input('IsActive', Bit, data.isActive === false ? 0 : 1)
            .query('UPDATE MenuItems SET CategoryId = @CategoryId, Name = @Name, Description = @Description, Price = @Price, \
                    ImageUrl = @ImageUrl, StockQty = @StockQty, StockUnit = @StockUnit, IsActive = @IsActive WHERE Id = @Id');
        return { ok: true };
    }

    async deleteItem(id: number) {
        await this.pool
            .request()
            .input('Id', Int, id)
            .query('DELETE FROM MenuItems WHERE Id = @Id');
        return { ok: true };
    }
}