/**
 * @file types/intelligence.ts
 * @description Type definitions for manual intelligence/liquidity events
 */

import type { SignalType, SignalSeverity, SignalTimeline } from './index';

// Information source for manual intelligence
export type InformationSource = 
  | 'client_conversation'
  | 'network_contact'
  | 'industry_event'
  | 'news_mention'
  | 'public_filing'
  | 'other';

// Manual intelligence form data structure
export interface IntelligenceFormData {
  clientId: string;
  eventType: SignalType;
  eventDetails: string;
  expectedTimeline: SignalTimeline;
  estimatedAmount?: number;
  informationSource: InformationSource;
  additionalNotes?: string;
  severity: SignalSeverity;
}

// Response from creating manual intelligence
export interface CreateIntelligenceResponse {
  success: boolean;
  data?: {
    signalId: string;
    leadScoreUpdated: boolean;
    newLeadScore?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Client search result
export interface ClientSearchResult {
  id: string;
  name: string;
  company: string;
  leadScore: number;
  scoreCategory: string;
}
