'use client';

import { ChefHat, QrCode, Receipt, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import HomeTerminal from './HomeTerminal';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import Reveal from '@/components/Reveal';
import { ADDRESS, HOURS, PHONE } from '@/lib/site';
import { foodImageFor, shortBlurbFor } from '@/lib/foodImages';
import styles from './page.module.css';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  imageUrl: string | null;
}

interface HomeClientContentProps {
  dishes: MenuItem[];
}

const STEPS = [
  {
    no: '01',
    icon: <QrCode size={20} />,
    title: 'Scan your table QR',
    text: 'Point your phone camera at the tent card. The menu opens for your table — no app to install.',
  },
  {
    no: '02',
    icon: <UtensilsCrossed size={20} />,
    title: 'Order from the menu',
    text: 'Add dishes to the cart and place the order. It reaches the waiter and kitchen instantly.',
  },
  {
    no: '03',
    icon: <ChefHat size={20} />,
    title: 'We cook, you track',
    text: 'Follow each order live: received, being prepared, delivered — all on the same page.',
  },
  {
    no: '04',
    icon: <Receipt size={20} />,
    title: 'Pay the bill',
    text: 'Check the receipt-style bill and pay by cash, eSewa, Khalti or FonePay.',
  },
];

export default function HomeClientContent({ dishes }: HomeClientContentProps) {
  const specials = dishes.slice(0, 3);
  const totalDishes = dishes.length;

  return (
    <div className={styles.page}>
      <SiteHeader />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroText}>
            <h1>
              Momo, Sekuwa &amp; Chiya,
              <br />
              ordered from your table.
            </h1>
            <p className={styles.lede}>
              Chiya &amp; Puff is a dine-in Nepalese restaurant
              {totalDishes > 0 ? ` with ${totalDishes}+ dishes on the menu` : ''}. Sit
              down, scan the QR tent card, and order without waiting for anyone.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/menu" className="btn btn-primary">View Full Menu</Link>
              <a href="#order" className={styles.btnLight}>Order from Your Table</a>
            </div>
            <dl className={styles.heroFacts}>
              <div>
                <dt>Find us</dt>
                <dd>{ADDRESS}</dd>
              </div>
              <div>
                <dt>Hours</dt>
                <dd>{HOURS}</dd>
              </div>
              <div>
                <dt>Call</dt>
                <dd>{PHONE}</dd>
              </div>
            </dl>
          </div>
          <div id="order" className={styles.heroCard}>
            <HomeTerminal />
            <p className={styles.heroCardNote}>
              Sitting at a table already? Type the table number above, or scan the
              QR tent card with your phone camera.
            </p>
          </div>
        </div>
      </section>

      {/* How ordering works */}
      <section className={styles.section}>
        <div className={styles.wrap}>
          <Reveal className={styles.secHead}>
            <h2>How table ordering works</h2>
            <p>
              Every table has its own QR code tied to a live order ticket. Guests
              order themselves; the waiter, kitchen and billing stay in step behind
              the counter. <Link href="/about">More about us →</Link>
            </p>
          </Reveal>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.no} delay={i * 90}>
                <span className={styles.stepNo}>{s.no}</span>
                <span className={styles.stepIcon}>{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Specials with photos */}
      {specials.length > 0 && (
        <section className={`${styles.section} ${styles.menuSection}`}>
          <div className={styles.wrap}>
            <div className={styles.secHeadRow}>
              <Reveal className={styles.secHead}>
                <h2>Plates regulars ask for</h2>
                <p>Straight from this week&apos;s live menu.</p>
              </Reveal>
              <Link href="/menu" className="btn btn-secondary">Full Menu</Link>
            </div>
            <div className={styles.photoCards}>
              {specials.map((s, i) => (
                <Reveal as="article" key={s.id} delay={i * 100}>
                  <img
                    src={s.imageUrl || foodImageFor(s.name, s.category)}
                    alt={s.name}
                    loading="lazy"
                  />
                  <div>
                    <p className={styles.photoCat}>{s.category}</p>
                    <h3>{s.name}</h3>
                    <p>{shortBlurbFor(s.description, s.category)}</p>
                    <p className={styles.photoPrice}>Rs. {s.price.toFixed(0)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Visit band */}
      <section className={styles.band}>
        <div className={styles.wrap}>
          <Reveal>
            <h2>Come hungry, leave with chiya.</h2>
            <p>
              {ADDRESS} · {HOURS} · {PHONE}
            </p>
          </Reveal>
          <div className={styles.bandCtas}>
            <Link href="/contact" className="btn btn-primary">Find Us</Link>
            <Link href="/menu" className={styles.btnGhost}>Browse Menu</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
