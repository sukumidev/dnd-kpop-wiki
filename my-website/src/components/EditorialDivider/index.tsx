import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export type EditorialDividerVariant = 'simple' | 'diamond' | 'ornament';

type EditorialDividerProps = {
  variant?: EditorialDividerVariant;
  className?: string;
};

const marks: Record<EditorialDividerVariant, string | null> = {
  simple: null,
  diamond: '◆',
  ornament: '❦',
};

export default function EditorialDivider({
  variant = 'simple',
  className,
}: EditorialDividerProps) {
  const mark = marks[variant];

  return (
    <div
      aria-hidden="true"
      className={clsx(styles.divider, styles[variant], className)}>
      <span className={styles.line} />
      {mark && <span className={styles.mark}>{mark}</span>}
      <span className={styles.line} />
    </div>
  );
}
