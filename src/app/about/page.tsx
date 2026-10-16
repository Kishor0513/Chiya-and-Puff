import { Coffee, Info, Star, UtensilsCrossed } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { PHONE } from '@/lib/site';
import styles from '../page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <SiteHeader />

      <section className={styles.section}>
        <div className={styles.aboutContent}>
          <div className={styles.iconWrapper}>
            <Info size={32} />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>About Chiya &amp; Puff</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Born from a passion for authentic Himalayan spices and the warm comfort of street-corner tea (Chiya), we bring the vibrant flavors of Nepal straight to your table.
            From our hand-crimped Momo dumplings to our sizzling Sekuwa, every dish is prepared with traditional recipes and a dash of modern flair.
          </p>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
            The QR ordering is there for one reason: so a full house never means slow service. Your order goes to the kitchen the second you place it, and you can
            see exactly where it stands. Behind the counter, waiters work from a live table plan, the kitchen cooks off a display screen, and the bill prints as a
            proper receipt payable by cash, eSewa, Khalti or FonePay.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.featureCard} glass-panel hover-lift`}>
            <Star size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Premium Quality</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Authentic spices sourced directly to ensure the truest taste of the Himalayas.</p>
          </div>
          <div className={`${styles.featureCard} glass-panel hover-lift`}>
            <UtensilsCrossed size={32} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Freshly Prepared</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Every dish is crafted from scratch upon ordering, including our signature Momo.</p>
          </div>
          <div className={`${styles.featureCard} glass-panel hover-lift`}>
            <Coffee size={32} color="#F5A623" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Warm Ambience</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Call ahead on {PHONE} for group tables — we will keep seats together.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
