import supertest from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

describe("create order", () => {
    it("has a route handler listening to /api/orders for post requests", async () => {
        const response = await supertest(app).post("/api/orders").send({});
        expect(response.status).not.toEqual(404);
    });

    it("return a 401 or 403 if no token is provided or invalid", async () => {
        const response = await supertest(app)
            .post("/api/orders")
            .send({});
        const status = response.status;
        expect([401, 403]?.includes(status)).toBe(true);
    });

    it("return a 400 if no ticket is provided", async () => {
        return supertest(app)
            .post("/api/orders")
            .set("Cookie", (global as any).authenticate())
            .send({})
            .expect(400);
    });

    it("return a 404 if the ticket is not found", async () => {
        return supertest(app)
            .post("/api/orders")
            .set("Cookie", (global as any).authenticate())
            .send({
                ticket: new mongoose.Types.ObjectId().toHexString(),
            })
            .expect(404);
    });

    it("return a 400 if the ticket is already reserved", async () => {
        const cookie = (global as any).authenticate();
        // Save order in db using createOrder function return created order (ticket passing optional param)
        const order = await (global as any).createOrder();
        return supertest(app)
            .post("/api/orders")
            .set("Cookie", cookie)
            .send({
                ticket: order.ticket,
            })
            .expect(400);
    });

    it("reserve a ticket", async () => {
        const cookie = (global as any).authenticate();
        const ticket = await (global as any).createTicket();
        const response = await supertest(app)
            .post("/api/orders")
            .set("Cookie", cookie)
            .send({
                ticket: ticket.id,
            });
        expect(response.status).toBe(201);
        expect(response.body.order).toBeDefined();
        expect(response.body.order.ticket).toBeDefined();
    });

    it("publishes an event", async () => {
        const cookie = (global as any).authenticate();
        const ticket = await (global as any).createTicket();
        await supertest(app)
            .post("/api/orders")
            .set("Cookie", cookie)
            .send({
                ticket: ticket.id,
            });
        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
})