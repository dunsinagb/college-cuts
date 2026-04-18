import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import sitemapRouter from "./routes/sitemap";
import { isSocialCrawler, resolveMajorRow, buildShareHtml } from "./routes/og";
import { logger } from "./lib/logger";
import { warmScorecardCache } from "./routes/skills-gap";

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

/**
 * GET /job-outlook?major=:major
 *
 * Crawler middleware: social media bots (LinkedIn, Twitter/X, Facebook, etc.) do
 * not execute JavaScript, so the React SPA's client-side <Helmet> tags are
 * invisible to them.  This route intercepts requests from known crawlers and
 * returns a server-rendered HTML shell with the correct og:image, og:title, and
 * og:description already in the <head>.  Human visitors are immediately
 * redirected to the Vite SPA so they see the full interactive page.
 *
 * NOTE: In the Vite development server (vite.config.ts), /job-outlook requests
 * whose User-Agent matches a known crawler are proxied here via the `bypass`
 * function so that testing against curl/Postman works without standing up a
 * separate proxy.  In production the same effect is achieved by routing all
 * /job-outlook traffic through this Express server before the static file CDN.
 */
app.get("/job-outlook", async (req, res, next): Promise<void> => {
  const ua = req.headers["user-agent"] ?? "";

  if (!isSocialCrawler(ua)) {
    const qs = req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    res.redirect(302, `https://college-cuts.com/job-outlook${qs}`);
    return;
  }

  const major = typeof req.query.major === "string" ? req.query.major.trim() : "";
  if (!major) {
    res.redirect(302, "https://college-cuts.com/job-outlook");
    return;
  }

  try {
    const row = await resolveMajorRow(major);
    if (!row) {
      res.redirect(302, `https://college-cuts.com/job-outlook?major=${encodeURIComponent(major)}`);
      return;
    }
    const html = buildShareHtml(row, major);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    res.send(html);
  } catch (err) {
    logger.error({ err }, "[crawler] /job-outlook handler error");
    next(err);
  }
});

app.use("/api", router);

const SCORECARD_REFRESH_MS = 5 * 60 * 1000;

warmScorecardCache();
setInterval(warmScorecardCache, SCORECARD_REFRESH_MS).unref();

export default app;
