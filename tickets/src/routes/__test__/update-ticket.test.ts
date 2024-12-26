import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

describe("update ticket", () => {
    it("has a route handler listening to /api/tickets/:id for put requests", async () => {
        const response = await request(app).put("/api/tickets/1").send({});
        expect(response.status).not.toEqual(404);
    });

    it("returns a 401 or 403 if no token is provided or invalid", async () => {
        const response = await request(app)
            .put("/api/tickets/1")
            .send({});
        expect([401, 403]?.includes(response.status)).toBe(true);
    });

    it("return an error if an invalid id is provided", async () => {
        const cookie = (global as any).authenticate();
        await request(app)
            .put("/api/tickets/1")
            .set("Cookie", cookie)
            .send({})
            .expect(400);
    });

    it("return an error if an invalid title is provided", async () => {
        const cookie = (global as any).authenticate();
        const createResponse = await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: 10,
            }).expect(201);
        await request(app)
            .put(`/api/tickets/${createResponse.body.ticket.id}`)
            .set("Cookie", cookie)
            .send({
                title: "",
                price: 10,
            })
            .expect(400);
    });

    it("return an error if an invalid price is provided", async () => {
        const cookie = (global as any).authenticate();
        const createResponse = await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: 10,
            });
        await request(app)
            .put(`/api/tickets/${createResponse.body.ticket.id}`)
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: -10,
            })
            .expect(400);
    });

    it("has returns a 404 if the ticket is not found", async () => {
        const cookie = (global as any).authenticate();
        const response = await request(app)
            .put(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: 10,
            });
        expect(response.status).toBe(404);
    });

    it("returns an 403 if the user does not own the ticket", async () => {
        const cookie = (global as any).authenticate();
        const createResponse = await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: 10,
            }).expect(201);
        const response = await request(app)
            .put(`/api/tickets/${createResponse.body.ticket.id}`)
            .set("Cookie", (global as any).authenticate())
            .send({
                title: "test",  
                price: 10,
            });
        expect(response.status).toBe(403);
    });

    it("updates the ticket with valid inputs and user owns the ticket", async () => {
        const cookie = (global as any).authenticate();
        const createResponse = await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: 10,
            }).expect(201);
        const response = await request(app)
            .put(`/api/tickets/${createResponse.body.ticket.id}`)
            .set("Cookie", cookie)
            .send({
                title: "test2",
                price: 20,
            });
        expect(response.status).toBe(200);
        expect(response.body.ticket).toBeDefined();
        expect(response.body.ticket.title).toBe("test2");
        expect(response.body.ticket.price).toBe(20);
    });

    it("publishes an event", async () => {
        const cookie = (global as any).authenticate();
        const createResponse = await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: 10,
            }).expect(201);
        await request(app)
            .put(`/api/tickets/${createResponse.body.ticket.id}`)
            .set("Cookie", cookie)
            .send({
                title: "test2",
                price: 20,
            }).expect(200);
        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
})