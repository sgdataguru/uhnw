# 11 - Add Liquidity Events Manually - Implementation Plan

## Project Context

**Technical Stack**: Next.js 15 (App Router), React 18, TypeScript, TailwindCSS
**Form Management**: React Hook Form + Zod validation
**Backend**: Supabase (PostgreSQL)
**Infrastructure**: Vercel (Frontend), Supabase (Backend)

---

## User Story

**As a** Relationship Manager,
**I want** to manually add liquidity events that I discover through my own channels,
**so that** the system captures intelligence that may not be available from automated data sources.

---

## Pre-conditions

- Supabase database with `signals` table
- User is authenticated as an RM
- RM has assigned clients in the system
- Signal types and categories are defined
- Lead scoring service is operational

---

## Business Requirements

- **Easy Intelligence Entry**: RMs can quickly add events they discover through relationships
  - *Success Metric*: Average time to add event <2 minutes
  
- **Comprehensive Data Capture**: Form captures all essential event details
  - *Success Metric*: 95%+ of manually added events have complete data
  
- **Clear Attribution**: Manual events are clearly marked as RM-contributed
  - *Success Metric*: RMs can distinguish auto vs. manual signals at a glance
  
- **Edit Capability**: RMs can update or remove their own entries
  - *Success Metric*: <5% of manual events require admin intervention to edit
  
- **System Integration**: Manual events trigger same downstream processes as auto-detected signals
  - *Success Metric*: Lead scores update within 5 minutes of manual entry

---

## Technical Specifications

### Integration Points

- **Signals Table**: Store manual events alongside auto-detected signals
- **Lead Scoring Service**: Trigger recalculation when manual event added
- **Activity Tracking**: Log RM's manual intelligence contribution
- **Suggestions System**: Generate engagement suggestions for manual events

### Security Requirements

- RLS ensures RMs can only edit their own manual entries
- Input validation prevents malicious data entry
- Rate limiting prevents spam (max 10 events per hour)
- Audit log for all manual entries

### Data Flow

```
RM Opens Form → Fill Details → Validation → 
Submit → Create Signal Record → 
Trigger Lead Scoring → Update Client → 
Activity Log → Confirmation
```

---

## Design Specifications

### Visual Layout & Components

**Add Intelligence Modal**:

```
┌─────────────────────────────────────────────────────────────┐
│  Add Liquidity Event                               [×] Close │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Client / Prospect *                                          │
│  [Search and select client...            ▼]                  │
│                                                               │
│  Event Type *                                                 │
│  ○ IPO Filing                                                 │
│  ○ Acquisition / M&A                                          │
│  ● Series Funding (A/B/C/D)                                   │
│  ○ Secondary Sale                                             │
│  ○ Promoter Activity                                          │
│  ○ Other                                                      │
│                                                               │
│  Event Details *                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ E-Commerce Solutions is raising Series C funding      │  │
│  │ from Tiger Global. Expected amount ₹350Cr.            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Expected Timeline *                                          │
│  [30-60 days                              ▼]                  │
│                                                               │
│  Estimated Amount (optional)                                  │
│  [₹ 350,00,00,000                        ]                   │
│                                                               │
│  Source of Information *                                      │
│  [Client conversation                     ▼]                  │
│                                                               │
│  Additional Notes (optional)                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Discussed during lunch meeting. Amit mentioned        │  │
│  │ they're in advanced talks and expect term sheet soon. │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Severity / Urgency                                           │
│  ○ Critical  ● High  ○ Medium  ○ Low                          │
│                                                               │
│                      [Cancel]  [Add Event + Score Client]     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Component Hierarchy**:

```tsx
<AddIntelligenceModal>
  <ModalHeader />
  <IntelligenceForm>
    <ClientSelector />
    <EventTypeSelector />
    <EventDetailsTextarea />
    <TimelineDropdown />
    <AmountInput />
    <SourceDropdown />
    <NotesTextarea />
    <SeveritySelector />
    <FormActions>
      <CancelButton />
      <SubmitButton />
    </FormActions>
  </IntelligenceForm>
