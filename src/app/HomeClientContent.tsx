'use client';

import { motion } from 'framer-motion';
import { UtensilsCrossed, Info, Star, Coffee } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import HomeTerminal from './HomeTerminal';
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
  categories: string[];
  dishes: MenuItem[];
}

export default function HomeClientContent({ categories, dishes }: HomeClientContentProps) {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <motion.header
        className={styles.header}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className={styles.headerLogo}>
          <div className={styles.logoIcon}>
            <UtensilsCrossed size={24} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Chiya & Puff</h2>
        </div>
        <nav className={styles.nav}>
          <ThemeToggle />
          <Link href="/admin" className="btn btn-secondary">Admin</Link>
          <Link href="/waiter" className="btn btn-secondary">Staff</Link>
        </nav>
      </motion.header>

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
            Welcome to Chiya & Puff, where traditional Nepalese cuisine meets seamless modern dining. Scan the QR code on your table, or use our digital terminal to get started.
          </motion.p>
          <motion.div className={styles.heroActions} variants={itemVariants}>
            <a href="#menu" className="btn btn-primary">View Our Menu</a>
            <a href="#about" className="btn btn-secondary">Our Story</a>
          </motion.div>
        </div>

        <motion.div className={styles.terminalWrapper} variants={itemVariants}>
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
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>About Chiya & Puff</h2>
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

      <section id="menu" className={styles.section}>
        <div className={styles.menuHeader}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Cuisine</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Browse what we have to offer before you take a seat.</p>
        </div>

        {categories.map(category => {
          const items = dishes.filter(m => m.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.menuGrid}>
                {items.map(item => (
                  <motion.div 
                    key={item.id} 
                    className={`${styles.menuCard} glass-panel hover-lift`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className={styles.menuCardTop}>
                      <h4 className={styles.itemName}>{item.name}</h4>
                      <span className={styles.itemPrice}>Rs. {item.price.toFixed(2)}</span>
                    </div>
                    <p className={styles.itemDescription}>
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <UtensilsCrossed size={20} />
          <span>Chiya & Puff - Restaurant Management System</span>
        </div>
        <p className={styles.copy}>© {new Date().getFullYear()} Chiya & Puff. All rights reserved.</p>
      </footer>
    </div>
  );
}
