import "dotenv/config";
import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./nats-wrapper";
import { OrderCancelledListener, OrderCreatedListener } from "./events";

const connectNATS = async () => {
    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID!,
            process.env.NATS_CLIENT_ID!,
            process.env.NATS_URL!
        );
        console.log('NATS connected successfully'); 
        natsWrapper.client.on("close", () => {
            console.log("NATS connection closed");
            process.exit();
        });

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());
    } catch (error) {
        console.error("NATS connection error:", error);
        process.exit(1);
    }
}

const connectDB = async () => {
    try {
        const URI = process.env.MONGO_URI!;
        await mongoose.connect(URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

const gracefulShutdown = async (signal: NodeJS.Signals) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    try {
        if (natsWrapper.client) {
            console.log("Closing NATS connection...");
            natsWrapper.client.close();
        }
        console.log("Closing MongoDB connection...");
        await mongoose.connection.close();
        console.log("All connections closed. Exiting process.");
        process.exit(0);
    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
    }
};

const startServer = async () => {
    const keys = ['NATS_CLUSTER_ID', 'NATS_CLIENT_ID', 'NATS_URL', 'MONGO_URI','JWT_SECRET'];
    for (const key of keys) {
        if (!process.env[key]) {
            throw new Error(`Missing environment variable ${key}`);
        }
    }

    await connectNATS();
    await connectDB();

    app.listen(8004, () => {
        console.log("Payments service listening on port 8004");
    });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();