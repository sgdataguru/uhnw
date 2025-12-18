# 05 - View Prospect Detail Panel - Implementation Plan

## Project Context
**Technical Stack**: Next.js 15 (App Router), React 18, TypeScript, TailwindCSS, Radix UI
**Backend**: Supabase (PostgreSQL), Neo4j (Relationship Graph)
**Infrastructure**: Vercel (Frontend), Supabase Cloud (Backend)

## User Story

As a **Relationship Manager**, I want to **view a detail panel showing key metrics, alerts, and relevance explanations for a prospect**, so that **I can understand the full context before engaging with the client**.

## Pre-conditions

- Dashboard displays list of prospects
- ProspectCard component is implemented
- Type definitions for Prospect, Signal, and related entities exist
- Authentication and authorization are functional
- Data fetching utilities are available

## Business Requirements

- **Contextual Intelligence**: Display all relevant prospect information in one scannable view, reducing time spent gathering context by 70%
- **Actionable Insights**: Present signal breakdowns and lead score explanations that guide engagement strategy
- **Efficient Workflow**: Enable quick prospect review and action-taking without navigating away from main dashboard
- **Success Metrics**: 
  - Time to review prospect context < 30 seconds
  - Panel usage in 80%+ of prospect engagements
  - RM satisfaction score > 4.5/5 on panel usability

## Technical Specifications

### Integration Points
- **Authentication**: Supabase Auth (Row-level security for prospect data)
- **Data Source**: Supabase PostgreSQL (Prospect, signals, metrics)
- **Graph Database**: Neo4j (Relationship connections, warm intro paths)
- **Real-time Updates**: Supabase Realtime (New signals, score changes)
- **Analytics**: Track panel opens, time spent, actions taken

### Security Requirements
- Row-level security on prospect data (RMs see only assigned prospects)
- Audit logging for prospect detail views
- Secure handling of sensitive client information (PII)
- RBAC for admin-level metrics vs. RM-level metrics

### Data Requirements
- Prospect profile data (name, title, company, contact info)
- Lead score with breakdown (points per factor)
- Active signals (unactioned + recent actioned)
- Key metrics (AUM, wallet share, relationship strength)
- Last interaction history (contacts, meetings, notes)
- Related entities (connections, company info, network)

## Design Specifications

### Visual Layout & Components

**Main Layout Structure**:
```
[Dashboard View]
├── [Left: Prospect List - 60% width]
└── [Right: Detail Panel - 40% width] ← NEW COMPONENT
    ├── [Header with Close Button]
    ├── [Prospect Profile Section]
    ├── [Lead Score & Breakdown]
    ├── [Active Signals Section]
    ├── [Key Metrics Grid]
    ├── [Relationship Context]
    └── [Action Buttons Footer]
```

**Component Hierarchy**:
```tsx
<DashboardLayout>
  <ProspectList>
    {prospects.map(p => <ProspectCard onClick={openPanel} />)}
  </ProspectList>
  
  {selectedProspect && (
    <ProspectDetailPanel 
      prospect={selectedProspect}
      onClose={closePanel}
    />
  )}
</DashboardLayout>
```

### Design System Compliance

**Color Palette**:
```css
/* Premium Wealth Management Aesthetic */
--panel-bg: #FFFFFF;              /* Clean white surface */
--panel-header: #0A1628;          /* Deep navy header */
--section-border: #E5E4E2;        /* Platinum dividers */
--text-primary: #1A1A2E;          /* Near black */
--text-secondary: #5A6C7D;        /* Muted blue-gray */
--accent-gold: #C9A227;           /* Gold highlights */
--critical-signal: #DC3545;       /* Red for critical */
--high-signal: #FFC107;           /* Amber for high */
--medium-signal: #17A2B8;         /* Teal for medium */
--low-signal: #28A745;            /* Green for low */
```

**Typography Scale**:
```css
/* Panel-specific typography */
--panel-title: 1.5rem;            /* 24px - Panel header */
--section-title: 1.125rem;        /* 18px - Section headers */
--metric-value: 1.875rem;         /* 30px - Large numbers */
--metric-label: 0.875rem;         /* 14px - Metric labels */
--body-text: 1rem;                /* 16px - Standard text */
--caption: 0.75rem;               /* 12px - Timestamps, hints */
```

**Spacing System**:
```css
/* Panel spacing */
--panel-padding: 2rem;            /* 32px - Overall padding */
--section-gap: 1.5rem;            /* 24px - Between sections */
--item-gap: 0.75rem;              /* 12px - Between items */
--tight-gap: 0.5rem;              /* 8px - Compact spacing */
```

### Responsive Behavior

