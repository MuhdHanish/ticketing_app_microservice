import { Ticket } from "../models";
import {
    CustomHTTPError,
    validationHandler,
} from "@hanishdev-ticketing/common";
import { validateCreateTicket } from "../lib";
import { natsWrapper } from "../nats-wrapper";
import { TicketCreatedPublisher } from "../events";
import { NextFunction, Request, Response, Router } from "express";

const router = Router();

router.post("/",
    validationHandler(validateCreateTicket),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { title, price } = req.body;
            if (!title || !price) {
                throw new CustomHTTPError("Title and price are required.", 400);
            }
            const { id } = req.user!;
            const ticket = Ticket.build({ title, price, user: id });
            await ticket.save();
            new TicketCreatedPublisher(natsWrapper.client).publish({
                id: ticket.id,
                title: ticket.title,
                price: ticket.price,
                version: ticket.version,
                user: id
            });
            res.status(201).send({ ticket });
        } catch (error: any) {
            next(error);
        }
    });

export { router as createTickerRouter };