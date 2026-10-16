import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { MenuItem } from '@/types';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  let menuItems: MenuItem[] = [];

  try {
    menuItems = await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  } catch (error) {
    console.error('Failed to load menu items on Menu page:', error);
  }

  const categories = Array.from(new Set(menuItems.map((m) => m.category)));

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
            const items = menuItems.filter((m) => m.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category} className={styles.categorySection}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                <div className={styles.menuGrid}>
                  {items.map((item) => (
                    <div key={item.id} className={`${styles.menuCard} glass-panel hover-lift`}>
                      <div className={styles.menuCardTop}>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        <span className={styles.itemPrice}>Rs. {item.price.toFixed(2)}</span>
                      </div>
                      {item.description && (
                        <p className={styles.itemDescription}>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
