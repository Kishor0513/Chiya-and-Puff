import { prisma } from '@/lib/prisma';
import type { MenuItem } from '@/types';
import HomeClientContent from './HomeClientContent';

// Next.js config for a Server Component that hits the DB
export const dynamic = 'force-dynamic';

export default async function Home() {
  let menuItems: MenuItem[] = [];

  try {
    menuItems = await prisma.menuItem.findMany({
      where: { available: true }
    });
  } catch (error) {
    console.error('Failed to load menu items on Home page:', error);
  }

  const categories = Array.from(new Set(menuItems.map((m) => m.category)));

  return <HomeClientContent categories={categories} dishes={menuItems} />;
}
