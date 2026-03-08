import React from 'react';

type DMVaultProps = {
  title?: string;
  children: React.ReactNode;
};

export default function DMVault({ title = 'DM Vault', children }: DMVaultProps) {
  return (
    <details className="dm-vault">
      <summary>{title} — spoilers</summary>
      <div className="dm-vault__content">{children}</div>
    </details>
  );
}