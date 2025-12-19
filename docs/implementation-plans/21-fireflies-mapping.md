# 21 - Auto-Map Meeting Notes to Client Follow-ups - Implementation Planning

## Project Context

**Technical Stack**: Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, shadcn/ui  
**Backend**: NestJS, PostgreSQL, Redis, BullMQ  
**Infrastructure**: Vercel (FE), Fly.io/Render (BE), GitHub Actions CI/CD  
**Integrations**: Fireflies.ai API, Microsoft Graph API (OneDrive), OpenAI GPT-4 for NLP

## User Story

**As a** Relationship Manager,  
**I want** my Fireflies.ai meeting transcriptions to be automatically processed and mapped to client follow-ups,  
**so that** I never miss action items from client meetings and can focus on relationships instead of note-taking.

## Pre-conditions

- User is authenticated with RM role
- RM has active Fireflies.ai account
- RM has OneDrive (personal or business) account
- Client database is populated with client names and profiles
- Follow-up task system is operational
- AI service (OpenAI/custom LLM) is configured

## Business Requirements

- **Automated Transcript Ingestion**: Detect and process new Fireflies transcripts within 5 minutes with 95%+ success rate
- **Client Identification**: Match conversation participants to client records with >90% accuracy
- **Action Item Extraction**: Extract commitments, requests, and follow-up triggers with >85% recall
- **Task Auto-Creation**: Generate follow-up tasks with smart due dates, linked to client profiles
- **RM Productivity**: Reduce post-meeting admin time from 30 min/day to <5 min review time

## Technical Specifications

### Integration Points

- **Fireflies.ai**: Webhook notifications, REST API for transcript retrieval
- **OneDrive**: Microsoft Graph API for file monitoring, delta queries for change detection
- **AI/NLP**: OpenAI GPT-4 for entity extraction, action item identification, sentiment analysis
- **Authentication**: OAuth 2.0 for Fireflies and Microsoft Graph
- **Notifications**: Email/SMS for new follow-ups, in-app notifications

### Security Requirements

- OAuth 2.0 flow for third-party integrations
- Encrypted storage for transcripts (AES-256)
- PII masking in logs and error messages
- RM-level data isolation (only see own meetings)
- Audit logging for all transcript processing
- Rate limiting on external APIs
- Optional meeting exclusion (sensitive meetings)

## Design Specifications

### Visual Layout & Components

**Settings Page** (Integration Setup):

```
[Header: Integrations]
├── Fireflies.ai Connection Card
│   ├── Status Badge (Connected/Disconnected)
│   ├── Connect Button / Disconnect
│   └── Configuration Options
├── OneDrive Connection Card
│   ├── Status Badge
│   ├── Folder Path Display
│   └── Authorize Button
└── Processing Rules
    ├── Auto-create tasks toggle
    ├── Confidence threshold slider
    └── Notification preferences
```

**Follow-ups Dashboard** (Enhanced):

```
[Header: Follow-ups]
├── Filters (All / AI-Generated / Manual)
└── Task List
    ├── Task Card
    │   ├── Task Title
    │   ├── Client Name (linked)
    │   ├── Due Date + Priority
    │   ├── Source Badge: "From Meeting: Dec 18"
    │   └── Transcript Snippet (expandable)
    └── Actions (Edit, Complete, Snooze)
```

**Client Profile** (Meeting History Tab):

```
[Client Header]
└── Meetings Tab
    ├── Meeting List (chronological)
    │   ├── Meeting Card
    │   │   ├── Date + Duration
    │   │   ├── Topics Discussed (tags)
    │   │   ├── Sentiment Badge
    │   │   ├── Action Items Count
    │   │   └── View Transcript (modal)
    └── Search + Filters
```

### Component Hierarchy

```tsx
<IntegrationsSettings>
  <FirefliesConnectionCard />
  <OneDriveConnectionCard />
  <ProcessingRulesPanel />
</IntegrationsSettings>

<FollowupsDashboard>
  <TaskFilters />
  <TaskList>
    <AIGeneratedTaskCard />
  </TaskList>
</FollowupsDashboard>

<ClientProfile>
  <MeetingHistoryTab>
    <MeetingCard />
    <TranscriptModal />
  </MeetingHistoryTab>
</ClientProfile>
```

## Technical Architecture

### Component Structure

