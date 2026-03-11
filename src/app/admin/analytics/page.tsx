'use client';

import { TrendingUp, Award, PieChart, Calendar, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './analytics.module.css';

interface AnalyticsData {
  revenueTrends: Array<{ date: string; amount: number }>;
  popularItems: Array<{ name: string; category: string; count: number }>;
  categoryStats: Array<{ name: string; value: number }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Analyzing patterns...</div>;
  if (!data) return <div className={styles.error}>Unable to load financial reports.</div>;

  const maxRevenue = Math.max(...data.revenueTrends.map(d => d.amount), 1);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.backBtn}>
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <TrendingUp size={32} color="var(--primary)" />
          <h1>Insights & Analytics</h1>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Revenue Trend Chart */}
        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <Calendar size={20} /> Revenue Trend (Last 7 Days)
          </div>
          <div className={styles.chartArea}>
            {data.revenueTrends.map((day, i) => (
              <div key={i} className={styles.barGroup}>
                <div 
                  className={styles.bar} 
                  style={{ height: `${(day.amount / maxRevenue) * 200}px` }}
                >
                  <span className={styles.tooltip}>Rs. {day.amount.toLocaleString()}</span>
                </div>
                <span className={styles.label}>{new Date(day.date).toLocaleDateString([], { weekday: 'short' })}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Items */}
        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <Award size={20} /> Most Loved Dishes
          </div>
          <div className={styles.list}>
            {data.popularItems.map((item, i) => (
              <div key={i} className={styles.listItem}>
                <div className={styles.rank}>{i + 1}</div>
                <div className={styles.itemInfo}>
                  <strong>{item.name}</strong>
                  <span>{item.category}</span>
                </div>
                <div className={styles.itemCount}>{item.count} orders</div>
              </div>
            ))}
          </div>
        </section>

        {/* Category breakdown */}
        <section className={styles.card}>
          <div className={styles.cardTitle}>
            <PieChart size={20} /> Revenue by Category
          </div>
          <div className={styles.categoryList}>
            {data.categoryStats.sort((a,b) => b.value - a.value).map((cat, i) => (
              <div key={i} className={styles.catItem}>
                <div className={styles.catLabel}>
                  <span>{cat.name}</span>
                  <strong>Rs. {cat.value.toLocaleString()}</strong>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${(cat.value / data.categoryStats.reduce((acc, c) => acc + c.value, 0)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
