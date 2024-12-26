import mongoose from "mongoose";
import { Ticket } from "../../../models";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent } from "@hanishdev-ticketing/common";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    
    const order = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: "concert",
        price: 20,
        user: new mongoose.Types.ObjectId().toHexString()
    });
    ticket.set({ order });
    await ticket.save();

    const data: OrderCancelledEvent["data"] = {
        id: order,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
}

describe("order-cancelled-listener", () => {
    it("updates the ticket", async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);
        const ticket = await Ticket.findById(data.ticket.id);
        expect(ticket!.order).toBeUndefined();
    });

    it("acks the message", async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);
        expect(msg.ack).toHaveBeenCalled();
    });
})