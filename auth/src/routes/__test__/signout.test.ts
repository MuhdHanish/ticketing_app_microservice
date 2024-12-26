import request from "supertest";
import { app } from "../../app";

describe("signout", () => {
    it("return a 2XX and clears the cookie session after signout", async () => {
        await request(app)
            .post("/api/auth/signup")
            .send({
                email: "jhondoe@example.com",
                password: "Jhone@123",
            })
            .expect(201);
        const response = await request(app)
            .post("/api/auth/signout")
            .send({});
        const cookie = response.get("Set-Cookie");
        const status = response.status;
        expect(status?.toString().startsWith('2')).toBe(true);
        expect(cookie).toBeDefined();
        expect(cookie?.toString()).toContain("session=;");
    });
});