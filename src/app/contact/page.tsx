import { Clock, MapPin, Phone } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import Reveal from '@/components/Reveal';
import { ADDRESS, HOURS, KITCHEN_NOTE, PHONE } from '@/lib/site';
import styles from '../page.module.css';

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <section className={styles.section}>
        <div className={styles.wrap}>
          <Reveal className={styles.secHead}>
            <h2>Find us</h2>
            <p>Walk in, take a table, and scan the QR tent card to start ordering.</p>
          </Reveal>
          <div className={styles.visitGrid}>
            <Reveal className={styles.visitCard}>
              <h3>
                <MapPin size={17} /> Address
              </h3>
              <p>
                Chiya &amp; Puff
                <br />
                {ADDRESS}
              </p>
            </Reveal>
            <Reveal className={styles.visitCard} delay={100}>
              <h3>
                <Clock size={17} /> Hours
              </h3>
              <p>{HOURS}</p>
              <p className={styles.muted}>{KITCHEN_NOTE}</p>
            </Reveal>
            <Reveal className={styles.visitCard} delay={200}>
              <h3>
                <Phone size={17} /> Contact
              </h3>
              <p>{PHONE}</p>
              <p className={styles.muted}>For table bookings and group orders.</p>
            </Reveal>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
