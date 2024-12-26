import { Ticket } from "../ticket";

describe("ticket model", () => {
    it("it implements optimistic concurrency control", async () => {
        const ticket = Ticket.build({
            title: "test",
            price: 10,
            user: "123"
        });
        await ticket.save();
        const firstInstance = await Ticket.findById(ticket.id);
        const secondInstance = await Ticket.findById(ticket.id);
        firstInstance!.set({ price: 15 });
        secondInstance!.set({ price: 25 });
        await firstInstance!.save();
        await expect(secondInstance!.save()).rejects.toThrow();
    });

    it("increments the version number on multiple saves", async () => {
        const ticket = Ticket.build({
            title: "test",
            price: 10,
            user: "123"
        });
        await ticket.save();
        expect(ticket.version).toEqual(0);
        await ticket.save();
        expect(ticket.version).toEqual(1);
        await ticket.save();
        expect(ticket.version).toEqual(2);
    });
})