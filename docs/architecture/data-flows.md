# End-to-End Data Flows

## 1. Real-Time Alert Flow (Hot Path)

**Goal**: Deliver "Breaking News" to RMs within seconds.

1. **Source**: News Provider API pushes webhook or is polled.
2. **Ingestion**: Event published to Kafka Topic `raw-news-events`.
3. **Processing**:
    * Spark Streaming job consumes `raw-news-events`.
    * Performs **Entity Resolution** (Matches "Amit Saxena" to Client ID `UHNW-102`).
    * Filters relevance score > 0.8.
4. **Enrichment**:
    * Call to SageMaker endpoint to summarize article.
    * Enriched payload published to `enriched-alerts` topic.
5. **Consumption**:
    * WebSocket service consumes `enriched-alerts`.
    * Pushes notification to RM's frontend session.

## 2. Portfolio Analysis Flow (Cold Path)

**Goal**: Update "Portfolio Health" dashboard daily.

1. **Source**: Core Banking System exports EOD positions csv.
2. **Ingestion**: File uploaded to S3 Bucket `s3://data-lake-bronze/positions/date=2025-01-01/`.
3. **Processing**:
    * AWS Glue Trigger starts nightly batch job.
    * Reads CSV, validates schema, converts to Parquet.
    * Writes to `s3://data-lake-silver/positions/`.
4. **Aggregation**:
    * Spark Aggregation job joins Positions + Market Price.
    * Calculates "Daily P&L".
    * Writes to `s3://data-lake-gold/client-metrics/`.
5. **Consumption**:
    * RDS Sync job loads Gold data into `client_metrics` table.
    * Dashboard API queries RDS.

## 3. Storage Strategy

| Layer | Storage Type | Format | Retention | Access Pattern |
|-------|--------------|--------|-----------|----------------|
| **Hot** | Kafka / Redis | Binary / JSON | 7 Days | Streaming / PubSub |
| **Warm** | S3 Standard | Parquet / Iceberg | 1 Year | Interactive Query (Presto/Athena) |
| **Cold** | S3 Glacier | Compressed JSON | 7 Years | Compliance Audit / Model Retraining |

## 4. Consumption Layers

* **Operational**: REST API (Node.js) serving User Profile and Alert History from RDS.
* **Analytical**: AWS Athena used by Data Analysts for ad-hoc SQL queries on S3 Silver/Gold.
* **Real-Time**: WebSocket server pushing live market ticks and alerts.
