import jwt from "jsonwebtoken";
import { User } from "../models";
import {
    CustomHTTPError,
    validationHandler,
} from "@hanishdev-ticketing/common";
import { validateEmailPassword } from "../lib";
import { NextFunction, Request, Response, Router } from "express";

const router = Router();

router.post("/signin",
    validationHandler(validateEmailPassword),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new CustomHTTPError("Email and password are required.", 400);
            }

            const user = await User.findOne({ email });
            if (!user || !await user.comparePassword(password)) {
                throw new CustomHTTPError("Credentials are not valid.", 401);
            }

            const token = jwt.sign({
                id: user.id,
                email: user.email,
            }, process.env.JWT_SECRET!);

            req.session = {
                token,
            };

            res.send({ user });
        } catch (error: any) {
            next(error);
        }
    });

export { router as signinRouter };