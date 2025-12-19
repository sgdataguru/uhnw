/**
 * @file app/api/data-sources/conflicts/route.ts
 * @description API endpoint to fetch and resolve data conflicts
 */

import { NextResponse } from 'next/server';
import { mockDataConflicts, getPendingConflicts } from '@/lib/mock-data/data-sources-mock';

/**
 * GET /api/data-sources/conflicts
 * Returns all data conflicts or pending conflicts only
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 250));

    let conflicts = mockDataConflicts;

    // Filter by status if provided
    if (status && status !== 'all') {
      conflicts = mockDataConflicts.filter((c) => c.status === status);
    }

    return NextResponse.json({
      success: true,
      data: {
        conflicts,
        summary: {
          total: mockDataConflicts.length,
          pending: getPendingConflicts().length,
          resolved: mockDataConflicts.filter((c) => c.status === 'resolved').length,
          escalated: mockDataConflicts.filter((c) => c.status === 'escalated').length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch data conflicts',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/data-sources/conflicts
 * Resolves a data conflict
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conflictId, selectedValue, reasoning, overrideSources } = body;

    if (!conflictId || !selectedValue) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'conflictId and selectedValue are required',
          },
        },
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find conflict
    const conflict = mockDataConflicts.find((c) => c.id === conflictId);

    if (!conflict) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFLICT_NOT_FOUND',
            message: `Conflict with ID '${conflictId}' not found`,
          },
        },
        { status: 404 }
      );
    }

    // In a real implementation, this would update the database
    // For demo, we'll just return success
    return NextResponse.json({
      success: true,
      data: {
        conflictId,
        status: 'resolved',
        resolution: {
          selectedValue,
          reasoning: reasoning || 'Manual resolution by admin',
          overrideSources: overrideSources || [],
          resolvedAt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RESOLUTION_ERROR',
          message: 'Failed to resolve conflict',
        },
      },
      { status: 500 }
    );
  }
}
