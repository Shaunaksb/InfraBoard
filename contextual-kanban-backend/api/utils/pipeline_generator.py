"""
DevOps Pipeline Generator
Renders configuration files for each tool_type using Jinja2 templates.
config_data comes from Card.config_data (JSONField).
"""
from jinja2 import Environment, BaseLoader, StrictUndefined

env = Environment(
    loader=BaseLoader(),
    undefined=StrictUndefined,
    trim_blocks=True,
    lstrip_blocks=True,
)

# ─────────────────────────────────────────────────────────────
# BASE IMAGE REGISTRY
# Each entry is keyed by the full Docker Hub tag.
# To add a new base image: add one entry here — no other file needs to change.
# ─────────────────────────────────────────────────────────────

BASE_IMAGES = {
    # ── Python ──────────────────────────────────────────────
    'python:3.12': {
        'label': 'Python 3.12',
        'family': 'python',
        'variant': 'full',
        'package_manager': 'apt',
        'install_cmd': 'apt-get update && apt-get install -y --no-install-recommends {packages} && rm -rf /var/lib/apt/lists/*',
        'default_port': 8000,
        'setup_cmds': [
            'COPY requirements.txt .',
            'RUN pip install --no-cache-dir -r requirements.txt',
        ],
        'default_cmd': '["python", "manage.py", "runserver", "0.0.0.0:8000"]',
    },
    'python:3.12-slim': {
        'label': 'Python 3.12 Slim',
        'family': 'python',
        'variant': 'slim',
        'package_manager': 'apt',
        'install_cmd': 'apt-get update && apt-get install -y --no-install-recommends {packages} && rm -rf /var/lib/apt/lists/*',
        'default_port': 8000,
        'setup_cmds': [
            'COPY requirements.txt .',
            'RUN pip install --no-cache-dir -r requirements.txt',
        ],
        'default_cmd': '["python", "manage.py", "runserver", "0.0.0.0:8000"]',
    },
    'python:3.12-alpine': {
        'label': 'Python 3.12 Alpine',
        'family': 'python',
        'variant': 'alpine',
        'package_manager': 'apk',
        'install_cmd': 'apk add --no-cache {packages}',
        'default_port': 8000,
        'setup_cmds': [
            'COPY requirements.txt .',
            'RUN pip install --no-cache-dir -r requirements.txt',
        ],
        'default_cmd': '["python", "manage.py", "runserver", "0.0.0.0:8000"]',
    },
    # ── Node ────────────────────────────────────────────────
    'node:22': {
        'label': 'Node.js 22',
        'family': 'node',
        'variant': 'full',
        'package_manager': 'apt',
        'install_cmd': 'apt-get update && apt-get install -y --no-install-recommends {packages} && rm -rf /var/lib/apt/lists/*',
        'default_port': 3000,
        'setup_cmds': [
            'COPY package*.json ./',
            'RUN npm ci --omit=dev',
        ],
        'default_cmd': '["node", "index.js"]',
    },
    'node:22-slim': {
        'label': 'Node.js 22 Slim',
        'family': 'node',
        'variant': 'slim',
        'package_manager': 'apt',
        'install_cmd': 'apt-get update && apt-get install -y --no-install-recommends {packages} && rm -rf /var/lib/apt/lists/*',
        'default_port': 3000,
        'setup_cmds': [
            'COPY package*.json ./',
            'RUN npm ci --omit=dev',
        ],
        'default_cmd': '["node", "index.js"]',
    },
    'node:22-alpine': {
        'label': 'Node.js 22 Alpine',
        'family': 'node',
        'variant': 'alpine',
        'package_manager': 'apk',
        'install_cmd': 'apk add --no-cache {packages}',
        'default_port': 3000,
        'setup_cmds': [
            'COPY package*.json ./',
            'RUN npm ci --omit=dev',
        ],
        'default_cmd': '["node", "index.js"]',
    },
    # ── Go ──────────────────────────────────────────────────
    'golang:1.22': {
        'label': 'Go 1.22',
        'family': 'golang',
        'variant': 'full',
        'package_manager': 'apt',
        'install_cmd': 'apt-get update && apt-get install -y --no-install-recommends {packages} && rm -rf /var/lib/apt/lists/*',
        'default_port': 8080,
        'setup_cmds': [
            'COPY go.mod go.sum ./',
            'RUN go mod download',
            'COPY . .',
            'RUN go build -o /app/server .',
        ],
        'default_cmd': '["/app/server"]',
    },
    'golang:1.22-alpine': {
        'label': 'Go 1.22 Alpine',
        'family': 'golang',
        'variant': 'alpine',
        'package_manager': 'apk',
        'install_cmd': 'apk add --no-cache {packages}',
        'default_port': 8080,
        'setup_cmds': [
            'COPY go.mod go.sum ./',
            'RUN go mod download',
            'COPY . .',
            'RUN go build -o /app/server .',
        ],
        'default_cmd': '["/app/server"]',
    },
    # ── OpenJDK ─────────────────────────────────────────────
    'openjdk:21-slim': {
        'label': 'OpenJDK 21 Slim',
        'family': 'openjdk',
        'variant': 'slim',
        'package_manager': 'apt',
        'install_cmd': 'apt-get update && apt-get install -y --no-install-recommends {packages} && rm -rf /var/lib/apt/lists/*',
        'default_port': 8080,
        'setup_cmds': [
            'COPY pom.xml .',
            'RUN mvn dependency:go-offline -B',
            'COPY src ./src',
            'RUN mvn package -DskipTests',
        ],
        'default_cmd': '["java", "-jar", "target/app.jar"]',
    },
    'openjdk:21-alpine': {
        'label': 'OpenJDK 21 Alpine',
        'family': 'openjdk',
        'variant': 'alpine',
        'package_manager': 'apk',
        'install_cmd': 'apk add --no-cache {packages}',
        'default_port': 8080,
        'setup_cmds': [
            'COPY pom.xml .',
            'RUN mvn dependency:go-offline -B',
            'COPY src ./src',
            'RUN mvn package -DskipTests',
        ],
        'default_cmd': '["java", "-jar", "target/app.jar"]',
    },
    # ── Ruby ────────────────────────────────────────────────
    'ruby:3.3-slim': {
        'label': 'Ruby 3.3 Slim',
        'family': 'ruby',
        'variant': 'slim',
        'package_manager': 'apt',
        'install_cmd': 'apt-get update && apt-get install -y --no-install-recommends {packages} && rm -rf /var/lib/apt/lists/*',
        'default_port': 3000,
        'setup_cmds': [
            'COPY Gemfile Gemfile.lock ./',
            'RUN bundle install --without development test',
        ],
        'default_cmd': '["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]',
    },
    'ruby:3.3-alpine': {
        'label': 'Ruby 3.3 Alpine',
        'family': 'ruby',
        'variant': 'alpine',
        'package_manager': 'apk',
        'install_cmd': 'apk add --no-cache {packages}',
        'default_port': 3000,
        'setup_cmds': [
            'COPY Gemfile Gemfile.lock ./',
            'RUN bundle install --without development test',
        ],
        'default_cmd': '["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]',
    },
    # ── Rust ────────────────────────────────────────────────
    'rust:1.76-slim': {
        'label': 'Rust 1.76 Slim',
        'family': 'rust',
        'variant': 'slim',
        'package_manager': 'apt',
        'install_cmd': 'apt-get update && apt-get install -y --no-install-recommends {packages} && rm -rf /var/lib/apt/lists/*',
        'default_port': 8080,
        'setup_cmds': [
            'COPY Cargo.toml Cargo.lock ./',
            'RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm src/main.rs',
            'COPY src ./src',
            'RUN cargo build --release',
        ],
        'default_cmd': '["./target/release/app"]',
    },
    # ── PHP ─────────────────────────────────────────────────
    'php:8.3-fpm-alpine': {
        'label': 'PHP 8.3 FPM Alpine',
        'family': 'php',
        'variant': 'alpine',
        'package_manager': 'apk',
        'install_cmd': 'apk add --no-cache {packages}',
        'default_port': 9000,
        'setup_cmds': [
            'COPY composer.json composer.lock ./',
            'RUN composer install --no-dev --optimize-autoloader',
        ],
        'default_cmd': '["php-fpm"]',
    },
    # ── Alpine (generic) ────────────────────────────────────
    'alpine:latest': {
        'label': 'Alpine Linux (latest)',
        'family': 'alpine',
        'variant': 'alpine',
        'package_manager': 'apk',
        'install_cmd': 'apk add --no-cache {packages}',
        'default_port': 8080,
        'setup_cmds': [
            'COPY . .',
        ],
        'default_cmd': '["/bin/sh"]',
    },
}

