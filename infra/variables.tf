variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1" # Mumbai region for Data Residency compliance
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "uhnw-platform"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}
