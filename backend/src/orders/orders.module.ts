import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [DbModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
