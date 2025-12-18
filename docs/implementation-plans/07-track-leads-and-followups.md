# 07 - Track Leads and Follow-ups on Dashboard - Implementation Plan

## Project Context

**Technical Stack**: Next.js 15 (App Router), React 18, TypeScript, TailwindCSS, Radix UI
**Backend**: Supabase (PostgreSQL), Realtime Subscriptions
**Charting**: Recharts / Tremor
**Infrastructure**: Vercel (Frontend), Supabase (Backend)

---

## User Story

**As a** Relationship Manager,
**I want** to see a dashboard tracking how many leads and liquidity events have been generated and followed up,
**so that** I can measure my engagement effectiveness and ensure no opportunities are missed.

---

## Pre-conditions

- Supabase database is set up with `clients`, `signals`, `follow_ups`, and `activities` tables
- User is authenticated as an RM
- RM has created clients and follow-up tasks in the system
- Dashboard page route exists (`/dashboard` or `/(dashboard)/page.tsx`)
- Activities are being tracked when RMs take actions (view signal, contact client, complete follow-up)

---

## Business Requirements

- **Activity Visibility**: RMs can see at-a-glance metrics of their engagement with leads and prospects
  - *Success Metric*: Dashboard loads in <1 second, metrics visible above the fold
  
- **Accountability Tracking**: Clear distinction between followed-up and pending leads
  - *Success Metric*: <5% of high-priority signals remain pending for >3 days
  
- **Real-time Updates**: Metrics update when new signals arrive or follow-ups are completed
  - *Success Metric*: Metrics refresh within 10 seconds of data change
  
- **Historical Trends**: Ability to view engagement trends over time (daily/weekly/monthly)
  - *Success Metric*: Historical charts show accurate data for last 30 days minimum
  
- **Actionable Insights**: Dashboard helps RMs identify what needs immediate attention
  - *Success Metric*: 80%+ of RMs take action on overdue follow-ups within 24 hours

---

## Technical Specifications

### Integration Points

- **Supabase Realtime**: Subscription to changes in `signals` and `follow_ups` tables
- **Recharts/Tremor**: Data visualization library for trend charts
- **Date-fns**: Date manipulation for trend aggregation
- **SWR/React Query**: Data fetching with auto-refresh

### Security Requirements

- RLS (Row-Level Security) ensures RMs only see their own metrics
- JWT token validation on all API requests
- No PII exposed in metric aggregations
- Activity logs encrypted at rest

### Data Flow

```
Database Change → Supabase Realtime → Frontend Subscription → 
State Update → Metric Recalculation → UI Refresh
```

---

## Design Specifications

### Visual Layout & Components

**Dashboard Layout**:

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard Header                                            │
│  "Welcome back, [RM Name]"                    [Date Range]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────┐│
│  │ Total Leads  │ │   Signals    │ │  Follow-ups  │ │ ... ││
│  │     185      │ │      42      │ │   23 / 45    │ │     ││
│  │   +12 this   │ │  +8 today    │ │   51% done   │ │     ││
│  │    week      │ │              │ │              │ │     ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────┘│
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Engagement Trends (Last 30 Days)                        ││
│  │  [Line Chart: Signals Generated vs Follow-ups Completed] ││
│  │                                                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────┐  ┌──────────────────────────────┐│
│  │  Pending Follow-ups   │  │   Recent Activity Feed       ││
│  │  (5 overdue)          │  │   • Viewed Signal: IPO...    ││
│  │  [List of tasks]      │  │   • Contacted Client: Raj... ││
│  │                       │  │   • Completed Follow-up...   ││
│  └───────────────────────┘  └──────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Component Hierarchy**:

```tsx
<DashboardPage>
  <PageHeader title="Dashboard" />
  <MetricsGrid>
    <MetricCard type="leads" />
    <MetricCard type="signals" />
    <MetricCard type="follow-ups" />
    <MetricCard type="conversions" />
  </MetricsGrid>
  <TrendSection>
    <DateRangeSelector />
    <EngagementTrendChart />
  </TrendSection>
  <DetailSection>
    <PendingFollowUpsList />
    <ActivityFeed />
  </DetailSection>
</DashboardPage>
```

### Design System Compliance

**Color Palette**:

