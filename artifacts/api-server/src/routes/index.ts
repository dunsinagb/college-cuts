import { Router, type IRouter } from "express";
import healthRouter from "./health";
import cutsRouter from "./cuts";
import statsRouter from "./stats";
import tipsRouter from "./tips";

const router: IRouter = Router();

router.use(healthRouter);
router.use(cutsRouter);
router.use(statsRouter);
router.use(tipsRouter);

export default router;