_FALLBACK_IMAGE = 'python:3.12-slim'


def get_base_image_options():
    """Return [{"value": tag, "label": label}, ...] for use in config_field selects."""
    return [{'value': tag, 'label': meta['label']} for tag, meta in BASE_IMAGES.items()]


# ─────────────────────────────────────────────────────────────
# DOCKER
# ─────────────────────────────────────────────────────────────

DOCKERFILE_TMPL = """\
FROM {{ _image_meta.base_image }}

WORKDIR /app

{% if _image_meta.extra_deps %}
RUN {{ _image_meta.install_cmd }}
{% endif %}

{% for cmd in _image_meta.setup_cmds %}
{{ cmd }}
{% endfor %}

{% if _image_meta.family not in ('golang', 'rust') %}
COPY . .
{% endif %}

EXPOSE {{ expose_port | default(_image_meta.default_port) }}

{% if healthcheck_path is defined %}
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:{{ expose_port | default(_image_meta.default_port) }}{{ healthcheck_path }} || exit 1
{% endif %}

{% if entrypoint is defined and entrypoint %}
CMD ["{{ entrypoint }}", "{{ entrypoint_args | default('') }}"]
{% else %}
CMD {{ _image_meta.default_cmd }}
{% endif %}
"""

DOCKER_COMPOSE_TMPL = """\
version: '3.9'

services:
  app:
    build: .
    image: {{ image_name | default('app') }}:{{ image_tag | default('latest') }}
    ports:
      - "{{ expose_port | default(8000) }}:{{ expose_port | default(8000) }}"
    environment:
      - DJANGO_ENV={{ environment | default('development') }}
    {% if include_db | default(false) %}
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: {{ db_name | default('app_db') }}
      POSTGRES_USER: {{ db_user | default('postgres') }}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    {% endif %}
    {% if include_redis | default(false) %}
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    {% endif %}

{% if include_db | default(false) %}
volumes:
  postgres_data:
{% endif %}
"""

