# 10 - Aggregate Data from Multiple Intelligence Sources - Implementation Planning

## Project Context

**Technical Stack**: Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, shadcn/ui  
**Backend**: NestJS, PostgreSQL, Redis, BullMQ  
**Infrastructure**: Vercel (FE), Fly.io/Render (BE), GitHub Actions CI/CD  
**Data Processing**: Apache Kafka/RabbitMQ, Elasticsearch, Python data pipelines

## User Story

**As a** Relationship Manager,  
**I want** the system to aggregate insights from multiple reliable data sources,  
**so that** I have a comprehensive view of liquidity events rather than relying on a single dataset.

## Pre-conditions

- Database infrastructure is operational
- External data source APIs or scraping access is available
- Authentication credentials for data sources configured
- Elasticsearch cluster is set up for indexing
- BullMQ is configured for job processing
- Admin dashboard exists for monitoring

## Business Requirements

- **Comprehensive Coverage**: Aggregate data from 4+ sources (PrivateCircle, Zauba Corp, NSE/BSE, promoter disclosures) with 99% uptime
- **Real-time Intelligence**: Data pipelines update every 15 minutes with <5 min processing latency
- **Data Trust**: 100% source attribution for traceability and compliance
- **Conflict Resolution**: Automated conflict detection and resolution with 95%+ accuracy using hierarchical prioritization
- **Search Performance**: Newly ingested data searchable within 30 seconds of pipeline completion

## Technical Specifications

### Integration Points

- **Data Sources**:
  - PrivateCircle API (Private equity deals, fundraising data)
  - Zauba Corp API/Scraper (Company registrations, compliance filings)
  - NSE/BSE APIs (IPO filings, market data)
  - MCA Portal (Promoter disclosures, director information)
- **Search Engine**: Elasticsearch for indexing and full-text search
- **Message Queue**: BullMQ for data pipeline orchestration
- **Caching**: Redis for deduplication and temporary storage
- **Monitoring**: Prometheus + Grafana for pipeline health

### Security Requirements

- API keys encrypted at rest (Vault/AWS Secrets Manager)
- Rate limiting on external API calls
- PII encryption for promoter/director data
- RBAC for admin dashboard access
- Audit logging for all data ingestion events
- Data retention policies (comply with regulations)

## Design Specifications

### Visual Layout & Components

**Admin Data Sources Dashboard**:

```
[Header: Data Sources]
├── Source Status Grid
│   ├── PrivateCircle Card
│   │   ├── Status Badge (Active/Down)
│   │   ├── Last Sync Time
│   │   ├── Records Ingested (24h)
│   │   └── Error Count
│   ├── Zauba Corp Card
│   ├── NSE/BSE Card
│   └── MCA Portal Card
├── Pipeline Health Chart
│   ├── Ingestion Rate (records/min)
│   └── Processing Latency (avg)
└── Recent Conflicts
    └── Conflict Resolution Log
```

**Data Provenance Display** (Client Profile):

```
[Client Profile Section]
└── Liquidity Events
    ├── Event Card
    │   ├── Event Details
    │   ├── Source Badge: "Zauba Corp, NSE"
    │   ├── Confidence Score
    │   └── View Source Details (modal)
    └── Conflict Indicator (if applicable)
        └── Shows resolution logic applied
```

**Conflict Resolution Panel** (Admin):

```
[Conflicts Dashboard]
├── Unresolved Conflicts List
│   ├── Conflict Card
│   │   ├── Data Field (e.g., "Director Name")
│   │   ├── Conflicting Values
│   │   │   ├── Source A: "Rajesh Kumar"
│   │   │   └── Source B: "R. Kumar"
│   │   ├── Auto-Resolution Applied
│   │   └── Actions (Override, Merge, Ignore)
└── Resolution Rules
    └── Priority Hierarchy Display
```

### Component Hierarchy

```tsx
<AdminDataSources>
  <SourceStatusGrid>
    <DataSourceCard />
  </SourceStatusGrid>
  <PipelineHealthChart />
  <ConflictResolutionLog />
</AdminDataSources>

<ClientProfile>
  <LiquidityEvents>
    <EventCard>
      <SourceAttribution />
      <ConflictIndicator />
    </EventCard>
  </LiquidityEvents>
</ClientProfile>

<ConflictsDashboard>
  <UnresolvedConflictsList>
    <ConflictCard />
  </UnresolvedConflictsList>
  <ResolutionRules />
</ConflictsDashboard>
```

