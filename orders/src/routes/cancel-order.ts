import {
    CustomHTTPError,
    OrderStatus,
    validationHandler,
} from "@hanishdev-ticketing/common";
import { validParamId } from "../lib";
import { Request, Response, NextFunction, Router } from "express";
import { Order } from "../models";
import { OrderCancelledPublisher } from "../events";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.patch("/:id/cancel",
    validationHandler(validParamId),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!id) {
                throw new CustomHTTPError("ID is required.", 400);
            }
            const user = req.user!;
            const order = await Order.findOne({ _id: id, user: user.id });
            if (!order) {
                throw new CustomHTTPError("Order not found with provided ID and user", 404);
            }
            order.status = OrderStatus.Cancelled;
            await order.save();
            new OrderCancelledPublisher(natsWrapper.client).publish({
                id: order._id as string,
                version: order.version,
                ticket: {
                    id: order.ticket._id as string
                }
            });
            res.status(200).send({ order });
        } catch (error) {
            next(error);
        }
    });

export { router as cancelOrderRouter };