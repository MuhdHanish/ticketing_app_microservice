import supertest from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { OrderStatus } from "@hanishdev-ticketing/common";
import { stripe } from "../../lib";

describe("create payment", () => {
    it("has a route handler listening to /api/payments for post requests", async () => {
        const response = await supertest(app).post("/api/payments").send({});
        expect(response.status).not.toEqual(404);
    });

    it("can only be accessed if the user is signed in", async () => {
        await supertest(app).post("/api/payments").send({}).expect(401);
    });

    it("returns a status other than 401 if the user is signed in", async () => {
        const response = await supertest(app)
            .post("/api/payments")
            .set("Cookie", (global as any).authenticate())
            .send({});
        expect(response.status).not.toEqual(401);
    });
    
    it("returns an error if an invalid token is provided", async () => {
        const response = await supertest(app)
            .post("/api/payments")
            .set("Cookie", ["session=invalid-token"])
            .send({});
        expect([401, 403]?.includes(response.status)).toBe(true);
    });

    it("return a 400 if the order is not provided", async () => {
        const response = await supertest(app)
            .post("/api/payments")
            .set("Cookie", (global as any).authenticate())
            .send({});
        expect(response.status).toBe(400);
    });

    it("return a 404 if the order is not found", async () => {
        const response = await supertest(app)
            .post("/api/payments")
            .set("Cookie", (global as any).authenticate())
            .send({
                order: new mongoose.Types.ObjectId().toHexString(),
            });
        expect(response.status).toBe(404);
    });

    it("return a 403 if the order doesn't belong to the user", async () => {
        const order = await (global as any).createOrder();
        const response = await supertest(app)
            .post("/api/payments")
            .set("Cookie", (global as any).authenticate())
            .send({
                order: order.id,
            });
        expect(response.status).toBe(403);
    });

    it("return a 400 if the order is cancelled", async () => {
        const order = await (global as any).createOrder();
        order.status = OrderStatus.Cancelled;
        await order.save();
        const response = await supertest(app)
            .post("/api/payments")
            .set("Cookie", (global as any).authenticate(order.user))
            .send({
                order: order.id,
            });
        expect(response.status).toBe(400);
    });
});