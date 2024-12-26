import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from "@hanishdev-ticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { Order } from "../../../models";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        user: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        version: 0
    });
    await order.save();

    const data: OrderCancelledEvent["data"] = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
}

describe('Order Cancelled Listener', () => {
    it('should update the order status to cancelled', async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);

        const order = await Order.findById(data.id);

        expect(order!.status).toEqual(OrderStatus.Cancelled);
    });

    it('should ack the message', async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();
    });
});