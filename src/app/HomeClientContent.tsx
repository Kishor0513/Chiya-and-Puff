'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  ChefHat,
  Clock,
  Coffee,
  Leaf,
  MapPin,
  Phone,
  QrCode,
  Receipt,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import HomeTerminal from './HomeTerminal';
import styles from './page.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
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

const EXPERIENCES = [
  {
    icon: <QrCode size={28} />,
    tint: 'var(--primary)',
    title: 'QR Table Ordering',
    text: 'No app, no waiting. Scan the tent card on your table to open this table’s live menu and order in seconds.',
  },
  {
    icon: <ChefHat size={28} />,
    tint: '#4A90E2',
    title: 'Fresh Momo Kitchen',
    text: 'Hand-crimped momos, sekuwa grills and thalis cooked to order — tracked live from pending to delivered.',
  },
  {
    icon: <Coffee size={28} />,
    tint: '#C9A227',
    title: 'Chiya Bar',
    text: 'Masala chiya, lemon tea and cold coffee brewed fresh — the original Chiya & Puff ritual, morning to night.',
  },
  {
    icon: <Leaf size={28} />,
    tint: 'var(--leaf)',
    title: 'Cozy Garden Corners',
    text: 'Warm lights, quiet corners and family tables. A calm garden feel built in our own style from scratch.',
  },
];

const FLOW = [
  {
    icon: <QrCode size={20} />,
    title: 'Scan & Order',
    text: 'Guest scans the table QR or enters the table number in the walk-in terminal. Same live menu as below.',
  },
  {
    icon: <ChefHat size={20} />,
    title: 'Kitchen Fires',
    text: 'Waiter moves PENDING → PREPARING, kitchen display cooks it and marks DELIVERED when ready.',
  },
  {
    icon: <Bell size={20} />,
    title: 'Waiter Serves',
    text: 'Floor plan flags OCCUPIED, NEEDS_SERVICE and BILL_REQUESTED live every 10 seconds.',
  },
  {
    icon: <Receipt size={20} />,
    title: 'Bill & Reset',
    text: 'Waiter generates the BILLED receipt. Guest pays cash / eSewa / Khalti / FonePay, staff frees the table.',
  },
];