DOCKERIGNORE_TMPL = """\
__pycache__/
*.pyc
*.pyo
.env
.env.*
.git
.gitignore
.venv
node_modules/
dist/
*.log
"""

# ─────────────────────────────────────────────────────────────
# KUBERNETES
# ─────────────────────────────────────────────────────────────

K8S_DEPLOYMENT_TMPL = """\
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ app_name | default('app') }}
  namespace: {{ namespace | default('default') }}
  labels:
    app: {{ app_name | default('app') }}
    environment: {{ environment | default('dev') }}
spec:
  replicas: {{ replicas | default(2) }}
  selector:
    matchLabels:
      app: {{ app_name | default('app') }}
  template:
    metadata:
      labels:
        app: {{ app_name | default('app') }}
      {% if enable_prometheus_scrape | default(false) %}
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "{{ expose_port | default(8000) }}"
        prometheus.io/path: "{{ metrics_path | default('/metrics') }}"
      {% endif %}
    spec:
      containers:
        - name: {{ app_name | default('app') }}
          image: {{ image_repo | default('myapp') }}:{{ image_tag | default('latest') }}
          ports:
            - containerPort: {{ expose_port | default(8000) }}
          resources:
            requests:
              cpu: {{ cpu_request | default('100m') }}
              memory: {{ memory_request | default('128Mi') }}
            limits:
              cpu: {{ cpu_limit | default('500m') }}
              memory: {{ memory_limit | default('256Mi') }}
          livenessProbe:
            httpGet:
              path: {{ health_path | default('/health') }}
              port: {{ expose_port | default(8000) }}
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: {{ health_path | default('/health') }}
              port: {{ expose_port | default(8000) }}
            initialDelaySeconds: 5
            periodSeconds: 10
"""

