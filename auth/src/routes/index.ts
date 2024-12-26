import { Router } from "express";

import { signupRouter } from "./signup";
import { signinRouter } from "./signin";
import { signoutRouter } from "./signout";
import { currentUserRouter } from "./current-user";

const authRouter = Router();

authRouter.use(signupRouter);
authRouter.use(signinRouter);
authRouter.use(signoutRouter);
authRouter.use(currentUserRouter);

export { authRouter };