**Breakpoints**:
```css
/* Panel responsive behavior */
/* Desktop (1280px+) */
.detail-panel-desktop {
  @apply fixed right-0 top-0 h-screen w-[480px] shadow-2xl;
}

/* Tablet (768px - 1279px) */
.detail-panel-tablet {
  @apply fixed right-0 top-0 h-screen w-[420px] shadow-xl;
}

/* Mobile (< 768px) */
.detail-panel-mobile {
  @apply fixed inset-0 w-full h-full z-50;
  /* Full-screen overlay on mobile */
}
```

**Layout Adaptations**:
- **Desktop**: Side panel (480px width), overlays prospect list
- **Tablet**: Narrower panel (420px width), still overlays
- **Mobile**: Full-screen modal, replaces dashboard view
- All: Smooth slide-in animation from right
- All: Backdrop overlay with dismiss-on-click

### Interaction Patterns

**Panel States**:
```typescript
interface PanelStates {
  closed: 'translate-x-full opacity-0';          // Hidden off-screen
  opening: 'translate-x-full opacity-0';         // Animation start
  open: 'translate-x-0 opacity-100';             // Fully visible
  closing: 'translate-x-full opacity-0';         // Animation out
}
```

**Animation Timing**:
```css
/* Smooth slide-in/out */
.panel-transition {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Interaction Rules**:
- Click ProspectCard → Panel slides in from right
- Click backdrop overlay → Panel closes
- Click X button in header → Panel closes
- ESC key → Panel closes
- Scroll within panel → Independent scrolling
- Click another prospect → Panel updates with smooth transition

## Technical Architecture

### Component Structure
```
app/
├── components/
│   └── features/
│       ├── ProspectDetailPanel.tsx          # Main panel component
│       ├── ProspectDetailPanel/
│       │   ├── index.ts
│       │   ├── ProspectProfile.tsx          # Profile section
│       │   ├── LeadScoreBreakdown.tsx       # Score explanation
│       │   ├── SignalsSection.tsx           # Active signals
│       │   ├── MetricsGrid.tsx              # Key metrics display
│       │   ├── RelationshipContext.tsx      # Network connections
│       │   ├── ActionButtonsFooter.tsx      # CTA buttons
│       │   └── hooks/
│       │       ├── useProspectDetail.ts     # Data fetching
│       │       ├── usePanelState.ts         # Open/close state
│       │       └── useProspectActions.ts    # Action handlers
│       └── index.ts
├── lib/
│   └── api/
│       └── prospects-detail-api.ts          # API service
└── types/
    └── prospect-detail-types.ts             # Type definitions
```

### State Management Architecture

**Global Panel State**:
```typescript
// Zustand store for panel state
interface PanelStore {
  selectedProspectId: string | null;
  isPanelOpen: boolean;
  isLoading: boolean;
  
  openPanel: (prospectId: string) => void;
  closePanel: () => void;
  setLoading: (loading: boolean) => void;
}
```

**Local Component State**:
```typescript
interface ProspectDetailState {
  // Data States
  prospect: Prospect | null;
  extendedMetrics: ExtendedMetrics | null;
  relatedConnections: Connection[];
  recentActivity: ActivityItem[];
  
  // UI States
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  
  // Section States
  expandedSections: {
    scoreBreakdown: boolean;
    signals: boolean;
    relationships: boolean;
  };
}

// State Actions
interface ProspectDetailActions {
  // Data Actions
  loadProspectDetail: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // UI Actions
  toggleSection: (section: keyof ExpandedSections) => void;
  
  // Action Handlers
  handleCall: () => void;
  handleEmail: () => void;
  handleAddNote: (note: string) => Promise<void>;
  handleScheduleFollowUp: (date: Date) => Promise<void>;
}
```

### API Integration Schema

**Request/Response Types**:
```typescript
// API Endpoints
interface ProspectDetailAPI {
  GET: {
    '/api/prospects/{id}/detail': { 
      response: ProspectDetailResponse 
    };
    '/api/prospects/{id}/metrics': { 
      response: ExtendedMetrics 
    };
    '/api/prospects/{id}/connections': { 
      response: Connection[] 
    };
    '/api/prospects/{id}/activity': { 
      response: ActivityItem[] 
    };
  };
  POST: {
    '/api/prospects/{id}/actions': { 
      body: ProspectActionDto; 
      response: ActionResponse 
    };
  };
}

// Data Transfer Objects
interface ProspectDetailResponse {
  prospect: Prospect;
  extendedMetrics: ExtendedMetrics;
  recentActivity: ActivityItem[];
  relatedConnections: Connection[];
}

interface ExtendedMetrics {
  aum: number;                    // Assets under management
  aumCurrency: string;            // INR
  walletShare: number;            // % of total wealth
  relationshipStrength: number;   // 0-100 score
  lifetimeValue: number;          // Revenue generated
  lastInteractionDays: number;    // Days since last contact
  upcomingFollowUps: number;      // Scheduled actions
}

