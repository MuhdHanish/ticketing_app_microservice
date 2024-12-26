import { CustomHTTPError, OrderStatus, validationHandler } from "@hanishdev-ticketing/common";
import { Request, Response, Router, NextFunction } from "express";
import { validateCreatePayment, stripe } from "../lib";
import { Order, Payment } from "../models";
import { PaymentCreatedPublisher } from "../events/publishers";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.post("/",
    validationHandler(validateCreatePayment),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { order } = req.body;
            if (!order) {
                throw new CustomHTTPError("Order is required.", 400);
            }
 
            order = await Order.findById(order);
            if (!order) {
                throw new CustomHTTPError("Order not found.", 404);
            }

            const { id } = req.user!;
            if (order.user !== id) {
                throw new CustomHTTPError("User doesn't have access to create payment for this order.", 403);
            }

            if(order.status === OrderStatus.Cancelled) {
                throw new CustomHTTPError("Cannot create payment for cancelled order.", 400);
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: order.price * 100,
                currency: 'usd',
                payment_method: 'pm_card_visa',
                payment_method_types: ['card'],
            });

            const payment = Payment.build({
                order: order.id,
                stripe: paymentIntent.id
            });
            await payment.save();

            new PaymentCreatedPublisher(natsWrapper.client).publish({
                id: payment.id,
                order: payment.order,
                stripe: payment.stripe
            });

            res.status(201).send({ message: "Payment created successfully." });
        } catch (error) {
            next(error);
        }
    });

export { router as createPaymentRouter };