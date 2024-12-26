import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

describe("get ticket by id", () => { 
    it("returns a 401 or 403 if no token is provided or invalid", async () => {
        const response = await request(app)
            .get("/api/tickets/1")
            .send({});
        expect([401, 403]?.includes(response.status)).toBe(true);
    });

    it("has a route handler listening to /api/tickets/:id for get requests", async () => {
        const response = await request(app).get("/api/tickets/1").send({});
        expect(response.status).not.toEqual(404);
    });

    it("return an error if an invalid id is provided", async () => {
        const cookie = (global as any).authenticate();
        await request(app)
            .get("/api/tickets/1")
            .set("Cookie", cookie)
            .send({})
            .expect(400);
    });

    it("has returns a 404 if the ticket is not found", async () => {
        const cookie = (global as any).authenticate();
        const response = await request(app)
            .get(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
            .set("Cookie", cookie)
            .send({});
        expect(response.status).toBe(404);
    });

    it("returns the ticket if the ticket is found", async () => { 
        const cookie = (global as any).authenticate();
        const createResponse = await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: 10,
            });
        const response = await request(app)
            .get(`/api/tickets/${createResponse.body.ticket.id}`)
            .set("Cookie", cookie)
            .send({});
        expect(response.status).toBe(200);
        expect(response.body.ticket).toBeDefined();
        expect(response.body.ticket.title).toBe("test");
        expect(response.body.ticket.price).toBe(10);
    });
});