```css
/* Metric Cards */
--metric-bg: #FFFFFF;
--metric-border: #E1E5EB;
--metric-value: #1A1A2E;         /* Primary text */
--metric-change-positive: #28A745; /* Green for increases */
--metric-change-negative: #DC3545; /* Red for decreases */
--metric-label: #5A6C7D;          /* Muted text */

/* Status Colors */
--status-completed: #28A745;      /* Green */
--status-pending: #FFC107;        /* Amber */
--status-overdue: #DC3545;        /* Red */
```

**Typography**:

```css
/* Metric Card Typography */
--metric-value-size: 2.25rem;     /* 36px - large numbers */
--metric-label-size: 0.875rem;    /* 14px - labels */
--metric-change-size: 0.75rem;    /* 12px - change indicators */
```

### Responsive Behavior

**Desktop (1024px+)**:

- 4-column metric grid
- Chart: Full width
- Side-by-side follow-ups and activity feed

**Tablet (768px - 1023px)**:

- 2-column metric grid
- Chart: Full width
- Stacked follow-ups and activity

**Mobile (<768px)**:

- 1-column stacked layout
- Chart: Simplified view
- Collapsible sections

### Interaction Patterns

**Metric Card States**:

```typescript
interface MetricCardStates {
  default: 'border-gray-200';
  hover: 'border-blue-300 shadow-md transform scale-105';
  loading: 'animate-pulse bg-gray-100';
  clickable: 'cursor-pointer';
}
```

**Trend Visualization**:

```typescript
interface TrendPattern {
  increase: 'text-green-600 ↑';
  decrease: 'text-red-600 ↓';
  neutral: 'text-gray-600 →';
}
```

---

## Technical Architecture

### Component Structure

```
app/(dashboard)/
├── page.tsx                          # Main dashboard page
├── components/
│   └── dashboard/
│       ├── MetricsCard.tsx           # Individual metric card
│       ├── MetricsGrid.tsx           # Grid layout for metrics
│       ├── EngagementTrendChart.tsx  # Line/area chart
│       ├── ActivityFeed.tsx          # Recent actions list
│       ├── PendingFollowUpsList.tsx  # Overdue/pending tasks
│       ├── DateRangeSelector.tsx     # Filter by date range
│       ├── QuickActions.tsx          # CTA buttons
│       └── hooks/
│           ├── useMetrics.ts         # Fetch dashboard metrics
│           ├── useTrends.ts          # Fetch trend data
│           ├── useActivityFeed.ts    # Fetch recent activities
│           └── useRealtimeMetrics.ts # Realtime subscriptions
```

### State Management Architecture

**Dashboard State Interface**:

```typescript
interface DashboardState {
  // Metrics
  metrics: DashboardMetrics | null;
  isLoadingMetrics: boolean;
  metricsError: string | null;
  
  // Trends
  trends: TrendData[];
  trendPeriod: 'daily' | 'weekly' | 'monthly';
  dateRange: DateRange;
  
  // Follow-ups
  pendingFollowUps: FollowUp[];
  overdueCount: number;
  
  // Activity Feed
  recentActivities: Activity[];
  
  // UI State
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

interface DashboardMetrics {
  totalLeads: number;
  leadsThisWeek: number;
  leadsChange: number;           // % change from previous period
  
  totalSignals: number;
  signalsToday: number;
  signalsThisWeek: number;
  
  totalFollowUps: number;
  completedFollowUps: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
  followUpCompletionRate: number; // %
  
  conversions: number;
  conversionRate: number;         // %
  
  // Engagement metrics
  totalActivities: number;
  activitiesToday: number;
}

interface TrendData {
  date: Date;
  signalsGenerated: number;
  followUpsCompleted: number;
  clientsContacted: number;
  conversions: number;
}

interface Activity {
  id: string;
  userId: string;
  actionType: ActivityType;
  description: string;
  clientId?: string;
  signalId?: string;
  createdAt: Date;
}

type ActivityType = 
  | 'signal_viewed'
  | 'signal_actioned'
  | 'client_contacted'
  | 'follow_up_created'
  | 'follow_up_completed'
  | 'client_converted'
  | 'intelligence_added';
```

**Dashboard Actions**:

