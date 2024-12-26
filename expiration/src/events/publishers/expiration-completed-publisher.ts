import { Publisher, ExpirationCompleteEvent, Subjects } from "@hanishdev-ticketing/common";

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}