K8S_SERVICE_TMPL = """\
apiVersion: v1
kind: Service
metadata:
  name: {{ app_name | default('app') }}-svc
  namespace: {{ namespace | default('default') }}
spec:
  selector:
    app: {{ app_name | default('app') }}
  type: {{ service_type | default('ClusterIP') }}
  ports:
    - protocol: TCP
      port: {{ service_port | default(80) }}
      targetPort: {{ expose_port | default(8000) }}
"""

K8S_INGRESS_TMPL = """\
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ app_name | default('app') }}-ingress
  namespace: {{ namespace | default('default') }}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: {{ hostname | default('app.example.com') }}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: {{ app_name | default('app') }}-svc
                port:
                  number: {{ service_port | default(80) }}
  {% if enable_tls | default(false) %}
  tls:
    - hosts:
        - {{ hostname | default('app.example.com') }}
      secretName: {{ app_name | default('app') }}-tls
  {% endif %}
"""

# ─────────────────────────────────────────────────────────────
# AWS (Terraform)
# ─────────────────────────────────────────────────────────────

AWS_MAIN_TF_TMPL = """\
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_role.arn
  version  = "{{ k8s_version | default('1.29') }}"

  vpc_config {
    subnet_ids = var.subnet_ids
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "cknbn-template-engine"
  }
}

# IAM Role for EKS
resource "aws_iam_role" "eks_role" {
  name = "${var.cluster_name}-eks-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_role.name
}

# Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.cluster_name}-nodes"
  node_role_arn   = aws_iam_role.eks_role.arn
  subnet_ids      = var.subnet_ids
  instance_types  = ["{{ instance_type | default('t3.medium') }}"]

  scaling_config {
    desired_size = {{ desired_nodes | default(2) }}
    max_size     = {{ max_nodes | default(4) }}
    min_size     = {{ min_nodes | default(1) }}
  }
}

# S3 Bucket for app storage
{% if include_s3 | default(false) %}
resource "aws_s3_bucket" "app_bucket" {
  bucket = "{{ s3_bucket_name | default('my-app-bucket') }}-${var.environment}"

  tags = {
    Environment = var.environment
    ManagedBy   = "cknbn-template-engine"
  }
}
{% endif %}
"""

AWS_VARIABLES_TF_TMPL = """\
variable "region" {
  description = "AWS region"
  type        = string
  default     = "{{ region | default('us-east-1') }}"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "{{ cluster_name | default('app-cluster') }}"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "{{ environment | default('dev') }}"
}

variable "subnet_ids" {
  description = "List of subnet IDs"
  type        = list(string)
  default     = []
}
"""

AWS_OUTPUTS_TF_TMPL = """\
output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.main.name
}

output "kubeconfig_command" {
  description = "Command to update kubeconfig"
  value       = "aws eks update-kubeconfig --region ${var.region} --name ${var.cluster_name}"
}
"""

# ─────────────────────────────────────────────────────────────
# GCP (Terraform)
# ─────────────────────────────────────────────────────────────

GCP_MAIN_TF_TMPL = """\
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# GKE Cluster
resource "google_container_cluster" "main" {
  name     = var.cluster_name
  location = var.region

  remove_default_node_pool = true
  initial_node_count       = 1

  networking_mode = "VPC_NATIVE"
  ip_allocation_policy {}

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
}

# Node Pool
resource "google_container_node_pool" "main" {
  name       = "${var.cluster_name}-node-pool"
  location   = var.region
  cluster    = google_container_cluster.main.name
  node_count = {{ node_count | default(2) }}

  node_config {
    machine_type = "{{ machine_type | default('e2-standard-2') }}"
    disk_size_gb = {{ disk_size_gb | default(50) }}
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
    labels = {
      environment = var.environment
    }
  }

  autoscaling {
    min_node_count = {{ min_nodes | default(1) }}
    max_node_count = {{ max_nodes | default(4) }}
  }
}

{% if include_cloud_sql | default(false) %}
# Cloud SQL
resource "google_sql_database_instance" "main" {
  name             = "{{ db_instance_name | default('app-db') }}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "{{ db_tier | default('db-f1-micro') }}"
  }
}
{% endif %}
"""

