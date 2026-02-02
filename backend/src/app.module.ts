import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import dbConfig from './config/db.config';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { TablesModule } from './tables/tables.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [dbConfig] }), DbModule, AuthModule, OrdersModule, TablesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
