# Cloud Hosting, Third-Party API, and Resourcing Estimate for 9-Week Early Liquidity Signal & Lead Scoring POC (India UHNW)

**Version:** 1.0  
**Date:** December 2024  
**Project:** India UHNW Early Liquidity Signal & Lead Scoring POC  
**Duration:** 9 Weeks  
**Status:** Planning Phase

---

## Executive Summary

This document provides a comprehensive cost estimate for a 9-week Proof of Concept (POC) to develop an early liquidity signal detection and lead scoring system for Ultra High Net Worth (UHNW) wealth management in India. The system will aggregate data from multiple sources, apply ML-based scoring, and present actionable insights to Relationship Managers.

**Total Estimated POC Cost (9 weeks):**
- **Low Range:** $1,710 (infrastructure + APIs)
- **Expected Range:** $3,500 - $4,000
- **High Range:** $5,294

**Resource Commitment:** 29 person-weeks (~143 person-days) across 4-5 FTE roles

---

## 1. Cloud Hosting Cost Estimate

The following infrastructure components are required for the POC deployment:

| Component | Service Category | Monthly Cost (USD) | Key Assumptions |
|-----------|-----------------|-------------------|-----------------|
| **Frontend hosting** | Managed Static/Web App (Vercel/AWS Amplify) | $15 – $50 | Next.js dashboard for 10–20 RMs; moderate traffic |
| **Backend APIs** | Serverless/API Gateway (AWS Lambda/API GW, GCP Functions) | $40 – $120 | Signal aggregation, lead scoring; 5–10K calls/mo |
| **Data Ingestion** | Managed ETL/Serverless (Glue, Dataflow) | $35 – $150 | Batch/event-driven, 2–4 streams, <1GB/day |
| **AI/ML workloads** | Managed ML/Spot Compute (SageMaker/Vertex AI) | $60 – $350 | Model scoring/classification, limited batch jobs |
| **Relational DB** | Managed SQL (RDS/Cloud SQL) | $45 – $120 | Lightweight, <15GB, low IOPS, nightly snapshot |
| **Analytical DB** | Managed Analytics (BigQuery/Snowflake) | $40 – $180 | 10–20M events, trend queries; separation from OLTP |
| **Object Storage** | Managed Object (S3/GCS/Azure Blob) | $8 – $32 | <120GB, 90% cold (raw, processed signals/files) |
| **Monitoring & Logging** | Managed Observability (CloudWatch/Stackdriver) | $10 – $30 | Basic dashboards, logs, metrics, alerting |
| **Network & Security** | API GW, IAM, Secrets, Basic WAF | $5 – $30 | Minimal egress, secrets mgmt, basic API keys |

**Estimated Monthly Cloud Cost:** $258 – $1,062 USD

### Cloud Infrastructure Details

#### Frontend Hosting
- **Platform:** Vercel (recommended) or AWS Amplify
- **Technology:** Next.js 15 with React 19
- **Users:** 10-20 Relationship Managers
- **Traffic:** Estimated 1,000-5,000 page views/month
- **Features:** SSR, automatic deployments, preview environments

#### Backend APIs
- **Architecture:** Serverless microservices
- **Services:** AWS Lambda + API Gateway or Google Cloud Functions
- **API Calls:** 5,000-10,000 requests/month during POC
- **Latency Target:** <500ms for most operations
- **Key Endpoints:**
  - Lead scoring API
  - Signal aggregation
  - User authentication
  - Data query services

#### Data Ingestion Pipeline
- **Pattern:** Event-driven batch processing
- **Data Sources:** 2-4 concurrent streams
- **Volume:** <1GB/day initially
- **Services:** AWS Glue, Google Dataflow, or Azure Data Factory
- **Frequency:** Hourly/daily depending on source

#### AI/ML Infrastructure
- **Platform:** AWS SageMaker or Google Vertex AI
- **Workload:** Batch scoring (not real-time during POC)
- **Models:** 
  - Lead scoring classifier
  - Liquidity event predictor
  - Signal strength evaluator
- **Training:** Limited retraining during POC
- **Inference:** Batch processing, ~500-2000 predictions/day

#### Database Architecture
- **Relational DB:** PostgreSQL on AWS RDS or Google Cloud SQL
  - Size: <15GB initially
  - Use case: Transactional data, user profiles, RM assignments
  - Backup: Daily automated snapshots
  
