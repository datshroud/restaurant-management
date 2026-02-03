import { Controller, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { MessageEvent } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Sse('stream')
    stream(): Observable<MessageEvent> {
        return this.notificationsService.stream();
    }
}

