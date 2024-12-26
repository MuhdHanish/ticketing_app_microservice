import { Listener, OrderCreatedEvent, Subjects } from "@hanishdev-ticketing/common";
import { ORDERS_LISTENER_QUEUE_GROUP } from "../queue-groups"
import { Message } from "node-nats-streaming";
import { Order } from "../../models";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    readonly subject = Subjects.OrderCreated;
    queueGroupName = ORDERS_LISTENER_QUEUE_GROUP;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const { ticket, ...rest } = data;
        const order = Order.build({
            price: ticket.price,
            ...rest,
        });
        await order.save();
        
        msg.ack();
    }
}