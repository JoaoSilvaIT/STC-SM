import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Card({ title, children, action, className = '' }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {action && <div className={styles.action}>{action}</div>}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