## Technical Architecture

### Data Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│           External Data Sources                          │
│  PrivateCircle │ Zauba Corp │ NSE/BSE │ MCA Portal       │
└────────┬────────────┬─────────────┬───────────┬──────────┘
         │            │             │           │
         ▼            ▼             ▼           ▼
    ┌────────────────────────────────────────────────┐
    │         Data Ingestion Layer (BullMQ)          │
    │  - API Clients / Web Scrapers                  │
    │  - Rate Limiting & Retry Logic                 │
    │  - Raw Data Storage (S3/Local)                 │
    └─────────────────┬──────────────────────────────┘
                      ▼
    ┌────────────────────────────────────────────────┐
    │      Data Normalization Layer (Python)         │
    │  - Schema Mapping                              │
    │  - Entity Resolution                           │
    │  - Data Validation                             │
    └─────────────────┬──────────────────────────────┘
                      ▼
    ┌────────────────────────────────────────────────┐
    │      Conflict Detection & Resolution           │
    │  - Deduplication (Redis)                       │
    │  - Conflict Identification                     │
    │  - Hierarchical Resolution                     │
    └─────────────────┬──────────────────────────────┘
                      ▼
    ┌────────────────────────────────────────────────┐
    │          Data Storage Layer                    │
    │  PostgreSQL (structured) │ Elasticsearch (search)│
    └────────────────────────────────────────────────┘
```

### Backend Services

```
backend/src/
├── data-sources/
│   ├── sources/
│   │   ├── privatecircle/
│   │   │   ├── privatecircle.service.ts
│   │   │   ├── privatecircle-client.ts
│   │   │   └── privatecircle-parser.ts
│   │   ├── zauba/
│   │   │   ├── zauba.service.ts
│   │   │   ├── zauba-scraper.ts
│   │   │   └── zauba-parser.ts
│   │   ├── nse-bse/
│   │   │   ├── exchange.service.ts
│   │   │   └── exchange-client.ts
│   │   └── mca/
│   │       ├── mca.service.ts
│   │       └── mca-scraper.ts
│   ├── ingestion/
│   │   ├── ingestion-orchestrator.service.ts
│   │   ├── rate-limiter.service.ts
│   │   └── retry-handler.service.ts
├── normalization/
│   ├── schema-mapper.service.ts
│   ├── entity-resolver.service.ts
│   ├── data-validator.service.ts
│   └── unified-schema.ts
├── conflicts/
│   ├── conflict-detector.service.ts
│   ├── conflict-resolver.service.ts
│   ├── resolution-rules.service.ts
│   └── entities/
│       └── conflict.entity.ts
├── indexing/
│   ├── elasticsearch.service.ts
│   └── search-indexer.service.ts
├── audit/
│   ├── audit-logger.service.ts
│   └── entities/
│       └── audit-log.entity.ts
└── jobs/
    ├── ingestion.processor.ts
    ├── normalization.processor.ts
    └── indexing.processor.ts
```

### State Management & Data Models

```typescript
// Unified Data Schema
interface UnifiedLiquidityEvent {
  id: string;
  eventType: 'ipo' | 'funding' | 'acquisition' | 'exit';
  companyName: string;
  companyId: string;
  amount: number;
  currency: string;
  date: Date;
  
  // Promoter/Director Information
  promoters: Promoter[];
  directors: Director[];
  
  // Source Attribution
  sources: DataSourceAttribution[];
  primarySource: DataSourceType;
  
  // Conflict Resolution
  hasConflicts: boolean;
  resolvedConflicts: ResolvedConflict[];
  
  // Metadata
  confidence: number;
  lastUpdated: Date;
  createdAt: Date;
}

interface DataSourceAttribution {
  source: DataSourceType;
  sourceRecordId: string;
  retrievedAt: Date;
  url?: string;
  reliability: number; // 0-100
}

type DataSourceType = 'privatecircle' | 'zauba' | 'nse' | 'bse' | 'mca';

interface ResolvedConflict {
  field: string;
  conflictingValues: ConflictingValue[];
  resolvedValue: any;
  resolutionStrategy: ResolutionStrategy;
  resolvedAt: Date;
  resolvedBy: 'auto' | 'admin';
}

interface ConflictingValue {
  value: any;
  source: DataSourceType;
  confidence: number;
}

