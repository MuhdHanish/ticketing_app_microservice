import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../.env.test.local") });

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { Ticket, Order, OrderStatus } from "../models";

jest.mock("../nats-wrapper.ts");

declare global {
    namespace NodeJS {
        interface Global {
            authenticate(): string[];
            createTicket(): Promise<any>;
            createOrder(): Promise<any>;
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

(global as any).authenticate = (providedId?: string) => {
    const id = providedId || new mongoose.Types.ObjectId().toHexString();
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

(global as any).createTicket = async () => {
    const ticket = Ticket.build({
        title: "concert",
        price: 10,

    });
    await ticket.save();
    return ticket;
};

(global as any).createOrder = async (createdTicket?: any) => {
    const ticket = createdTicket || await (global as any).createTicket();
    const order = Order.build({
        ticket,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        user: new mongoose.Types.ObjectId().toHexString(),
    });
    await order.save();
    return order;
};