</AddIntelligenceModal>
```

### Design System Compliance

**Color Palette**:

```css
/* Manual Intelligence Badge */
--manual-badge-bg: #C9A227;        /* Gold */
--manual-badge-text: #FFFFFF;      /* White */

/* Form States */
--form-input-default: #F8F9FA;
--form-input-focus: #FFFFFF;
--form-input-error: #FEF2F2;
--form-border-error: #DC3545;
```

**Typography**:

```css
/* Form Labels */
--form-label-size: 0.875rem;       /* 14px */
--form-label-weight: 600;

/* Input Text */
--form-input-size: 1rem;           /* 16px */
--form-input-weight: 400;
```

### Responsive Behavior

**Desktop (1024px+)**:

- Modal: 600px width centered
- Two-column layout for some fields
- Full form visible

**Tablet (768px - 1023px)**:

- Modal: 90% width
- Single column layout
- Full form visible

**Mobile (<768px)**:

- Full-screen modal
- Single column layout
- Collapsible sections for long form

### Interaction Patterns

**Form Validation States**:

```typescript
interface FormFieldStates {
  default: 'border-gray-300 bg-gray-50';
  focus: 'border-blue-500 ring-2 ring-blue-200 bg-white';
  error: 'border-red-500 bg-red-50';
  success: 'border-green-500 bg-green-50';
  disabled: 'border-gray-200 bg-gray-100 cursor-not-allowed';
}
```

**Submit Behaviors**:

```typescript
interface SubmitBehaviors {
  success: 'Show toast, close modal, refresh signals list, update client lead score';
  error: 'Show error message, keep modal open, highlight invalid fields';
  validation: 'Prevent submit, show validation errors inline';
}
```

---

## Technical Architecture

### Component Structure

```
app/(dashboard)/
├── signals/
│   └── components/
│       └── AddIntelligenceModal.tsx  # Main modal
└── intelligence/
    └── add/
        └── components/
            ├── IntelligenceForm.tsx      # Form component
            ├── ClientSelector.tsx        # Client search/select
            ├── EventTypeSelector.tsx     # Event type radio group
            ├── TimelineDropdown.tsx      # Expected timeline
            ├── AmountInput.tsx           # Currency input
            ├── SourceDropdown.tsx        # Information source
            └── hooks/
                ├── useAddIntelligence.ts    # Form submission
                └── useClientSearch.ts       # Client search

app/api/
└── intelligence/
    ├── route.ts                      # POST create manual event
    └── [id]/
        ├── route.ts                  # GET, PATCH, DELETE
        └── edit/route.ts             # PATCH update event

services/
└── intelligenceService.ts            # Business logic

lib/
└── validators/
    └── intelligence.ts               # Zod schemas

types/
└── intelligence.ts                   # Type definitions
```

### State Management Architecture

**Intelligence Form State**:

```typescript
interface IntelligenceFormState {
  // Form Data
  formData: IntelligenceFormData;
  
  // UI State
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Validation
  validationErrors: Record<string, string>;
  isDirty: boolean;
}

interface IntelligenceFormData {
  clientId: string;
  eventType: SignalType;
  eventDetails: string;
  expectedTimeline: Timeline;
  estimatedAmount?: number;
  informationSource: InformationSource;
  additionalNotes?: string;
  severity: SignalSeverity;
}

type SignalType = 
  | 'ipo_filing'
  | 'acquisition'
  | 'funding_round'
  | 'secondary_sale'
  | 'promoter_activity'
  | 'board_change'
  | 'other';

type Timeline = 
  | '30_days'
  | '30_60_days'
  | '60_90_days'
  | '3_6_months'
  | '6_plus_months';

type InformationSource = 
  | 'client_conversation'
  | 'network_contact'
  | 'industry_event'
  | 'news_mention'
  | 'public_filing'
  | 'other';

