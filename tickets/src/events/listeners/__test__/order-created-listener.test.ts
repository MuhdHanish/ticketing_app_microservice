import { OrderCreatedEvent, OrderStatus } from "@hanishdev-ticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Ticket } from "../../../models";

const setup = async () => { 
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: "concert",
        price: 20,
        user: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    const data: OrderCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        user: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date().toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
}

describe("order-created-listener", () => {
    it("updates the ticket", async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);
        const ticket = await Ticket.findById(data.ticket.id);
        expect(ticket!.order).toEqual(data.id);
    });

    it("acks the message", async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);
        expect(msg.ack).toHaveBeenCalled();
    });

    it("publishes a ticket updated event", async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);
        expect(natsWrapper.client.publish).toHaveBeenCalled();

        const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[2][1]);
        expect(data.ticket.id).toEqual(ticketUpdatedData.id);
    });
})