'use client';

import { useEffect, useState } from 'react';
import { Clock, MapPin, Phone, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ADDRESS, HOURS, PHONE } from '@/lib/site';
import styles from '@/app/page.module.css';

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.wrap}>
          <span className={styles.topItem}>
            <MapPin size={13} /> {ADDRESS}
          </span>
          <span className={styles.topItem}>
            <Clock size={13} /> {HOURS}
          </span>
          <span className={styles.topRight}>
            <Phone size={13} /> {PHONE}
            <span className={styles.topSep}>|</span>
            <Link href="/login">Staff Login</Link>
          </span>
        </div>
      </div>
      <header className={`${styles.header}${scrolled ? ` ${styles.headerScrolled}` : ''}`}>
        <div className={styles.wrap}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>
              <UtensilsCrossed size={20} />
            </span>
            <span>
              <span className={styles.brandName}>Chiya &amp; Puff</span>
              <span className={styles.brandTag}>Nepalese Kitchen — Kathmandu</span>
            </span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/menu">Menu</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Find Us</Link>
            <ThemeToggle />
            <Link href="/#order" className="btn btn-primary">Order by QR</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
