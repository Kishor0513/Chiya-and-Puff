'use client';

import { motion } from 'framer-motion';
import { Coffee, Croissant, Info, QrCode } from 'lucide-react';
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
  // Our signatures first: a chiya, then a puff, then whatever is popular.
  const chiya = dishes.find((d) => /chiya|tea/i.test(d.name));
  const puff = dishes.find((d) => /puff/i.test(d.name));
  const specials = [chiya, puff, ...dishes]
    .filter((d): d is MenuItem => Boolean(d))
    .filter((d, i, arr) => arr.findIndex((x) => x.id === d.id) === i)
    .slice(0, 3);

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
            Slow-Brewed Chiya.<br />
            <span className={styles.heroHighlight}>Fresh-Baked Puff.</span>
          </motion.h1>
          <motion.p className={styles.heroSubtitle} variants={itemVariants}>
            Welcome to Chiya &amp; Puff — a Nepali tea and puff kitchen for breakfasts, evening snacks and everything in between.
            We brew chiya to order, bake puffs golden twice a day, and take your table&apos;s order by QR so it arrives hot.
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
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Chiya &amp; Puff, Every Morning</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Our day starts with two things: a pot of spiced milk chiya and a tray of puffs going into the oven.
            Masala, adrak-elaichi, butter tea; veg, chicken, buff and paneer puffs — simple things done properly, served steaming at your table.
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Flaky, generously filled veg, chicken, buff and paneer puffs — morning and evening batches.</p>
          </div>
          <div className={`${styles.featureCard} glass-panel hover-lift`}>
            <QrCode size={32} color="#E8A93D" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ordered By QR</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Scan your table, order in seconds, and track it live from oven to table.</p>
          </div>
        </div>
      </motion.section>

      {specials.length > 0 && (
        <section className={styles.section}>
          <div className={styles.menuHeader}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Chiya &amp; Puff Signatures</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Our most-ordered cup and our most-ordered bake — plus one more from this week&apos;s live menu.</p>
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
