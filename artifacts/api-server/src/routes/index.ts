import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import categoriesRouter from "./categories";
import adminRouter from "./admin";
import storageRouter from "./storage";
import bannersRouter from "./banners";
import localStorageRouter from "./local-storage";
import newsletterRouter from "./newsletter";
import cinemaRouter from "./cinema";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(categoriesRouter);
router.use(adminRouter);
router.use(localStorageRouter);
router.use(storageRouter);
router.use(bannersRouter);
router.use(newsletterRouter);
router.use(cinemaRouter);

export default router;