- **Analytical DB:** BigQuery or Snowflake
  - Volume: 10-20M events/records
  - Use case: Historical signal data, trend analysis, reporting
  - Query pattern: Aggregations, time-series analysis

#### Storage
- **Service:** AWS S3, Google Cloud Storage, or Azure Blob
- **Total Volume:** <120GB for POC
- **Storage Classes:**
  - Hot: 10-15GB (recent data, active files)
  - Cold: 90-110GB (historical data, archives)
- **Content:** Raw data files, processed signals, ML model artifacts

#### Monitoring & Observability
- **Tools:** AWS CloudWatch, Google Cloud Operations, or Datadog
- **Metrics:** 
  - API performance and latency
  - Error rates and exceptions
  - Database query performance
  - ML model accuracy and drift
- **Alerts:** Critical failure notifications, performance degradation
- **Logs:** Application logs retained for 7-30 days

#### Security & Networking
- **Components:**
  - API Gateway for rate limiting and authentication
  - AWS IAM or equivalent for role-based access
  - Secrets Manager for API keys and credentials
  - Basic WAF rules for common vulnerabilities
- **SSL/TLS:** Enabled for all endpoints
- **Network:** Minimal egress traffic during POC

---

## 2. Third-Party API & Data Costs

The POC requires access to multiple external data sources for liquidity signal detection:

| Provider | POC Tier (Monthly, USD) | Usage Assumptions | Licensing Notes |
|----------|------------------------|-------------------|-----------------|
| **PrivateCircle** | $200 – $500 | 2–3 seats/API keys, 300–1000 entity lookups/mo, early exit signal needs | Non-prod access; commercial POC LOI for higher API volumes |
| **Zauba Corp** | $70 – $250 | API or bulk access, 500–2000 lookup/month (filings, directors, changes) | Bulk pricing for POC, may need negotiation |
| **NSE/BSE Exchange** | $60 – $120 | Delayed POC feeds, 2–3 feeds (actions/announcements/block deals) | POC-only; no real-time/production feeds |
| **VCCircle** | $100 – $400 | Editorial+data, 100–300 docs/mo, triggers for M&A/PE/VC exits | Controlled by seats or query limits |
| **News API** | $70 – $200 | Commercial plan, 1000–3000 articles/mo processed for signal triggers | POC tier, not free; may need content quota controls |

**Estimated Monthly Third-Party API Cost:** $500 – $1,470 USD

### Data Source Details

#### PrivateCircle
- **Purpose:** Early exit signals for private equity and startup investments
- **Data Points:**
  - Company funding rounds
  - Startup valuations
  - Investor movements
  - Exit signals and intentions
- **API Rate:** 300-1000 entity lookups/month
- **Access Type:** Non-production POC license
- **Seats:** 2-3 concurrent users/API keys

#### Zauba Corp
- **Purpose:** Corporate filings and directorship information
- **Data Points:**
  - Director appointments and resignations
  - Company shareholding patterns
  - Related party transactions
  - Corporate structure changes
- **API Rate:** 500-2000 lookups/month
- **Delivery:** API access or bulk file downloads
- **Coverage:** Indian companies registered with MCA

#### NSE/BSE Exchange Data
- **Purpose:** Public market activity and corporate actions
- **Feeds:**
  - Corporate announcements
  - Block deals
  - Bulk deals
  - Dividend declarations
- **Data Delay:** 15-minute to end-of-day delay for POC
- **Subscription:** 2-3 separate feed types
- **Limitation:** No real-time feeds in POC tier

#### VCCircle
- **Purpose:** Private market intelligence and deal flow
- **Content:**
  - M&A announcements
  - PE/VC investment news
  - Exit transactions
  - Fund raises
- **Volume:** 100-300 articles/documents per month
- **Access Model:** Seat-based or query-limited API
- **Format:** Structured data + editorial content

#### News API
- **Purpose:** Media monitoring for liquidity trigger events
- **Sources:** Major Indian business publications
- **Volume:** 1,000-3,000 articles/month
- **Processing:** NLP-based signal extraction
- **Plan:** Commercial tier (not free tier)
- **Quota:** Controlled by API call limits

---

