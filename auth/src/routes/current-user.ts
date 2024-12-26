import { authHandler } from "@hanishdev-ticketing/common";
import { NextFunction, Request, Response, Router } from "express";

const router = Router();

router.get("/currentuser",
    authHandler,
    (req: Request, res: Response, next: NextFunction) => {
        try {
            res.send({ user: req?.user || null });
        } catch (error) {
            next(error);
        }
    });

export { router as currentUserRouter };