import { NextFunction, Request, Response, Router } from "express";
import { Order } from "../models";

const router = Router();

router.get("/",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user!;
            const orders = await Order.find({ user: id }).populate('ticket');
            res.status(200).send({ orders });
        } catch (error: any) {
            next(error);
        }
    });

export { router as getAllOrdersRouter };