GCP_VARIABLES_TF_TMPL = """\
variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "{{ project_id | default('my-gcp-project') }}"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "{{ region | default('us-central1') }}"
}

variable "cluster_name" {
  description = "GKE cluster name"
  type        = string
  default     = "{{ cluster_name | default('app-cluster') }}"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "{{ environment | default('dev') }}"
}
"""

GCP_OUTPUTS_TF_TMPL = """\
output "cluster_name" {
  value = google_container_cluster.main.name
}

output "cluster_endpoint" {
  value     = google_container_cluster.main.endpoint
  sensitive = true
}

output "kubeconfig_command" {
  value = "gcloud container clusters get-credentials ${var.cluster_name} --region ${var.region} --project ${var.project_id}"
}
"""


# ─────────────────────────────────────────────────────────────
# AZURE (Terraform)
# ─────────────────────────────────────────────────────────────

AZURE_MAIN_TF_TMPL = """\
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group
  location = var.location
}

resource "azurerm_kubernetes_cluster" "main" {
  name                = var.app_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = var.app_name

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = "{{ vm_size | default('Standard_DS2_v2') }}"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = var.environment
  }
}
"""

AZURE_VARIABLES_TF_TMPL = """\
variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "{{ app_name | default('my-app') }}"
}

variable "resource_group" {
  description = "Azure Resource Group"
  type        = string
  default     = "{{ resource_group | default('rg-myapp') }}"
}

variable "location" {
  description = "Azure Region"
  type        = string
  default     = "{{ location | default('eastus') }}"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "{{ environment | default('dev') }}"
}
"""

AZURE_OUTPUTS_TF_TMPL = """\
output "client_certificate" {
  value     = azurerm_kubernetes_cluster.main.kube_config.0.client_certificate
  sensitive = true
}

output "kube_config" {
  value     = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive = true
}
"""

# ─────────────────────────────────────────────────────────────
# PROMETHEUS
# ─────────────────────────────────────────────────────────────

PROMETHEUS_CONFIG_TMPL = """\
global:
  scrape_interval: {{ scrape_interval | default('15s') }}
  evaluation_interval: {{ evaluation_interval | default('15s') }}
  external_labels:
    environment: {{ environment | default('dev') }}
    app: {{ app_name | default('app') }}

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ["{{ alertmanager_host | default('alertmanager:9093') }}"]

scrape_configs:
  - job_name: '{{ app_name | default('app') }}'
    static_configs:
      - targets: ["{{ app_host | default('app:8000') }}"]
    metrics_path: {{ metrics_path | default('/metrics') }}

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: ["{{ namespace | default('default') }}"]
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: "true"
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?:\\\\d+)?;(\\\\d+)
        replacement: $1:$2
        target_label: __address__

  - job_name: 'node-exporter'
    static_configs:
      - targets: ["{{ node_exporter_host | default('node-exporter:9100') }}"]
"""

PROMETHEUS_ALERT_RULES_TMPL = """\
groups:
  - name: {{ app_name | default('app') }}_alerts
    rules:

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > {{ error_rate_threshold | default(0.05) }}
        for: 5m
        labels:
          severity: critical
          environment: {{ environment | default('dev') }}
        annotations:
          summary: "High HTTP error rate on {{ app_name | default('app') }}"
          description: "Error rate above {{ error_rate_threshold | default('5%') }} for 5 minutes."

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > {{ latency_threshold_seconds | default(2) }}
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High p95 latency on {{ app_name | default('app') }}"
          description: "p95 latency exceeds {{ latency_threshold_seconds | default(2) }}s."

      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Pod crash-looping in namespace {{ namespace | default('default') }}"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > {{ memory_threshold | default(0.85) }}
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Memory usage above {{ memory_threshold | default('85%') }}"
"""

