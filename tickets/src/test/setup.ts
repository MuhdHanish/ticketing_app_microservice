import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../.env.test.local") });

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

jest.mock("../nats-wrapper.ts");

declare global {
    namespace NodeJS {
        interface Global {
            authenticate(): string[];
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

(global as any).authenticate = () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const email = "jhondoe@example.com";
    const token = jwt.sign({
        id,
        email,
    }, process.env.JWT_SECRET!);
    const session = { token };
    const sessionJSON = JSON.stringify(session);
    const base64 = Buffer.from(sessionJSON).toString("base64");
    const cookie = [`session=${base64}=;path=/;httponly`];
    return cookie;
};