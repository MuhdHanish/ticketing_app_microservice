import { TicketCreatedEvent } from "@hanishdev-ticketing/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models";

const setup = async () => {
    const listener = new TicketCreatedListener(natsWrapper.client);
    const data: TicketCreatedEvent["data"] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20,
        user: new mongoose.Types.ObjectId().toHexString()
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg };
}

describe("ticket-created-listener", () => {

    it("creates and save a ticket", async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);
        const ticket = await Ticket.findById(data.id);

        expect(ticket).toBeDefined();
        expect(ticket!.title).toEqual(data.title);
        expect(ticket!.price).toEqual(data.price);
    });

    it("acks the message", async () => {
        const { listener, data, msg } = await setup();
        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();
    });
});