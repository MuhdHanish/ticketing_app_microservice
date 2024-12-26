import request from "supertest";
import { app } from "../../app";

describe("signin", () => {
    it("returns a 400 with missing email and password", async () => {
        return request(app)
            .post("/api/auth/signin")
            .send({})
            .expect(400);
    });

    it("returns a 400 with an invalid email", async () => {
        return request(app)
            .post("/api/auth/signin")
            .send({
                email: "testtest.com",
                password: "Jhone@123",
            })
            .expect(400);
    });

    it("returns a 400 with an invalid password", async () => {
        return request(app)
            .post("/api/auth/signin")
            .send({
                email: "jhondoe@example.com",
                password: "J",
            })
            .expect(400);
    });

    it("returns a 400 with an invalid email and password", async () => {
        return request(app)
            .post("/api/auth/signin")
            .send({
                email: "testtest.com",
                password: "J",
            })
            .expect(400);
    });

    it("returns a 401 with an invalid credentials", async () => {
        await request(app)
            .post("/api/auth/signin")
            .send({
                email: "jhondoe@example.com",
                password: "Jhone@123",
            })
            .expect(401);
    });

    it("return a 200 and sets a cookie after successful signin", async () => {
        await (global as any).signup();
        const response = await request(app)
            .post("/api/auth/signin")
            .send({
                email: "jhondoe@example.com",
                password: "Jhone@123",
            });
        expect(response.status).toBe(200);
        expect(response.get("Set-Cookie")).toBeDefined();
    });
});