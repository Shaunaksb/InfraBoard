import { BoardTemplate } from "@/types/kanban";

export const TAG_COLORS = [
  { name: "Teal", value: "172 66% 40%" },
  { name: "Blue", value: "210 80% 55%" },
  { name: "Green", value: "152 60% 42%" },
  { name: "Orange", value: "25 95% 55%" },
  { name: "Red", value: "0 72% 55%" },
  { name: "Purple", value: "270 60% 55%" },
  { name: "Pink", value: "330 70% 55%" },
  { name: "Yellow", value: "45 95% 50%" },
];

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: "aws-infra",
    name: "AWS Cloud Infrastructure",
    description: "Provision EKS, IAM, and S3 on AWS with Terraform",
    icon: "☁️",
    columns: ["AWS Terraform", "Kubernetes Deploy", "GitHub Actions CI"],
    fields: [
      { id: "cluster_name", name: "Cluster Name", type: "text", placeholder: "prod-cluster" },
      { id: "region", name: "AWS Region", type: "text", placeholder: "us-east-1" },
      { id: "instance_type", name: "Instance Type", type: "select", options: ["t3.small", "t3.medium", "t3.large", "m5.xlarge"] },
      { id: "environment", name: "Environment", type: "select", options: ["dev", "staging", "production"] },
    ],
    tags: [
      { id: "aws", name: "AWS", color: "30 90% 55%" },
      { id: "iac", name: "IaC", color: "150 70% 50%" },
    ],
  },
  {
    id: "gcp-infra",
    name: "GCP Cloud Infrastructure",
    description: "Provision GKE, Cloud SQL on GCP with Terraform",
    icon: "☁️",
    columns: ["GCP Terraform", "Kubernetes Deploy", "Prometheus Monitoring"],
    fields: [
      { id: "project_id", name: "GCP Project ID", type: "text", placeholder: "my-gcp-project" },
      { id: "cluster_name", name: "Cluster Name", type: "text", placeholder: "prod-cluster" },
      { id: "region", name: "GCP Region", type: "text", placeholder: "us-central1" },
      { id: "machine_type", name: "Machine Type", type: "select", options: ["e2-small", "e2-standard-2", "e2-standard-4", "n1-standard-4"] },
      { id: "environment", name: "Environment", type: "select", options: ["dev", "staging", "production"] },
    ],
    tags: [
      { id: "gcp", name: "GCP", color: "210 70% 55%" },
      { id: "iac", name: "IaC", color: "150 70% 50%" },
    ],
  },
  {
    id: "azure-infra",
    name: "Azure Cloud Infrastructure",
    description: "Provision AKS, Resource Groups, and Storage on Azure with Terraform",
    icon: "☁️",
    columns: ["Azure Terraform", "Kubernetes Deploy", "GitHub Actions CI"],
    fields: [
      { id: "app_name", name: "App Name", type: "text", placeholder: "my-azure-app" },
      { id: "resource_group", name: "Resource Group", type: "text", placeholder: "rg-myapp" },
      { id: "location", name: "Location", type: "text", placeholder: "eastus" },
      { id: "vm_size", name: "VM Size", type: "select", options: ["Standard_DS2_v2", "Standard_DS3_v2", "Standard_D2s_v3"] },
      { id: "environment", name: "Environment", type: "select", options: ["dev", "staging", "production"] },
    ],
    tags: [
      { id: "azure", name: "Azure", color: "200 90% 50%" },
      { id: "iac", name: "IaC", color: "150 70% 50%" },
    ],
  },
  {
    id: "container-app",
    name: "Containerized Web App",
    description: "Standard Docker image built and deployed via CI/CD",
    icon: "📦",
    columns: ["Docker Build", "Terraform Infra", "GitHub Actions Deploy"],
    fields: [
      { id: "environment", name: "Environment", type: "select", options: ["Production", "Staging", "Development"] },
      { id: "owner", name: "Owner", type: "text", placeholder: "Responsible team" },
    ],
    tags: [
      { id: "frontend", name: "Frontend", color: "210 80% 60%" },
      { id: "backend", name: "Backend", color: "150 70% 50%" },
    ],
  },
  {
    id: "serverless",
    name: "Serverless Infrastructure",
    description: "Provision and deploy cloud-native serverless components",
    icon: "⚡",
    columns: ["Terraform Base", "GitHub Actions CI", "Terraform App"],
    fields: [
      { id: "region", name: "Cloud Region", type: "text", placeholder: "us-east-1" },
      { id: "runtime", name: "Runtime", type: "select", options: ["Node.js", "Python", "Go"] },
    ],
    tags: [
      { id: "api", name: "API Gateway", color: "45 90% 55%" },
      { id: "db", name: "Database", color: "280 60% 60%" },
    ],
  },
  {
    id: "k8s-full-stack",
    name: "Kubernetes Full Stack",
    description: "Docker build → K8s deploy with Prometheus & Grafana monitoring",
    icon: "🏗️",
    columns: ["Docker Build", "Kubernetes Deploy", "Prometheus Alerts", "Grafana Dashboard"],
    fields: [
      { id: "app_name", name: "App Name", type: "text", placeholder: "my-app" },
      { id: "environment", name: "Environment", type: "select", options: ["dev", "staging", "production"] },
      { id: "namespace", name: "K8s Namespace", type: "text", placeholder: "default" },
    ],
    tags: [
      { id: "k8s", name: "Kubernetes", color: "210 80% 60%" },
      { id: "monitoring", name: "Monitoring", color: "45 90% 55%" },
    ],
  },
];

export const EMPTY_BOARD_CONFIG = {
  id: "custom",
  name: "Custom Board",
  description: "Start from scratch with your own configuration",
  icon: "🛠️",
  columns: [],
  fields: [],
  tags: [],
};
