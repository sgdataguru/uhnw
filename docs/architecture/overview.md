# Data Platform Architecture Overview

## 1. Executive Summary

The UHNW Data Platform is an **Event-Driven Lakehouse** designed to process market signals and client data in real-time. By leveraging AWS managed services, the platform provides Relationship Managers (RMs) with sub-second alert latency regarding critical wealth events, enabling a shift from reactive to proactive client engagement.

## 2. High-Level Architecture

```mermaid
graph TD
    subgraph "Ingestion Layer"
        NewsAPI[News APIs] -->|JSON/Stream| MSK[AWS MSK (Kafka)]
        MarketData[Market Data] -->|Ticks| MSK
        CRM[Salesforce] -->|CDC Event| MSK
        WebScraper[Niche Scrapers] -->|Raw HTML| S3Raw[S3 Bronze (Raw)]
    end

    subgraph "Processing Layer"
        MSK -->|Stream| SparkStreaming[EMR Spark Streaming]
        SparkStreaming -->|Micro-batch| S3Silver[S3 Silver (Clean)]
        S3Raw -->|Batch ETL| Glue[AWS Glue]
        Glue --> S3Silver
        
        S3Silver -->|Transformation| SparkBatch[EMR Spark Batch]
        SparkBatch --> S3Gold[S3 Gold (Aggregated)]
    end

    subgraph "Intelligence Layer"
        S3Silver -->|Training Data| SageMaker[SageMaker Training]
        SageMaker -->|Model Artifact| LambdaInference[Lambda Inference]
        LambdaInference -->|Enriched Event| MSK
    end

    subgraph "Consumption Layer"
        S3Gold -->|Meta Sync| RDS[RDS PostgreSQL]
        RDS -->|API| GraphQL
        MSK -->|Real-time Alert| WebSocket
        GraphQL --> WebApp[RM Workstation]
        WebSocket --> WebApp
    end
```

## 3. Major Components

* **Ingestion**: Hybrid model supporting high-frequency streams (Kafka) and large bulk uploads (S3 Direct).
* **Lakehouse Storage**: S3-based storage layers (Bronze/Silver/Gold) managed via Glue Catalog.
* **Compute Engine**: EMR (Spark) for heavy transformations; Lambda for lightweight, event-driven triggers.
* **Serving**: Relational data served via RDS; unstructured/search data via OpenSearch (optional).

## 4. Key Design Principles

1. **Decoupling**: Producers write to Kafka topics, unaware of consumers.
2. **Immutability**: Raw data in Bronze layer is never overwritten, only appended.
3. **Schema Enforcement**: All streams validated against Avro schemas registry before ingestion.
4. **Serverless Preference**: Managed services (MSK Serverless, Aurora Serverless) prioritized to reduce ops overhead.
