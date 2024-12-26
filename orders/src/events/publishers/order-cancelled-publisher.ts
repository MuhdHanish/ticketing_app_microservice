import { Publisher, Subjects, OrderCancelledEvent } from '@hanishdev-ticketing/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
