import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { MenuItem } from '@/types';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import Reveal from '@/components/Reveal';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  let dishes: MenuItem[] = [];
  try {
    dishes = await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  } catch (error) {
    console.error('Failed to load menu items on Menu page:', error);
  }

  const categories = Array.from(new Set(dishes.map((m) => m.category)));

  return (
    <div className={styles.page}>
      <SiteHeader />
      <section className={`${styles.section} ${styles.menuSection}`}>
        <div className={styles.wrap}>
          <Reveal className={styles.secHead}>
            <h2>Our Menu</h2>
            <p>
              The live menu — the same list your table QR orders from. Prices are
              as printed on the bill; nothing gets added at payment.{' '}
              <Link href="/#order">Order from your table →</Link>
            </p>
          </Reveal>

          {categories.length === 0 ? (
            <p className={styles.notice}>
              The menu is being updated right now. Please ask our staff.
            </p>
          ) : (
            categories.map((category) => {
              const items = dishes.filter((m) => m.category === category);
              if (items.length === 0) return null;
              return (
                <Reveal key={category} className={styles.catBlock}>
                  <h3 className={styles.catTitle}>
                    <span>{category}</span>
                  </h3>
                  <ul className={styles.dishList}>
                    {items.map((item) => (
                      <li key={item.id}>
                        <div className={styles.dishRow}>
                          <span className={styles.dishName}>{item.name}</span>
                          <span className={styles.dots} aria-hidden="true" />
                          <span className={styles.dishPrice}>
                            Rs. {item.price.toFixed(0)}
                          </span>
                        </div>
                        {item.description && (
                          <p className={styles.dishDesc}>{item.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            })
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
