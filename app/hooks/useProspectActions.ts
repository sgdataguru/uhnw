/**
 * @file app/hooks/useProspectActions.ts
 * @description Hook for handling prospect actions (call, email, note, etc.)
 */

'use client';

import { useState, useCallback } from 'react';
import type { ActionType } from '@/types';

interface CreateActionData {
  actionType: ActionType;
  description: string;
  scheduledDate?: Date;
  metadata?: Record<string, unknown>;
}

interface UseProspectActionsReturn {
  isCreating: boolean;
  error: string | null;
  createAction: (prospectId: string, data: CreateActionData) => Promise<boolean>;
  scheduleCall: (prospectId: string, notes: string, scheduledDate?: Date) => Promise<boolean>;
  sendEmail: (prospectId: string, subject: string, body: string) => Promise<boolean>;
  logNote: (prospectId: string, note: string) => Promise<boolean>;
}

export function useProspectActions(): UseProspectActionsReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAction = useCallback(async (
    prospectId: string,
    data: CreateActionData
  ): Promise<boolean> => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch(`/api/prospects/${prospectId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return true;
      } else {
        throw new Error(result.error?.message || 'Failed to create action');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating action:', err);
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const scheduleCall = useCallback(async (
    prospectId: string,
    notes: string,
    scheduledDate?: Date
  ): Promise<boolean> => {
    return createAction(prospectId, {
      actionType: 'call',
      description: notes,
      scheduledDate,
    });
  }, [createAction]);

  const sendEmail = useCallback(async (
    prospectId: string,
    subject: string,
    body: string
  ): Promise<boolean> => {
    return createAction(prospectId, {
      actionType: 'email',
      description: `Subject: ${subject}\n\n${body}`,
    });
  }, [createAction]);

  const logNote = useCallback(async (
    prospectId: string,
    note: string
  ): Promise<boolean> => {
    return createAction(prospectId, {
      actionType: 'note',
      description: note,
    });
  }, [createAction]);

  return {
    isCreating,
    error,
    createAction,
    scheduleCall,
    sendEmail,
    logNote,
  };
}
