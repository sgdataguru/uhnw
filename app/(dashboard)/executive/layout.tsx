/**
 * @file app/(dashboard)/executive/layout.tsx
 * @description Executive route guard layout.
 */

'use client';

import { useRoleGuard } from '@/app/hooks/useRoleGuard';

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized } = useRoleGuard('executive');

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-sm text-[var(--text-secondary)]">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return children;
}
