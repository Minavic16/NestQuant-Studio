"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./metrics-panel.module.css";
import { Counter } from "@/components/effects/Counter";

/**
 * Metrics panel for the dashboard.
 *
 * Everything a non-technical administrator needs to see "what is going on":
 * visitors and views over the last 30 days, today's numbers, the most-viewed
 * pages, where visitors came from, and what devices they used.
 */

type Metrics = {
  window: number;
  totals: { views: number; visitors: number; viewsToday: number; visitorsToday: number };
  series: Array<{ date: string; views: number; visitors: number }>;
  topPaths: Array<{ label: string; count: number }>;
  topReferrers: Array<{ label: string; count: number }>;
  devices: Array<{ label: string; count: number }>;
  reviews: { pending: number; approved: number; average: number | null };
};

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void fetch("/api/admin/metrics")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load metrics.");
        return response.json() as Promise<Metrics>;
      })
      .then((data) => {
        if (active) setMetrics(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load metrics.");
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className={styles.panel}>
        <p className={styles.error} role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={styles.panel}>
        <p className={styles.loading}>Loading metrics…</p>
      </div>
    );
  }

  const peak = Math.max(1, ...metrics.series.map((day) => day.views));

  return (
    <div className={styles.panel}>
      <div className={styles.cards}>
        <Metric label="Visitors" hint={`Last ${metrics.window} days`} value={metrics.totals.visitors} />
        <Metric label="Page views" hint={`Last ${metrics.window} days`} value={metrics.totals.views} />
        <Metric label="Visitors today" value={metrics.totals.visitorsToday} />
        <Metric label="Views today" value={metrics.totals.viewsToday} />
        <Metric
          label="Reviews awaiting approval"
          value={metrics.reviews.pending}
          hint={metrics.reviews.pending > 0 ? "Needs your attention" : "All clear"}
          emphasis={metrics.reviews.pending > 0}
        />
        <Metric
          label="Average rating"
          value={metrics.reviews.average === null ? "—" : metrics.reviews.average}
          hint={`${metrics.reviews.approved} published`}
        />
      </div>

      <section className={styles.block} aria-label="Traffic">
        <h2 className={styles.blockTitle}>
          Visitors and views <span className={styles.blockHint}>last {metrics.window} days</span>
        </h2>
        <ul className={styles.chart}>
          {metrics.series.map((day) => (
            <li key={day.date} className={styles.bar}>
              <span
                className={styles.barFill}
                style={{ height: `${Math.round((day.views / peak) * 100)}%` }}
                aria-hidden="true"
              />
              <span className="visually-hidden">
                {day.date}: {day.views} views, {day.visitors} visitors
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.chartLabels}>
          <span>{metrics.series[0]?.date ?? ""}</span>
          <span>today</span>
        </p>
      </section>

      <div className={styles.columns}>
        <section className={styles.block} aria-label="Most viewed pages">
          <h2 className={styles.blockTitle}>Most viewed pages</h2>
          <RankedList items={metrics.topPaths} empty="No page views recorded yet." />
        </section>

        <section className={styles.block} aria-label="Where visitors came from">
          <h2 className={styles.blockTitle}>Where visitors came from</h2>
          <RankedList items={metrics.topReferrers} empty="No referrers recorded yet." />
        </section>

        <section className={styles.block} aria-label="Devices">
          <h2 className={styles.blockTitle}>Devices</h2>
          <RankedList items={metrics.devices} empty="No device data recorded yet." />
        </section>
      </div>

      <p className={styles.footnote}>
        Collected by the website itself — no third-party analytics service (ARCHITECTURE.md §11).{" "}
        <Link href="/" className={styles.link}>
          View the public site
        </Link>
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string;
  value: number | string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div className={[styles.card, emphasis ? styles.cardEmphasis : ""].filter(Boolean).join(" ")}>
      <p className={styles.cardLabel}>{label}</p>
      <p className={styles.cardValue}>
        {typeof value === "number" ? <Counter value={value} /> : value}
      </p>
      {hint ? <p className={styles.cardHint}>{hint}</p> : null}
    </div>
  );
}

function RankedList({
  items,
  empty,
}: {
  items: Array<{ label: string; count: number }>;
  empty: string;
}) {
  if (items.length === 0) return <p className={styles.empty}>{empty}</p>;

  const peak = items[0]?.count ?? 1;

  return (
    <ul className={styles.ranked}>
      {items.map((item) => (
        <li key={item.label} className={styles.rankedItem}>
          <span className={styles.rankedLabel}>{item.label}</span>
          <span className={styles.rankedTrack} aria-hidden="true">
            <span className={styles.rankedFill} style={{ width: `${(item.count / peak) * 100}%` }} />
          </span>
          <span className={styles.rankedCount}>{item.count.toLocaleString("en-NG")}</span>
        </li>
      ))}
    </ul>
  );
}