type ResolutionStrategy = 
  | 'hierarchical_priority'
  | 'most_recent'
  | 'highest_confidence'
  | 'majority_vote'
  | 'manual_override';

// Resolution Hierarchy
const SOURCE_PRIORITY_HIERARCHY = {
  regulatory: ['mca', 'nse', 'bse'],       // Highest priority
  verified: ['privatecircle'],              // Medium priority
  thirdParty: ['zauba'],                    // Lower priority
};

interface DataSourceStatus {
  source: DataSourceType;
  status: 'active' | 'down' | 'degraded';
  lastSync: Date;
  recordsIngestedLast24h: number;
  errorCount: number;
  avgLatency: number;
}

interface IngestionJob {
  id: string;
  source: DataSourceType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsFailed: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}
```

### API Schema

```typescript
// Admin Dashboard - Source Status
GET /api/admin/data-sources/status
response: {
  sources: DataSourceStatus[];
  pipelineHealth: {
    ingestionRate: number;
    avgLatency: number;
    errorRate: number;
  };
}

// Conflict Management
GET /api/admin/conflicts
query: { status?: 'unresolved' | 'resolved'; source?: DataSourceType }
response: {
  conflicts: ResolvedConflict[];
  total: number;
}

POST /api/admin/conflicts/{id}/resolve
body: {
  resolution: 'accept' | 'override';
  value?: any;
}

// Search Indexed Data
GET /api/intelligence/search
query: { q: string; sources?: string[]; from?: string; to?: string }
response: {
  results: UnifiedLiquidityEvent[];
  total: number;
  facets: SearchFacets;
}

// Trigger Manual Ingestion
POST /api/admin/data-sources/{source}/sync
response: {
  jobId: string;
  status: 'queued';
}

// Audit Logs
GET /api/admin/audit-logs
query: { source?: DataSourceType; from?: string; to?: string }
response: {
  logs: AuditLog[];
  total: number;
}
```

## Implementation Requirements

### Core Components

**DataSourceCard.tsx** - Display source status and metrics  
**ConflictCard.tsx** - Display and resolve data conflicts  
**SourceAttribution.tsx** - Show data provenance on events  
**PipelineHealthChart.tsx** - Visualize pipeline metrics  
**AuditLogViewer.tsx** - Browse ingestion audit logs

### Backend Services

**IngestionOrchestrator** - Coordinate data ingestion jobs  
**SchemaMapper** - Map disparate schemas to unified model  
**ConflictResolver** - Detect and resolve conflicts  
**SearchIndexer** - Index data in Elasticsearch  
**AuditLogger** - Log all ingestion activities

### Data Connectors

**PrivateCircleClient** - API integration  
**ZaubaScraper** - Web scraping (with rate limiting)  
**ExchangeClient** - NSE/BSE API integration  
**MCAScraper** - MCA portal scraper

### Utility Functions

**entity-resolver.ts** - Resolve duplicate entities  
**data-validator.ts** - Validate ingested data  
**conflict-detection.ts** - Identify data conflicts  
**source-prioritizer.ts** - Apply hierarchy for resolution

## Acceptance Criteria

### Data Ingestion & Integration

✅ System ingests from PrivateCircle, Zauba Corp, NSE/BSE, MCA Portal  
✅ Data pipelines run automatically every 15 minutes  
✅ Structured and semi-structured data parsed correctly  
✅ API failures handled with retry logic (3 retries, exponential backoff)  
✅ Raw data archived for audit purposes  

### Data Integrity & Provenance

✅ Every data point displays "Source Trace" (source + date)  
✅ Source attribution visible on client profiles and events  
✅ Conflict resolution uses hierarchical priority (regulatory > verified > third-party)  
✅ All conflicts logged in admin dashboard  
✅ Audit logs capture all ingestion events and failures  

### Functional Performance

✅ Ingested data indexed in Elasticsearch within 30 seconds  
✅ Search queries return results in <1 second  
✅ Data normalized to unified schema (consistent field names)  
✅ Director/Promoter names standardized ("Director" vs "Promoter")  
✅ Processing latency <5 minutes per ingestion cycle  

### Monitoring & Admin

✅ Admin dashboard shows real-time source status  
✅ Pipeline health metrics visible (ingestion rate, latency, errors)  
✅ Unresolved conflicts highlighted for manual review  
✅ Admins can trigger manual sync for any source  
✅ Alerting for pipeline failures or degraded sources  

## Modified Files

**Frontend:**

```
src/app/admin/data-sources/
├── page.tsx ⬜
└── components/
    ├── SourceStatusGrid.tsx ⬜
    ├── DataSourceCard.tsx ⬜
    ├── PipelineHealthChart.tsx ⬜
    └── ConflictResolutionLog.tsx ⬜