```typescript
interface DashboardActions {
  // Data Loading
  loadMetrics: () => Promise<void>;
  loadTrends: (period: TrendPeriod, range?: DateRange) => Promise<void>;
  loadRecentActivities: (limit?: number) => Promise<void>;
  
  // Realtime
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
  
  // UI Actions
  refreshDashboard: () => Promise<void>;
  changeDateRange: (range: DateRange) => void;
  changeTrendPeriod: (period: TrendPeriod) => void;
}
```

### API Integration Schema

**Metrics API** (`/api/metrics/route.ts`):

```typescript
// GET Request
interface GetMetricsRequest {
  rmId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Response
interface MetricsResponse {
  success: boolean;
  data: DashboardMetrics;
  lastUpdated: Date;
}
```

**Trends API** (`/api/metrics/trends/route.ts`):

```typescript
// GET Request
interface GetTrendsRequest {
  rmId: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
}

// Response
interface TrendsResponse {
  success: boolean;
  data: TrendData[];
  period: string;
}
```

**Activities API** (`/api/activities/route.ts`):

```typescript
// GET Request
interface GetActivitiesRequest {
  rmId: string;
  limit?: number;
  offset?: number;
}

// POST Request (track new activity)
interface CreateActivityRequest {
  actionType: ActivityType;
  clientId?: string;
  signalId?: string;
  notes?: string;
}

// Response
interface ActivitiesResponse {
  success: boolean;
  data: Activity[];
  total: number;
}
```

---

## Implementation Requirements

### Core Components

#### 1. `MetricsCard.tsx` - Metric display card

- Displays a single metric (leads, signals, follow-ups, etc.)
- Shows current value, change indicator, and trend
- Animated counter for value changes
- Click to navigate to detailed view

#### 2. `MetricsGrid.tsx` - Grid container for metrics

- Responsive grid layout (4 cols → 2 cols → 1 col)
- Loading skeleton states
- Error boundary for failed metrics

#### 3. `EngagementTrendChart.tsx` - Trend visualization

- Line/Area chart with multiple series
- Configurable date range
- Tooltips showing exact values
- Legend for different metrics

#### 4. `PendingFollowUpsList.tsx` - Follow-up task list

- List of pending/overdue follow-ups
- Sorted by priority and due date
- Quick action: Mark as complete
- Navigate to client detail

#### 5. `ActivityFeed.tsx` - Recent actions feed

- Chronological list of recent activities
- Icons for different activity types
- Relative timestamps ("2 hours ago")
- Load more / pagination

### Custom Hooks

#### `useMetrics()` - Fetch dashboard metrics

