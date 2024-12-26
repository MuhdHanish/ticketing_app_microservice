import { Ticket } from "../models";
import {
    CustomHTTPError,
    validationHandler,
} from "@hanishdev-ticketing/common";
import { validParamId } from "../lib";
import { NextFunction, Request, Response, Router } from "express";

const router = Router();

router.get("/:id",
    validationHandler(validParamId),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!id) {
                throw new CustomHTTPError("ID is required.", 400);
            }
            const ticket = await Ticket.findById(id);
            if (!ticket) {
                throw new CustomHTTPError("Ticket not found with provided ID.", 404);
            }
            res.status(200).send({ ticket });
        } catch (error: any) {
            next(error);
        }
    });

export { router as getTicketByIdRouter };