interface Connection {
  id: string;
  name: string;
  relationship: string;           // 'board-member', 'investor', etc.
  strength: number;               // Connection strength score
  canIntroduce: boolean;          // Warm intro available
}

interface ProspectActionDto {
  action: 'call' | 'email' | 'note' | 'schedule';
  payload: {
    note?: string;
    scheduledDate?: Date;
    followUpType?: string;
  };
}
```

### Real-time Updates

```typescript
// Supabase real-time subscription
useEffect(() => {
  if (!selectedProspectId) return;
  
  const channel = supabase
    .channel(`prospect:${selectedProspectId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'prospects',
        filter: `id=eq.${selectedProspectId}`,
      },
      (payload) => {
        refreshProspectData();
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [selectedProspectId]);
```

## Implementation Requirements

### Core Components

**1. ProspectDetailPanel.tsx** - Main container with slide-in animation
- Manages open/close state
- Handles backdrop overlay
- Coordinates child component rendering
- Implements keyboard navigation (ESC to close)

**2. ProspectProfile.tsx** - Top section with client identity
- Avatar with initials
- Name, title, company
- Contact information (phone, email with click-to-action)
- Location and sector tags
- Last contacted timestamp

**3. LeadScoreBreakdown.tsx** - Score visualization with explanation
- Large lead score badge
- Expandable breakdown list
- Progress bars for each factor
- Tooltips with detailed descriptions
- Total points calculation display

**4. SignalsSection.tsx** - Active signals display
- Critical signals at top (severity-sorted)
- Signal badges with icons
- Source attribution
- Time since detection
- Action status indicators
- Quick action buttons (Mark as Actioned)

**5. MetricsGrid.tsx** - Key financial and relationship metrics
- 2x3 grid layout (desktop), 1x6 (mobile)
- Large metric values with labels
- Trend indicators (up/down arrows)
- Currency formatting for financial metrics
- Hover tooltips for definitions

**6. RelationshipContext.tsx** - Network connections
- List of key connections
- Relationship types
- Warm intro availability indicators
- Connection strength visualization
- Click to view in relationship graph

**7. ActionButtonsFooter.tsx** - Sticky footer with CTAs
- Primary: "Schedule Call" button
- Secondary: "Send Email" button
- Tertiary: "Add Note" button
- All actions with proper icon + label

### Custom Hooks

**useProspectDetail(prospectId: string)**
```typescript
export function useProspectDetail(prospectId: string) {
  const [state, setState] = useState<ProspectDetailState>({
    prospect: null,
    extendedMetrics: null,
    relatedConnections: [],
    recentActivity: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
    expandedSections: {
      scoreBreakdown: true,
      signals: true,
      relationships: false,
    },
  });
  
  useEffect(() => {
    loadProspectDetail();
  }, [prospectId]);
  
  const loadProspectDetail = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Parallel data fetching
      const [detail, metrics, connections, activity] = await Promise.all([
        fetchProspectDetail(prospectId),
        fetchExtendedMetrics(prospectId),
        fetchConnections(prospectId),
        fetchRecentActivity(prospectId),
      ]);
      
      setState({
        prospect: detail,
        extendedMetrics: metrics,
        relatedConnections: connections,
        recentActivity: activity,
        isLoading: false,
        isRefreshing: false,
        error: null,
        expandedSections: state.expandedSections,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  };
  
  return {
    ...state,
    refreshData: loadProspectDetail,
  };
}
```

**usePanelState()**
```typescript
export function usePanelState() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  
  const openPanel = useCallback((prospectId: string) => {
    setSelectedProspectId(prospectId);
    setIsOpen(true);
  }, []);
  
  const closePanel = useCallback(() => {
    setIsOpen(false);
    // Delay clearing prospect to allow exit animation
    setTimeout(() => setSelectedProspectId(null), 300);
  }, []);
  
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closePanel]);
  
  return {
    isOpen,
    selectedProspectId,
    openPanel,
    closePanel,
  };
}
```

**useProspectActions(prospectId: string)**
```typescript
export function useProspectActions(prospectId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCall = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await logAction({
        prospectId,
        action: 'call',
        timestamp: new Date(),
      });
      
      // Open phone dialer on mobile, log on desktop
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        window.location.href = `tel:${prospect.phone}`;
      }
    } catch (error) {
      console.error('Failed to log call:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [prospectId]);
  
  const handleEmail = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await logAction({
        prospectId,
        action: 'email',
        timestamp: new Date(),
      });
      
      // Open email client
      window.location.href = `mailto:${prospect.email}`;
    } catch (error) {
      console.error('Failed to log email:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [prospectId]);
  
  const handleAddNote = useCallback(async (note: string) => {
    try {
      setIsSubmitting(true);
      await createNote({
        prospectId,
        content: note,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [prospectId]);
  
  return {
    handleCall,
    handleEmail,
    handleAddNote,
    isSubmitting,
  };
}
```

### Utility Functions

**formatters.ts** - Data formatting utilities
```typescript
export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
};
```

**validators.ts** - Validation functions
```typescript
export const validateProspectId = (id: string): boolean => {
  return /^[a-zA-Z0-9-_]{8,}$/.test(id);
};

export const validateNote = (note: string): boolean => {
  return note.trim().length > 0 && note.length <= 1000;
};
```

**api-handlers.ts** - API call abstractions
```typescript
export async function fetchProspectDetail(
  prospectId: string
): Promise<ProspectDetailResponse> {
  const response = await fetch(`/api/prospects/${prospectId}/detail`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch prospect detail: ${response.statusText}`);
  }
  
  return response.json();
}

