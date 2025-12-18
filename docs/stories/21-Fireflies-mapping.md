# User Story: 21 - Auto-Map Meeting Notes to Client Follow-ups

**As a** Relationship Manager,
**I want** my Fireflies.ai meeting transcriptions to be automatically processed and mapped to client follow-ups,
**so that** I never miss action items from client meetings and can focus on relationships instead of note-taking.

---

## Use Case Overview

### The Problem
RMs conduct 5-10 client meetings per day. Currently:
- Meeting notes are scattered across personal notebooks, emails, and memory
- Action items get lost or forgotten
- Follow-up tasks are manually created (if at all)
- No systematic way to track what was discussed with each client

### The Solution: Fireflies.ai → OneDrive → UHNW Platform

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Fireflies.ai   │────▶│    OneDrive     │────▶│  UHNW Platform  │
│  (Records &     │     │  (Storage &     │     │  (AI Processing │
│   Transcribes)  │     │   Sync Folder)  │     │   & Follow-ups) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Detailed Workflow

### Step 1: RM Conducts Meeting (Fireflies.ai)
- RM joins client call (Zoom/Teams/Google Meet)
- Fireflies.ai bot automatically joins and records
- Real-time transcription happens in background
- Meeting ends → Fireflies generates summary + transcript

### Step 2: Auto-Save to OneDrive
- Fireflies.ai integration pushes transcript to designated OneDrive folder
- Folder structure: `OneDrive/UHNW-Meetings/[RM-Name]/[Date]/`
- Files saved: 
  - `transcript.txt` - Full conversation
  - `summary.json` - AI-generated summary with action items
  - `audio.mp3` - Recording (optional)

### Step 3: UHNW Platform Ingestion
- Platform monitors OneDrive folder for new files
- On new file detection:
  1. **Parse transcript** using AI
  2. **Identify client** from conversation (name matching, context clues)
  3. **Extract action items** (commitments, follow-ups, requests)
  4. **Detect topics** (IPO, funding, portfolio, products mentioned)
  5. **Assess sentiment** (positive, concerns, objections)

### Step 4: Auto-Create Follow-ups
- System automatically creates tasks in RM's follow-up queue:
  - "Send PMS brochure to Rajesh Kumar" (due: tomorrow)
  - "Schedule portfolio review with Anita Patel" (due: next week)
  - "Check on credit facility status for Vikram" (due: 3 days)
- Tasks linked to client records with full context

### Step 5: RM Review & Action
- RM sees new follow-ups in dashboard
- Each task shows:
  - What was discussed (relevant transcript snippet)
  - What client requested/mentioned
  - Suggested priority based on signals
- RM can edit, snooze, or mark complete

---

## Acceptance Criteria

### Integration Setup
* [ ] RM can connect their Fireflies.ai account
* [ ] RM can authorize OneDrive folder access
* [ ] System validates folder structure and permissions
* [ ] Connection status shown in settings

### Transcript Processing
* [ ] New transcripts detected within 5 minutes of upload
* [ ] AI correctly identifies client name from conversation (>90% accuracy)
* [ ] Multiple clients in same meeting handled correctly
* [ ] Transcripts linked to correct client records

### Action Item Extraction
* [ ] AI extracts explicit commitments ("I'll send you...", "Let me check on...")
* [ ] AI extracts client requests ("Can you share...", "I need...")
* [ ] AI extracts follow-up triggers ("Let's discuss next week", "Call me after...")
* [ ] Due dates intelligently assigned based on urgency language

### Follow-up Creation
* [ ] Tasks auto-created in RM's follow-up queue
* [ ] Tasks include relevant transcript snippet as context
* [ ] Tasks linked to client profile
* [ ] Priority assigned based on client score + urgency
* [ ] RM notified of new follow-ups

### Review & Edit
* [ ] RM can review AI-extracted items before finalizing
* [ ] RM can edit, delete, or add follow-ups
* [ ] RM can mark items as "not relevant"
* [ ] System learns from RM corrections over time

### Search & History
* [ ] All transcripts searchable by keyword
* [ ] Meeting history visible on client profile
* [ ] Filter meetings by date, client, topic

---

## Example Scenario

**Meeting:** RM John meets Rajesh Kumar (Score: 92) about IPO planning

**Fireflies Transcript Snippet:**
> Rajesh: "...so the IPO is on track for Q1. We're looking at a $500M valuation."
> John: "That's exciting! I'll send you our PMS offerings that would be perfect for managing the post-IPO wealth."
> Rajesh: "Yes, please do. Also, my wife Priya wants to discuss setting up a family office. Can you include some information on that?"
> John: "Absolutely. I'll send everything by end of week and we can schedule a call next Tuesday to discuss."

**AI-Extracted Follow-ups:**

| Task | Due Date | Priority | Context |
|------|----------|----------|---------|
| Send PMS offerings to Rajesh Kumar | Fri, Dec 20 | High | "I'll send you our PMS offerings..." |
| Include family office information | Fri, Dec 20 | High | "...wife Priya wants to discuss setting up a family office" |
| Schedule call with Rajesh | Tue, Dec 24 | High | "...schedule a call next Tuesday to discuss" |

**Auto-Updated Client Profile:**
- Last contact: Today
- Topics discussed: IPO, PMS, Family Office
- Sentiment: Positive
- New signal: Wife interested in family office services

---

## Technical Notes

### Fireflies.ai Integration
- Use Fireflies API for webhook notifications
- Supported meeting platforms: Zoom, Google Meet, Microsoft Teams, Webex
- Transcript format: JSON with timestamps and speaker labels

### OneDrive Integration
- Microsoft Graph API for folder monitoring
- Use delta queries for efficient change detection
- Support for both personal and business OneDrive accounts

### AI Processing
- Use LLM for entity extraction and action item identification
- Client name matching against RM's client database
- Confidence scores for all extractions
- Human-in-the-loop for low-confidence matches

### Privacy & Security
- Transcripts encrypted at rest
- RM controls which meetings sync
- Option to exclude sensitive meetings
- Retention policies configurable

---

## Benefits for RM

| Before | After |
|--------|-------|
| Manually writes notes after meetings | Notes auto-captured and processed |
| Forgets action items | Never miss a follow-up |
| Spends 30 min/day on admin | Admin time reduced to 5 min review |
| Client context lost over time | Full meeting history on client profile |
| No systematic follow-up tracking | Automated task queue with reminders |

---

## Future Enhancements

- **Real-time coaching:** AI suggests talking points during live calls
- **Meeting prep:** Auto-generate briefing docs before client meetings
- **Voice notes:** Quick mobile recordings (not just Fireflies) also processed
- **Multi-language:** Support for Hindi, Marathi transcription
- **CRM sync:** Push follow-ups to Salesforce/HubSpot if needed
