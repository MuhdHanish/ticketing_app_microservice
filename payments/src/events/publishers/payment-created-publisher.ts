import { Publisher, Subjects, PaymentCreatedEvent } from "@hanishdev-ticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
