import jwt from "jsonwebtoken";
import { User } from "../models";
import {
    CustomHTTPError,
    validationHandler,
} from "@hanishdev-ticketing/common";
import { validateEmailPassword } from "../lib";
import { NextFunction, Request, Response, Router } from "express";

const router = Router();

router.post("/signup",
    validationHandler(validateEmailPassword),
    async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {   
            throw new CustomHTTPError("Email and password are required.", 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new CustomHTTPError("Email already exists.", 409);
        }

        const user = User.build({ email, password });
        await user.save();

        const token = jwt.sign({
            id: user.id,
            email: user.email,
        }, process.env.JWT_SECRET!);

        req.session = {
            token,
        };

        res.status(201).send({ user });
    } catch (error: any) {
        next(error);
    }
});

export { router as signupRouter };