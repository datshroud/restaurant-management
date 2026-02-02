import { Module } from '@nestjs/common';
import { ConnectionPool, config as SqlConfig } from 'mssql';

export const DATABASE_POOL = 'DATABASE_POOL';

@Module({
    providers: [
        {
            provide: DATABASE_POOL,
            useFactory: async (): Promise<ConnectionPool> => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const db = {
                    server: process.env.DB_HOST,
                    database: process.env.DB_NAME,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    port: Number(process.env.DB_PORT || 1433),
                    options: {
                        encrypt: false,
                        trustServerCertificate: true,
                    },
                } as SqlConfig;

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                const pool = await new ConnectionPool(db).connect();
                return pool;
            },
        },
    ],
    exports: [DATABASE_POOL],
})
export class DbModule {}