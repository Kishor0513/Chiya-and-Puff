import { UtensilsCrossed, Info, Star, Coffee } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import HomeTerminal from './HomeTerminal';

// Next.js config for a Server Component that hits the DB
export const dynamic = 'force-dynamic';

export default async function Home() {
  const menuItems = await prisma.menuItem.findMany({
    where: { available: true }
  });

  const categories = [...new Set(menuItems.map(m => m.category))];

  return (
    <div className="page-wrapper" style={{ display: 'block' }}>
      {/* Decorative background blobs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 90, 95, 0.08) 0%, transparent 60%)', filter: 'blur(30px)', zIndex: -1 }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 166, 153, 0.08) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: -1 }} />

      {/* Header */}
      <header style={{ padding: '1.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '12px' }}>
            <UtensilsCrossed size={24} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Chiya & Puff</h2>
        </div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Admin</Link>
          <Link href="/waiter" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Staff</Link>
        </nav>
      </header>

      {/* Hero / Terminal Section */}
      <section style={{ padding: '6rem 5%', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ flex: '1 1 500px' }}>
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Authentic Taste.<br />
            <span style={{ color: 'var(--primary)' }}>Smart Ordering.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px', lineHeight: 1.6 }}>
            Welcome to Chiya & Puff, where traditional Nepalese cuisine meets seamless modern dining. Scan the QR code on your table, or use our digital terminal to get started.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#menu" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>View Our Menu</a>
            <a href="#about" className="btn btn-secondary" style={{ padding: '1rem 2rem' }}>Our Story</a>
          </div>
        </div>

        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <HomeTerminal />
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ padding: '5rem 5%', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.02))' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 166, 153, 0.1)', color: 'var(--secondary)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Info size={32} />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>About Chiya & Puff</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Born from a passion for authentic Himalayan spices and the warm comfort of street-corner tea (Chiya), we bring the vibrant flavors of Nepal straight to your table.
            From our hand-crimped Momo dumplings to our sizzling Sekuwa, every dish is prepared with traditional recipes and a dash of modern flair.
            Our smart QR ordering system ensures your dining experience is as relaxing and uninterrupted as sipping a perfect cup of Chiya.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '3rem auto 0' }}>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <Star size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Premium Quality</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Authentic spices sourced directly to ensure the truest taste of the Himalayas.</p>
          </div>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <UtensilsCrossed size={32} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Freshly Prepared</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Every dish is crafted from scratch upon ordering, including our signature Momo.</p>
          </div>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <Coffee size={32} color="#F5A623" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Warm Ambience</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>A perfect environment designed for deep conversations and memorable moments.</p>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section id="menu" style={{ padding: '5rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Cuisine</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Browse what we have to offer before you take a seat.</p>
        </div>

        {categories.map(category => {
          const items = menuItems.filter(m => m.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} style={{ marginBottom: '4rem' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', color: 'var(--text-main)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem', display: 'inline-block' }}>
                {category}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {items.map(item => (
                  <div key={item.id} className="glass-panel hover-lift" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '1.125rem', margin: 0 }}>{item.name}</h4>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Rs. {item.price.toFixed(2)}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 5%', textAlign: 'center', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <UtensilsCrossed size={20} />
          <span style={{ fontWeight: 600 }}>Chiya & Puff - Restaurant Management System</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>© {new Date().getFullYear()} Chiya & Puff. All rights reserved.</p>
      </footer>
    </div>
  );
}
