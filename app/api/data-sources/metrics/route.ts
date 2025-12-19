/**
 * @file app/api/data-sources/metrics/route.ts
 * @description API endpoint to fetch ingestion metrics
 */

import { NextResponse } from 'next/server';
import {
  mockIngestionMetrics,
  mockIngestionMetricsBySource,
} from '@/lib/mock-data/data-sources-mock';

/**
 * GET /api/data-sources/metrics
 * Returns ingestion metrics for all sources or specific source
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (sourceId) {
      const sourceMetrics = mockIngestionMetricsBySource[sourceId];
      
      if (!sourceMetrics) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SOURCE_NOT_FOUND',
              message: `Source with ID '${sourceId}' not found`,
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: sourceMetrics,
      });
    }

    // Return aggregated metrics
    return NextResponse.json({
      success: true,
      data: {
        aggregated: mockIngestionMetrics,
        bySource: mockIngestionMetricsBySource,
      },
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch ingestion metrics',
        },
      },
      { status: 500 }
    );
  }
}
