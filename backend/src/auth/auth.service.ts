import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConnectionPool, NVarChar } from 'mssql';
import { DATABASE_POOL } from '../db/db.module';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(
        @Inject(DATABASE_POOL) private readonly pool: ConnectionPool,
    ) {}

    async register(data: { email: string; password: string }) {
        const { email, password } = data;
        const exist = await this.pool
            .request()
            .input('Email', NVarChar, email)
            .query<{ Id: number }>('select Id from Users where Email = @Email');

        if (exist.recordset.length !== 0) {
            throw new BadRequestException('User đã tồn tại');
        }

        const hash = await bcrypt.hash(password, 10);
        await this.pool
            .request()
            .input('Email', NVarChar, email)
            .input('PasswordHash', NVarChar, hash)
            .query('insert into Users (Email, PasswordHash) values (@Email, @PasswordHash)');
        return { ok: true };
    }

    async login(data: { email: string; password: string }) {
        const { email, password } = data;
        const res = await this.pool
            .request()
            .input('Email', NVarChar, email)
            .query<{ Id: number; PasswordHash: string }>(
                'select Id, PasswordHash from Users where Email = @Email',
            );
        if (res.recordset.length === 0) {
            throw new UnauthorizedException('Email không tồn tại');
        }
        const user = res.recordset[0];
        const valid = await bcrypt.compare(password, user.PasswordHash);
        
        if (!valid) {
            throw new UnauthorizedException('Mật khẩu không đúng');
        }

        return { ok: true, userId: user.Id };
    }
}
