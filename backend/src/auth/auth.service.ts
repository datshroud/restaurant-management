import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConnectionPool, Int, NVarChar } from 'mssql';
import { DATABASE_POOL } from '../db/db.module';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(
        @Inject(DATABASE_POOL) private readonly pool: ConnectionPool,
    ) {}

    async register(data: { email: string; password: string; fullName?: string; phone?: string }) {
        const { email, password, fullName, phone } = data;
        const exist = await this.pool
            .request()
            .input('Email', NVarChar, email)
            .query<{ Id: number }>('select Id from Users where Email = @Email');

        if (exist.recordset.length !== 0) {
            throw new BadRequestException('User đã tồn tại');
        }

        const hash = await bcrypt.hash(password, 10);
        const res = await this.pool
            .request()
            .input('Email', NVarChar, email)
            .input('PasswordHash', NVarChar, hash)
            .input('FullName', NVarChar, fullName ?? null)
            .input('Phone', NVarChar, phone ?? null)
            .query('insert into Users (Email, PasswordHash, FullName, Phone) output INSERTED.Id values (@Email, @PasswordHash, @FullName, @Phone)');
        return { ok: true, userId: res.recordset[0]?.Id as number };
    }

    async login(data: { email: string; password: string }) {
        const { email, password } = data;
        const res = await this.pool
            .request()
            .input('Email', NVarChar, email)
            .query<{ Id: number; PasswordHash: string; FullName: string | null; Role: string; Phone: string | null }>(
                'select Id, PasswordHash, FullName, Role, Phone from Users where Email = @Email',
            );
        if (res.recordset.length === 0) {
            throw new UnauthorizedException('Email không tồn tại');
        }
        const user = res.recordset[0];
        const valid = await bcrypt.compare(password, user.PasswordHash);
        
        if (!valid) {
            throw new UnauthorizedException('Mật khẩu không đúng');
        }

        return { ok: true, userId: user.Id, fullName: user.FullName, role: user.Role, phone: user.Phone, email };
    }

    async getProfile(userId: number) {
        const res = await this.pool
            .request()
            .input('Id', Int, userId)
            .query<{ Id: number; Email: string; FullName: string | null; Role: string; Phone: string | null }>(
                'select Id, Email, FullName, Role, Phone from Users where Id = @Id',
            );
        if (res.recordset.length === 0) {
            throw new BadRequestException('User không tồn tại');
        }
        return res.recordset[0];
    }

    async updateProfile(userId: number, data: { fullName?: string; phone?: string }) {
        const res = await this.pool
            .request()
            .input('Id', Int, userId)
            .input('FullName', NVarChar, data.fullName ?? null)
            .input('Phone', NVarChar, data.phone ?? null)
            .query(
                'update Users set FullName = @FullName, Phone = @Phone where Id = @Id',
            );
        if (res.rowsAffected[0] === 0) {
            throw new BadRequestException('User không tồn tại');
        }
        return { ok: true };
    }

    async changePassword(userId: number, data: { oldPassword: string; newPassword: string }) {
        const res = await this.pool
            .request()
            .input('Id', Int, userId)
            .query<{ PasswordHash: string }>('select PasswordHash from Users where Id = @Id');
        if (res.recordset.length === 0) {
            throw new BadRequestException('User không tồn tại');
        }
        const valid = await bcrypt.compare(data.oldPassword, res.recordset[0].PasswordHash);
        if (!valid) {
            throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
        }
        const hash = await bcrypt.hash(data.newPassword, 10);
        await this.pool
            .request()
            .input('Id', Int, userId)
            .input('PasswordHash', NVarChar, hash)
            .query('update Users set PasswordHash = @PasswordHash where Id = @Id');
        return { ok: true };
    }
}
