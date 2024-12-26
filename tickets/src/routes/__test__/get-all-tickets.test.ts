import request from "supertest";
import { app } from "../../app";

describe("get all tickets", () => {
    it("has a route handler listening to /api/tickets for get requests", async () => {
        const response = await request(app).get("/api/tickets").send({});
        expect(response.status).not.toEqual(404);
    });

    it("returns a 401 or 403 if no token is provided or invalid", async () => {
        const response = await request(app)
            .get("/api/tickets")
            .send({});
        expect([401, 403]?.includes(response.status)).toBe(true);
    });

    it("return all tickets", async () => {    
        const cookie = (global as any).authenticate();
        const response = await request(app)
            .get("/api/tickets")
            .set("Cookie", cookie)
            .send({});
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.tickets)).toBe(true);
    });

    it("return an empty array if there are no tickets", async () => {
        const cookie = (global as any).authenticate();
        const response = await request(app)
            .get("/api/tickets")
            .set("Cookie", cookie)
            .send({});
        expect(response.status).toBe(200);
        expect(response.body.tickets.length).toBe(0);
    });

    it("return at least one ticket", async () => { 
        const cookie = (global as any).authenticate();
        await request(app)
            .post("/api/tickets")
            .set("Cookie", cookie)
            .send({
                title: "test",
                price: 10,
            });
        const response = await request(app)
            .get("/api/tickets")
            .set("Cookie", cookie)
            .send({});
        expect(response.status).toBe(200);
        expect(response.body.tickets.length).toBeGreaterThanOrEqual(1);
    });
});