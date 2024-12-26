import { Listener, OrderCancelledEvent, Subjects } from "@hanishdev-ticketing/common";
import { Message } from "node-nats-streaming";
import { ORDERS_LISTENER_QUEUE_GROUP } from "../queue-groups";
import { Ticket } from "../../models";
import { TicketUpdatedPublisher } from "../publishers";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = ORDERS_LISTENER_QUEUE_GROUP;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {        
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error("Ticket not found");
        }

        ticket.set({ order: undefined });
        await ticket.save();

        const { id, title, price, version, user } = ticket;
        await new TicketUpdatedPublisher(this.client).publish({
            id,
            title,
            price,
            version,
            user,
        });

        msg.ack();
    }
}