export async function logAction(action: ProspectActionDto): Promise<void> {
  const response = await fetch('/api/prospects/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to log action: ${response.statusText}`);
  }
}
```

## Acceptance Criteria

### Functional Requirements

**1. Panel Display & Navigation**
- [ ] Right-side panel appears when prospect card is clicked
- [ ] Panel slides in smoothly from right (300ms animation)
- [ ] Backdrop overlay appears behind panel (semi-transparent)
- [ ] Click backdrop to close panel
- [ ] Click X button in header to close panel
- [ ] Press ESC key to close panel
- [ ] Panel scrolls independently from main dashboard
- [ ] Clicking another prospect updates panel content smoothly

**2. Data Display**
- [ ] Prospect profile section shows all identity information
- [ ] Lead score displays with visual badge
- [ ] Score breakdown expands to show all contributing factors
- [ ] Each factor shows points, label, and description
- [ ] Active signals display in severity-sorted order
- [ ] Critical signals appear at top with red styling
- [ ] Key metrics grid shows 6 financial/relationship metrics
- [ ] All currency values formatted correctly (₹X.XCr)
- [ ] Percentages formatted with 1 decimal place
- [ ] Timestamps show relative time ("2 days ago")

**3. Alerts & Signals**
- [ ] Critical signals prominently highlighted (red badge)
- [ ] High signals shown with amber badge
- [ ] Medium signals shown with teal badge
- [ ] Low signals shown with green badge
- [ ] Source attribution displayed for each signal
- [ ] Signal age displayed ("Detected 3 days ago")
- [ ] Actioned signals show checkmark indicator
- [ ] Unactioned signals have "Mark as Actioned" button

**4. Relevance Explanation**
- [ ] Score breakdown clearly explains why prospect is relevant
- [ ] Each factor has descriptive label and points
- [ ] Tooltips provide additional context on hover
- [ ] Total score calculation visible
- [ ] Score category badge matches color scheme

**5. Panel Controls**
- [ ] Panel can be collapsed (minimize to tab on right edge)
- [ ] Panel can be dismissed (fully closes)
- [ ] Collapsed panel shows prospect initials + score
- [ ] Click collapsed tab to re-expand panel
- [ ] Panel state persists during dashboard navigation

**6. Information Presentation**
- [ ] Information organized in logical sections
- [ ] Clear visual hierarchy with section headers
- [ ] Adequate spacing between sections
- [ ] Scannable format with key info first
- [ ] Progressive disclosure (expandable sections)
- [ ] No horizontal scrolling required

### Non-Functional Requirements

**Performance**
- [ ] Panel opens in < 200ms from click
- [ ] Data loads in < 1 second
- [ ] Smooth 60fps animations
- [ ] No layout shift during data loading
- [ ] Optimistic UI updates for actions
- [ ] Lazy loading for related connections (below fold)

**Accessibility**
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation fully supported
- [ ] Tab order logical (top to bottom)
- [ ] Focus trap when panel is open
- [ ] Screen reader announcements for panel open/close
- [ ] ARIA labels on all interactive elements
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] Focus indicators visible on all buttons

**Responsive Design**
- [ ] Desktop (1280px+): 480px wide side panel
- [ ] Tablet (768-1279px): 420px wide side panel
- [ ] Mobile (<768px): Full-screen modal
- [ ] Touch-friendly tap targets (44x44px minimum)
- [ ] Swipe-to-close gesture on mobile
- [ ] All content readable without zooming

**Security**
- [ ] Row-level security enforced (only assigned prospects)
- [ ] Sensitive data not exposed in client-side logs
- [ ] Action logging includes user ID and timestamp
- [ ] XSS protection on user-generated content
- [ ] CSRF tokens on all POST requests

## Modified Files

```
app/
├── components/
│   ├── features/
│   │   ├── ProspectDetailPanel.tsx                      ⬜ NEW
│   │   ├── ProspectDetailPanel/
│   │   │   ├── index.ts                                 ⬜ NEW
│   │   │   ├── ProspectProfile.tsx                      ⬜ NEW
│   │   │   ├── LeadScoreBreakdown.tsx                   ⬜ NEW
│   │   │   ├── SignalsSection.tsx                       ⬜ NEW
│   │   │   ├── MetricsGrid.tsx                          ⬜ NEW
│   │   │   ├── RelationshipContext.tsx                  ⬜ NEW
│   │   │   ├── ActionButtonsFooter.tsx                  ⬜ NEW
│   │   │   └── hooks/
│   │   │       ├── useProspectDetail.ts                 ⬜ NEW
│   │   │       ├── usePanelState.ts                     ⬜ NEW
│   │   │       └── useProspectActions.ts                ⬜ NEW
│   │   ├── ProspectCard.tsx                             🔵 MODIFIED (add onClick handler)
│   │   └── index.ts                                     🔵 MODIFIED (export ProspectDetailPanel)
│   └── ui/
│       ├── Badge.tsx                                    ⬜ NEW (for tags/labels)
│       └── Tooltip.tsx                                  ⬜ NEW (for hover explanations)
├── page.tsx                                             🔵 MODIFIED (integrate panel)
├── lib/
│   ├── api/
│   │   ├── prospects-api.ts                             🔵 MODIFIED (add detail endpoint)
│   │   └── actions-api.ts                               ⬜ NEW (action logging)
│   ├── utils/
│   │   ├── formatters.ts                                🔵 MODIFIED (add formatCurrency, etc.)
│   │   └── validators.ts                                ⬜ NEW
│   └── hooks/
│       └── useRealtime.ts                               ⬜ NEW (Supabase real-time)
├── types/
│   └── index.ts                                         🔵 MODIFIED (add detail types)
└── store/
    └── panel-store.ts                                   ⬜ NEW (global panel state)