```typescript
export function useMetrics(rmId: string, dateRange?: DateRange) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchMetrics() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/metrics?rmId=${rmId}`);
        const data = await response.json();
        setMetrics(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMetrics();
  }, [rmId, dateRange]);
  
  return { metrics, isLoading, error };
}
```

#### `useRealtimeMetrics()` - Real-time updates

```typescript
export function useRealtimeMetrics(rmId: string) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  useEffect(() => {
    // Subscribe to Supabase Realtime
    const signalsChannel = supabase
      .channel('signals-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'signals',
        filter: `assigned_rm_id=eq.${rmId}`
      }, (payload) => {
        setLastUpdate(new Date());
        queryClient.invalidateQueries(['metrics', rmId]);
      })
      .subscribe();
    
    const followUpsChannel = supabase
      .channel('followups-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'follow_ups',
        filter: `rm_id=eq.${rmId}`
      }, (payload) => {
        setLastUpdate(new Date());
        queryClient.invalidateQueries(['metrics', rmId]);
      })
      .subscribe();
    
    return () => {
      signalsChannel.unsubscribe();
      followUpsChannel.unsubscribe();
    };
  }, [rmId]);
  
  return { lastUpdate };
}
```

#### `useTrends()` - Historical trend data

```typescript
export function useTrends(
  rmId: string,
  period: TrendPeriod,
  dateRange: DateRange
) {
  return useQuery({
    queryKey: ['trends', rmId, period, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        rmId,
        period,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      });
      
      const response = await fetch(`/api/metrics/trends?${params}`);
      if (!response.ok) throw new Error('Failed to fetch trends');
      
      const data = await response.json();
      return data.data as TrendData[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Utility Functions

#### `services/metricsService.ts` - Metrics calculation

```typescript
export async function calculateDashboardMetrics(
  rmId: string,
  dateRange?: DateRange
): Promise<DashboardMetrics> {
  const supabase = createServerClient();
  
  // Fetch all required data
  const [clients, signals, followUps, activities] = await Promise.all([
    supabase
      .from('clients')
      .select('*')
      .eq('assigned_rm_id', rmId),
    
    supabase
      .from('signals')
      .select('*')
      .eq('client_id', 'in', clientIds),
    
    supabase
      .from('follow_ups')
      .select('*')
      .eq('rm_id', rmId),
    
    supabase
      .from('activities')
      .select('*')
      .eq('user_id', rmId)
  ]);
  
  // Calculate metrics
  const totalLeads = clients.data?.length || 0;
  const leadsThisWeek = clients.data?.filter(c => 
    isThisWeek(new Date(c.created_at))
  ).length || 0;
  
  const totalSignals = signals.data?.length || 0;
  const signalsToday = signals.data?.filter(s => 
    isToday(new Date(s.detected_at))
  ).length || 0;
  
  const totalFollowUps = followUps.data?.length || 0;
  const completedFollowUps = followUps.data?.filter(f => 
    f.status === 'completed'
  ).length || 0;
  const overdueFollowUps = followUps.data?.filter(f => 
    f.status === 'pending' && isPast(new Date(f.due_date))
  ).length || 0;
  
  const conversions = clients.data?.filter(c => 
    c.status === 'converted'
  ).length || 0;
  
  return {
    totalLeads,
    leadsThisWeek,
    leadsChange: calculatePercentChange(totalLeads, leadsLastWeek),
    
    totalSignals,
    signalsToday,
    signalsThisWeek,
    
    totalFollowUps,
    completedFollowUps,
    pendingFollowUps: totalFollowUps - completedFollowUps,
    overdueFollowUps,
    followUpCompletionRate: (completedFollowUps / totalFollowUps) * 100,
    
    conversions,
    conversionRate: (conversions / totalLeads) * 100,
    
    totalActivities: activities.data?.length || 0,
    activitiesToday: activities.data?.filter(a => 
      isToday(new Date(a.created_at))
    ).length || 0
  };
}
```

#### `lib/utils/metrics-helpers.ts` - Helper functions

```typescript
export function calculatePercentChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

export function formatMetricChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export function getTrendDirection(
  change: number
): 'increase' | 'decrease' | 'neutral' {
  if (change > 2) return 'increase';
  if (change < -2) return 'decrease';
  return 'neutral';
}

export function getFollowUpStatus(followUp: FollowUp): 'overdue' | 'pending' | 'completed' {
  if (followUp.status === 'completed') return 'completed';
  if (isPast(new Date(followUp.due_date))) return 'overdue';
  return 'pending';
}
```

---

## Acceptance Criteria

### Functional Requirements

#### Core Feature Functionality

✅ **AC 1.1**: Dashboard displays count of total leads generated

- Metric card shows total number of clients/leads assigned to RM
- Includes leads from all sources (manual, signal-derived, imported)
- Updates in real-time when new leads are added

✅ **AC 1.2**: Dashboard shows count of liquidity events detected

- Metric card shows total signals detected
- Breakdown: Today, This Week, Total
- Includes all signal types (IPO, M&A, Funding, etc.)

✅ **AC 1.3**: Tracks followed-up vs. pending leads

- Follow-up metric shows: X completed / Y total (Z% completion rate)
- Separate count for overdue follow-ups (highlighted in red)
- Clickable to view full follow-up list

✅ **AC 1.4**: Metrics updated in real-time or near real-time

- Supabase Realtime subscriptions active
- Metrics refresh within 10 seconds of database change
- Visual indicator showing "Updated X seconds ago"

✅ **AC 1.5**: Historical trends shown (daily/weekly/monthly)

- Line chart displays engagement trends
- Configurable period: Last 7 days, 30 days, 90 days
- Multiple series: Signals, Follow-ups, Contacts, Conversions

✅ **AC 1.6**: Dashboard is visually clear and scannable

- Metrics above the fold (no scrolling needed)
- Color-coded status indicators (green/amber/red)
- Large, readable numbers
- Responsive on all devices

### Non-Functional Requirements

#### Performance

- ⚡ Dashboard loads in <1 second
- ⚡ Metric calculation completes in <500ms
- ⚡ Chart renders in <300ms
- ⚡ Realtime update latency <10 seconds

#### Accessibility

- ♿ Keyboard navigation for all interactive elements
- ♿ Screen reader announces metric updates
- ♿ WCAG AA color contrast for all text
- ♿ Focus indicators on cards and buttons

#### Security

- 🔒 RLS ensures RMs only see their own metrics
- 🔒 No PII exposed in aggregated data
- 🔒 Activity logs encrypted at rest

---

## Modified Files

### New Files

```
app/
├── api/
│   ├── metrics/
│   │   ├── route.ts                ⬜ NEW - Get dashboard metrics
│   │   └── trends/
│   │       └── route.ts            ⬜ NEW - Get trend data
│   └── activities/
│       └── route.ts                ⬜ NEW - Get/create activities

components/
└── features/
    └── dashboard/
        ├── MetricsCard.tsx         ⬜ NEW - Individual metric card
        ├── MetricsGrid.tsx         ⬜ NEW - Metrics grid layout
        ├── EngagementTrendChart.tsx ⬜ NEW - Trend visualization
        ├── ActivityFeed.tsx        ⬜ NEW - Recent activity list
        ├── PendingFollowUpsList.tsx ⬜ NEW - Follow-up tasks
        ├── DateRangeSelector.tsx   ⬜ NEW - Date filter
        ├── QuickActions.tsx        ⬜ NEW - CTA buttons
        └── hooks/
            ├── useMetrics.ts       ⬜ NEW - Metrics data hook
            ├── useTrends.ts        ⬜ NEW - Trends data hook
            ├── useActivityFeed.ts  ⬜ NEW - Activity feed hook
            └── useRealtimeMetrics.ts ⬜ NEW - Realtime subscriptions

services/
└── metricsService.ts               ⬜ NEW - Metrics calculation logic

lib/
└── utils/
    └── metrics-helpers.ts          ⬜ NEW - Metric utility functions

types/
└── metrics.ts                      ⬜ NEW - Metrics type definitions
```

### Modified Files

```
app/(dashboard)/
└── page.tsx                        ✏️ MODIFY - Add metrics and charts

lib/supabase/
└── client.ts                       ✏️ MODIFY - Add metrics queries

types/
└── index.ts                        ✏️ MODIFY - Export metrics types
```

---

## Implementation Status

**OVERALL STATUS**: ⬜ NOT STARTED

### Phase 1: Foundation & Setup

- ⬜ Create metrics type definitions
- ⬜ Set up activities table (if not exists)
- ⬜ Create API route structure
- ⬜ Set up Recharts/Tremor library

### Phase 2: Metrics Calculation

- ⬜ Build metricsService for calculations
- ⬜ Implement /api/metrics endpoint
- ⬜ Create useMetrics hook
- ⬜ Add database queries for aggregations

### Phase 3: Dashboard UI

- ⬜ Build MetricsCard component
- ⬜ Create MetricsGrid layout
- ⬜ Update dashboard page with metrics
- ⬜ Add loading and error states

### Phase 4: Trends & Visualization

- ⬜ Implement trend calculation logic
- ⬜ Build EngagementTrendChart component
- ⬜ Create DateRangeSelector
- ⬜ Add useTrends hook

### Phase 5: Realtime & Polish

- ⬜ Set up Supabase Realtime subscriptions
- ⬜ Implement useRealtimeMetrics hook
- ⬜ Add ActivityFeed component
- ⬜ Build PendingFollowUpsList
- ⬜ Add animations for metric updates
- ⬜ Performance optimization

---

## Dependencies

### Internal Dependencies

- ✅ Supabase authentication (already implemented)
- ✅ Database schema (clients, signals, follow_ups tables)
- ⬜ Design system components (Card, Badge, Button)
- ⬜ Date utilities (date-fns)

### External Dependencies

- Recharts or Tremor (data visualization)
- Date-fns (date manipulation)
- React Query / SWR (data fetching)
- Supabase Realtime (subscriptions)

### NPM Packages

```bash
npm install recharts date-fns @tanstack/react-query
# OR
npm install @tremor/react date-fns
```

---

## Risk Assessment

### Technical Risks

#### **Risk 1: Metrics Calculation Performance**

- **Impact**: High - Slow dashboard load hurts UX
- **Mitigation**:
  - Use database aggregations (not client-side)
  - Add indexes on frequently queried columns
  - Cache metrics for 1 minute (SWR)
  - Lazy load trend charts
- **Contingency**: Pre-calculate metrics in background job, store in separate table

#### **Risk 2: Realtime Update Overhead**

- **Impact**: Medium - Too many subscriptions slow down app
- **Mitigation**:
  - Single channel per user for all updates
  - Debounce rapid updates (max 1 refresh/10sec)
  - Unsubscribe when dashboard not visible
- **Contingency**: Fall back to polling every 30 seconds

#### **Risk 3: Data Inconsistency**

- **Impact**: Medium - Metrics don't match detail pages
- **Mitigation**:
  - Use same queries for metrics and details
  - Invalidate cache on data changes
  - Add automated tests for calculations
- **Contingency**: Show "Last updated" timestamp, manual refresh button

### Business Risks

#### **Risk 1: Metric Overload**

- **Impact**: Medium - Too many metrics confuse RMs
- **Mitigation**:
  - Start with 4 core metrics (leads, signals, follow-ups, conversions)
  - Add advanced metrics in v2
  - User testing with 5 RMs
- **Contingency**: Allow RMs to customize which metrics to display

---

## Testing Strategy

### Unit Tests (Jest)

**Test File**: `services/metricsService.test.ts`

```typescript
describe('calculateDashboardMetrics', () => {
  it('should calculate total leads correctly', async () => {
    const mockClients = [
      { id: '1', created_at: new Date().toISOString() },
      { id: '2', created_at: subDays(new Date(), 3).toISOString() }
    ];
    
    mockSupabaseQuery('clients', mockClients);
    
    const metrics = await calculateDashboardMetrics('rm-123');
    expect(metrics.totalLeads).toBe(2);
  });
  
  it('should calculate follow-up completion rate', async () => {
    const mockFollowUps = [
      { id: '1', status: 'completed' },
      { id: '2', status: 'completed' },
      { id: '3', status: 'pending' },
      { id: '4', status: 'pending' }
    ];
    
    mockSupabaseQuery('follow_ups', mockFollowUps);
    
    const metrics = await calculateDashboardMetrics('rm-123');
    expect(metrics.followUpCompletionRate).toBe(50);
  });
  
  it('should identify overdue follow-ups', async () => {
    const mockFollowUps = [
      { id: '1', status: 'pending', due_date: subDays(new Date(), 2).toISOString() },
      { id: '2', status: 'pending', due_date: addDays(new Date(), 2).toISOString() }
    ];
    
    mockSupabaseQuery('follow_ups', mockFollowUps);
    
    const metrics = await calculateDashboardMetrics('rm-123');
    expect(metrics.overdueFollowUps).toBe(1);
  });
});
```

**Test File**: `components/features/dashboard/MetricsCard.test.tsx`

```typescript
describe('MetricsCard', () => {
  it('should display metric value and label', () => {
    const { getByText } = render(
      <MetricsCard 
        label="Total Leads" 
        value={185} 
        change={12}
      />
    );
    
    expect(getByText('Total Leads')).toBeInTheDocument();
    expect(getByText('185')).toBeInTheDocument();
  });
  
  it('should show positive change indicator', () => {
    const { container } = render(
      <MetricsCard value={100} change={15} />
    );
    
    const changeIndicator = container.querySelector('[data-trend="increase"]');
    expect(changeIndicator).toHaveClass('text-green-600');
    expect(changeIndicator).toHaveTextContent('+15%');
  });
  
  it('should show negative change indicator', () => {
    const { container } = render(
      <MetricsCard value={100} change={-10} />
    );
    
    const changeIndicator = container.querySelector('[data-trend="decrease"]');
    expect(changeIndicator).toHaveClass('text-red-600');
    expect(changeIndicator).toHaveTextContent('-10%');
  });
});
```

### Integration Tests (React Testing Library)

**Test File**: `app/(dashboard)/page.integration.test.tsx`

```typescript
describe('Dashboard Page Integration', () => {
  it('should load and display all metrics', async () => {
    mockAPI('/api/metrics', {
      data: {
        totalLeads: 185,
        totalSignals: 42,
        completedFollowUps: 23,
        totalFollowUps: 45
      }
    });
    
    const { getByText } = render(<DashboardPage />);
    
    await waitFor(() => {
      expect(getByText('185')).toBeInTheDocument(); // Total leads
      expect(getByText('42')).toBeInTheDocument();  // Total signals
      expect(getByText('23 / 45')).toBeInTheDocument(); // Follow-ups
    });
  });
  
  it('should update metrics in realtime', async () => {
    const { getByText, rerender } = render(<DashboardPage />);
    
    // Initial metrics
    await waitFor(() => {
      expect(getByText('42')).toBeInTheDocument();
    });
    
    // Simulate realtime update
    act(() => {
      triggerRealtimeUpdate({ signalsToday: 43 });
    });
    
    // Metrics should update
    await waitFor(() => {
      expect(getByText('43')).toBeInTheDocument();
    });
  });
  
  it('should handle API failures gracefully', async () => {
    mockAPI('/api/metrics', { error: 'Failed to load' }, 500);
    
    const { getByText } = render(<DashboardPage />);
    
    await waitFor(() => {
      expect(getByText(/error loading metrics/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

**Test File**: `e2e/dashboard-metrics.spec.ts`

```typescript
test.describe('Dashboard Metrics', () => {
  test('complete dashboard workflow', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'rm@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Dashboard loads
    await page.waitForURL('/dashboard');
    await expect(page.locator('[data-testid="metrics-grid"]')).toBeVisible();
    
    // All metric cards visible
    await expect(page.locator('[data-testid="metric-leads"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-signals"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-followups"]')).toBeVisible();
    
    // Chart visible
    await expect(page.locator('[data-testid="engagement-chart"]')).toBeVisible();
    
    // Click on metric card
    await page.click('[data-testid="metric-followups"]');
    await expect(page).toHaveURL(/\/follow-ups/);
  });
  
  test('realtime metric updates', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Note initial signal count
    const initialCount = await page
      .locator('[data-testid="metric-signals"] [data-testid="metric-value"]')
      .textContent();
    
    // Trigger signal creation in another tab/process
    // (This would be set up in test fixtures)
    await triggerSignalCreation();
    
    // Wait for realtime update
    await page.waitForTimeout(5000);
    
    // Count should increase
    const updatedCount = await page
      .locator('[data-testid="metric-signals"] [data-testid="metric-value"]')
      .textContent();
    
    expect(Number(updatedCount)).toBeGreaterThan(Number(initialCount));
  });
  
  test('date range filter affects trends', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Select different date range
    await page.click('[data-testid="date-range-selector"]');
    await page.click('[data-testid="date-range-7days"]');
    
    // Wait for chart to update
    await page.waitForTimeout(1000);
    
    // Chart should show 7 data points
    const dataPoints = await page.locator('[data-testid="chart-data-point"]').count();
    expect(dataPoints).toBe(7);
  });
});
```

**How to Run Tests**:

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test
```

