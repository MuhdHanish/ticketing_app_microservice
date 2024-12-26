import { Request, Response, Router } from "express";

const router = Router();

router.post("/signout", (req: Request, res: Response) => {
    req.session = null;
    res.status(200).send({ message: "Signed out successfully." });
});

export { router as signoutRouter };