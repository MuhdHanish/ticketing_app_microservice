import express from "express";
import {
    authHandler,
    CustomHTTPError,
    errorHandler
} from "@hanishdev-ticketing/common";
import cookieSession from "cookie-session";
import { paymentRouter } from "./routes";

const app = express();

app.set("trust proxy", true);

app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
}));

app.use("/api/payments", authHandler, paymentRouter);

app.use("*", (req, res, next) => {
    errorHandler(new CustomHTTPError("Resource not found.", 404), req, res, next);
});

app.use(errorHandler);

export { app };