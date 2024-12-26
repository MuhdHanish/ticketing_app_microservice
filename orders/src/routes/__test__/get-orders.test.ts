import request from "supertest";
import { app } from "../../app";

describe("get orders", () => {
    it("has a route handler listening to /api/orders for get requests", async () => {
        const response = await request(app).get("/api/orders").send({});
        expect(response.status).not.toEqual(404);
    });

    it("return a 401 or 403 if no token is provided or invalid", async () => {
        const response = await request(app)
            .get("/api/orders")
            .send({});
        const status = response.status;
        expect([401, 403]?.includes(status)).toBe(true);
    });

    it("return a 200 and orders if the token is provided and valid", async () => {
        const cookie = (global as any).authenticate();
        const response = await request(app)
            .get("/api/orders")
            .set("Cookie", cookie)
            .send({});
        expect(response.status).toBe(200);
        expect(response.body.orders).toBeDefined();
        expect(Array.isArray(response.body.orders)).toBe(true);
    });
});