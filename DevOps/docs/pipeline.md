# CI/CD Pipeline Documentation

## Overview

This project uses **GitHub Actions** for Continuous Integration and Continuous Deployment.

## Workflows

### 1. Terraform Infrastructure

* **File**: `DevOps/pipeline/terraform.yml`
* **Triggers**: Push to `main`, Pull Requests affecting `infra/`
* **Steps**:
    1. **Format Check**: Ensures code follows canonical format (`terraform fmt`).
    2. **Validation**: Verifies configuration syntax (`terraform validate`).
    3. **Plan** (Future): Generates execution plan on PRs.
    4. **Apply** (Future): Applies changes on merge to `main`.

## Secrets

To run this pipeline, the following secrets must be configured in GitHub:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
