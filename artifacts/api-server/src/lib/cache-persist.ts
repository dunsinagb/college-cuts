import fs from "fs";
import path from "path";
import { logger } from "./logger";
import type { ScorecardRow } from "../routes/skills-gap";

export interface PersistedCache {
  data: ScorecardRow[];
  timestamp: number;
}

function getCachePath(): string {
  return process.env["SCORECARD_CACHE_PATH"]
    ?? path.resolve(process.cwd(), "data", "scorecard-cache.json");
}

export function writeScorecardCache(cache: PersistedCache): void {
  const filePath = getCachePath();
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(cache), "utf8");
    logger.debug({ filePath }, "[cache-persist] Scorecard written to disk");
  } catch (err) {
    logger.warn({ err, filePath }, "[cache-persist] Failed to write scorecard cache to disk");
  }
}

export function readScorecardCache(): PersistedCache | null {
  const filePath = getCachePath();
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as PersistedCache;
    if (
      !Array.isArray(parsed.data) ||
      typeof parsed.timestamp !== "number"
    ) {
      logger.warn({ filePath }, "[cache-persist] Disk cache has unexpected shape — ignoring");
      return null;
    }
    logger.info(
      { filePath, rows: parsed.data.length, age_s: Math.round((Date.now() - parsed.timestamp) / 1000) },
      "[cache-persist] Scorecard seeded from disk",
    );
    return parsed;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      logger.warn({ err, filePath }, "[cache-persist] Failed to read scorecard cache from disk");
    }
    return null;
  }
}
