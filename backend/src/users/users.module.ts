import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DbModule } from '../db/db.module';

@Module({
    imports: [DbModule],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
