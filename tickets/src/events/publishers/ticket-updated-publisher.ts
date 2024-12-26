import { Publisher, Subjects, TickUpdatedEvent } from '@hanishdev-ticketing/common';

export class TicketUpdatedPublisher extends Publisher<TickUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
