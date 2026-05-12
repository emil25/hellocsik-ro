import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import categoriesRouter from "./categories";
import adminRouter from "./admin";
import storageRouter from "./storage";
import bannersRouter from "./banners";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(categoriesRouter);
router.use(adminRouter);
router.use(storageRouter);
router.use(bannersRouter);

export default router;