export default function HomeClientContent({ categories, dishes }: HomeClientContentProps) {
  // Original picks from OUR OWN live menu — scratch-built, same data the QR flow orders from.
  // Takes reference from the ordering system itself, not a copied restaurant menu.
  const signaturePicks = dishes.slice(0, 6);
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.gardenGlow} />

      <div className={styles.announceBar}>
        <QrCode size={14} />
        <span>
          <strong>Chiya & Puff</strong> • Scan the table QR, order live — no app needed
        </span>
      </div>

      <motion.header
        className={styles.header}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className={styles.headerLogo}>
          <div className={styles.logoIcon}>
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <h2 className={styles.brandName}>Chiya & Puff</h2>
            <p className={styles.brandSub}>Garden restaurant • QR ordering</p>
          </div>
        </div>
        <nav className={styles.nav}>
          <Link href="#experience" className={styles.navLink}>Experience</Link>
          <Link href="#signatures" className={styles.navLink}>Signatures</Link>
          <Link href="#menu" className={styles.navLink}>Menu</Link>
          <Link href="#visit" className={styles.navLink}>Visit</Link>
          <ThemeToggle />
          <Link href="/waiter" className="btn btn-secondary">Staff</Link>
          <Link href="/admin" className="btn btn-primary">Admin</Link>
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
          <motion.div variants={itemVariants}>
            <span className="eyebrow">
              <QrCode size={13} /> Kathmandu • QR table ordering
            </span>
          </motion.div>
          <motion.h1 className={`${styles.heroTitle} display-serif`} variants={itemVariants}>
            Authentic taste.
            <span className={styles.heroHighlight}>Smart ordering.</span>
          </motion.h1>
          <motion.p className={styles.heroSubtitle} variants={itemVariants}>
            Chiya & Puff is our own scratch-built Nepalese kitchen with smart QR ordering —
            scan your table, track PENDING → PREPARING → DELIVERED live, and pay by cash,
            eSewa, Khalti or FonePay.
          </motion.p>

          <motion.div className={styles.trustRow} variants={itemVariants}>
            <span className={styles.trustPill}>
              <Star size={14} fill="currentColor" /> Live QR ordering
            </span>
            <span className={styles.trustPill}>
              <MapPin size={14} /> Dine-in tables 1–5+
            </span>
            <span className={styles.trustPill}>
              <Clock size={14} /> Waiter • Kitchen • Admin in sync
            </span>
          </motion.div>

          <motion.div className={styles.heroActions} variants={itemVariants}>
            <a href="#menu" className="btn btn-primary">Explore Menu</a>
            <a href="#visit" className="btn btn-secondary">Plan Your Visit</a>
            <a href="#how" className="btn btn-garden btn">How ordering works</a>
          </motion.div>

          <motion.div className={styles.heroStats} variants={itemVariants}>
            <div>
              <strong>{dishes.length > 0 ? `${dishes.length}+` : '45+'}</strong>
              <span>Nepali & global dishes</span>
            </div>
            <div>
              <strong>4-step</strong>
              <span>QR → kitchen → serve → bill</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>Waiter • Kitchen • Admin</span>
            </div>
          </motion.div>
        </div>

        <motion.div className={styles.terminalWrapper} variants={itemVariants}>
          <div className={styles.terminalStack}>
            <HomeTerminal />
            <div className={`${styles.gardenCard} glass-panel`}>
              <div className={styles.gardenCardHead}>
                <Coffee size={18} />
                <strong>How a table order works</strong>
              </div>
              <ul>
                <li><span>1. Scan QR</span><span>opens /table/ID</span></li>
                <li><span>2. Order</span><span>PENDING → OCCUPIED</span></li>
                <li><span>3. Track</span><span>live every 8s</span></li>
              </ul>
              <p className={styles.gardenNote}>
                Same IDs, tokens and statuses the waiter, kitchen and admin screens use.
                Enter a table number above to walk through it.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <hr className="garden-divider" />

      <motion.section
        id="experience"
        className={styles.section}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7 }}
      >
        <div className={styles.sectionHead}>
          <span className="eyebrow">Why Chiya & Puff</span>
          <h2 className="display-serif">Built from scratch, around your table</h2>
          <p>
            Every card, flow and status here mirrors the real ordering system below —
            same menu API, same table tokens, same order states. All copy and design
            are original.
          </p>
        </div>
        <div className={styles.grid}>
          {EXPERIENCES.map((f) => (
            <div key={f.title} className={`${styles.featureCard} glass-panel hover-lift`}>
              <div className={styles.featureIcon} style={{ color: f.tint, background: `${f.tint}14` }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <section id="signatures" className={`${styles.section} ${styles.tintedSection}`}>
        <div className={styles.sectionHead}>
          <span className="eyebrow">From our own live menu</span>
          <h2 className="display-serif">Kitchen picks right now</h2>
          <p>
            Pulled straight from the same dishes array your QR table orders from.
            Change the menu in Admin and this row updates automatically.
          </p>
        </div>
        <div className={styles.signatureGrid}>
          {signaturePicks.length === 0 ? (
            <p className={styles.emptyMenu}>
              Menu is empty in the database — seed it, then these cards fill in on their own.
            </p>
          ) : (
            signaturePicks.map((s) => (
              <div key={s.id} className={`${styles.signatureCard} glass-panel hover-lift`}>
                <span className={styles.signatureTag}>{s.category}</span>
                <h4>{s.name}</h4>
                <p>{s.description || 'Fresh from our scratch kitchen.'}</p>
                <span className={styles.signaturePrice}>Rs. {s.price.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
        <p className={styles.referenceNote}>
          Ambience reference only: garden restaurants like Lavie Garden, Boudha showed how
          greenery + live QR service feels. Dishes, text and theme here are 100% Chiya & Puff.
        </p>
      </section>

      <section id="how" className={styles.section}>
        <div className={styles.sectionHead}>
          <span className="eyebrow">The main system</span>
          <h2 className="display-serif">QR ordering, end to end</h2>
          <p>
            This homepage is a window into the live loop: customer QR page, waiter floor,
            kitchen display and admin stats share one Prisma database.
          </p>
        </div>
        <div className={styles.flowGrid}>
          {FLOW.map((s, i) => (
            <div key={s.title} className={`${styles.flowCard} glass-panel`}>
              <div className={styles.flowStep}>0{i + 1}</div>
              <div className={styles.flowIcon}>{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <div className={styles.dashLinks}>
          <Link href="/waiter" className="btn btn-secondary"><Users size={16} /> Waiter floor plan</Link>
          <Link href="/kitchen" className="btn btn-secondary"><ChefHat size={16} /> Kitchen display</Link>
          <Link href="/admin" className="btn btn-primary"><Sparkles size={16} /> Admin dashboard</Link>
        </div>
      </section>

      <section id="menu" className={`${styles.section} ${styles.tintedSection}`}>
        <div className={styles.menuHeader}>
          <span className="eyebrow">Our cuisine</span>
          <h2 className="display-serif">Browse before you take a seat</h2>
          <p>Live from our kitchen — the same menu your QR table ordering uses.</p>
        </div>

        {categories.length === 0 && (
          <p className={styles.emptyMenu}>
            Menu is loading or unavailable right now — please ask our staff or try the walk-in terminal above.
          </p>
        )}

        {categories.map((category) => {
          const items = dishes.filter((m) => m.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.menuGrid}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    className={`${styles.menuCard} glass-panel hover-lift`}
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className={styles.menuCardTop}>
                      <h4 className={styles.itemName}>
                        <span className={styles.vegDot} aria-hidden="true" />
                        {item.name}
                      </h4>
                      <span className={styles.itemPrice}>Rs. {item.price.toFixed(2)}</span>
                    </div>
                    {item.description && (
                      <p className={styles.itemDescription}>{item.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section id="visit" className={styles.section}>
        <div className={styles.visitGrid}>
          <div>
            <span className="eyebrow">Visit us</span>
            <h2 className="display-serif">Take a table, scan, relax</h2>
            <p className={styles.visitLead}>
              Walk in, get a table number from staff or scan the printed QR tent card.
              The menu, cart, live status, bill request and receipt all live on that one page.
            </p>
            <ul className={styles.visitList}>
              <li><QrCode size={16} /> Each table has its own QR link: /table/[id]?token=qrData</li>
              <li><MapPin size={16} /> Kathmandu, Nepal — ask staff for your table number</li>
              <li><Phone size={16} /> Walk-ins welcome — use the terminal above if you have no QR</li>
            </ul>
            <div className={styles.heroActions}>
              <a href="#menu" className="btn btn-garden btn">See menu & order</a>
              <Link href="/login" className="btn btn-secondary">Staff login</Link>
            </div>
          </div>
          <div className={`${styles.visitCard} glass-panel`}>
            <h3 className="display-serif">Good to know</h3>
            <div className={styles.visitRows}>
              <div><strong>Best for</strong><span>Dine-in QR ordering for small–medium restaurants</span></div>
              <div><strong>Payments</strong><span>Cash • eSewa • Khalti • FonePay — receipt bill with print & share</span></div>
              <div><strong>Staff</strong><span>Waiter floor plan • Kitchen display • Admin menu, tables, staff, analytics</span></div>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <UtensilsCrossed size={20} />
            <span>Chiya & Puff — Garden Restaurant & Management System</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="#experience">Experience</Link>
            <Link href="#signatures">Signatures</Link>
            <Link href="#menu">Menu</Link>
            <Link href="#visit">Visit</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/waiter">Staff</Link>
          </div>
          <p className={styles.footerRef}>
            Original Chiya & Puff theme and menu, built from scratch. Garden-restaurant
            ambience takes light inspiration from places like Lavie Garden, Boudha.
          </p>
          <p className={styles.copy}>© {new Date().getFullYear()} Chiya & Puff. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
