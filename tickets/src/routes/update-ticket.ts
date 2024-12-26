import { Ticket } from "../models";
import {
    CustomHTTPError,
    validationHandler,
} from "@hanishdev-ticketing/common";
import { validateUpdateTicket } from "../lib";
import { natsWrapper } from "../nats-wrapper";
import { TicketUpdatedPublisher } from "../events";
import { NextFunction, Request, Response, Router } from "express";

const router = Router();

router.put("/:id",
    validationHandler(validateUpdateTicket),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!id) { 
                throw new CustomHTTPError("ID is required.", 400);
            }
            const { title, price } = req.body;
            if (!title || !price) {
                throw new CustomHTTPError("Title and price are required.", 400);
            }
            const existingTicket = await Ticket.findById(id);
            if (!existingTicket) {
                throw new CustomHTTPError("Ticket not found with provided ID.", 404);
            }
            if (existingTicket.user !== req.user!.id) {
                throw new CustomHTTPError("User doesn't have access to update this ticket.", 403);
            }
            existingTicket.set({ title, price });
            await existingTicket.save();
            new TicketUpdatedPublisher(natsWrapper.client).publish({
                id: existingTicket.id,
                title: existingTicket.title,
                price: existingTicket.price,
                version: existingTicket.version,
                user: existingTicket.user
            });
            res.status(200).send({ ticket: existingTicket });
        } catch (error: any) {
            next(error);
        }
    });

export { router as updateTicketRouter };