```
src/app/
├── settings/integrations/
│   ├── page.tsx
│   └── components/
│       ├── FirefliesConnectionCard.tsx
│       ├── OneDriveConnectionCard.tsx
│       ├── ProcessingRulesPanel.tsx
│       └── hooks/
│           ├── useFirefliesAuth.ts
│           ├── useOneDriveAuth.ts
│           └── useIntegrationStatus.ts
├── dashboard/followups/
│   └── components/
│       ├── AIGeneratedTaskCard.tsx
│       └── TranscriptSnippet.tsx
└── clients/[id]/
    └── components/
        ├── MeetingHistoryTab.tsx
        ├── MeetingCard.tsx
        └── TranscriptModal.tsx
```

### Backend Services

```
backend/src/
├── integrations/
│   ├── fireflies/
│   │   ├── fireflies.service.ts
│   │   ├── fireflies.controller.ts (webhooks)
│   │   └── fireflies-auth.service.ts
│   ├── onedrive/
│   │   ├── onedrive.service.ts
│   │   ├── onedrive-monitor.service.ts
│   │   └── delta-query.service.ts
├── transcripts/
│   ├── transcript-processor.service.ts
│   ├── client-matcher.service.ts
│   ├── action-extractor.service.ts
│   └── entities/
│       ├── transcript.entity.ts
│       └── meeting.entity.ts
├── ai/
│   ├── nlp.service.ts
│   ├── entity-extraction.service.ts
│   └── sentiment-analysis.service.ts
└── tasks/
    └── ai-task-generator.service.ts
```

### State Management

```typescript
interface IntegrationsState {
  fireflies: {
    isConnected: boolean;
    accountEmail: string | null;
    lastSync: Date | null;
  };
  onedrive: {
    isConnected: boolean;
    folderPath: string | null;
    lastCheck: Date | null;
  };
  processingRules: {
    autoCreateTasks: boolean;
    confidenceThreshold: number;
    notifyOnNewTasks: boolean;
  };
}

interface TranscriptState {
  transcripts: Transcript[];
  isProcessing: boolean;
  error: string | null;
}

interface Transcript {
  id: string;
  meetingDate: Date;
  duration: number;
  participants: string[];
  content: string;
  summary: string;
  extractedClients: ClientMatch[];
  extractedActions: ActionItem[];
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  status: 'pending' | 'processed' | 'failed';
}

interface ClientMatch {
  clientId: string;
  clientName: string;
  confidence: number;
  context: string;
}

interface ActionItem {
  id: string;
  type: 'commitment' | 'request' | 'followup';
  description: string;
  dueDate: Date | null;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  transcriptSnippet: string;
  isReviewed: boolean;
}
```

### API Schema

```typescript
// Fireflies Webhook
POST /api/webhooks/fireflies
body: {
  event: 'transcript.created';
  transcriptId: string;
  meetingDate: string;
  participants: string[];
}

// OneDrive File Detection
GET /api/integrations/onedrive/sync
response: {
  newFiles: OneDriveFile[];
  processedCount: number;
}

// Process Transcript
POST /api/transcripts/process
body: {
  transcriptId: string;
  content: string;
  metadata: TranscriptMetadata;
}
response: {
  clients: ClientMatch[];
  actions: ActionItem[];
  topics: string[];
  sentiment: string;
}

// Auth Endpoints
GET /api/integrations/fireflies/auth/url
POST /api/integrations/fireflies/auth/callback
GET /api/integrations/onedrive/auth/url
POST /api/integrations/onedrive/auth/callback
```

## Implementation Requirements

### Core Components

**FirefliesConnectionCard.tsx** - Fireflies OAuth connection
**OneDriveConnectionCard.tsx** - OneDrive folder authorization
**AIGeneratedTaskCard.tsx** - Task card with transcript context
**MeetingHistoryTab.tsx** - Client meeting history view
**TranscriptModal.tsx** - Full transcript viewer

### Custom Hooks

**useFirefliesAuth()** - OAuth flow for Fireflies
**useOneDriveAuth()** - OAuth flow for OneDrive
**useTranscriptProcessor()** - Process and extract from transcripts
**useMeetingHistory()** - Fetch client meeting history

### Utility Functions

**client-matcher.ts** - Match names to client database
**action-extractor.ts** - Extract action items from text
**due-date-calculator.ts** - Intelligently assign due dates
**transcript-parser.ts** - Parse Fireflies JSON format

## Acceptance Criteria

### Integration Setup

