import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import categoriesRouter from "./categories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(categoriesRouter);

export default router;
