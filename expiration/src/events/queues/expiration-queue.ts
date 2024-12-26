import Queue from "bull";
import { ExpirationCompletedPublisher } from "../publishers";
import { natsWrapper } from "../../nats-wrapper";

interface Payload { 
    order: string;
}

const expirationQueue = new Queue<Payload>("order-expiration", {
    redis: {
        host: process.env.REDIS_HOST,
    },
});

expirationQueue.process(async (job) => {
    console.log(`Processing job ${job.id}...`);
    new ExpirationCompletedPublisher(natsWrapper.client).publish({
        order: job.data.order
    });
});

export { expirationQueue };