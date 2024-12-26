import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { OrderStatus } from "@hanishdev-ticketing/common";

describe("cancel order", () => { 
    it("has a route handler listening to /api/orders/:id for delete requests", async () => {
        const response = await request(app).patch("/api/orders/1").send({});
        expect(response.status).not.toEqual(404);
    });

    it("return a 401 or 403 if no token is provided or invalid", async () => {
        const response = await request(app)
            .patch("/api/orders")
            .send({});
        const status = response.status;
        expect([401, 403]?.includes(status)).toBe(true);
    });

    it("return a 404 if the order is not found", async () => {
        return request(app)
            .patch(`/api/orders/${new mongoose.Types.ObjectId().toHexString()}`)
            .set("Cookie", (global as any).authenticate())
            .send({})
            .expect(404);
    });

    it("return a 204 if the provided token and id are valid", async () => {
        const order = await (global as any).createOrder();
        const cookie = (global as any).authenticate(order.user);
        const response = await request(app)
            .patch(`/api/orders/${order._id}`)
            .set("Cookie", cookie)
            .send({});
        expect(response.status).toBe(200);
        expect(response.body.order).toBeDefined();
        expect(response.body.order.status).toBe(OrderStatus.Cancelled);
    });

    it("publishes an event", async () => {
        const cookie = (global as any).authenticate();
        const order = await (global as any).createOrder();
        await request(app)
            .patch(`/api/orders/${order._id}`)
            .set("Cookie", cookie)
            .send({});
        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});