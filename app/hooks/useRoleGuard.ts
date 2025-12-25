/**
 * @file hooks/useRoleGuard.ts
 * @description Client-side role guard for dashboard routes.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDefaultDashboardRoute, getStoredAuth } from '@/lib/auth/session';
import type { UserRole } from '@/types';

export function useRoleGuard(allowedRole: UserRole) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = getStoredAuth();

    if (!session?.isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (session.user.role !== allowedRole) {
      router.replace(getDefaultDashboardRoute(session.user.role));
      return;
    }

    setIsAuthorized(true);
  }, [allowedRole, router]);

  return { isAuthorized };
}