type SignalSeverity = 'critical' | 'high' | 'medium' | 'low';
```

**Intelligence Actions**:

```typescript
interface IntelligenceActions {
  // Modal Control
  openModal: () => void;
  closeModal: () => void;
  
  // Form Management
  updateField: <K extends keyof IntelligenceFormData>(
    field: K,
    value: IntelligenceFormData[K]
  ) => void;
  resetForm: () => void;
  
  // Submission
  submitIntelligence: () => Promise<void>;
  
  // Edit
  loadExistingIntelligence: (id: string) => Promise<void>;
  updateIntelligence: (id: string) => Promise<void>;
  deleteIntelligence: (id: string) => Promise<void>;
}
```

### API Integration Schema

**Create Intelligence API** (`/api/intelligence/route.ts`):

```typescript
// POST Request
interface CreateIntelligenceRequest {
  clientId: string;
  eventType: SignalType;
  eventDetails: string;
  expectedTimeline: Timeline;
  estimatedAmount?: number;
  informationSource: InformationSource;
  additionalNotes?: string;
  severity: SignalSeverity;
}

// Response
interface CreateIntelligenceResponse {
  success: boolean;
  data: {
    signal: Signal;
    leadScoreUpdated: boolean;
    newLeadScore: number;
  };
}
```

**Update Intelligence API** (`/api/intelligence/[id]/route.ts`):

```typescript
// PATCH Request
interface UpdateIntelligenceRequest {
  eventDetails?: string;
  expectedTimeline?: Timeline;
  estimatedAmount?: number;
  additionalNotes?: string;
  severity?: SignalSeverity;
}

// DELETE Request
// No body required

