import { Router } from "express";

import {createOrderRouter} from "./create-order";
import {getAllOrdersRouter} from "./get-orders";
import { getOrderByIdRouter } from "./get-order-by-id";
import { cancelOrderRouter } from "./cancel-order";

const router = Router();

router.use(createOrderRouter);
router.use(getAllOrdersRouter);
router.use(getOrderByIdRouter);
router.use(cancelOrderRouter);

export { router as orderRouter };