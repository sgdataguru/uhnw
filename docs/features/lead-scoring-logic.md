# Lead Scoring Logic: "Likelihood to Transact"

## Overview

The platform assigns a "Lead Score" (0-100) to every UHNW client, representing their propensity to engage in a wealth management transaction or their immediate liquidity potential. This score allows Relationship Managers (RMs) to prioritize their outreach efforts.

## The Algorithm

The score is calculated by summing the weighted contributions of all detected "Signals" (Market Events) for a specific client.

**Formula:**

```math
LeadScore = Normalize( \sum_{i=1}^{n} (Severity_i \times Weight_i \times RecencyFactor_i \times Confidence_i) )
```

### Components

1. **Severity Score** (`Severity`):
    * Derived from the magnitude of the event.
    * `Critical` = 100 (e.g., IPO confirmed)
    * `High` = 75 (e.g., Board Approval for M&A)
    * `Medium` = 50 (e.g., Regulatory rumor)
    * `Low` = 25 (e.g., Sector trend match)

2. **Signal Weight** (`Weight`):
    * Relative importance of the event type (defined in `lib/scoring/calculate-score.ts`).
    * **IPO**: 0.30 (Highest Impact)
    * **Acquisition/Merger**: 0.25
    * **Open Offer**: 0.22 (Tender offer -> Immediate Cash)
    * **Funding**: 0.20
    * **Stock Split**: 0.10
    * **Board Change**: 0.10

3. **Recency Factor** (`RecencyFactor`):
    * A time-decay function. Events lose value as they age.
    * Day 0-7: 1.0 (100% impact)
    * Day 8-30: 0.8
    * Day 30+: < 0.5

4. **Confidence Score** (`Confidence`):
    * Reliability of the data source (0.0 - 1.0).
    * **NSE/BSE Filings**: 0.99
    * **Bloomberg/Reuters**: 0.90
    * **News Scraper**: 0.60 - 0.80 (varies by source trust)

## Categorization

Final scores are normalized to a 0-100 range and categorized:

| Category | Score Range | Meaning | Suggested Action |
|----------|-------------|---------|------------------|
| **HOT** 🔥 | **80 - 100** | Imminent Liquidity Event. | **Call Immediately**. Priority 1. |
| **WARM** 🌤 | **50 - 79** | Strong Signals / Recent Activity. | Schedule meeting this week. |
| **COLD** ❄️ | **0 - 49** | No major recent events. | Nurture / periodic check-in. |

## Implementation

* **Logic Location**: `lib/scoring/calculate-score.ts`
* **Trigger**: Scores are recalculated whenever a new `Signal` is ingested via the Data Pipeline (Kafka -> Spark -> RDS).
* **Expiration**: Scores are valid for 24 hours before requiring re-evaluation (or simpler decay update).