✅ RM can connect Fireflies.ai account via OAuth  
✅ RM can authorize OneDrive folder access  
✅ System validates folder structure and permissions  
✅ Connection status shown in settings  

### Transcript Processing

✅ New transcripts detected within 5 minutes  
✅ AI identifies client names with >90% accuracy  
✅ Multiple clients in meeting handled correctly  
✅ Transcripts linked to client records  

### Action Item Extraction

✅ Extracts explicit commitments ("I'll send...")  
✅ Extracts client requests ("Can you share...")  
✅ Extracts follow-up triggers ("Let's discuss next week")  
✅ Due dates assigned based on urgency  

### Follow-up Creation

✅ Tasks auto-created in follow-up queue  
✅ Tasks include transcript snippet  
✅ Tasks linked to client profile  
✅ Priority assigned based on client score + urgency  
✅ RM notified of new follow-ups  

### Review & Edit

✅ RM can review AI-extracted items before finalizing  
✅ RM can edit, delete, or add follow-ups  
✅ RM can mark as "not relevant"  
✅ System learns from corrections  

### Search & History

✅ All transcripts searchable by keyword  
✅ Meeting history on client profile  
✅ Filter by date, client, topic  

## Modified Files

**Frontend:**

```
src/app/settings/integrations/
├── page.tsx ⬜
└── components/
    ├── FirefliesConnectionCard.tsx ⬜
    ├── OneDriveConnectionCard.tsx ⬜
    ├── ProcessingRulesPanel.tsx ⬜
    └── hooks/
        ├── useFirefliesAuth.ts ⬜
        ├── useOneDriveAuth.ts ⬜
        └── useIntegrationStatus.ts ⬜

src/app/dashboard/followups/components/
├── AIGeneratedTaskCard.tsx ⬜
└── TranscriptSnippet.tsx ⬜

src/app/clients/[id]/components/
├── MeetingHistoryTab.tsx ⬜
├── MeetingCard.tsx ⬜
└── TranscriptModal.tsx ⬜

src/lib/
├── api/
│   ├── fireflies-api.ts ⬜
│   ├── onedrive-api.ts ⬜
│   └── transcripts-api.ts ⬜
└── utils/
    ├── client-matcher.ts ⬜
    └── due-date-calculator.ts ⬜

src/types/
├── integrations-types.ts ⬜
└── transcript-types.ts ⬜
```

**Backend:**

```
backend/src/integrations/
├── fireflies/
│   ├── fireflies.service.ts ⬜
│   ├── fireflies.controller.ts ⬜
│   └── fireflies-auth.service.ts ⬜
├── onedrive/
│   ├── onedrive.service.ts ⬜
│   ├── onedrive-monitor.service.ts ⬜
│   └── delta-query.service.ts ⬜

backend/src/transcripts/
├── transcript-processor.service.ts ⬜
├── client-matcher.service.ts ⬜
├── action-extractor.service.ts ⬜
└── entities/
    ├── transcript.entity.ts ⬜
    └── meeting.entity.ts ⬜

backend/src/ai/
├── nlp.service.ts ⬜
├── entity-extraction.service.ts ⬜
└── sentiment-analysis.service.ts ⬜
```

## Implementation Status

**OVERALL STATUS**: ⬜ NOT STARTED

### Phase 1: Integration Setup

- [ ] Fireflies.ai OAuth integration
- [ ] OneDrive OAuth integration
- [ ] Database schema for transcripts and meetings
- [ ] Settings UI for connections

### Phase 2: Transcript Ingestion

- [ ] Fireflies webhook listener
- [ ] OneDrive folder monitoring service
- [ ] Transcript parsing and storage
- [ ] BullMQ jobs for processing

### Phase 3: AI Processing

- [ ] Client name matching algorithm
- [ ] Action item extraction (NLP)
- [ ] Due date assignment logic
- [ ] Sentiment analysis

### Phase 4: Task Generation

- [ ] Auto-create follow-up tasks
- [ ] Link tasks to client profiles
- [ ] Priority calculation
- [ ] RM notification system

### Phase 5: UI & UX

- [ ] Meeting history tab
- [ ] AI-generated task cards
- [ ] Transcript viewer modal
- [ ] Review/edit interface

### Phase 6: Testing & Refinement

- [ ] Unit tests for AI extraction
- [ ] Integration tests for webhooks
- [ ] E2E tests for full workflow
- [ ] Learning from RM corrections

## Dependencies

### Internal

