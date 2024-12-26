import request from "supertest";
import { app } from "../../app";

describe("currentuser", () => { 
    it("returns a 401 or 403 if no token is provided or invalid", async () => { 
        const response = await request(app)
            .get("/api/auth/currentuser")
            .send({});
        const status = response.status;
        expect([401, 403]?.includes(status)).toBe(true);
    });
    
    it("return a 200 and user if token is provided and valid", async () => {
        const cookie = await (global as any).signup() as string[];
        expect(cookie).toBeDefined();
        const response = await request(app)
            .get("/api/auth/currentuser")
            .set("Cookie", cookie)
            .send({});
        expect(response.status).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("email");
    });
});