import { prisma } from '@/lib/prisma';
import HomeClientContent from './HomeClientContent';

// Next.js config for a Server Component that hits the DB
export const dynamic = 'force-dynamic';

export default async function Home() {
  const menuItems = await prisma.menuItem.findMany({
    where: { available: true }
  });

  const categories = Array.from(new Set(menuItems.map(m => m.category)));

  return <HomeClientContent categories={categories} dishes={menuItems} />;
}