# ─────────────────────────────────────────────────────────────
# GRAFANA
# ─────────────────────────────────────────────────────────────

GRAFANA_DATASOURCE_TMPL = """\
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://{{ prometheus_host | default('prometheus:9090') }}
    isDefault: true
    jsonData:
      timeInterval: {{ scrape_interval | default('15s') }}
      httpMethod: POST
"""

GRAFANA_DASHBOARD_TMPL = """\
{
  "title": "{{ app_name | default('App') }} Overview",
  "uid": "{{ app_name | default('app') | lower | replace(' ', '-') }}-overview",
  "schemaVersion": 38,
  "version": 1,
  "refresh": "{{ refresh_interval | default('30s') }}",
  "panels": [
    {
      "id": 1,
      "title": "Request Rate",
      "type": "timeseries",
      "gridPos": { "x": 0, "y": 0, "w": 12, "h": 8 },
      "targets": [{
        "expr": "rate(http_requests_total{job='{{ app_name | default('app') }}'}[5m])",
        "legendFormat": "{{method}} {{status}}"
      }]
    },
    {
      "id": 2,
      "title": "p95 Latency",
      "type": "timeseries",
      "gridPos": { "x": 12, "y": 0, "w": 12, "h": 8 },
      "targets": [{
        "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job='{{ app_name | default('app') }}'}[5m]))",
        "legendFormat": "p95"
      }]
    },
    {
      "id": 3,
      "title": "Error Rate",
      "type": "stat",
      "gridPos": { "x": 0, "y": 8, "w": 6, "h": 4 },
      "targets": [{
        "expr": "rate(http_requests_total{status=~'5..', job='{{ app_name | default('app') }}'}[5m])",
        "legendFormat": "errors/s"
      }]
    },
    {
      "id": 4,
      "title": "Pod Memory Usage",
      "type": "gauge",
      "gridPos": { "x": 6, "y": 8, "w": 6, "h": 4 },
      "targets": [{
        "expr": "container_memory_usage_bytes{namespace='{{ namespace | default('default') }}'}",
        "legendFormat": "{{pod}}"
      }]
    }
  ],
  "time": { "from": "now-1h", "to": "now" },
  "timepicker": {}
}
"""

# ─────────────────────────────────────────────────────────────
# DISPATCH TABLE
# ─────────────────────────────────────────────────────────────