- ✅ Authentication service
- ✅ Client database and profiles
- ✅ Follow-up task system
- ✅ Notification system

### External

- ⬜ Fireflies.ai API access
- ⬜ Microsoft Graph API credentials
- ⬜ OpenAI GPT-4 API
- ⬜ BullMQ for background jobs

## Risk Assessment

### Technical Risks

**Fireflies API Reliability**

- Impact: High
- Mitigation: Implement retry logic, queue failed jobs, fallback to OneDrive monitoring
- Contingency: Manual upload option

**Client Name Matching Accuracy**

- Impact: High
- Mitigation: Fuzzy matching, context analysis, confidence scores, human-in-loop for low confidence
- Contingency: RM manual assignment

**OneDrive Sync Delays**

- Impact: Medium
- Mitigation: Delta queries every 2 minutes, webhook if available
- Contingency: Manual refresh button

**AI Extraction False Positives**

- Impact: Medium
- Mitigation: Confidence thresholds, RM review queue, learning from corrections
- Contingency: Disable auto-creation, enable review-first mode

### Business Risks

**User Adoption**

- Impact: Medium
- Mitigation: Simple setup wizard, clear value demo, onboarding support
- Contingency: Opt-in feature flag

**Privacy Concerns**

- Impact: High
- Mitigation: Clear consent flow, encrypted storage, meeting exclusion option
- Contingency: Disable feature, delete all data on request

## Testing Strategy

### Unit Tests

```typescript
describe('ClientMatcher', () => {
  it('should match client names with high confidence', () => {
    const result = matchClient('Rajesh Kumar', clientDatabase);
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});

describe('ActionExtractor', () => {
  it('should extract commitments', () => {
    const text = "I'll send you the brochure tomorrow";
    const actions = extractActions(text);
    expect(actions[0].type).toBe('commitment');
  });
});
```

### Integration Tests

```typescript
describe('Transcript Processing Pipeline', () => {
  it('should process transcript end-to-end', async () => {
    const transcript = mockTranscript();
    const result = await processTranscript(transcript);
    expect(result.clients).toBeDefined();
    expect(result.actions.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests

```typescript
test('Fireflies to Follow-up Flow', async ({ page }) => {
  await page.goto('/settings/integrations');
  await page.click('text=Connect Fireflies');
  // ... OAuth flow
  await triggerFirefliesWebhook();
  await page.goto('/dashboard/followups');
  await expect(page.locator('[data-ai-generated="true"]')).toBeVisible();
});
```

## Performance Considerations

- Transcript processing: <10 seconds
- Client matching: <2 seconds
- OneDrive sync: Every 2-5 minutes
- Webhook response: <1 second
- AI API timeout: 30 seconds with retry

## Deployment Plan

### Development

- Feature flag: `ENABLE_FIREFLIES_INTEGRATION`
- Mock Fireflies webhooks for testing
- Staging OneDrive account

### Staging

- Pilot with 5-10 RMs
- Monitor accuracy metrics
- Gather feedback on UI/UX

### Production

- Gradual rollout: 10% → 50% → 100%
- Monitor error rates and costs
- A/B test auto-create vs review-first

## Monitoring & Analytics

### Performance Metrics

- Transcript processing time (p95)
- Client matching accuracy
- Action extraction recall/precision
- API response times

### Business Metrics

- RMs using integration
- Transcripts processed per day
- Tasks auto-created
- Admin time saved (self-reported)

### Quality Metrics

- False positive rate
- RM edit/delete rate
- Task completion rate
- User satisfaction scores

## Documentation

### Technical Docs

- OAuth setup guide (Fireflies + OneDrive)
- Webhook configuration
- AI prompt templates
- Troubleshooting guide

### User Docs

- Integration setup wizard
- How to review AI-generated tasks
- Privacy and data handling
- FAQ

## Success Criteria

- 80%+ of active RMs enable integration
- >90% client matching accuracy
- >85% action extraction recall
- <5% false positive rate
- Admin time reduced by 80%+
- 4.5/5 user satisfaction

---

## Notes

- **Privacy First**: Clear consent, encrypted storage, RM control over which meetings sync
- **Accuracy Over Automation**: High confidence threshold for auto-creation, low confidence → review queue
- **Learning Loop**: Capture RM corrections to improve AI models over time
- **Graceful Degradation**: If AI fails, fall back to manual task creation
- **Fireflies Alternative**: Consider Otter.ai, Grain integration for broader platform support
