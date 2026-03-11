import styles from './Skeleton.module.css';

export function Skeleton({ className = '', style = {} }) {
  return <span className={`${styles.skeleton} ${className}`} style={style} />;
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton className={styles.title} />
        <Skeleton style={{ width: '40px', height: '1.25rem' }} />
      </div>
      <Skeleton className={styles.text} />
      <Skeleton className={styles.text} style={{ width: '80%' }} />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className={styles.card} style={{ height: '120px', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Skeleton className={styles.circle} />
        <div style={{ flex: 1 }}>
          <Skeleton className={styles.title} style={{ width: '30%', marginBottom: '0.5rem' }} />
          <Skeleton className={styles.text} style={{ width: '50%', margin: 0 }} />
        </div>
      </div>
    </div>
  );
}
