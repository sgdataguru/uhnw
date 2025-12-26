# Infrastructure Component Specifications

## 1. Streaming: Amazon MSK (Managed Kafka)

* **Purpose**: Central nervous system for real-time liquidity events and operational logs.
* **Technology**: Apache Kafka 3.x (Provisioned Mode).
* **Configuration**:
  * **Brokers**: 3 (spread across 3 AZs for high availability).
  * **Instance Type**: `kafka.m5.large` (Production), `kafka.t3.small` (Dev).
  * **Storage**: EBS GP3 volumes with auto-scaling enabled.
* **Scalability**: Horizontal scaling of brokers; partition rebalancing.
* **Cost**: High fixed cost; requires reserved instances for production.

## 2. Compute: Amazon EMR (on EKS)

* **Purpose**: Running Spark Streaming and Batch ETL jobs.
* **Technology**: Apache Spark 3.4 on Kubernetes (EKS).
* **Rationale**: EMR on EKS allows sharing compute resources with other apps and faster startup times (<1 min) compared to EC2-based EMR.
* **Configuration**:
  * **Driver**: 2 vCPU, 8GB RAM.
  * **Executor**: Dynamic allocation (Spot Instances for Batch, On-Demand for Streaming).
* **Integration**: Reads from MSK/S3, writes to S3/RDS.

## 3. Storage: Amazon S3 (Data Lake)

* **Purpose**: Durable storage for all data layers.
* **Technology**: S3 Standard + Lifecycle Policies.
* **Structure**:
  * `s3://uhnw-bronze/`: 30-day retention policies.
  * `s3://uhnw-silver/`: Parquet format, Snappy compression.
  * `s3://uhnw-gold/`: Optimized for read-heavy query patterns (partitioned by Date/Region).
* **Cost**: Low storage cost; optimized by transitioning old data to Glacier Instant Retrieval.

## 4. Metadata: Amazon RDS

* **Purpose**: Transactional store for Application state and User Profiles.
* **Technology**: PostgreSQL 15 (Aurora Serverless v2).
* **Rationale**: Serverless v2 scales compute down to 0.5 ACU during nights/weekends to save costs.
* **Scalability**: Auto-scaling read replicas for high dashboard load.
