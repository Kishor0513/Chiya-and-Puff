'use client';

import { motion } from 'framer-motion';
import { Coffee, Info, Star, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import HomeTerminal from './HomeTerminal';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import Reveal from '@/components/Reveal';
import { foodImageFor, shortBlurbFor } from '@/lib/foodImages';
import styles from './page.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
} as const;

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

export default function HomeClientContent({ dishes }: HomeClientContentProps) {
  const specials = dishes.slice(0, 3);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <SiteHeader />

      <motion.section
        className={styles.heroSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className={styles.heroContent}>
          <motion.h1 className={styles.heroTitle} variants={itemVariants}>
            Authentic Taste.<br />
            <span className={styles.heroHighlight}>Smart Ordering.</span>
          </motion.h1>
          <motion.p className={styles.heroSubtitle} variants={itemVariants}>
            Welcome to Chiya &amp; Puff, where traditional Nepalese cuisine meets seamless modern dining. Scan the QR code on your table, or use our digital terminal to get started.
          </motion.p>
          <motion.div className={styles.heroActions} variants={itemVariants}>
            <Link href="/menu" className="btn btn-primary">View Our Menu</Link>
            <Link href="/about" className="btn btn-secondary">Our Story</Link>
          </motion.div>
        </div>

        <motion.div id="order" className={styles.terminalWrapper} variants={itemVariants}>
          <HomeTerminal />
        </motion.div>
      </motion.section>

      <motion.section
        id="about"
        className={styles.section}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.aboutContent}>
          <div className={styles.iconWrapper}>
            <Info size={32} />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>About Chiya &amp; Puff</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Born from a passion for authentic Himalayan spices and the warm comfort of street-corner tea (Chiya), we bring the vibrant flavors of Nepal straight to your table.
            From our hand-crimped Momo dumplings to our sizzling Sekuwa, every dish is prepared with traditional recipes and a dash of modern flair.
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>A perfect environment designed for deep conversations and memorable moments.</p>
          </div>
        </div>
      </motion.section>

      {specials.length > 0 && (
        <section className={styles.section}>
          <div className={styles.menuHeader}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Loved Plates</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>A taste of this week&apos;s live menu — the full list is one tap away.</p>
          </div>
          <div className={styles.photoGrid}>
            {specials.map((item, i) => (
              <Reveal as="article" key={item.id} delay={i * 100} className={`${styles.photoCard} glass-panel hover-lift`}>
                <img
                  src={item.imageUrl || foodImageFor(item.name, item.category)}
                  alt={item.name}
                  loading="lazy"
                />
                <div className={styles.photoBody}>
                  <p className={styles.photoCat}>{item.category}</p>
                  <h3>{item.name}</h3>
                  <p>{shortBlurbFor(item.description, item.category)}</p>
                  <span className={styles.photoPrice}>Rs. {item.price.toFixed(2)}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <div className={styles.sectionCta}>
            <Link href="/menu" className="btn btn-primary">See The Full Menu</Link>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
