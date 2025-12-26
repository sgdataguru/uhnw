# Network Security & Topology

## 1. Network Topology

* **VPC CIDR**: `10.16.0.0/16` (Allows 65k IPs).
* **Subnet Strategy (Multi-AZ)**:
  * **Public (DMZ)**: `10.16.1.0/24` (ALB, NAT Gateway).
  * **Private App**: `10.16.10.0/24` (EKS Nodes, Lambda).
  * **Private Data**: `10.16.20.0/24` (RDS, MSK, Elasticache).
* **Routing**:
  * Private subnets route outbound internet traffic via NAT Gateway (for API calls to Bloomberg/Reuters).
  * No direct inbound internet access to Private subnets.

## 2. Firewall & Security Groups

* **SG-Public-ALB**: Allow Inbound 443 (HTTPS) from Everywhere (`0.0.0.0/0`).
* **SG-Private-App**: Allow Inbound 8080 from SG-Public-ALB.
* **SG-Data-RDS**: Allow Inbound 5432 ONLY from SG-Private-App.
* **SG-Data-MSK**: Allow Inbound 9092 ONLY from SG-Private-App.

## 3. Private Connectivity

* **S3 Gateway Endpoint**: Allows traffic to S3 buckets to stay on the AWS backbone, bypassing public internet (lower cost, higher security).
* **Secrets Manager Interface Endpoint**: Secure retrieval of API keys without internet access.
* **VPN**: AWS Client VPN for Developers to access RDS/MSK dashboards securely from local machines.

## 4. DNS Strategy

* **Route53 Private Zone**: Internal DNS resolution (e.g., `db.internal.uhnw.com` resolves to RDS private IP).
