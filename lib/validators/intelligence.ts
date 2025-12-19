/**
 * @file lib/validators/intelligence.ts
 * @description Zod validation schemas for manual intelligence forms
 */

import { z } from 'zod';

export const intelligenceFormSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  
  eventType: z.enum([
    'ipo',
    'funding',
    'acquisition',
    'merger',
    'board',
    'director_change',
    'corporate_action',
    'margin_pledge',
    'early_exit',
  ], { message: 'Please select an event type' }),
  
  eventDetails: z
    .string()
    .min(20, 'Please provide at least 20 characters of detail')
    .max(1000, 'Details must be less than 1000 characters'),
  
  expectedTimeline: z.enum([
    '30_days',
    '30_60_days',
    '60_90_days',
    '3_6_months',
    '6_plus_months'
  ], { message: 'Please select an expected timeline' }),
  
  estimatedAmount: z
    .number()
    .positive('Amount must be positive')
    .optional(),
  
  informationSource: z.enum([
    'client_conversation',
    'network_contact',
    'industry_event',
    'news_mention',
    'public_filing',
    'other'
  ], { message: 'Please specify information source' }),
  
  additionalNotes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
  
  severity: z.enum(['critical', 'high', 'medium', 'low'], {
    message: 'Please select severity level'
  })
});

export type IntelligenceFormInput = z.infer<typeof intelligenceFormSchema>;
