/**
 * @file app/(dashboard)/rm/layout.tsx
 * @description RM route guard layout.
 */

'use client';

import { useRoleGuard } from '@/app/hooks/useRoleGuard';

export default function RMLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized } = useRoleGuard('rm');

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-sm text-[var(--text-secondary)]">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return children;
}
