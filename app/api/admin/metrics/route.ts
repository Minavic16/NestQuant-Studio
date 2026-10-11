import { NextResponse } from "next/server";
import { readDocument, STORE_FILES } from "@/data/store/store";
import type { MetricsDay, MetricsDocument } from "@/data/store/schema";
import { requireAdmin } from "@/lib/admin/guard";
import { getReviews } from "@/data/store/repositories";

/**
 * Dashboard metrics. Reads the aggregated daily buckets and derives the
 * figures a non-technical administrator needs: visitors, views, popular pages,
 * where visitors came from, what device they used and how reviews are doing.
 */

const WINDOW_DAYS = 30;

function emptyDay(): MetricsDay {
  return { views: 0, visitors: 0, paths: {}, referrers: {}, devices: {} };
}

function readMetrics(value: unknown): MetricsDocument {
  const source = (typeof value === "object" && value !== null ? value : {}) as Record<
    string,
    unknown
  >;
  const days = (typeof source.days === "object" && source.days !== null ? source.days : {}) as Record<
    string,
    MetricsDay
  >;
  return { version: 1, days, sessions: {} };
}

export async function GET(): Promise<NextResponse> {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const [metrics, reviews] = await Promise.all([
    readDocument(STORE_FILES.metrics, { version: 1, days: {}, sessions: {} } as MetricsDocument, readMetrics),
    getReviews(),
  ]);

  const today = new Date();
  const series: Array<{ date: string; views: number; visitors: number }> = [];
  let totalViews = 0;
  let totalVisitors = 0;
  const paths = new Map<string, number>();
  const referrers = new Map<string, number>();
  const devices = new Map<string, number>();

  for (let offset = WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    const day = metrics.days[key] ?? emptyDay();

    totalViews += day.views;
    totalVisitors += day.visitors;
    series.push({ date: key, views: day.views, visitors: day.visitors });

    for (const [path, count] of Object.entries(day.paths)) {
      paths.set(path, (paths.get(path) ?? 0) + count);
    }
    for (const [referrer, count] of Object.entries(day.referrers)) {
      referrers.set(referrer, (referrers.get(referrer) ?? 0) + count);
    }
    for (const [device, count] of Object.entries(day.devices)) {
      devices.set(device, (devices.get(device) ?? 0) + count);
    }
  }

  const top = (map: Map<string, number>, limit: number) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([label, count]) => ({ label, count }));

  return NextResponse.json(
    {
      window: WINDOW_DAYS,
      totals: {
        views: totalViews,
        visitors: totalVisitors,
        viewsToday: series.at(-1)?.views ?? 0,
        visitorsToday: series.at(-1)?.visitors ?? 0,
      },
      series,
      topPaths: top(paths, 8),
      topReferrers: top(referrers, 6),
      devices: top(devices, 4),
      reviews: {
        pending: reviews.filter((review) => review.status === "pending").length,
        approved: reviews.filter((review) => review.status === "approved").length,
        average:
          reviews.filter((review) => review.status === "approved").length > 0
            ? Number(
                (
                  reviews
                    .filter((review) => review.status === "approved")
                    .reduce((sum, review) => sum + review.rating, 0) /
                  reviews.filter((review) => review.status === "approved").length
                ).toFixed(1),
              )
            : null,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
