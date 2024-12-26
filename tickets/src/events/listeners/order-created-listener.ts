import { Listener, OrderCreatedEvent, Subjects } from "@hanishdev-ticketing/common";
import { Message } from "node-nats-streaming";
import { ORDERS_LISTENER_QUEUE_GROUP } from "../queue-groups";
import { Ticket } from "../../models";
import { TicketUpdatedPublisher } from "../publishers";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = ORDERS_LISTENER_QUEUE_GROUP;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error("Ticket not found");
        }

        ticket.set({ order: data.id });
        await ticket.save();

        const { id, title, price, version, user, order } = ticket;
        await new TicketUpdatedPublisher(this.client).publish({
            id,
            title,
            price,
            version,
            user,
            order,
        });

        msg.ack();
    }
}