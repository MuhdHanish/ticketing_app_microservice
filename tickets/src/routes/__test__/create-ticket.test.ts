import request from "supertest";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";

describe("create ticket", () => {
    it("has a route handler listening to /api/tickets for post requests", async () => {
        const response = await request(app).post("/api/tickets").send({});
        expect(response.status).not.toEqual(404);
    });

    it("can only be accessed if the user is signed in", async () => {
        const response = await request(app).post("/api/tickets").send({});
        expect([401, 403]?.includes(response.status)).toBe(true);
    });

    it("returns a status other than 401 or 403 if the user is signed in", async () => {
        const cookie = (global as any).authenticate();
        const response = await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({});
        expect(response.status).not.toEqual(401);
    });

    it("returns an error if an invalid title is provided", async () => {
        const cookie = (global as any).authenticate();
        await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "",
                price: 10,
            })
            .expect(400);
    });

    it("returns an error if an invalid price is provided", async () => {
        const cookie = (global as any).authenticate();
        await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: -10,
            })
            .expect(400);
    });

    it("creates a ticket with valid inputs", async () => {
        const cookie = (global as any).authenticate();
        const response = await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: 10,
            });
        expect(response.status).toBe(201);
        expect(response.body.ticket).toBeDefined();
        expect(response.body.ticket.title).toBe("test");
        expect(response.body.ticket.price).toBe(10);
    });

    it("publishes an event", async () => {
        const cookie = (global as any).authenticate();
        await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: 10,
            })
            .expect(201);
        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});