---

## Performance Considerations

### Bundle Optimization

- **Code splitting**: Lazy load chart library

  ```typescript
  const EngagementTrendChart = lazy(() => 
    import('@/components/features/dashboard/EngagementTrendChart')
  );
  ```

- **Tree shaking**: Import only used chart components
- **Compression**: Use lightweight chart library (Tremor < Recharts)

### Runtime Performance

- **Memoization**: Cache expensive calculations

  ```typescript
  const metrics = useMemo(() => 
    calculatePercentChanges(rawMetrics), 
    [rawMetrics]
  );
  ```

- **Debouncing**: Prevent excessive realtime updates
- **Virtual scrolling**: For activity feed (if >100 items)

### Caching Strategy

- **SWR**: Stale-while-revalidate for metrics (1 min stale time)
- **Query caching**: React Query for trends (5 min cache)
- **Realtime optimization**: Debounce updates to max 1/10sec

---

## Deployment Plan

### Development Phase

1. **Feature branch**: `feature/07-lead-tracking-dashboard`
2. **Environment**: Development with test data
3. **Testing**: All unit/integration tests pass
4. **Code review**: PR with detailed description

### Staging Phase

1. **Deploy to staging**: Merge to `develop` branch
2. **UAT**: 3-5 RMs test dashboard with real data
3. **Performance test**:
   - Dashboard load time <1s
   - Metrics calculation <500ms
   - Realtime updates working
