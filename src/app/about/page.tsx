import { Coffee, Croissant, Info, QrCode } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import Reveal from '@/components/Reveal';
import { PHONE } from '@/lib/site';
import { PLACE_IMAGES } from '@/lib/foodImages';
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
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>A Tea &amp; Puff Kitchen</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Chiya &amp; Puff is built around Nepal&apos;s favourite pairing: a steaming glass of spiced milk chiya
            and a flaky, golden puff. Masala, adrak-elaichi and butter chiya brewed per cup; veg, chicken, buff
            and paneer puffs baked in small morning and evening batches.
          </p>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Around that core sits the wider kitchen — momos, chowmein, thukpa, sadeko starters, choila and sekuwa,
            thali sets and desserts. And the QR ordering means your chiya arrives steaming: the order hits the kitchen
            the second you place it, and the bill prints as a proper receipt payable by cash, eSewa, Khalti or FonePay.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.featureCard} glass-panel hover-lift`}>
            <Coffee size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Chiya, Many Ways</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Masala, adrak-elaichi, butter and iced chiya — brewed per cup, never reheated.</p>
          </div>
          <div className={`${styles.featureCard} glass-panel hover-lift`}>
            <Croissant size={32} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Puffs, Baked Golden</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Flaky, generously filled puffs in veg, chicken, buff and paneer.</p>
          </div>
          <div className={`${styles.featureCard} glass-panel hover-lift`}>
            <QrCode size={32} color="#E8A93D" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ordered By QR</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Call ahead on {PHONE} for group tables — we will keep seats together.</p>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.menuHeader}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Place</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>The counter, the oven trays and the evening tables.</p>
        </div>
        <div className={styles.placeGrid}>
          {PLACE_IMAGES.map((place, i) => (
            <Reveal as="article" key={place.title} delay={i * 100} className={`${styles.placeCard} glass-panel hover-lift`}>
              <img src={place.src} alt={place.title} loading="lazy" />
              <div className={styles.placeBody}>
                <h3>{place.title}</h3>
                <p>{place.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