```

## Implementation Status

**OVERALL STATUS: ⬜ NOT STARTED**

### Phase 1: Foundation & Setup ⬜
- [ ] Create ProspectDetailPanel component structure
- [ ] Set up TypeScript types for extended data
- [ ] Implement usePanelState hook
- [ ] Create panel-store.ts for global state
- [ ] Set up API endpoints (/api/prospects/[id]/detail)
- [ ] Implement base styling with animations

### Phase 2: Core Panel Components ⬜
- [ ] Implement ProspectProfile component
- [ ] Build LeadScoreBreakdown with expandable list
- [ ] Create SignalsSection with severity sorting
- [ ] Develop MetricsGrid with 2x3 layout
- [ ] Implement RelationshipContext component
- [ ] Build ActionButtonsFooter with CTAs

### Phase 3: Data Integration ⬜
- [ ] Implement useProspectDetail hook
- [ ] Set up parallel data fetching
- [ ] Add loading states for each section
- [ ] Implement error handling and retry logic
- [ ] Set up Supabase real-time subscriptions
- [ ] Add optimistic UI updates

### Phase 4: Actions & Interactivity ⬜
- [ ] Implement useProspectActions hook
- [ ] Connect call/email action handlers
- [ ] Build note-taking interface
- [ ] Implement schedule follow-up modal
- [ ] Add action logging to database
- [ ] Set up success/error notifications

### Phase 5: Responsive & Accessibility ⬜
- [ ] Implement responsive breakpoints
- [ ] Add mobile full-screen variant
- [ ] Implement swipe-to-close on mobile
- [ ] Add keyboard navigation (Tab, ESC)
- [ ] Implement focus trap
- [ ] Add ARIA labels and screen reader support
- [ ] Test with keyboard-only navigation

### Phase 6: Polish & Testing ⬜
- [ ] Refine animations and transitions
- [ ] Optimize performance (lazy loading, memoization)
- [ ] Write unit tests for hooks
- [ ] Write integration tests for panel flow
- [ ] Add E2E tests for user workflows
- [ ] Conduct accessibility audit
- [ ] User acceptance testing with RMs

## Dependencies

### Internal Dependencies
- ✅ Prospect type definitions (types/index.ts)
- ✅ ProspectCard component (for click handler)
- ✅ Authentication service (Supabase Auth)
- ✅ Base UI components (Card, Button, Avatar)
- ⬜ API service layer (needs detail endpoint)
- ⬜ Badge component (for tags)
- ⬜ Tooltip component (for explanations)

### External Dependencies
- ✅ Next.js 15 (App Router, Server Components)
- ✅ React 18 (Client Components, hooks)
- ✅ TypeScript 5.x
- ✅ Tailwind CSS
- ⬜ Radix UI (Dialog primitive for panel base)
- ⬜ Framer Motion (for smooth animations) - OPTIONAL
- ⬜ Zustand (global state management)
- ✅ Supabase (database, real-time, auth)

## Risk Assessment

### Technical Risks

**1. Real-time Update Complexity**
- **Impact**: High
- **Likelihood**: Medium
- **Mitigation**: Use Supabase Realtime with fallback to polling
- **Contingency**: Disable real-time for MVP, add manual refresh button

**2. Panel Performance with Large Datasets**
- **Impact**: Medium
- **Likelihood**: Medium
- **Mitigation**: Implement virtualization for long lists, lazy loading
- **Contingency**: Pagination or "View More" buttons for extensive data

**3. Mobile Panel UX**
- **Impact**: Medium
- **Likelihood**: Low
- **Mitigation**: Full-screen modal on mobile, swipe gestures
- **Contingency**: Separate mobile detail page if modal is problematic

**4. Animation Performance**
- **Impact**: Low
- **Likelihood**: Low
- **Mitigation**: Use CSS transforms, avoid layout thrashing
- **Contingency**: Reduce animations, use prefers-reduced-motion

### Business Risks

**1. RM Adoption**
- **Impact**: High
- **Likelihood**: Low
- **Mitigation**: User testing, iterate on feedback
- **Contingency**: Training videos, tooltips, onboarding tour

**2. Data Privacy Concerns**
- **Impact**: High
- **Likelihood**: Low
- **Mitigation**: Row-level security, audit logging
- **Contingency**: Additional compliance review, restricted data fields

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
// useProspectDetail.test.ts
describe('useProspectDetail', () => {
  it('should fetch prospect detail on mount', async () => {
    const { result } = renderHook(() => useProspectDetail('prospect-123'));
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.prospect).toBeTruthy();
    });
  });
  
  it('should handle fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useProspectDetail('invalid-id'));
    
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.prospect).toBeNull();
    });
  });
});

// usePanelState.test.ts
describe('usePanelState', () => {
  it('should open panel with prospect ID', () => {
    const { result } = renderHook(() => usePanelState());
    
    act(() => {
      result.current.openPanel('prospect-123');
    });
    
    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedProspectId).toBe('prospect-123');
  });
  
  it('should close panel on ESC key', () => {
    const { result } = renderHook(() => usePanelState());
    
    act(() => {
      result.current.openPanel('prospect-123');
    });
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(result.current.isOpen).toBe(false);
  });
});

// ProspectDetailPanel.test.tsx
describe('ProspectDetailPanel', () => {
  it('should render all sections when data is loaded', () => {
    render(
      <ProspectDetailPanel
        prospectId="prospect-123"
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    
    expect(screen.getByText(/lead score/i)).toBeInTheDocument();
    expect(screen.getByText(/signals/i)).toBeInTheDocument();
    expect(screen.getByText(/key metrics/i)).toBeInTheDocument();
  });
  
  it('should call onClose when backdrop is clicked', () => {
    const handleClose = jest.fn();
    render(
      <ProspectDetailPanel
        prospectId="prospect-123"
        isOpen={true}
        onClose={handleClose}
      />
    );
    
    fireEvent.click(screen.getByTestId('panel-backdrop'));
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

```typescript
// ProspectDetailPanel.integration.test.tsx
describe('ProspectDetailPanel Integration', () => {
  it('should complete full prospect review workflow', async () => {
    // Render dashboard with prospect list
    render(<DashboardPage />);
    
    // Click on a prospect card
    const prospectCard = screen.getByText('Rajesh Kumar');
    fireEvent.click(prospectCard);
    
    // Wait for panel to appear
    await waitFor(() => {
      expect(screen.getByTestId('prospect-detail-panel')).toBeVisible();
    });
    
    // Verify all sections loaded
    expect(screen.getByText(/lead score: 92/i)).toBeInTheDocument();
    expect(screen.getByText(/ipo filing/i)).toBeInTheDocument();
    
    // Expand score breakdown
    fireEvent.click(screen.getByText(/view breakdown/i));
    expect(screen.getByText(/40 points/i)).toBeInTheDocument();
    
    // Click email action
    fireEvent.click(screen.getByText(/send email/i));
    
    // Verify action logged
    await waitFor(() => {
      expect(mockLogAction).toHaveBeenCalledWith({
        prospectId: 'prospect-123',
        action: 'email',
        timestamp: expect.any(Date),
      });
    });
  });
  
  it('should handle panel closure correctly', async () => {
    render(<DashboardPage />);
    
    // Open panel
    fireEvent.click(screen.getByText('Rajesh Kumar'));
    await waitFor(() => {
      expect(screen.getByTestId('prospect-detail-panel')).toBeVisible();
    });
    
    // Close via X button
    fireEvent.click(screen.getByLabelText('Close panel'));
    
    // Verify panel closed
    await waitFor(() => {
      expect(screen.queryByTestId('prospect-detail-panel')).not.toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// prospect-detail-panel.spec.ts
test.describe('Prospect Detail Panel', () => {
  test('RM can open panel and review prospect details', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
    
    // Wait for prospects to load
    await page.waitForSelector('[data-testid="prospect-card"]');
    
    // Click first prospect card
    await page.click('[data-testid="prospect-card"]:first-child');
    
    // Wait for panel animation
    await page.waitForSelector('[data-testid="prospect-detail-panel"]', {
      state: 'visible',
    });
    
    // Verify panel content
    await expect(page.locator('text=Lead Score')).toBeVisible();
    await expect(page.locator('text=Active Signals')).toBeVisible();
    await expect(page.locator('text=Key Metrics')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'panel-open.png' });
    
    // Close panel via ESC
    await page.keyboard.press('Escape');
    
    // Verify panel closed
    await expect(
      page.locator('[data-testid="prospect-detail-panel"]')
    ).not.toBeVisible();
  });
  
  test('RM can perform actions from panel', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="prospect-card"]:first-child');
    await page.waitForSelector('[data-testid="prospect-detail-panel"]');
    
    // Click "Schedule Call" button
    await page.click('button:has-text("Schedule Call")');
    
    // Verify modal appeared
    await expect(page.locator('text=Schedule Follow-up')).toBeVisible();
    
    // Fill form
    await page.fill('[name="followUpDate"]', '2025-12-25');
    await page.click('button:has-text("Save")');
    
    // Verify success notification
    await expect(page.locator('text=Follow-up scheduled')).toBeVisible();
  });
});
```

## Performance Considerations

### Bundle Optimization
- **Code splitting**: Lazy load panel component (only when first opened)
- **Tree shaking**: Import only used Radix UI primitives
- **Dynamic imports**: Load Framer Motion only if animations enabled

```typescript
// Lazy load panel
const ProspectDetailPanel = dynamic(
  () => import('@/components/features/ProspectDetailPanel'),
  {
    loading: () => <PanelSkeleton />,
    ssr: false, // Client-side only
  }
);
```

### Runtime Performance
- **Memoization**: Use React.memo for expensive child components
- **Virtual scrolling**: For long signal/connection lists (use react-window)
- **Debounced updates**: Throttle real-time subscription updates (max 1/sec)
- **Intersection Observer**: Lazy load "below-fold" sections

```typescript
// Memoized child component
const MetricsGrid = memo(function MetricsGrid({ metrics }: Props) {
  return <div>{/* metrics display */}</div>;
});

// Debounced real-time updates
const debouncedRefresh = useMemo(
  () => debounce(refreshProspectData, 1000),
  [refreshProspectData]
);
```

### Caching Strategy
- **React Query**: Cache API responses, stale-while-revalidate
- **Local Storage**: Persist panel state (collapsed/expanded sections)
- **Service Worker**: Cache static assets

```typescript
// React Query setup
const { data, isLoading } = useQuery({
  queryKey: ['prospect-detail', prospectId],
  queryFn: () => fetchProspectDetail(prospectId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

## Deployment Plan

### Development Phase
- **Feature flag**: `ENABLE_PROSPECT_DETAIL_PANEL` (default: true in dev)
- **Local testing**: Test with mock data and real Supabase dev instance
- **Code review**: Peer review focusing on accessibility and performance

### Staging Phase
- **User acceptance testing**: 3-5 RMs test with production-like data
- **Performance benchmarking**: Lighthouse scores, Core Web Vitals
- **Accessibility audit**: WAVE tool, screen reader testing
- **Load testing**: Simulate 50 concurrent users opening panels

### Production Phase
- **Canary release**: 10% of RMs (3-4 users) for 48 hours
- **Monitoring**: Track panel open rate, time spent, error rate
- **Gradual rollout**: Expand to 50% after 48 hours, 100% after 1 week
- **Rollback procedure**: Feature flag toggle, database migration rollback

## Monitoring & Analytics

### Performance Metrics
- **Panel open time**: Time from click to fully rendered (target: <200ms)
- **Data load time**: Time to fetch all data (target: <1s)
- **Animation FPS**: Frame rate during transitions (target: 60fps)
- **Error rate**: Failed API calls / total calls (target: <1%)

### Business Metrics
- **Panel adoption**: % of prospects viewed via panel (target: >80%)
- **Engagement depth**: Avg. sections expanded per session (target: >2)
- **Action rate**: % of panel sessions resulting in action (target: >40%)
- **Time to action**: Time from panel open to action taken (target: <60s)

### Technical Metrics
- **API latency**: P50, P95, P99 response times
- **Real-time lag**: Delay in receiving Supabase updates
- **Bundle size impact**: JS bundle size increase (target: <50KB)
- **Memory usage**: Client-side memory consumption

### Analytics Events
```typescript
// Track panel interactions
analytics.track('prospect_panel_opened', {
  prospectId,
  prospectScore: prospect.leadScore,
  signalCount: prospect.signals.length,
  timestamp: new Date(),
});

analytics.track('prospect_action_taken', {
  prospectId,
  action: 'email' | 'call' | 'note' | 'schedule',
  timeToAction: timeInMs,
  timestamp: new Date(),
});

analytics.track('prospect_section_expanded', {
  prospectId,
  section: 'scoreBreakdown' | 'signals' | 'relationships',
  timestamp: new Date(),
});
```

## Documentation Requirements

### Technical Documentation

**Component Documentation** (Storybook):
- ProspectDetailPanel with all states (loading, loaded, error)
- Individual child components (ProspectProfile, MetricsGrid, etc.)
- Interactive examples with controls
- Accessibility features documentation

**API Documentation**:
```typescript
/**
 * Fetch detailed information for a specific prospect
 * 
 * @endpoint GET /api/prospects/{id}/detail
 * @auth Required (Supabase JWT)
 * @rls Enforced (RMs see only assigned prospects)
 * 
 * @param {string} id - Prospect UUID
 * @returns {ProspectDetailResponse} Complete prospect data
 * 
 * @throws {401} Unauthorized - Invalid/missing JWT
 * @throws {403} Forbidden - Prospect not assigned to RM
 * @throws {404} Not Found - Prospect does not exist
 * @throws {500} Internal Server Error
 * 
 * @example
 * const response = await fetch('/api/prospects/abc123/detail', {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 * const data = await response.json();
 */
```

**Hook Documentation**:
```typescript
/**
 * Hook for managing prospect detail panel state
 * 
 * @category Hooks
 * @subcategory Panel Management
 * 
 * @returns {UsePanelStateReturn} Panel state and control functions
 * 
 * @example
 * function DashboardPage() {
 *   const { isOpen, selectedProspectId, openPanel, closePanel } = usePanelState();
 *   
 *   return (
 *     <div>
 *       <ProspectCard onClick={() => openPanel('prospect-123')} />
 *       {isOpen && (
 *         <ProspectDetailPanel 
 *           prospectId={selectedProspectId}
 *           onClose={closePanel}
 *         />
 *       )}
 *     </div>
 *   );
 * }
 */
```

### User Documentation

**Feature Guide** (for RMs):
1. **Opening the Panel**: "Click any prospect card to view detailed information"
2. **Understanding Lead Scores**: "The breakdown shows exactly why this prospect is relevant"
3. **Reviewing Signals**: "Critical signals (red) require immediate attention"
4. **Taking Actions**: "Use the bottom buttons to call, email, or schedule follow-ups"
5. **Closing the Panel**: "Click the X, press ESC, or click outside the panel"

**Video Tutorial** (2-3 minutes):
- Overview of panel layout
- How to interpret lead scores
- Taking actions from the panel
- Keyboard shortcuts

**FAQ**:
- Q: Why can't I see some prospects in the detail panel?
- A: You can only view prospects assigned to you for data privacy.
- Q: How often is the data updated?
- A: Data refreshes in real-time as new signals are detected.

## Post-Launch Review

### Success Criteria
- [ ] Panel adoption rate > 80% within 2 weeks
- [ ] Panel open time < 200ms (P95)
- [ ] Data load time < 1s (P95)
- [ ] Action rate > 40% of panel sessions
- [ ] Zero critical accessibility issues
- [ ] RM satisfaction score > 4.5/5
- [ ] Error rate < 1%

### Metrics Collection Period
- **Week 1**: Daily monitoring, immediate bug fixes
- **Week 2-4**: Weekly reviews, feature refinements
- **Month 2+**: Monthly reviews, long-term improvements

### Retrospective Items
- What went well during implementation?
- What challenges did we face?
- How can we improve the process for future features?
- What technical debt was created?
- What lessons can we apply to Story 06 (AI Chatbot)?

### Future Enhancements (Post-MVP)
- [ ] Collapsed panel mode (minimize to side tab)
- [ ] Panel history (back/forward navigation between prospects)
- [ ] Inline note-taking without modal
- [ ] Quick actions menu (right-click on prospect)
- [ ] Customizable panel sections (RM preferences)
- [ ] Export prospect summary as PDF
- [ ] Compare two prospects side-by-side
- [ ] Panel keyboard shortcuts (J/K navigation)
- [ ] Dark mode support
- [ ] Multi-language support (Hindi, Marathi)

---

## Implementation Checklist

Before starting development:
- [x] Read technical specifications
- [x] Read implementation plans
- [x] Read user story
- [ ] Review existing code patterns
- [ ] Set up development environment
- [ ] Create feature branch
- [ ] Begin Phase 1: Foundation & Setup

---

**Document Version**: 1.0.0  
**Created**: 2025-12-19  
**Last Updated**: 2025-12-19  
**Status**: Ready for Implementation  
**Next Story**: [06 - Query Data with AI Chatbot](./06-query-data-with-ai-chatbot.md)
