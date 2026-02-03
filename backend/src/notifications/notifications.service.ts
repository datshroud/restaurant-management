import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

export type NotificationEventType = 'order_created' | 'order_updated' | 'order_paid';

export type NotificationEvent = {
    id: string;
    type: NotificationEventType;
    orderId: number;
    total?: number;
    method?: string;
    tableIds?: number[];
    createdAt: string;
};

@Injectable()
export class NotificationsService {
    private readonly subject = new Subject<NotificationEvent>();

    emit(event: NotificationEvent) {
        this.subject.next(event);
    }

    stream(): Observable<MessageEvent> {
        return this.subject.asObservable().pipe(map((data) => ({ data } as MessageEvent)));
    }
}