## 3. Resourcing Estimate (9 Weeks)

The following team composition is recommended for successful POC delivery:

| Role | People | Weeks | Total Person-Days (9w, 5d/wk) | Key Responsibilities |
|------|--------|-------|-------------------------------|----------------------|
| **Backend/Cloud Engineer** | 1 | 7 | 35 | Infra setup, CI/CD pipeline, API orchestration, data pipelines, deployment automation |
| **Data Engineer** | 1 | 6 | 30 | Data ingestion design, ETL pipelines, DB schema design, data normalization, test data generation |
| **Data Scientist/ML Engineer** | 1 | 7 | 35 | Signal logic design, ML model development, scoring algorithms, data QA, metrics definition |
| **Frontend Engineer** | 1 | 5 | 25 | RM dashboard UI, component development, API integration, insights visualization |
| **Product/Delivery Manager** | 0.4 | 9 | 18 | Scope management, stakeholder demos, requirement refinement, reporting, coordination |
| **Total** | ~4.4 | - | **143 days / ~29 person-weeks** | - |

### Team Allocation Details

#### Backend/Cloud Engineer (35 days)
- **Weeks 1-2:** Cloud infrastructure setup, environment provisioning
- **Weeks 3-5:** API development, service integration, data pipeline implementation
- **Weeks 6-7:** Integration testing, performance optimization, deployment automation
- **Key Deliverables:**
  - Serverless API infrastructure
  - CI/CD pipeline
  - Monitoring and logging setup
  - Third-party API integration layer

#### Data Engineer (30 days)
- **Weeks 1-2:** Database schema design, data model definition
- **Weeks 3-5:** ETL pipeline implementation, data ingestion automation
- **Weeks 6:** Data quality checks, test data generation
- **Key Deliverables:**
  - Data ingestion pipelines for all sources
  - Normalized data models
  - ETL workflows
  - Data quality framework

#### Data Scientist/ML Engineer (35 days)
- **Weeks 1-2:** Signal logic design, feature engineering
- **Weeks 3-5:** ML model development, training, validation
- **Weeks 6-7:** Model refinement, scoring API, documentation
- **Key Deliverables:**
  - Lead scoring model
  - Liquidity signal detection algorithms
  - Feature engineering pipeline
  - Model performance metrics

#### Frontend Engineer (25 days)
- **Weeks 1:** Design system setup, component library
- **Weeks 2-4:** Dashboard development, UI components
- **Weeks 5:** API integration, testing, refinement
- **Key Deliverables:**
  - RM dashboard application
  - Data visualization components
  - User authentication flow
  - Responsive design implementation

#### Product/Delivery Manager (18 days, 0.4 FTE)
- **Ongoing:** Daily standup facilitation, blocker resolution
- **Weekly:** Stakeholder updates, demo preparation
- **Bi-weekly:** Sprint planning, retrospectives
- **Key Deliverables:**
  - Project timeline management
  - Stakeholder communication
  - Demo presentations
  - Risk mitigation

### Staffing Profile
- **Peak Staffing:** 4-5 FTE during weeks 3-6 (parallel development)
- **Average Staffing:** ~3 FTE across the 9-week period
- **Parallel Work:** Development and testing can occur simultaneously
- **Sequential Work:** ML model development and production-like runs require coordination

---

## 4. Timeline-Aware Cost Summary

The following table summarizes costs over the 9-week POC period:

| Category | Monthly (Low) | Monthly (Expected) | Monthly (High) | 9-Week Total (Low / High) |
|----------|---------------|--------------------|----------------|--------------------------|
| **Cloud Hosting** | $258 | $600 | $1,062 | $581 / $2,206 |
| **Third-Party APIs** | $500 | $950 | $1,470 | $1,129 / $3,088 |
| **Combined Infrastructure (9w)** | - | - | - | **$1,710 / $5,294** |

| **Resource Total** | - | - | - | **29 person-weeks (~143 days)** |

### Cost Calculation Notes
- 9-week period = 2.25 months (approximate)
- Low estimate: Minimal usage, conservative provisioning
- Expected estimate: Moderate usage with standard POC patterns
- High estimate: Maximum quota usage, aggressive testing, full feature set

