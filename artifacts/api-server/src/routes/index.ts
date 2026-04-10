import { Router, type IRouter } from "express";
import healthRouter from "./health";
import cutsRouter from "./cuts";
import statsRouter from "./stats";
import tipsRouter from "./tips";
import subscribeRouter from "./subscribe";
import jobOutlookRouter from "./job-outlook";
import newsRouter from "./news";

const router: IRouter = Router();

router.use(healthRouter);
router.use(cutsRouter);
router.use(statsRouter);
router.use(tipsRouter);
router.use(subscribeRouter);
router.use(jobOutlookRouter);
router.use(newsRouter);

export default router;