src/app/admin/conflicts/
├── page.tsx ⬜
└── components/
    ├── ConflictCard.tsx ⬜
    └── ResolutionRules.tsx ⬜

src/components/shared/
├── SourceAttribution.tsx ⬜
└── ConflictIndicator.tsx ⬜

src/lib/api/
├── data-sources-api.ts ⬜
├── conflicts-api.ts ⬜
└── search-api.ts ⬜

src/types/
├── data-source-types.ts ⬜
└── conflict-types.ts ⬜
```

**Backend:**

```
backend/src/data-sources/
├── sources/
│   ├── privatecircle/
│   │   ├── privatecircle.service.ts ⬜
│   │   └── privatecircle-client.ts ⬜
│   ├── zauba/
│   │   ├── zauba.service.ts ⬜
│   │   └── zauba-scraper.ts ⬜
│   ├── nse-bse/
│   │   └── exchange.service.ts ⬜
│   └── mca/
│       └── mca.service.ts ⬜
├── ingestion/
│   └── ingestion-orchestrator.service.ts ⬜
├── normalization/
│   ├── schema-mapper.service.ts ⬜
│   └── entity-resolver.service.ts ⬜
├── conflicts/
│   ├── conflict-detector.service.ts ⬜
│   └── conflict-resolver.service.ts ⬜
├── indexing/
│   └── elasticsearch.service.ts ⬜
└── jobs/
    ├── ingestion.processor.ts ⬜
    └── normalization.processor.ts ⬜

backend/src/audit/
└── audit-logger.service.ts ⬜
```

**Infrastructure:**

```
docker/
├── elasticsearch.yml ⬜
└── docker-compose.yml (update) ⬜

backend/database/migrations/
├── xxx-create-data-sources.ts ⬜
├── xxx-create-conflicts.ts ⬜
└── xxx-create-audit-logs.ts ⬜
```

## Implementation Status

**OVERALL STATUS**: ⬜ NOT STARTED

### Phase 1: Infrastructure Setup

- [ ] Elasticsearch cluster setup
- [ ] BullMQ queue configuration
- [ ] Database schema for sources, conflicts, audit logs
- [ ] Redis for deduplication

### Phase 2: Data Connectors

- [ ] PrivateCircle API client
- [ ] Zauba Corp scraper
- [ ] NSE/BSE API client
- [ ] MCA portal scraper
- [ ] Rate limiting and retry logic

### Phase 3: Data Pipeline

- [ ] Ingestion orchestrator
- [ ] Schema mapper (unified model)
- [ ] Entity resolver (deduplication)
- [ ] Data validator

### Phase 4: Conflict Management

- [ ] Conflict detector
- [ ] Hierarchical resolver
- [ ] Admin conflict dashboard
- [ ] Manual resolution UI

### Phase 5: Search & Indexing

- [ ] Elasticsearch indexer
- [ ] Full-text search API
- [ ] Real-time index updates

### Phase 6: Monitoring & Admin UI

- [ ] Source status dashboard
- [ ] Pipeline health metrics
- [ ] Audit log viewer
- [ ] Alerting system

### Phase 7: Testing & Optimization

- [ ] Unit tests for parsers/mappers
- [ ] Integration tests for pipelines
- [ ] Performance testing (1M+ records)
- [ ] Monitoring and observability

## Dependencies

### Internal

- ✅ PostgreSQL database
- ✅ Redis cache
- ⬜ Elasticsearch cluster
- ⬜ BullMQ configuration
- ✅ Admin authentication

### External

- ⬜ PrivateCircle API access + credentials
- ⬜ Zauba Corp access (API or scraping)
- ⬜ NSE/BSE API credentials
- ⬜ MCA portal scraping setup
- ⬜ Prometheus/Grafana for monitoring

## Risk Assessment

### Technical Risks

**External API Reliability**

- Impact: High
- Mitigation: Retry logic, fallback to scraping, queue failed jobs
- Contingency: Manual data upload interface

**Web Scraping Blocks**

- Impact: High (Zauba, MCA)
- Mitigation: Rotating proxies, user-agent rotation, rate limiting
- Contingency: Partner integration or manual data entry

**Conflict Resolution Accuracy**

- Impact: Medium
- Mitigation: Confidence scoring, human-in-loop for low confidence
- Contingency: Manual conflict resolution queue

**Search Performance at Scale**

- Impact: Medium
- Mitigation: Elasticsearch optimization, sharding strategy
- Contingency: Pagination, result limits

**Data Normalization Errors**

- Impact: Medium
- Mitigation: Validation rules, fallback to raw data storage
- Contingency: Manual review queue for failed normalizations

### Business Risks

**Data Quality Issues**

- Impact: High
- Mitigation: Source reliability scoring, multi-source validation
- Contingency: Display confidence scores to users

**Regulatory Compliance**

- Impact: High
- Mitigation: Audit logging, data retention policies, PII encryption
- Contingency: Legal review, data purging on request

## Testing Strategy

### Unit Tests

```typescript
describe('SchemaMapper', () => {
  it('should map PrivateCircle data to unified schema', () => {
    const raw = mockPrivateCircleData();
    const unified = schemaMapper.map(raw, 'privatecircle');
    expect(unified).toMatchUnifiedSchema();
  });
});