### Additional Considerations
- **Ramp-up Period:** Weeks 1-2 will have lower cloud costs as infrastructure is being established
- **Peak Usage:** Weeks 4-7 will see maximum cloud resource consumption
- **Wrap-up Period:** Week 8-9 may have reduced API calls as testing concludes

---

## 5. Key Assumptions, Risks & Exclusions

### Exclusions

The following items are **NOT** included in this POC estimate:

- **Production Features:**
  - Real-time trading feeds or market data
  - Regulatory reporting and compliance workflows
  - Disaster recovery and multi-region failover
  - Production hardening and security audits
  - Advanced audit trails for SOC2/ISO compliance
  - Production-grade SSO integration
  - High availability and auto-scaling infrastructure

- **Integration Scope:**
  - No integration with client KYC/AML systems at this stage
  - No proprietary CRM system integration
  - No connection to core banking systems
  - No integration with portfolio management systems

- **Data & Compliance:**
  - No production data migration
  - No full regulatory compliance assessment
  - No data residency or sovereignty requirements
  - No PII data handling beyond test scenarios

### Cost Increasers & Risk Factors

**Infrastructure Risks:**
- Higher than expected third-party API quota needs
- Additional seats or licenses for data providers
- Unplanned ML infrastructure scaling for model experimentation
- Production-grade or non-POC feed requirements from data vendors
- Sudden usage spikes requiring additional capacity
- Extension to multi-region or high availability setup
- Deeper analytics requiring additional compute resources

**Third-Party Data Risks:**
- **Vendor Policy Changes:** API providers may change terms, pricing, or restrict POC-level access without notice
- **Quota Limitations:** Bulk API constraints may limit the volume of data we can process
- **SLA Limitations:** POC-tier access typically has no guaranteed SLA or data refresh schedule
- **Legal/Contractual:** Some data sources may require separate legal agreements or LOIs that could delay access
- **Data Quality:** Inconsistent or incomplete data from providers may require additional processing
- **Access Restrictions:** Some vendors may require production licenses even for POC usage

**Development Risks:**
- **Scope Creep:** Additional feature requests beyond the initial scope
- **Integration Complexity:** Unforeseen challenges in connecting disparate data sources
- **Data Quality Issues:** More time required for data cleansing and normalization
- **ML Model Performance:** Model accuracy may require more iterations than planned
- **Technical Debt:** Rapid POC development may create technical debt requiring refactoring

**Vendor & Negotiation Risks:**
- Vendor negotiation failures or extended procurement timelines
- Pricing changes from providers during POC period
- Minimum commitment requirements from data vendors
- Currency fluctuation impacts (USD/INR exchange rate)
- Payment terms requiring upfront annual commitments

### POC vs Production Cost Multiplier

**Important Note:** Production deployment will significantly increase costs:

- **Infrastructure Costs:** 2-4x increase for production-grade infrastructure
  - High availability and redundancy
  - Multi-region deployment
  - Enhanced security and monitoring
  - Production-grade database instances
  - Real-time feeds and lower-latency requirements

- **Data Costs:** 3-5x increase for production data licenses
  - Real-time market data feeds
  - Higher API quotas and rate limits
  - Enterprise-grade SLAs
  - Production usage tier pricing

- **Operational Costs:** Additional ongoing expenses
  - 24/7 support and on-call rotation
  - Security compliance and audits
  - Backup and disaster recovery
  - Production monitoring and alerting

### Mitigation Strategies

**To manage costs and risks:**

1. **Vendor Management:**
   - Secure POC agreements before starting development
   - Negotiate trial periods or proof-of-value pricing
   - Identify alternative data sources as fallback options
   - Document all API limitations and quota restrictions

2. **Infrastructure Optimization:**
   - Use serverless and pay-per-use services to minimize fixed costs
   - Implement automatic shutdown of non-production resources
   - Monitor usage closely and set up billing alerts
   - Leverage free tiers where available

3. **Scope Control:**
   - Maintain strict POC scope boundaries
   - Document all out-of-scope requests for production phase
   - Conduct weekly scope review meetings
   - Use time-boxing for exploratory work

4. **Technical Risk Mitigation:**
   - Build data abstraction layers for easy provider switching
   - Implement comprehensive error handling for API failures
   - Create mock data sources for development and testing
   - Design modular architecture for easy component replacement

---

## 6. Success Metrics for POC

