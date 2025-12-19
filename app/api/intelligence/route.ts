/**
 * @file app/api/intelligence/route.ts
 * @description API route for creating manual intelligence/liquidity events
 */

import { NextRequest, NextResponse } from 'next/server';
import { intelligenceFormSchema } from '@/lib/validators/intelligence';
import type { Signal } from '@/types';
import type { CreateIntelligenceResponse } from '@/types/intelligence';

// Generate a unique ID for signals (in production, use UUID from database)
function generateId(): string {
  return 's' + Date.now() + Math.random().toString(36).substring(2, 9);
}

// Generate signal title from event type
function generateSignalTitle(eventType: string, clientName: string): string {
  const eventTypeLabels: Record<string, string> = {
    ipo: 'IPO Filing',
    funding: 'Funding Round',
    acquisition: 'Acquisition',
    merger: 'Merger',
    board: 'Board Change',
    director_change: 'Director Change',
    corporate_action: 'Corporate Action',
    margin_pledge: 'Margin/Pledge',
    early_exit: 'Early Exit',
  };
  
  return `${clientName} - ${eventTypeLabels[eventType] || eventType} (RM Intel)`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = intelligenceFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError?.message || 'Invalid form data',
          },
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // In production, this would:
    // 1. Verify user authentication
    // 2. Check RM has access to client
    // 3. Insert signal into Supabase
    // 4. Trigger lead score recalculation
    // 5. Log activity
    
    // For now, create a mock signal
    const newSignal: Signal = {
      id: generateId(),
      type: data.eventType,
      severity: data.severity,
      title: generateSignalTitle(data.eventType, 'Client'),
      description: data.eventDetails,
      source: 'Manual Intelligence',
      createdAt: new Date(),
      isActioned: false,
      isRead: false,
      expectedTimeline: data.expectedTimeline,
      metadata: {
        isManual: true,
        addedByRm: 'current-rm-id',
        informationSource: data.informationSource,
        additionalNotes: data.additionalNotes,
        estimatedAmount: data.estimatedAmount,
      },
      estimatedLiquidity: data.estimatedAmount ? data.estimatedAmount / 10000000 : undefined,
      confidence: 85,
    };
    
    // Mock lead score update
    const mockLeadScore = Math.floor(Math.random() * 20) + 75;
    
    const response: CreateIntelligenceResponse = {
      success: true,
      data: {
        signalId: newSignal.id,
        leadScoreUpdated: true,
        newLeadScore: mockLeadScore,
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating intelligence:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create intelligence event',
        },
      },
      { status: 500 }
    );
  }
}
