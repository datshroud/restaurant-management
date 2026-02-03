import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [DbModule, NotificationsModule],
    controllers: [PaymentsController],
    providers: [PaymentsService],
})
export class PaymentsModule {}
