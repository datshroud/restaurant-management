import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConnectionPool, Int, NVarChar } from 'mssql';
import { DATABASE_POOL } from '../db/db.module';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
    constructor(
        @Inject(DATABASE_POOL) private readonly pool: ConnectionPool,
    ) {}

    async getAll(){
        const res = await this.pool
            .request()
            .query('select * from DiningTables order by Id desc');
        return res.recordset;
    }

    async create(data: CreateTableDto){
        if (!data.tableNo) {
            throw new BadRequestException('Vui lòng nhập số bàn.');
        }
        const resolvedName =
            data.name?.trim() || (data.tableNo ? `Bàn ${data.tableNo}` : 'Bàn mới');

        const duplicate = await this.pool
            .request()
            .input('TableNo', Int, data.tableNo)
            .input('Name', NVarChar, resolvedName)
            .query('SELECT TOP 1 Id FROM DiningTables WHERE TableNo = @TableNo OR Name = @Name');

        if (duplicate.recordset.length > 0) {
            throw new BadRequestException('Số bàn hoặc tên bàn đã tồn tại.');
        }
        const res = await this.pool
            .request()
            .input('Name', NVarChar, resolvedName)
            .input('Seats', Int, data.seats)
                .input('TableNo', Int, data.tableNo ?? null)
                .input('Location', NVarChar, data.location ?? null)
                .query('INSERT INTO DiningTables (Name, Seats, TableNo, Location) \
                    output INSERTED.Id VALUES (@Name, @Seats, @TableNo, @Location)');
        return { ok: true, id: res.recordset[0]?.Id as number};
    }

    async update(id: number, data: UpdateTableDto) {
        const current = await this.pool
            .request()
            .input('Id', Int, id)
            .query('SELECT TOP 1 * FROM DiningTables WHERE Id = @Id');

        if (current.recordset.length === 0) {
            return null;
        }

        const existing = current.recordset[0] as {
            Name: string;
            Seats: number;
            TableNo?: number | null;
            Location?: string | null;
            Status: string;
        };

        const resolvedName =
            data.name?.trim() ||
            (data.tableNo ? `Bàn ${data.tableNo}` : existing.Name);

        if (data.tableNo !== undefined && data.tableNo !== null && data.tableNo !== existing.TableNo) {
            const duplicateNo = await this.pool
                .request()
                .input('Id', Int, id)
                .input('TableNo', Int, data.tableNo)
                .query('SELECT TOP 1 Id FROM DiningTables WHERE TableNo = @TableNo AND Id <> @Id');

            if (duplicateNo.recordset.length > 0) {
                throw new BadRequestException('Số bàn đã tồn tại.');
            }
        }

        if (resolvedName && resolvedName !== existing.Name) {
            const duplicateName = await this.pool
                .request()
                .input('Id', Int, id)
                .input('Name', NVarChar, resolvedName)
                .query('SELECT TOP 1 Id FROM DiningTables WHERE Name = @Name AND Id <> @Id');

            if (duplicateName.recordset.length > 0) {
                throw new BadRequestException('Tên bàn đã tồn tại.');
            }
        }

        await this.pool
            .request()
            .input('Id', Int, id)
            .input('Name', NVarChar, resolvedName)
            .input('Seats', Int, data.seats ?? existing.Seats)
            .input('TableNo', Int, data.tableNo ?? existing.TableNo ?? null)
            .input('Location', NVarChar, data.location ?? existing.Location ?? null)
            .input('Status', NVarChar, data.status ?? existing.Status)
            .query('UPDATE DiningTables SET Name = @Name, Seats = @Seats, TableNo = @TableNo, Location = @Location, Status = @Status WHERE Id = @Id');

        return { ok: true };
    }

    async remove(id: number) {
        await this.pool
            .request()
            .input('Id', Int, id)
            .query('DELETE FROM DiningTables WHERE Id = @Id');
        return { ok: true };
    }
}
