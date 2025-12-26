# Risk & Constraint Register: UHNW Data Platform

## 1. Overview

This register tracks the boundaries and potential pitfalls of the Data Platform strategy. It is a living document owned by the Lead Architect and reviewed bi-weekly during the implementation phase.

## 2. Risk Register

| Risk ID | Risk Description | Likelihood | Impact | Mitigation Strategy | Owner | Phase |
|---------|------------------|------------|--------|---------------------|-------|-------|
| **R-001** | **API Rate Limits/Cost**: Financial APIs (Bloomberg/Reuters) have strict limits and high overage costs. | High | High | Implement "Smart Polling" (adaptive frequency) and aggressive caching layer. | Data Eng | Ph 1 |
| **R-002** | **"False Positive" Fatigue**: AI generates too many irrelevant alerts, causing RMs to ignore the platform. | Medium | Critical | Users can "Start Quiet" (High confidence threshold only). Mandatory RLHF (Feedback loop) from RMs. | Product | Ph 2 |
| **R-003** | **Data Residency Breach**: PII accidentally leaking to US region via Global LLM APIs. | Low | High | Use "Private Link" to Azure OpenAI/Bedrock in India region or host Open Source LLM (Llama 2) in VPC. | SecOps | Ph 2 |
| **R-004** | **Adoption Resistance**: Senior RMs prefer their "gut feel" and old networks over AI. | High | Medium | Involve "Champion RMs" in design. Show "Win Stories" (e.g., "RM X closed this deal because of this alert"). | Change Mgmt | Ph 3 |
| **R-005** | **Entity Resolution Failure**: Confusing "Amit Saxena" (Client) with "Amit Saxena" (Random person in news). | Medium | High | Use Graph Identity Resolution combining Name + Context (Company, Location, Age). | Data Sci | Ph 2 |
| **R-006** | **Niche Source Blocking**: Scrapers for Indian legal/SME sites getting blocked. | High | Medium | diverse IP rotation proxies; Negotiate official API access where possible. | Data Eng | Ph 3 |

## 3. Assumptions

**A-001**: **News API Reliability**: We assume commercial news APIs will provide structured metadata (Ticker, Person Tags) with >70% accuracy.
**A-002**: **Cloud Availability**: We assume AWS Mumbai (ap-south-1) has capacity for all required GPU instances (for LLM inference if self-hosted).
**A-003**: **CRM Access**: We assume we will be granted API access to the internal Salesforce/CRM instance by Week 8 (Phase 3 dependency).
**A-004**: **Mobile Reachability**: RMs will have corporate devices capable of receiving Push Notifications.

## 4. Constraints

**C-001**: **Regulatory (DPDP)**: All "Client" Data must reside physically within Indian borders. No egress to international regions allowed.
**C-002**: **Budget**: Initial infrastructure spend capped at $X,000/month. "Serverless First" approach required to minimize idle costs.
**C-003**: **Tech Stack**: Must use **Terraform** for IaC and **AWS** as the provider (Organizational Standard).
**C-004**: **Authentication**: Must integrate with existing Enterprise SSO (Active Directory/Okta) - no separate user database for RMs.

## 5. Risk Monitoring & Review

* **Review Cycle**: Bi-weekly during Sprint Planning.
* **Escalation**: Risks with "Critical" impact or realized issues are escalated to the Steering Committee immediately.
* **Retirement**: Risks are closed when the Mitigation Strategy is fully implemented and verified (e.g., "R-003 closed after Private Link setup verified").
