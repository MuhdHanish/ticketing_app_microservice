import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../.env.test.local") });

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";

declare global {
    namespace NodeJS {
        interface Global {
            signup(): Promise<string[]>;
        }
    }
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const URI = mongo.getUri();
    await mongoose.connect(URI);
});

afterAll(async () => {
    const collections = await mongoose.connection.db?.collections() || [];
    for (const collection of collections) {
        await collection.drop();
    }
    if (mongo) await mongo.stop();
    await mongoose.connection.close();
});

(global as any).signup = async () => {
    const email = "jhondoe@example.com";
    const password = "Jhone@123";
    const response = await request(app)
        .post("/api/auth/signup")
        .send({
            email,
            password,
        });
    expect(response.status).toBe(201);
    const cookie = response.get("Set-Cookie");
    expect(cookie).toBeDefined();
    if (!cookie) {   
        throw new Error("No cookie");
    }
    return cookie;
};