import {
    OrderCancelledEvent,
    Subjects,
    Listener,
    OrderStatus
} from "@hanishdev-ticketing/common";
import { ORDERS_LISTENER_QUEUE_GROUP } from "../queue-groups";
import { Message } from "node-nats-streaming";
import { Order } from "../../models";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = ORDERS_LISTENER_QUEUE_GROUP;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        const { id, version } = data;
        const order = await Order.findOne({ _id: id, version: version - 1 });

        if (!order) {
            throw new Error("Order not found");
        }

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        msg.ack();
    }
}