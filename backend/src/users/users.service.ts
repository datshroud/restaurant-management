import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConnectionPool, Int, NVarChar } from 'mssql';
import * as bcrypt from 'bcrypt';
import { DATABASE_POOL } from '../db/db.module';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @Inject(DATABASE_POOL) private readonly pool: ConnectionPool,
    ) {}

    async getAll() {
        const res = await this.pool
            .request()
            .query('select Id, Email, FullName, Phone, Role, CreatedAt from Users order by Id desc');
        return res.recordset;
    }

    async create(data: CreateUserDto) {
        const existing = await this.pool
            .request()
            .input('Email', NVarChar, data.email)
            .query<{ Id: number }>('select Id from Users where Email = @Email');

        if (existing.recordset.length !== 0) {
            throw new BadRequestException('Email đã tồn tại');
        }

        const rawPassword = (data.password && data.password.trim()) || '123456';
        const hash = await bcrypt.hash(rawPassword, 10);
        const res = await this.pool
            .request()
            .input('Email', NVarChar, data.email)
            .input('PasswordHash', NVarChar, hash)
            .input('FullName', NVarChar, data.fullName ?? null)
            .input('Phone', NVarChar, data.phone ?? null)
            .input('Role', NVarChar, data.role ?? 'staff')
            .query('insert into Users (Email, PasswordHash, FullName, Phone, Role) output INSERTED.Id values (@Email, @PasswordHash, @FullName, @Phone, @Role)');

        return { ok: true, userId: res.recordset[0]?.Id as number };
    }

    async update(id: number, data: UpdateUserDto) {
        if (data.email) {
            const existing = await this.pool
                .request()
                .input('Email', NVarChar, data.email)
                .input('Id', Int, id)
                .query<{ Id: number }>('select Id from Users where Email = @Email and Id <> @Id');

            if (existing.recordset.length !== 0) {
                throw new BadRequestException('Email đã tồn tại');
            }
        }

        let passwordHash: string | null = null;
        if (data.password) {
            passwordHash = await bcrypt.hash(data.password, 10);
        }

        const res = await this.pool
            .request()
            .input('Id', Int, id)
            .input('Email', NVarChar, data.email ?? null)
            .input('FullName', NVarChar, data.fullName ?? null)
            .input('Phone', NVarChar, data.phone ?? null)
            .input('Role', NVarChar, data.role ?? null)
            .input('PasswordHash', NVarChar, passwordHash)
            .query(
                'update Users set ' +
                'Email = coalesce(@Email, Email), ' +
                'FullName = @FullName, ' +
                'Phone = @Phone, ' +
                'Role = coalesce(@Role, Role), ' +
                'PasswordHash = coalesce(@PasswordHash, PasswordHash) ' +
                'where Id = @Id',
            );

        if (res.rowsAffected[0] === 0) {
            throw new BadRequestException('User không tồn tại');
        }

        return { ok: true };
    }

}