// Response
interface IntelligenceActionResponse {
  success: boolean;
  data?: Signal;
  message: string;
}
```

---

## Implementation Requirements

### Core Components

#### 1. `AddIntelligenceModal.tsx` - Main modal wrapper

- Dialog/modal component with backdrop
- Open/close state management
- Trigger button ("+ Add Intelligence")
- Responsive sizing

#### 2. `IntelligenceForm.tsx` - Form with validation

- React Hook Form integration
- Zod schema validation
- Field-level validation
- Submit handling with loading state

#### 3. `ClientSelector.tsx` - Client search and select

- Autocomplete search input
- Search RM's clients by name or company
- Display client with wealth and current lead score
- Validation: Required field

#### 4. `EventTypeSelector.tsx` - Event type radio group

- Radio buttons for common event types
- "Other" option with text input
- Icons/illustrations for each type
- Validation: Required field

#### 5. `AmountInput.tsx` - Currency input field

- Formatted number input (₹ prefix)
- Comma separators for readability
- Accepts Crores/Lakhs notation
- Optional field

### Custom Hooks

#### `useAddIntelligence()` - Form submission logic

```typescript
export function useAddIntelligence() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitIntelligence = async (data: IntelligenceFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add intelligence');
      }
      
      const result = await response.json();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['signals']);
      queryClient.invalidateQueries(['clients', data.clientId]);
      
      // Log activity
      await logActivity({
        type: 'intelligence_added',
        clientId: data.clientId,
        metadata: { signalType: data.eventType }
      });
      
      toast.success('Intelligence added successfully!');
      
      return result.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { submitIntelligence, isSubmitting };
}
```

#### `useClientSearch()` - Client autocomplete

```typescript
export function useClientSearch(searchQuery: string) {
  return useQuery({
    queryKey: ['clients', 'search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      
      const response = await fetch(
        `/api/clients?search=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      return data.data;
    },
    enabled: searchQuery.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
```

### Validation Schema

#### `lib/validators/intelligence.ts` - Zod schema

```typescript
import { z } from 'zod';

export const intelligenceFormSchema = z.object({
  clientId: z.string().uuid('Please select a valid client'),
  
  eventType: z.enum([
    'ipo_filing',
    'acquisition',
    'funding_round',
    'secondary_sale',
    'promoter_activity',
    'board_change',
    'other'
  ], { required_error: 'Please select an event type' }),
  
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
  ], { required_error: 'Please select an expected timeline' }),
  
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
  ], { required_error: 'Please specify information source' }),
  
  additionalNotes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
  
  severity: z.enum(['critical', 'high', 'medium', 'low'], {
    required_error: 'Please select severity level'
  })
});

export type IntelligenceFormInput = z.infer<typeof intelligenceFormSchema>;
```

### Service Functions

#### `services/intelligenceService.ts` - Business logic

```typescript
export async function createManualIntelligence(
  data: IntelligenceFormData,
  rmId: string
): Promise<{ signal: Signal; leadScoreUpdated: boolean; newLeadScore: number }> {
  const supabase = createServerClient();
  
  // Create signal record
  const { data: signal, error } = await supabase
    .from('signals')
    .insert({
      type: data.eventType,
      source: 'rm_input',
      severity: data.severity,
      title: generateSignalTitle(data),
      description: data.eventDetails,
      metadata: {
        estimatedAmount: data.estimatedAmount,
        informationSource: data.informationSource,
        additionalNotes: data.additionalNotes,
        addedByRm: rmId,
        isManual: true
      },
      expected_timeline: data.expectedTimeline,
      detected_at: new Date().toISOString(),
      client_id: data.clientId,
      is_read: false,
      is_actioned: false
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Trigger lead scoring update
  const { newLeadScore, updated } = await updateClientLeadScore(data.clientId);
  
  // Log activity
  await logActivity({
    userId: rmId,
    clientId: data.clientId,
    signalId: signal.id,
    actionType: 'intelligence_added',
    notes: `Added manual intelligence: ${data.eventType}`
  });
  
  return {
    signal,
    leadScoreUpdated: updated,
    newLeadScore
  };
}

function generateSignalTitle(data: IntelligenceFormData): string {
  const client = await getClientById(data.clientId);
  const eventTypeLabels = {
    ipo_filing: 'IPO Filing',
    acquisition: 'Acquisition',
    funding_round: 'Funding Round',
    secondary_sale: 'Secondary Sale',
    promoter_activity: 'Promoter Activity',
    board_change: 'Board Change',
    other: 'Liquidity Event'
  };
  
  return `${client.company} - ${eventTypeLabels[data.eventType]} (RM Intel)`;
}
```

---

## Acceptance Criteria

### Functional Requirements

#### Core Feature Functionality

✅ **AC 1.1**: RM can access "Add Liquidity Event" form

- "+" button or "Add Intelligence" button visible on signals page
- Modal/dialog opens with form
- Form is accessible from multiple entry points (signals page, client detail)

✅ **AC 1.2**: Form allows entry of required fields

- Client/Prospect selection (autocomplete search)
- Event type (radio buttons with common types)
- Expected timeline (dropdown)
- Source of information (dropdown)
- Event details (textarea, minimum 20 characters)

✅ **AC 1.3**: Added events appear alongside auto-detected signals

- Manual events stored in same `signals` table
- Show in signals feed with other signals
- Can be filtered/searched like regular signals

✅ **AC 1.4**: Manually added events clearly marked as RM-contributed

- Badge showing "Manual" or "RM Intel"
- Different icon/color indicator
- Shows which RM added it ("Added by Priya M.")
- Source field shows "rm_input"

✅ **AC 1.5**: Events can be edited or removed by adding RM

- Edit button on manual signals (only for creator)
- Delete button with confirmation
- Edit form pre-populated with existing data
- RLS prevents editing others' manual entries

✅ **AC 1.6**: Added events trigger lead scoring updates

- Signal creation triggers lead score recalculation
- Client's lead score updated within 5 minutes
- Lead score explanation updated with new factor
- Activity logged in client timeline

### Non-Functional Requirements

#### Performance

- ⚡ Form loads in <300ms
- ⚡ Form submission completes in <1 second
- ⚡ Lead score update within 5 minutes

#### Accessibility

- ♿ Full keyboard navigation
- ♿ Screen reader compatible
- ♿ WCAG AA compliant form fields
- ♿ Clear error messages

#### Security

- 🔒 RLS prevents unauthorized edits
- 🔒 Input sanitization prevents XSS
- 🔒 Rate limiting (10 events/hour per RM)
- 🔒 Audit log for all manual entries

---

## Modified Files

### New Files

```
app/
├── api/
│   └── intelligence/
│       ├── route.ts                ⬜ NEW - POST create manual event
│       └── [id]/
│           └── route.ts            ⬜ NEW - GET, PATCH, DELETE

app/(dashboard)/
├── intelligence/
│   └── add/
│       └── components/
│           ├── AddIntelligenceModal.tsx    ⬜ NEW - Modal wrapper
│           ├── IntelligenceForm.tsx        ⬜ NEW - Main form
│           ├── ClientSelector.tsx          ⬜ NEW - Client search
│           ├── EventTypeSelector.tsx       ⬜ NEW - Event type radio
│           ├── TimelineDropdown.tsx        ⬜ NEW - Timeline dropdown
│           ├── AmountInput.tsx             ⬜ NEW - Currency input
│           ├── SourceDropdown.tsx          ⬜ NEW - Source dropdown
│           └── hooks/
│               ├── useAddIntelligence.ts   ⬜ NEW - Submit logic
│               └── useClientSearch.ts      ⬜ NEW - Client search

services/
└── intelligenceService.ts          ⬜ NEW - Business logic

lib/
└── validators/
    └── intelligence.ts             ⬜ NEW - Zod schema

types/
└── intelligence.ts                 ⬜ NEW - Type definitions
```

### Modified Files

```
app/(dashboard)/
├── signals/page.tsx                ✏️ MODIFY - Add "Add Intelligence" button
└── clients/[id]/page.tsx           ✏️ MODIFY - Add "Add Intelligence" button

components/features/signals/
└── SignalCard.tsx                  ✏️ MODIFY - Show "Manual" badge

types/
└── index.ts                        ✏️ MODIFY - Export intelligence types
```

---

## Implementation Status

**OVERALL STATUS**: ⬜ NOT STARTED

### Phase 1: Foundation & Setup

- ⬜ Create database migration (if needed)
- ⬜ Set up type definitions
- ⬜ Create Zod validation schema
- ⬜ Set up API route structure

### Phase 2: Form Components

- ⬜ Build AddIntelligenceModal
- ⬜ Create IntelligenceForm
- ⬜ Build ClientSelector with search
- ⬜ Create EventTypeSelector
- ⬜ Build other form fields

### Phase 3: Backend Integration

- ⬜ Implement /api/intelligence POST endpoint
- ⬜ Create intelligenceService
- ⬜ Integrate lead scoring trigger
- ⬜ Add activity logging

### Phase 4: Edit & Delete

- ⬜ Implement edit functionality
- ⬜ Add delete with confirmation
- ⬜ Set up RLS policies
- ⬜ Add edit/delete buttons to SignalCard

### Phase 5: UI Integration & Polish

- ⬜ Add "Add Intelligence" buttons to pages
- ⬜ Add "Manual" badge to signals
- ⬜ Add form validation feedback
- ⬜ Add success/error toasts
- ⬜ Mobile responsive design
- ⬜ Performance optimization

---

## Dependencies

### Internal Dependencies

- ✅ Signals table schema
- ✅ Clients table
- ✅ Lead scoring service
- ⬜ Design system components (Dialog, Input, Select)
- ⬜ Activity tracking service

### External Dependencies

- React Hook Form
- Zod (validation)
- React Query
- React Hot Toast

### NPM Packages

```bash
npm install react-hook-form zod @hookform/resolvers
```

---

## Risk Assessment

### Technical Risks

#### **Risk 1: Form Complexity**

- **Impact**: Medium - Complex form may confuse RMs
- **Mitigation**:
  - Progressive disclosure (show fields as needed)
  - Smart defaults based on event type
  - Inline help text
  - User testing with 3-5 RMs
- **Contingency**: Simplified form with fewer fields

#### **Risk 2: Duplicate Entry**

- **Impact**: Medium - RMs may add events already auto-detected
- **Mitigation**:
  - Check for similar signals before submit
  - Show warning if similar event exists
  - Allow RM to confirm if intentional
- **Contingency**: De-duplication report for admins

#### **Risk 3: Data Quality**

- **Impact**: Medium - Inconsistent manual data
- **Mitigation**:
  - Strict validation rules
  - Dropdown options for standardization
  - Required fields
  - Character limits
- **Contingency**: Admin review workflow for manual entries

### Business Risks

#### **Risk 1: Low Adoption**

- **Impact**: High - Feature unused if too complex
- **Mitigation**:
  - Simple, fast form (< 2 min to complete)
  - Clear value proposition
  - Training for RMs
  - Showcase high-value manual entries
- **Contingency**: Simplified quick-add form

---

## Testing Strategy

### Unit Tests (Jest)

**Test File**: `lib/validators/intelligence.test.ts`

```typescript
describe('intelligenceFormSchema', () => {
  it('should validate correct form data', () => {
    const validData = {
      clientId: 'uuid-123',
      eventType: 'ipo_filing',
      eventDetails: 'Company is planning to file for IPO in Q2 2025',
      expectedTimeline: '60_90_days',
      informationSource: 'client_conversation',
      severity: 'high'
    };
    
    const result = intelligenceFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it('should reject short event details', () => {
    const invalidData = {
      clientId: 'uuid-123',
      eventType: 'ipo_filing',
      eventDetails: 'IPO soon',  // Too short
      expectedTimeline: '30_days',
      informationSource: 'client_conversation',
      severity: 'high'
    };
    
    const result = intelligenceFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain('eventDetails');
  });
  
  it('should accept optional fields as undefined', () => {
    const dataWithoutOptional = {
      clientId: 'uuid-123',
      eventType: 'acquisition',
      eventDetails: 'Company in talks for acquisition by larger player',
      expectedTimeline: '3_6_months',
      informationSource: 'network_contact',
      severity: 'medium'
      // estimatedAmount and additionalNotes omitted
    };
    
    const result = intelligenceFormSchema.safeParse(dataWithoutOptional);
    expect(result.success).toBe(true);
  });
});
```

**Test File**: `services/intelligenceService.test.ts`

```typescript
describe('intelligenceService', () => {
  it('should create manual intelligence signal', async () => {
    const formData = mockIntelligenceFormData();
    const rmId = 'rm-001';
    
    const result = await createManualIntelligence(formData, rmId);
    
    expect(result.signal).toBeDefined();
    expect(result.signal.source).toBe('rm_input');
    expect(result.signal.metadata.isManual).toBe(true);
    expect(result.signal.metadata.addedByRm).toBe(rmId);
  });
  
  it('should trigger lead score update', async () => {
    const formData = mockIntelligenceFormData();
    const rmId = 'rm-001';
    
    const result = await createManualIntelligence(formData, rmId);
    
    expect(result.leadScoreUpdated).toBe(true);
    expect(result.newLeadScore).toBeGreaterThan(0);
  });
});
```

### Integration Tests

**Test File**: `app/intelligence/add/components/IntelligenceForm.integration.test.tsx`

```typescript
describe('IntelligenceForm Integration', () => {
  it('should submit form with valid data', async () => {
    mockAPI('/api/intelligence', {
      success: true,
      data: { signal: mockSignal(),leadScoreUpdated: true, newLeadScore: 85 }
    });
    
    const { getByLabelText, getByText, getByRole } = render(
      <AddIntelligenceModal isOpen={true} onClose={jest.fn()} />
    );
    
    // Fill form
    await userEvent.type(getByLabelText(/Client/i), 'Rajesh');
    await userEvent.click(getByText('Rajesh Sharma'));
    
    await userEvent.click(getByLabelText(/IPO Filing/i));
    
    await userEvent.type(
      getByLabelText(/Event Details/i),
      'TechCorp is planning to file for IPO by end of Q2 2025'
    );
    
    await userEvent.selectOptions(
      getByLabelText(/Expected Timeline/i),
      '60_90_days'
    );
    
    await userEvent.selectOptions(
      getByLabelText(/Source/i),
      'client_conversation'
    );
    
    // Submit
    await userEvent.click(getByRole('button', { name: /Add Event/i }));
    
    // Verify API called
    await waitFor(() => {
      expect(mockAPI).toHaveBeenCalledWith('/api/intelligence', {
        method: 'POST',
        body: expect.objectContaining({
          clientId: expect.any(String),
          eventType: 'ipo_filing'
        })
      });
    });
    
    // Success toast shown
    expect(toast.success).toHaveBeenCalledWith('Intelligence added successfully!');
  });
  
  it('should show validation errors for invalid data', async () => {
    const { getByRole, getByText } = render(
      <AddIntelligenceModal isOpen={true} onClose={jest.fn()} />
    );
    
    // Try to submit without filling required fields
    await userEvent.click(getByRole('button', { name: /Add Event/i }));
    
    // Validation errors shown
    await waitFor(() => {
      expect(getByText(/Please select a valid client/i)).toBeInTheDocument();
      expect(getByText(/Please select an event type/i)).toBeInTheDocument();
      expect(getByText(/Please provide at least 20 characters/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

**Test File**: `e2e/manual-intelligence.spec.ts`

```typescript
test.describe('Manual Intelligence Entry', () => {
  test('complete intelligence entry workflow', async ({ page }) => {
    await page.goto('/signals');
    
    // Click Add Intelligence button
    await page.click('[data-testid="add-intelligence-button"]');
    
    // Modal opens
    await expect(page.locator('[data-testid="intelligence-modal"]')).toBeVisible();
    
    // Fill form
    await page.fill('[data-testid="client-search"]', 'Rajesh');
    await page.click('text=Rajesh Sharma');
    
    await page.click('[data-testid="event-type-ipo_filing"]');
    
    await page.fill(
      '[data-testid="event-details"]',
      'TechCorp India is planning to file for IPO by end of Q2 2025. Expected valuation is ₹450 Cr.'
    );
    
    await page.selectOption('[data-testid="timeline-select"]', '60_90_days');
    
    await page.fill('[data-testid="amount-input"]', '45000000000');
    
    await page.selectOption('[data-testid="source-select"]', 'client_conversation');
    
    await page.fill(
      '[data-testid="notes-textarea"]',
      'Discussed during quarterly review meeting'
    );
    
    await page.click('[data-testid="severity-high"]');
    
    // Submit
    await page.click('[data-testid="submit-button"]');
    
    // Success notification
    await expect(page.locator('text=Intelligence added successfully')).toBeVisible();
    
    // Modal closes
    await expect(page.locator('[data-testid="intelligence-modal"]')).not.toBeVisible();
    
    // New signal appears in list with "Manual" badge
    await expect(page.locator('[data-testid="signal-card"]').first()).toContainText('TechCorp');
    await expect(page.locator('[data-testid="manual-badge"]')).toBeVisible();
  });
  
  test('edit manual intelligence', async ({ page }) => {
    await page.goto('/signals');
    
    // Find manual signal
    const manualSignal = page.locator('[data-testid="signal-card"]').filter({
      has: page.locator('[data-testid="manual-badge"]')
    }).first();
    
    // Click edit button
    await manualSignal.locator('[data-testid="edit-button"]').click();
    
    // Edit form opens with pre-filled data
    await expect(page.locator('[data-testid="intelligence-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-details"]')).not.toBeEmpty();
    
    // Update details
    await page.fill('[data-testid="event-details"]', 'Updated: IPO filing expected in Q3 2025');
    
    // Save
    await page.click('[data-testid="submit-button"]');
    
    // Success
    await expect(page.locator('text=Intelligence updated')).toBeVisible();
  });
  
  test('delete manual intelligence', async ({ page }) => {
    await page.goto('/signals');
    
    // Find manual signal
    const manualSignal = page.locator('[data-testid="signal-card"]').filter({
      has: page.locator('[data-testid="manual-badge"]')
    }).first();
    
    // Click delete button
    await manualSignal.locator('[data-testid="delete-button"]').click();
    
    // Confirmation dialog
    await expect(page.locator('text=Are you sure')).toBeVisible();
    await page.click('button:has-text("Delete")');
    
    // Success
    await expect(page.locator('text=Intelligence deleted')).toBeVisible();
    
    // Signal removed from list
    await expect(manualSignal).not.toBeVisible();
  });
});
```

---

## Performance Considerations

### Bundle Optimization

- **Code splitting**: Lazy load modal component
- **Tree shaking**: Import only used form components

### Runtime Performance

- **Debouncing**: Client search debounced (300ms)
- **Memoization**: Cache client search results
- **Optimistic updates**: Update UI before API confirmation

### Caching Strategy

- **Client search**: Cache for 1 minute
- **Form options**: Cache dropdowns indefinitely
- **Submitted signals**: Invalidate queries on submit

---

## Deployment Plan

### Development Phase

1. **Feature branch**: `feature/11-manual-intelligence`
2. **Environment**: Development
3. **Testing**: Form validation, submission
4. **Code review**: PR with form screenshots

### Staging Phase

1. **Deploy to staging**: Test with real data
2. **UAT**: 3-5 RMs test adding events
3. **Validation**: Verify lead scores update
4. **Usability**: Collect feedback on form UX

### Production Phase

1. **Deploy to production**: Merge to `main`
2. **Monitor metrics**:
   - Form submission success rate
   - Time to complete form
   - Manual events per RM
3. **Gradual rollout**: Enable for all RMs
4. **Rollback plan**: Feature flag disable

---

## Monitoring & Analytics

### Performance Metrics

- **Form Load Time**: Average time to render
- **Submission Time**: Time from submit to success
- **Error Rate**: Failed submissions / total

### Business Metrics

- **Adoption Rate**: % of RMs who add manual events
- **Events Per RM**: Average manual events per RM per week
- **Data Quality**: % of complete entries
- **Lead Score Impact**: Average lead score change from manual events

### Technical Metrics

- **Validation Errors**: Most common validation failures
- **API Success Rate**: Successful submissions / total
- **Edit/Delete Rate**: % of manual events edited/deleted

---

## Documentation Requirements

### Technical Documentation

- **Form Validation Rules**: All validation constraints
- **API Endpoints**: Request/response schemas
- **Manual Signal Schema**: Database structure

### User Documentation

- **How to Add Intelligence**: Step-by-step guide
- **Event Types Guide**: When to use each type
- **Best Practices**: Writing good event details
- **FAQ**: Common questions

---

## Post-Launch Review

### Success Criteria

- ✅ 60%+ of RMs add at least 1 manual event per week
- ✅ Average form completion time <2 minutes
- ✅ Form submission success rate >95%
- ✅ User satisfaction score >4.0/5.0

### Retrospective Items

- **Lessons Learned**: Form UX improvements, validation tweaks
- **Process Improvements**: Better RM training
- **Technical Debt**: Form performance optimization

### Future Enhancements

- **Bulk Upload**: CSV import for multiple events
- **Templates**: Pre-filled forms for common event types
- **AI Suggestions**: Auto-populate fields based on description
- **Photo Attachments**: Upload meeting notes, documents

---

## Sign-off

**Created by**: AI Implementation Planner
**Date**: 2025-12-19
**Version**: 1.0
**Status**: Ready for Review

**Approval Required From**:

- [ ] Product Manager (business requirements)
- [ ] Tech Lead (architecture review)
- [ ] RM Representatives (form usability)

---
