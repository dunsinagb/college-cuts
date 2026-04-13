import { Router, type IRouter } from "express";
import Parser from "rss-parser";

const router: IRouter = Router();
const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "CollegeCuts/1.0 RSS Reader" },
});

const FEEDS = [
  {
    id: "inside-higher-ed",
    name: "Inside Higher Ed",
    url: "https://www.insidehighered.com/rss.xml",
  },
  {
    id: "edscoop",
    name: "EdScoop",
    url: "https://edscoop.com/feed/",
  },
  {
    id: "ecampus-news",
    name: "eCampus News",
    url: "https://www.ecampusnews.com/feed/",
  },
  {
    id: "higher-ed-dive",
    name: "Higher Ed Dive",
    url: "https://www.highereddive.com/feeds/news/",
  },
];

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  link: string;
  pubDate: string;
  source: string;
  sourceId: string;
};

type CacheEntry = {
  data: NewsItem[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 30 * 60 * 1000;
let cache: CacheEntry | null = null;

function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

async function fetchAllFeeds(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const fetched = await parser.parseURL(feed.url);
      return (fetched.items ?? []).map((item, idx): NewsItem => ({
        id: `${feed.id}-${idx}-${item.guid ?? item.link ?? idx}`,
        title: stripHtml(item.title) || "Untitled",
        excerpt: truncate(
          stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? ""),
          280
        ),
        link: item.link ?? "",
        pubDate: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        source: feed.name,
        sourceId: feed.id,
      }));
    })
  );

  const items: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }

  items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return items;
}

router.get("/news", async (_req, res): Promise<void> => {
  try {
    const now = Date.now();
    if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
      res.json(cache.data);
      return;
    }

    const items = await fetchAllFeeds();
    cache = { data: items, fetchedAt: now };
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