4. **Data validation**: Verify metric accuracy

### Production Phase

1. **Deploy to production**: Merge to `main`
2. **Monitor metrics**:
   - Dashboard load times
   - API response times
   - Realtime connection stability
3. **Gradual rollout**: All RMs immediately (core feature)
4. **Rollback plan**: Revert to previous dashboard version

---

## Monitoring & Analytics

### Performance Metrics

- **Dashboard Load Time**: p50, p95, p99
- **Metrics API Response Time**: Average, max
- **Chart Render Time**: Time to interactive
- **Realtime Latency**: Time from DB change to UI update

### Business Metrics

- **Dashboard Views Per RM**: Daily average
- **Metric Card Clicks**: Which metrics are most viewed
- **Date Range Usage**: Most popular time ranges
- **Follow-up Completion Rate**: % of overdue follow-ups

### Technical Metrics

- **API Error Rate**: Failed metric requests / total
- **Realtime Connection Uptime**: % time connected
- **Cache Hit Rate**: Cached vs fresh requests
- **Database Query Performance**: Slow query alerts

**Monitoring Tools**:

- Vercel Analytics (frontend performance)
- Supabase Dashboard (database metrics, realtime)
- Sentry (error tracking)

---

## Documentation Requirements

### Technical Documentation

- **Metrics Calculation Guide**: How each metric is computed
- **Database Queries**: SQL queries used for aggregations
- **Realtime Setup**: How to configure subscriptions
- **Troubleshooting**: Common issues and fixes

