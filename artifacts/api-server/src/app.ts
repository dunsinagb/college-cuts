import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import sitemapRouter from "./routes/sitemap";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use("/api", apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/robots.txt", (_req, res) => {
  res.set("Content-Type", "text/plain");
  res.set("Cache-Control", "public, max-age=86400");
  res.send([
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://college-cuts.com/sitemap.xml",
    "Sitemap: https://college-cuts.com/news-sitemap.xml",
  ].join("\n"));
});

app.use(sitemapRouter);
app.use("/api", router);

export default app;
