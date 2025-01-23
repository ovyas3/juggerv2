import styles from '../styles/FreightDashboardCard.module.css';

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function FreightDashboardCard({ title, subtitle, children }: CardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

