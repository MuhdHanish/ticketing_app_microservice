import { TickUpdatedEvent } from "@hanishdev-ticketing/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });
    await ticket.save();

    const data: TickUpdatedEvent["data"] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: "new concert",
        price: 999,
        user: new mongoose.Types.ObjectId().toHexString()
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg, ticket };
}

describe("ticket-updated-listener", () => {

    it("finds, updates and save a ticket", async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);

        const updatedTicket = await Ticket.findById(data.id);
        expect(updatedTicket!.title).toEqual(data.title);
        expect(updatedTicket!.price).toEqual(data.price);
        expect(updatedTicket!.version).toEqual(data.version);
    });

    it("acks the message", async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();
    });

    it("does not call ack if the event has a skipped version number", async () => {
        const { listener, data, msg } = await setup();
        data.version = 10;
        try {
            await listener.onMessage(data, msg);
        } catch (err) {}
        expect(msg.ack).not.toHaveBeenCalled();
    });
});