import { Message } from "node-nats-streaming";
import { TickUpdatedEvent, Listener, Subjects } from "@hanishdev-ticketing/common";
import { TICKETS_LISTENER_QUEUE_GROUP } from "../queue-groups";
import { Ticket } from "../../models";

export class TicketUpdatedListener extends Listener<TickUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = TICKETS_LISTENER_QUEUE_GROUP;

    async onMessage(data: TickUpdatedEvent["data"], msg: Message): Promise<void> {
        const { id, title, price, version } = data;
        const ticket = await Ticket.findByIdAndVersion({ id, version });
        if (!ticket) {
            throw new Error("Ticket not found");
        }
        ticket.set({
            title,
            price,
            version
        });
        await ticket.save();
        
        msg.ack();
    }
}