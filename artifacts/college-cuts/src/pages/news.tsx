import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Helmet } from "react-helmet-async";
import { ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  link: string;
  pubDate: string;
  source: string;
  sourceId: string;
};

const SOURCES = [
  { id: "all", name: "All" },
  { id: "inside-higher-ed", name: "Inside Higher Ed" },
  { id: "chronicle", name: "Chronicle of Higher Education" },
  { id: "edscoop", name: "EdScoop" },
  { id: "ecampus-news", name: "eCampus News" },
  { id: "higher-ed-dive", name: "Higher Ed Dive" },
];

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  "inside-higher-ed": { bg: "bg-blue-100", text: "text-blue-800" },
  chronicle: { bg: "bg-purple-100", text: "text-purple-800" },
  edscoop: { bg: "bg-green-100", text: "text-green-800" },
  "ecampus-news": { bg: "bg-amber-100", text: "text-amber-800" },
  "higher-ed-dive": { bg: "bg-indigo-100", text: "text-indigo-800" },
};

function SkeletonCard() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function News() {
  const [activeSource, setActiveSource] = useState("all");

  const {
    data: items,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<NewsItem[]>({
    queryKey: ["news"],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/news`);
      if (!r.ok) throw new Error("Failed to load news feed");
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 30,
  });

  const filtered =
    activeSource === "all" ? (items ?? []) : (items ?? []).filter((item) => item.sourceId === activeSource);

  return (
    <>
      <Helmet>
        <title>College Program Closures & Higher Ed Budget Cuts — News | CollegeCuts</title>
        <meta name="description" content="The latest news on college program closures, university budget cuts, faculty layoffs, and campus shutdowns — aggregated daily from Inside Higher Ed, EdScoop, eCampus News, and Higher Ed Dive." />
        <link rel="canonical" href="https://college-cuts.com/news" />
      </Helmet>
    <div className="min-h-screen bg-[#f0f4f9]">
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 60%, #1a3352 100%)" }}
      >
        <div className="relative container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 mt-1">
              <Newspaper className="h-6 w-6 text-amber-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Higher Ed News
              </h1>
              <p className="text-blue-200 text-base max-w-2xl">
                The latest from Inside Higher Ed, EdScoop, eCampus News, and Higher Ed Dive — aggregated and updated automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((src) => (
              <button
                key={src.id}
                onClick={() => setActiveSource(src.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeSource === src.id
                    ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1e3a5f]/50 hover:text-[#1e3a5f]"
                }`}
              >
                {src.name}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-[#1e3a5f] self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Newspaper className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">Unable to load news feeds</p>
              <p className="text-sm text-gray-500 mt-1">
                The RSS feeds may be temporarily unavailable. Please try again.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
            >
              Try Again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Newspaper className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700">No articles found</p>
            <p className="text-sm text-gray-500">No stories match this filter right now.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {filtered.length} article{filtered.length !== 1 ? "s" : ""}
              {activeSource !== "all" ? ` from ${SOURCES.find((s) => s.id === activeSource)?.name}` : ""}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => {
                const colors = SOURCE_COLORS[item.sourceId] ?? { bg: "bg-gray-100", text: "text-gray-700" };
                let dateStr = "";
                try {
                  dateStr = format(parseISO(item.pubDate), "MMM d, yyyy");
                } catch {
                  dateStr = item.pubDate;
                }
                return (
                  <Card
                    key={item.id}
                    className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col"
                  >
                    <CardContent className="p-5 flex flex-col flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${colors.bg} ${colors.text}`}
                        >
                          {item.source}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#1e3a5f] leading-snug line-clamp-3">
                        {item.title}
                      </h3>
                      {item.excerpt && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1">
                          {item.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
                        <span className="text-xs text-gray-400">{dateStr}</span>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a5f] hover:text-amber-600 transition-colors"
                        >
                          Read article
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