### User Documentation

- **Dashboard Overview**: "Understanding Your Metrics"
- **Metric Definitions**: What each number means
- **Trend Interpretation**: How to read the charts
- **FAQ**: Common questions about accuracy, updates

---

## Post-Launch Review

### Success Criteria

- ✅ Dashboard loads in <1 second for 95% of requests
- ✅ Metrics update within 10 seconds of data change
- ✅ 100% of RMs log in daily to check metrics
- ✅ Follow-up completion rate improves by 15%
- ✅ User satisfaction score >4.2/5.0

### Retrospective Items

- **Lessons Learned**: Realtime setup challenges, metric accuracy validation
- **Process Improvements**: Better testing for calculations, faster UAT
- **Technical Debt**:
  - Refactor metrics calculation for better performance
  - Add more granular caching

### Future Enhancements

- **Customizable Metrics**: Allow RMs to choose which metrics to display
- **Goal Setting**: Set targets and track progress
- **Comparative Analytics**: Compare performance to team average
- **Export Dashboard**: Download metrics as PDF/Excel
- **Predictive Insights**: AI forecasts for conversions

---

## Appendix

### Metric Definitions

**Total Leads**:

- All clients assigned to the RM
- Includes: New, Contacted, Engaged, Qualified, Converted, Inactive
- Excludes: Deleted clients

**Liquidity Events (Signals)**:

- All signals detected for RM's clients
- Types: IPO, M&A, Funding, Promoter Activity, etc.
- Timeframes: Today, This Week, Total

**Follow-ups**:

- Tasks created to follow up with clients
- Status: Pending, Completed, Overdue
- Completion Rate = Completed / Total

**Conversions**:

- Clients moved to "Converted" status
- Conversion Rate = Conversions / Total Leads

**Activities**:

- All RM actions tracked in system
- Types: Signal viewed, Client contacted, Follow-up created, etc.

---

## Sign-off

**Created by**: AI Implementation Planner
**Date**: 2025-12-19
**Version**: 1.0
**Status**: Ready for Review

**Approval Required From**:

- [ ] Product Manager (business requirements)
- [ ] Tech Lead (architecture review)
- [ ] RM Representatives (user acceptance)

---
