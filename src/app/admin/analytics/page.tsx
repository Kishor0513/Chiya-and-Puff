'use client';

import {
  Award,
  Calendar,
  ChevronLeft,
  Clock,
  CookingPot,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import styles from './analytics.module.css';

interface AnalyticsData {
  days: number;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgBill: number;
    todayRevenue: number;
    todayOrders: number;
  };
  revenueTrends: Array<{ date: string; amount: number; orders: number }>;
  popularItems: Array<{ name: string; category: string; count: number; revenue: number }>;
  categoryStats: Array<{ name: string; value: number }>;
  peakHours: Array<{ hour: number; count: number }>;
  pipeline: Array<{ status: string; count: number }>;
}

const RANGES = [7, 14, 30];

function fmtHour(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${suffix}`;
}

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/admin/analytics?days=${d}`);
      if (!res.ok) throw new Error('bad status');
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  const maxRevenue = Math.max(...(data?.revenueTrends.map((d) => d.amount) ?? [1]), 1);
  const categoryTotal = (data?.categoryStats ?? []).reduce((s, c) => s + c.value, 0);
  const pipelineTotal = (data?.pipeline ?? []).reduce((s, p) => s + p.count, 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.backBtn}>
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>
        <div className={styles.titleRow}>
          <TrendingUp size={30} color="var(--primary)" />
          <h1>Sales Analytics</h1>
          <div className={styles.rangePills}>
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={days === r ? styles.rangeActive : ''}
              >
                {r}D
              </button>
            ))}
          </div>
        </div>
        <p className={styles.subtitle}>Billed orders only — unpaid tickets never inflate the numbers.</p>
      </header>

      {loading ? (
        <div className={styles.loading}>Crunching the numbers…</div>
      ) : error || !data ? (
        <div className={styles.error}>
          Unable to load analytics.
          <button onClick={() => load(days)} className={styles.retryBtn}>Try again</button>
        </div>
      ) : (
        <>
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <span>Revenue · last {data.days}d</span>
              <strong>Rs. {data.summary.totalRevenue.toLocaleString()}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span>Bills · last {data.days}d</span>
              <strong>{data.summary.totalOrders.toLocaleString()}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span>Average bill</span>
              <strong>Rs. {data.summary.avgBill.toLocaleString()}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span>Today so far</span>
              <strong>Rs. {data.summary.todayRevenue.toLocaleString()}</strong>
              <em>{data.summary.todayOrders} bills</em>
            </div>
          </div>

          <div className={styles.grid}>
            <section className={styles.card}>
              <div className={styles.cardTitle}>
                <Calendar size={20} /> Daily Revenue
              </div>
              <div className={styles.chartArea}>
                {data.revenueTrends.map((day) => (
                  <div key={day.date} className={styles.barGroup}>
                    <div
                      className={styles.bar}
                      style={{ height: `${Math.max((day.amount / maxRevenue) * 190, 3)}px` }}
                    >
                      <span className={styles.tooltip}>
                        Rs. {day.amount.toLocaleString()} · {day.orders} bills
                      </span>
                    </div>
                    <span className={styles.label}>
                      {new Date(day.date + 'T00:00:00').toLocaleDateString([], {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardTitle}>
                <Award size={20} /> Top Dishes
              </div>
              {data.popularItems.length === 0 ? (
                <p className={styles.empty}>No billed dishes in this period yet.</p>
              ) : (
                <div className={styles.list}>
                  {data.popularItems.map((item, i) => (
                    <div key={item.name} className={styles.listItem}>
                      <div className={styles.rank}>{i + 1}</div>
                      <div className={styles.itemInfo}>
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                      </div>
                      <div className={styles.itemMeta}>
                        <strong>{item.count} sold</strong>
                        <span>Rs. {item.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardTitle}>
                <PieChart size={20} /> Revenue by Category
              </div>
              {data.categoryStats.length === 0 ? (
                <p className={styles.empty}>Nothing billed in this period yet.</p>
              ) : (
                <div className={styles.categoryList}>
                  {data.categoryStats.map((cat) => (
                    <div key={cat.name} className={styles.catItem}>
                      <div className={styles.catLabel}>
                        <span>{cat.name}</span>
                        <strong>Rs. {cat.value.toLocaleString()}</strong>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${categoryTotal > 0 ? (cat.value / categoryTotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardTitle}>
                <Clock size={20} /> Busiest Hours
              </div>
              {data.peakHours.every((h) => h.count === 0) ? (
                <p className={styles.empty}>Not enough bills yet to call it.</p>
              ) : (
                <div className={styles.list}>
                  {data.peakHours.map((h, i) => (
                    <div key={h.hour} className={styles.listItem}>
                      <div className={styles.rank}>{i + 1}</div>
                      <div className={styles.itemInfo}>
                        <strong>{fmtHour(h.hour)}</strong>
                        <span>billing hour</span>
                      </div>
                      <div className={styles.itemMeta}>
                        <strong>{h.count} bills</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.pipeline}>
                <div className={styles.cardTitle} style={{ marginBottom: '0.75rem' }}>
                  <CookingPot size={20} /> Live Pipeline
                </div>
                {pipelineTotal === 0 ? (
                  <p className={styles.empty}>Floor is clear — no active tickets.</p>
                ) : (
                  <div className={styles.pipeRow}>
                    {data.pipeline.map((p) => (
                      <span key={p.status} className={styles.pipeChip}>
                        {p.status}: <strong>{p.count}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
