import { Listener, Subjects, PaymentCreatedEvent, OrderStatus } from "@hanishdev-ticketing/common";
import { Message } from "node-nats-streaming";
import { TICKETS_LISTENER_QUEUE_GROUP } from "../queue-groups";
import { Order } from "../../models";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = TICKETS_LISTENER_QUEUE_GROUP;

    async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
        const order = await Order.findById(data.order);
        if (!order) {
            throw new Error("Order not found");
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        msg.ack();
    }
}