TEMPLATE_MAP = {
    'docker': {
        'Dockerfile':          DOCKERFILE_TMPL,
        'docker-compose.yml':  DOCKER_COMPOSE_TMPL,
        '.dockerignore':       DOCKERIGNORE_TMPL,
    },
    'kubernetes': {
        'k8s/deployment.yaml': K8S_DEPLOYMENT_TMPL,
        'k8s/service.yaml':    K8S_SERVICE_TMPL,
        'k8s/ingress.yaml':    K8S_INGRESS_TMPL,
    },
    'aws': {
        'terraform/aws/main.tf':      AWS_MAIN_TF_TMPL,
        'terraform/aws/variables.tf': AWS_VARIABLES_TF_TMPL,
        'terraform/aws/outputs.tf':   AWS_OUTPUTS_TF_TMPL,
    },
    'gcp': {
        'terraform/gcp/main.tf':      GCP_MAIN_TF_TMPL,
        'terraform/gcp/variables.tf': GCP_VARIABLES_TF_TMPL,
        'terraform/gcp/outputs.tf':   GCP_OUTPUTS_TF_TMPL,
    },
    'azure': {
        'terraform/azure/main.tf':      AZURE_MAIN_TF_TMPL,
        'terraform/azure/variables.tf': AZURE_VARIABLES_TF_TMPL,
        'terraform/azure/outputs.tf':   AZURE_OUTPUTS_TF_TMPL,
    },
    'prometheus': {
        'monitoring/prometheus.yml':       PROMETHEUS_CONFIG_TMPL,
        'monitoring/alert_rules.yml':      PROMETHEUS_ALERT_RULES_TMPL,
    },
    'grafana': {
        'monitoring/grafana/datasource.yml':  GRAFANA_DATASOURCE_TMPL,
        'monitoring/grafana/dashboard.json':  GRAFANA_DASHBOARD_TMPL,
    },
    # Legacy aliases — keep for backwards compatibility
    'terraform': {
        'terraform/aws/main.tf':      AWS_MAIN_TF_TMPL,
        'terraform/aws/variables.tf': AWS_VARIABLES_TF_TMPL,
        'terraform/aws/outputs.tf':   AWS_OUTPUTS_TF_TMPL,
    },
    'github_actions': {
        '.github/workflows/deploy.yml': """\
name: CI/CD Pipeline
on:
  push:
    branches: ["{{ branch | default('main') }}"]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t {{ image_name | default('app') }}:${{ '{{' }} github.sha {{ '}}' }} .

      - name: Run tests
        run: {{ test_command | default('echo No tests configured') }}

      {% if enable_terraform | default(false) %}
      # ── Terraform Lifecycle ────────────────────────────────
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: {{ terraform_version | default('1.7.0') }}

      {% set provider = cloud_provider | default('None') %}
      {% if provider == 'AWS' %}
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ '{{' }} secrets.AWS_ACCESS_KEY_ID {{ '}}' }}
          aws-secret-access-key: ${{ '{{' }} secrets.AWS_SECRET_ACCESS_KEY {{ '}}' }}
          aws-region: {{ region | default('us-east-1') }}
      {% elif provider == 'GCP' %}
      - name: Auth to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ '{{' }} secrets.GCP_SA_KEY {{ '}}' }}
      {% elif provider == 'Azure' %}
      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ '{{' }} secrets.AZURE_CREDENTIALS {{ '}}' }}
      {% endif %}

      {% set target_dir = terraform_dir | default('') %}
      {% if not target_dir %}
        {% if provider == 'AWS' %}{% set target_dir = 'terraform/aws' %}
        {% elif provider == 'GCP' %}{% set target_dir = 'terraform/gcp' %}
        {% elif provider == 'Azure' %}{% set target_dir = 'terraform/azure' %}
        {% else %}{% set target_dir = 'terraform' %}
        {% endif %}
      {% endif %}

      - name: Terraform Init
        run: terraform init
        working-directory: {{ target_dir }}

      - name: Terraform Plan
        run: terraform plan
        working-directory: {{ target_dir }}

      - name: Terraform Apply
        run: terraform apply -auto-approve
        working-directory: {{ target_dir }}
      {% endif %}
""",
    },
}


def generate_pipeline(tool_type: str, config_data: dict) -> dict:
    """
    Render all config files for a given tool_type.
    Returns { filename: rendered_string }.
    Errors per-file are caught and returned as inline comments.
    """
    # Build a mutable copy so we don't mutate the caller's dict
    ctx = dict(config_data)

    # For docker, inject resolved image metadata so the template stays logic-free
    if tool_type == 'docker':
        tag = ctx.get('base_image', _FALLBACK_IMAGE)
        meta = BASE_IMAGES.get(tag, BASE_IMAGES[_FALLBACK_IMAGE])

        # Parse comma-separated extra_dependencies into a clean list
        raw_deps = ctx.get('extra_dependencies', '') or ''
        dep_list = [d.strip() for d in raw_deps.split(',') if d.strip()]
        install_cmd = meta['install_cmd'].format(packages=' '.join(dep_list)) if dep_list else ''

        ctx['_image_meta'] = {
            'base_image': tag,
            'family': meta['family'],
            'variant': meta['variant'],
            'package_manager': meta['package_manager'],
            'install_cmd': install_cmd,
            'extra_deps': bool(dep_list),
            'setup_cmds': meta['setup_cmds'],
            'default_port': meta['default_port'],
            'default_cmd': meta['default_cmd'],
        }

    tmpl_map = TEMPLATE_MAP.get(tool_type, {})
    result = {}
    for filename, tmpl_str in tmpl_map.items():
        try:
            result[filename] = env.from_string(tmpl_str).render(**ctx)
        except Exception as e:
            result[filename] = f"# Template render error: {e}\n# config_data: {config_data}"
    return result
