import Link from 'next/link';
import styles from '@/app/page.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLogo}>
        <img src="/logo.svg" alt="Chiya and Puff" width={30} height={30} />
        <span>Chiya &amp; Puff - Restaurant Management System</span>
      </div>
      <div className={styles.footerLinks}>
        <Link href="/menu">Menu</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Find Us</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/waiter">Staff</Link>
      </div>
      <p className={styles.copy}>© {new Date().getFullYear()} Chiya &amp; Puff. All rights reserved.</p>
    </footer>
  );
}
