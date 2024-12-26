import {
    CustomHTTPError,
    OrderStatus,
    validationHandler,
} from "@hanishdev-ticketing/common";
import { Order, Ticket } from "../models";
import { validateCreateOrder } from "../lib";
import { natsWrapper } from "../nats-wrapper";
import { OrderCreatedPublisher } from "../events";
import { NextFunction, Request, Response, Router } from "express";

const router = Router();

const  EXPERRARION_WINDOW_SECONDS = 60;

router.post("/",
    validationHandler(validateCreateOrder),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ticket } = req.body;
            if (!ticket) {
                throw new CustomHTTPError("Ticket is required.", 400);
            }
            const existingTicket = await Ticket.findById(ticket);
            if (!existingTicket) {
                throw new CustomHTTPError("Ticket not found.", 404);
            }
            const isReserved = await existingTicket.isReserved();
            if (isReserved) {
                throw new CustomHTTPError("Ticket is already reserved.", 400);
            }
            const { id } = req.user!;
            const expiration = new Date();
            expiration.setSeconds(expiration.getSeconds() + EXPERRARION_WINDOW_SECONDS);
            const order = Order.build({
                user: id,
                status: OrderStatus.Created,
                expiresAt: expiration,
                ticket
            })
            await order.save();
            new OrderCreatedPublisher(natsWrapper.client).publish({
                id: order.id,
                status: order.status,
                expiresAt: order.expiresAt.toISOString(),
                user: order.user,
                version: order.version,
                ticket: {
                    id: existingTicket.id,
                    price: existingTicket.price
                }
            });
            res.status(201).send({ order });
        } catch (error: any) {
            next(error);
        }
    });

export { router as createOrderRouter };