import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import claimsRouter from "./claims";
import messagesRouter from "./messages";
import callsRouter from "./calls";
import documentsRouter from "./documents";
import feedbackRouter from "./feedback";
import billsRouter from "./bills";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(claimsRouter);
router.use(messagesRouter);
router.use(callsRouter);
router.use(documentsRouter);
router.use(feedbackRouter);
router.use(billsRouter);
router.use(dashboardRouter);

export default router;
