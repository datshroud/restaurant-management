import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

@Module({
  imports: [DbModule],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule {}
