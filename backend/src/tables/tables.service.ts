import { Inject, Injectable } from '@nestjs/common';
import { ConnectionPool, Int, NVarChar} from 'mssql';
import { DATABASE_POOL } from '../db/db.module';
import { CreateTableDto } from './dto/create-table.dto';

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
        const res = await this.pool
            .request()
            .input('Name', NVarChar, data.name)
            .input('Seats', Int, data.seats)
            .query('INSERT INTO DiningTables (Name, Seats) \
                    output INSERTED.Id VALUES (@Name, @Seats)');
        return { ok: true, id: res.recordset[0]?.Id as number};
    }
}
