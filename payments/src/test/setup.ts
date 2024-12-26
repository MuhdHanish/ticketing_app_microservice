import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../.env.test.local") });

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Order, OrderStatus, IOrder } from "../models";

jest.mock("../nats-wrapper.ts");
jest.mock("../lib");

declare global {
    namespace NodeJS {
        interface Global {
            authenticate(userId?: string): string[];
            createOrder(user?: string): Promise<IOrder>;
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

(global as any).authenticate = (userId?: string) => {
    const id = userId || new mongoose.Types.ObjectId().toHexString();
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

(global as any).createOrder = async (user?: string): Promise<IOrder> => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        version: 0,
        status: OrderStatus.Created,
        user: user || new mongoose.Types.ObjectId().toHexString(),
    });
    await order.save();
    return order;
};