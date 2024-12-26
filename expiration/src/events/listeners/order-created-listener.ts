import { Listener, OrderCreatedEvent, Subjects } from "@hanishdev-ticketing/common";
import { EXPIRATION_LISTENER_QUEUE_GROUP } from "../queue-groups";
import { expirationQueue } from "../queues/expiration-queue";
import { Message } from "node-nats-streaming";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    readonly subject = Subjects.OrderCreated;
    queueGroupName = EXPIRATION_LISTENER_QUEUE_GROUP;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log(`Waiting ${delay}ms to process the job...`);
        await expirationQueue.add({
            order: data.id
        }, { delay });
        msg.ack();
    }
}