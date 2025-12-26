# Operations & Observability

## 1. Monitoring & Logging

* **CloudWatch Logs**: Central repository for all application and system logs.
  * Retention: 30 days (Hot), archived to S3 afterwards.
* **CloudWatch Metrics**:
  * **MSK**: Consumer Lag, Disk Usage.
  * **EMR**: Container Failures, Heap Usage.
  * **RDS**: CPU Utilization, DB Connections.
* **Alerting**:
  * **High Severity (PagerDuty)**: MSK Broker down, Consumer Lag > 10 mins.
  * **Low Severity (Email/Slack)**: S3 Bucket growth spike, daily batch job failure.

## 2. Disaster Recovery (DR)

* **RPO (Recovery Point Objective)**: 15 minutes (Database backups), 24 hours (S3 Data Lake).
* **RTO (Recovery Time Objective)**: 4 hours.
* **Strategy**:
  * **RDS**: Automated daily snapshots + continuous WAL archiving (PITR).
  * **S3**: Cross-Region Replication (CRR) to `ap-south-2` (Hyderabad) for critical Gold datasets.
  * **IaC**: Entire infrastructure re-deployable via Terraform in disaster region.

## 3. CI/CD Pipeline Design

* **Source Control**: GitHub (Branch-per-feature workflow).
* **Pipeline Stages**:
    1. **Lint/Test**: Checks Python/Terraform code quality.
    2. **Plan (Staging)**: `terraform plan` on Staging environment.
    3. **Apply (Staging)**: Auto-deploy to Staging.
    4. **Integration Test**: Run end-to-end data pipeline test suite.
    5. **Promote**: Manual approval gate for Production deploy.

## 4. Cost Optimization

* **Spot Instances**: Use EC2 Spot for Stateless Spark Executors (~60% savings).
* **S3 Intelligent Tiering**: Automatically move infrequent data to cheaper storage classes.
* **Auto-Stop**: Dev environments (RDS, EKS) scheduled to stop during non-business hours (8 PM - 8 AM).
