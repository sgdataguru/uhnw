/**
 * @file app/api/data-sources/status/route.ts
 * @description API endpoint to fetch data source statuses
 */

import { NextResponse } from 'next/server';
import { mockDataSources, getAggregatedStats } from '@/lib/mock-data/data-sources-mock';

/**
 * GET /api/data-sources/status
 * Returns status of all data sources
 */
export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const stats = getAggregatedStats();

    return NextResponse.json({
      success: true,
      data: {
        sources: mockDataSources,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch data source statuses',
        },
      },
      { status: 500 }
    );
  }
}