The following metrics will determine POC success:

### Technical Metrics
- **Data Pipeline Reliability:** >95% uptime for all ingestion pipelines
- **API Response Time:** <500ms for 95th percentile of API calls
- **ML Model Accuracy:** >70% precision on lead scoring validation set
- **Signal Detection Rate:** Identify >80% of known liquidity events in test dataset

### Business Metrics
- **RM Adoption:** >75% of pilot RMs use the dashboard weekly
- **Signal Actionability:** >60% of generated signals result in RM action or note
- **Time Savings:** Estimated 2-4 hours/week saved per RM in research time
- **Lead Quality:** >40% of high-scoring leads progress to engagement stage

### System Metrics
- **Data Freshness:** Signals updated within 24 hours of source availability
- **Dashboard Load Time:** <3 seconds for initial page load
- **Error Rate:** <1% error rate across all system components

---

## 7. Timeline & Milestones

### Week 1-2: Foundation
- Cloud infrastructure provisioned
- Development environments setup
- Database schemas designed
- Initial API integrations started
- **Deliverable:** Working development environment

### Week 3-5: Core Development
- ETL pipelines implemented
- ML models in development
- Dashboard UI development
- API endpoints built
- **Deliverable:** Alpha version with basic functionality

### Week 6-7: Integration & Refinement
- End-to-end integration testing
- ML model refinement
- Dashboard polish and optimization
- Performance tuning
- **Deliverable:** Beta version ready for user testing

### Week 8-9: Testing & Demo
- User acceptance testing with pilot RMs
- Bug fixes and refinements
- Documentation completion
- Demo preparation and stakeholder presentation
- **Deliverable:** POC demonstration and evaluation report

---

## 8. Next Steps & Approvals

### Required Approvals
- [ ] Budget approval from Finance
- [ ] Resource allocation confirmation from Engineering
- [ ] Data vendor POC agreements secured
- [ ] Legal review of third-party data terms
- [ ] Stakeholder sign-off on scope and timeline

### Pre-Development Checklist
- [ ] Cloud accounts provisioned with appropriate limits
- [ ] Team members identified and onboarded
- [ ] Development tools and licenses acquired
- [ ] Access to pilot RM group secured
- [ ] Success criteria formally documented

### Go/No-Go Decision Points
- **Week 2:** Infrastructure setup complete, proceed to development
- **Week 5:** Core functionality validated, proceed to integration
- **Week 7:** Beta testing complete, proceed to final polish

---

## Appendix A: Cost Breakdown by Phase

| Phase | Duration | Cloud Cost | API Cost | Notes |
|-------|----------|-----------|----------|-------|
| Setup (Week 1-2) | 2 weeks | $200-300 | $300-500 | Minimal usage, environment setup |
| Development (Week 3-5) | 3 weeks | $500-900 | $800-1,200 | Peak cloud usage, full API testing |
| Integration (Week 6-7) | 2 weeks | $400-700 | $600-1,000 | Testing and optimization |
| Testing (Week 8-9) | 2 weeks | $300-500 | $400-800 | User testing, reduced dev activity |

---

## Appendix B: Technology Stack Summary

### Frontend
- **Framework:** Next.js 15 with App Router
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Hosting:** Vercel

### Backend
- **API:** Serverless functions (AWS Lambda or Cloud Functions)
- **Language:** TypeScript/Node.js
- **API Gateway:** AWS API Gateway or Cloud Endpoints

### Data Layer
- **Relational:** PostgreSQL (AWS RDS or Cloud SQL)
- **Analytics:** BigQuery or Snowflake
- **Storage:** S3 or Google Cloud Storage
- **Cache:** Redis (if needed)

### ML/AI
- **Platform:** AWS SageMaker or Google Vertex AI
- **Language:** Python
- **Libraries:** scikit-learn, pandas, numpy

### DevOps
- **CI/CD:** GitHub Actions
- **Monitoring:** CloudWatch or Cloud Operations
- **Logging:** CloudWatch Logs or Cloud Logging

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2024 | POC Planning Team | Initial cost estimate document |

---

**Disclaimer:** This estimate is provided for stakeholder planning purposes. Actual costs may vary based on usage patterns, vendor negotiations, and scope changes. This is not a final pricing commitment and will require revision if scale or scope changes significantly.
