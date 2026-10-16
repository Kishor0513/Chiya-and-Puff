import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import Reveal from '@/components/Reveal';
import { PHONE } from '@/lib/site';
import styles from '../page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <section className={`${styles.section} ${styles.aboutSection}`}>
        <div className={styles.wrap}>
          <div className={styles.aboutGrid}>
            <Reveal>
              <h2>A neighbourhood kitchen for chiya and comfort food</h2>
              <p>
                Chiya &amp; Puff started with two things we never compromise on:
                properly brewed milk chiya and dumplings crimped by hand. The menu
                stays close to home — momo in all its forms, chowmein and thukpa,
                sadeko starters, choila and sekuwa off the grill, thali sets, and a
                short list of desserts and drinks.
              </p>
              <p>
                The QR ordering is there for one reason: so a full house never means
                slow service. Your order goes to the kitchen the second you place
                it, and you can see exactly where it stands — received, being
                prepared, or delivered.
              </p>
              <p>
                Behind the counter, the same system runs the floor: waiters work
                from a live table plan, the kitchen cooks off a display screen, and
                the bill prints as a proper receipt payable by cash, eSewa, Khalti
                or FonePay.
              </p>
            </Reveal>
            <Reveal className={styles.aboutBox} delay={120}>
              <h3>Good to know</h3>
              <dl>
                <div>
                  <dt>Seating</dt>
                  <dd>Numbered dine-in tables, each with its own QR code</dd>
                </div>
                <div>
                  <dt>Orders</dt>
                  <dd>Placed by guests, confirmed by the waiter, cooked to order</dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>Cash, eSewa, Khalti or FonePay — receipt with print &amp; share</dd>
                </div>
                <div>
                  <dt>Groups</dt>
                  <dd>Call ahead on {PHONE} and we will keep tables together</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
