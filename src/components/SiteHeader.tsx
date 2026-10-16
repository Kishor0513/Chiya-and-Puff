'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    <header className={`${styles.header}${scrolled ? ` ${styles.headerScrolled}` : ''}`}>
      <Link href="/" className={styles.headerLogo}>
        <img src="/logo.svg" alt="Chiya and Puff" width={42} height={42} />
        <span style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Chiya &amp; Puff</span>
      </Link>
      <nav className={styles.nav}>
        <Link href="/menu" className={styles.navLink}>Menu</Link>
        <Link href="/about" className={styles.navLink}>About</Link>
        <Link href="/contact" className={styles.navLink}>Find Us</Link>
        <ThemeToggle />
        <Link href="/admin" className="btn btn-secondary">Admin</Link>
        <Link href="/waiter" className="btn btn-secondary">Staff</Link>
      </nav>
    </header>
  );
}
