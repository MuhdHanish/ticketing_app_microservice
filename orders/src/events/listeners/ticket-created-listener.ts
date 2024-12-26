import { Ticket } from "../../models";
import { Message } from "node-nats-streaming";
import { Listener, Subjects, TicketCreatedEvent } from "@hanishdev-ticketing/common";
import { TICKETS_LISTENER_QUEUE_GROUP } from "../queue-groups";

export const TicketCreatedQueueGroupName = "orders-service";

export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;
    queueGroupName =  TICKETS_LISTENER_QUEUE_GROUP;
    
    async onMessage(data: TicketCreatedEvent["data"], msg: Message): Promise<void> {
        const { id, title, price } = data;
        const ticket = Ticket.build({
            id,
            title,
            price
        });
        await ticket.save();

        msg.ack();
    }
}