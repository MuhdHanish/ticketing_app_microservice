import { Router } from "express";
import { createPaymentRouter } from "./create-payment";

const paymentRouter = Router();

paymentRouter.use(createPaymentRouter);

export { paymentRouter };