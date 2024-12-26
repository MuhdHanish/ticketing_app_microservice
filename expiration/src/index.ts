import "dotenv/config";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

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

        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());
    } catch (error) {
        console.error("NATS connection error:", error);
        process.exit(1);
    }
}

const gracefulShutdown = async (signal: NodeJS.Signals) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    try {
        if (natsWrapper.client) {
            console.log("Closing NATS connection...");
            natsWrapper.client.close();
        }

        console.log("All connections closed. Exiting process.");
        process.exit(0);
    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
    }
};

const startServer = async () => {
    const keys = ['NATS_CLUSTER_ID', 'NATS_CLIENT_ID', 'NATS_URL', 'REDIS_HOST'];
    for (const key of keys) {
        if (!process.env[key]) {
            throw new Error(`Missing environment variable ${key}`);
        }
    }

    await connectNATS();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();