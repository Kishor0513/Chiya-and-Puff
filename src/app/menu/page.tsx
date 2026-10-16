import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { MenuItem } from '@/types';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import Reveal from '@/components/Reveal';
import { foodImageFor } from '@/lib/foodImages';
import { ingredientsFor, orderedCategories, sortMenuItems } from '@/lib/menu';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  let menuItems: MenuItem[] = [];

  try {
    menuItems = await prisma.menuItem.findMany({
      where: { available: true },
    });
  } catch (error) {
    console.error('Failed to load menu items on Menu page:', error);
  }

  const items = sortMenuItems(menuItems);
  const categories = orderedCategories(items);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <SiteHeader />

      <section className={styles.section}>
        <div className={styles.menuHeader}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Cuisine</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
            The live menu — the same list your table QR orders from.{' '}
            <Link href="/#order" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Order from your table →
            </Link>
          </p>
        </div>

        {categories.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            The menu is being updated right now. Please ask our staff.
          </p>
        ) : (
          categories.map((category) => {
            const catItems = items.filter((m) => m.category === category);
            if (catItems.length === 0) return null;

            return (
              <Reveal key={category} className={styles.categorySection}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                <div className={styles.menuGrid}>
                  {catItems.map((item) => {
                    const extra = ingredientsFor(item.name);
                    return (
                      <div key={item.id} className={`${styles.menuCard} glass-panel hover-lift`}>
                        <div className={styles.menuCardRow}>
                          <img
                            src={item.imageUrl || foodImageFor(item.name, item.category)}
                            alt={item.name}
                            loading="lazy"
                            className={styles.dishThumb}
                          />
                          <div className={styles.menuCardBody}>
                            <div className={styles.menuCardTop}>
                              <h4 className={styles.itemName}>{item.name}</h4>
                              <span className={styles.itemPrice}>Rs. {item.price.toFixed(2)}</span>
                            </div>
                            {item.description && (
                              <p className={styles.itemDescription}>{item.description}</p>
                            )}
                            {extra && (
                              <p className={styles.dishExtra}>Made with {extra}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            );
          })
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
