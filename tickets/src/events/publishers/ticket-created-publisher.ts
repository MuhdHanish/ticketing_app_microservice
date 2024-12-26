import { Publisher, Subjects, TicketCreatedEvent } from "@hanishdev-ticketing/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
