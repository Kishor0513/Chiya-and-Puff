import { UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { ADDRESS, HOURS } from '@/lib/site';
import styles from '@/app/page.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div className={styles.footGrid}>
          <div>
            <p className={styles.footBrand}>
              <UtensilsCrossed size={18} /> Chiya &amp; Puff
            </p>
            <p className={styles.muted}>
              Nepalese kitchen in {ADDRESS}. Dine in, scan the table QR, and eat
              while it is hot.
            </p>
          </div>
          <div>
            <p className={styles.footHead}>Explore</p>
            <p>
              <Link href="/menu">Menu</Link>
            </p>
            <p>
              <Link href="/about">About</Link>
            </p>
            <p>
              <Link href="/contact">Find Us</Link>
            </p>
          </div>
          <div>
            <p className={styles.footHead}>Staff</p>
            <p>
              <Link href="/waiter">Waiter board</Link>
            </p>
            <p>
              <Link href="/kitchen">Kitchen display</Link>
            </p>
            <p>
              <Link href="/admin">Admin panel</Link>
            </p>
          </div>
        </div>
        <div className={styles.footBase}>
          <span>© {new Date().getFullYear()} Chiya &amp; Puff. All rights reserved.</span>
          <span>{HOURS}</span>
        </div>
      </div>
    </footer>
  );
}
