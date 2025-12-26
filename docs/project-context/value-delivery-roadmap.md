# Value Delivery Roadmap: UHNW Data Platform

## 1. Overview & Phasing Philosophy

This roadmap outlines the phased execution of the Data Platform Strategy. Our delivery is guided by the **"Crawl, Walk, Run"** philosophy, prioritizing end-to-end value delivery over "big bang" infrastructure builds.

**Principles**:

* **Value First**: Phase 1 delivers usable alerts, not just empty plumbing.
* **Vertical Slices**: Each phase implements specific use cases (Ingest -> Process -> Serve) completely.
* **Learn & Adapt**: Feedback from RMs on Phase 1 alerts will tune the ML models for Phase 2.

## 2. Phase Definitions

### Phase 1: Foundation & "Speed to Signal"

**Strategic Objectives**: Establish the core Event-Driven Architecture and deliver the first set of "Hard Signal" alerts (IPOs, Mergers) to RMs.

**Key Capabilities**:

* **Infra**: AWS VPC, MSK (Kafka), S3 Base Layers, IAM Security.
* **Ingestion**: Connectors for 2 major Financial APIs (e.g., Bloomberg/BSE feed).
* **Processing**: Simple rule-based filtering (e.g., "If Company X in Portfolio announces IPO -> Alert").
* **Serving**: "Latest Alerts" widget on RM Dashboard.

**Business Value**:

* **Immediate Visibility**: RMs see public market events for their clients in one place.
* **Time Savings**: Eliminates manual checking of news portals for major listed clients.
* **Metric**: Alert Latency < 15 mins.

**Dependencies**:

* AWS Account Setup (Terraform).
* Procurement of Financial Data API keys.

**Estimated Timeline**: Weeks 1-6

---

### Phase 2: Intelligence & "Soft Signals"

**Strategic Objectives**: Move beyond simple rules to AI-driven insights. Detect "Soft Signals" (e.g., management changes, rumors) via unstructured text analysis.

**Key Capabilities**:

* **AI/ML service**: NER (Named Entity Recognition) to map news articles to Client Portfolios.
* **GenAI**: LLM-generated summaries of news events ("Why this matters for your client").
* **Notification**: Push notifications (Mobile/Email) for high-urgency events.
* **Data Quality**: Automated "Silver Layer" validation rules active.

**Business Value**:

* **Differentiation**: RMs get insights that aren't obvious from public headlines.
* **Actionability**: Pre-written talking points allow RMs to react instantly.
* **Metric**: RM Engagement Rate (Open Rate of alerts).

**Dependencies**:

* Phase 1 Ingestion stable.
* Validation of LLM models on historical data.

**Estimated Timeline**: Weeks 7-12

---

### Phase 3: Scale & Integration

**Strategic Objectives**: Deepen integration with RM workflows and expand data coverage to private markets/niche sources.

**Key Capabilities**:

* **CRM 2-Way Sync**: Alerts logged as "interactions" in Salesforce/CRM.
* **Niche Sources**: Custom scrapers for Indian specialized sites (Private Equity news, Legal databases).
* **Advanced Analytics**: "Likelihood to Transact" scoring based on historical patterns.
* **Self-Service**: BI Dashboard overlay for Execs to view "Opportunity Pipeline".

**Business Value**:

* **Workflow Integration**: Zero friction; alerts are part of the daily CRM capability.
* **Coverage**: Visibility into the private market (where true UHNW wealth often sits).
* **Metric**: Conversion Rate (Alert -> Meeting Booked).

**Estimated Timeline**: Weeks 13-20

## 3. Cross-Phase Dependencies

* **Data Governance**: Must be defined in Phase 1 (Tags, PII rules) to prevent "Data Swamp" in Phase 3.
* **RM Feedback Loop**: Phase 2 AI models require "thumbs up/down" feedback from Phase 1 to improve accuracy.
* **API Costs**: Monitoring API usage in Phase 1 is crucial to forecast Phase 3 budgets as volume scales.

## 4. Value Milestones

| Milestone | Description | Est. Timing |
|-----------|-------------|-------------|
| **M1: Hello World** | Infrastructure Up, First "Hello World" message through Kafka to S3 | Week 2 |
| **M2: First Alert** | End-to-end flow: Mock Market Event -> Dashboard UI | Week 4 |
| **M3: Alpha Release** | Phase 1 Go-Live with Pilot Group of 5 RMs | Week 6 |
| **M4: AI Integration** | LLM Summaries active in Staging | Week 9 |
| **M5: Beta Release** | Phase 2 Go-Live (AI features) to all RMs | Week 12 |
| **M6: Full Launch** | Phase 3 Complete (CRM Sync + Mobile Push) | Week 20 |
