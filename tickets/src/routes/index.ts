import { Router } from "express";

import { createTickerRouter } from "./create-ticket";
import { getTicketByIdRouter } from "./get-ticket-by-id";
import { getAllTicketsRouter } from "./get-all-tickets";
import { updateTicketRouter } from "./update-ticket";

const ticketRouter = Router();

ticketRouter.use(createTickerRouter);
ticketRouter.use(updateTicketRouter);
ticketRouter.use(getTicketByIdRouter);
ticketRouter.use(getAllTicketsRouter);

export { ticketRouter };