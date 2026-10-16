import { Clock, MapPin, Phone } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { ADDRESS, HOURS, KITCHEN_NOTE, PHONE } from '@/lib/site';
import styles from '../page.module.css';

const CARDS = [
  { icon: <MapPin size={32} color="var(--primary)" />, title: 'Address', lines: ['Chiya & Puff', ADDRESS] },
  { icon: <Clock size={32} color="var(--secondary)" />, title: 'Hours', lines: [HOURS, KITCHEN_NOTE] },
  { icon: <Phone size={32} color="#F5A623" />, title: 'Contact', lines: [PHONE, 'For table bookings and group orders.'] },
];

export default function ContactPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <SiteHeader />

      <section className={styles.section}>
        <div className={styles.menuHeader}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Find Us</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Walk in, take a table, and scan the QR tent card to start ordering.</p>
        </div>

        <div className={styles.grid}>
          {CARDS.map((card) => (
            <div key={card.title} className={`${styles.featureCard} glass-panel hover-lift`}>
              <div style={{ marginBottom: '1rem' }}>{card.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{card.title}</h3>
              {card.lines.map((line) => (
                <p key={line} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0' }}>{line}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
