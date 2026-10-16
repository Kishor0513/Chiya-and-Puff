'use client';

import { useEffect, useState, type ReactNode } from 'react';
import styles from '@/app/page.module.css';

interface RevealProps {
  children: ReactNode;
  /** stagger delay in ms */
  delay?: number;
  as?: 'div' | 'li' | 'article';
  className?: string;
}

// Small scroll-reveal wrapper. Fades content up once when it enters the
// viewport. Fully disabled under prefers-reduced-motion (see CSS).
export default function Reveal({ children, delay = 0, as = 'div', className = '' }: RevealProps) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  // If IntersectionObserver doesn't exist (very old browser / SSR), stay visible.
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [el]);

  const cls = `${styles.reveal}${visible ? ` ${styles.visible}` : ''}${className ? ` ${className}` : ''}`;
  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;

  if (as === 'li') {
    return (
      <li ref={setEl} style={style} className={cls}>
        {children}
      </li>
    );
  }
  if (as === 'article') {
    return (
      <article ref={setEl} style={style} className={cls}>
        {children}
      </article>
    );
  }
  return (
    <div ref={setEl} style={style} className={cls}>
      {children}
    </div>
  );
}