describe('ConflictResolver', () => {
  it('should prioritize regulatory sources', () => {
    const conflicts = [
      { source: 'zauba', value: 'R. Kumar' },
      { source: 'mca', value: 'Rajesh Kumar' }
    ];
    const resolved = resolver.resolve(conflicts, 'name');
    expect(resolved.value).toBe('Rajesh Kumar');
    expect(resolved.strategy).toBe('hierarchical_priority');
  });
});
```

### Integration Tests

```typescript
describe('Data Pipeline', () => {
  it('should ingest, normalize, and index data', async () => {
    await triggerIngestion('privatecircle');
    await waitForJobCompletion();
    
    const indexed = await elasticsearch.search({ q: 'test-company' });
    expect(indexed.hits.length).toBeGreaterThan(0);
    expect(indexed.hits[0]._source.sources).toBeDefined();
  });
});
```

### Performance Tests

```typescript
describe('Pipeline Performance', () => {
  it('should process 10K records within 5 minutes', async () => {
    const start = Date.now();
    await processRecords(mockRecords(10000));
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5 * 60 * 1000);
  });
});
```

## Performance Considerations

- **Ingestion Rate**: Target 1000 records/min per source
- **Processing Latency**: <5 min end-to-end
- **Search Response**: <1 second for 95th percentile
- **Index Update**: <30 seconds after normalization
- **Deduplication**: Redis cache for fast lookups

## Deployment Plan

### Development

- Mock external APIs for testing
- Docker Compose for local Elasticsearch
- Feature flag: `ENABLE_DATA_SOURCES`

### Staging

- Connect to staging data sources
- Limited ingestion (test accounts)
- Monitor for conflicts and errors

### Production

- Gradual source enablement (one at a time)
- Monitor pipeline health and costs
- Set up alerting for failures

## Monitoring & Analytics

### Performance Metrics

- Ingestion rate (records/min)
- Processing latency (p50, p95, p99)
- Search query performance
- Index size and growth rate

### Business Metrics

- Total records ingested per source
- Conflict resolution rate
- Data coverage (% clients with liquidity events)
- Source reliability scores

### Quality Metrics

- Data validation failure rate
- Conflict frequency
- Manual override rate
- Search result relevance

## Documentation

### Technical Docs

- Data source integration guides
- Schema mapping documentation
- Conflict resolution rules
- Elasticsearch index configuration
- Troubleshooting guide

### Admin Docs

- How to resolve conflicts manually
- How to trigger manual sync
- Understanding audit logs
- Managing source credentials

## Success Criteria

- All 4 data sources ingesting successfully
- 99% uptime for data pipelines
- <5 min processing latency (p95)
- <30 sec search indexing time
- >95% conflict auto-resolution rate
- 100% source attribution on data points
- Zero data loss during ingestion

---

## Notes

- **Incremental Rollout**: Enable one data source at a time, validate quality before adding next
- **Cost Management**: Monitor API call costs, implement caching to reduce redundant requests
- **Compliance**: Ensure proper licensing for data sources, respect rate limits
- **Scalability**: Design for 1M+ records, plan for horizontal scaling of Elasticsearch
- **Human-in-Loop**: Low-confidence conflicts require admin review before resolution
- **Alternative Sources**: Consider Bloomberg, Crunchbase, LinkedIn as additional sources
