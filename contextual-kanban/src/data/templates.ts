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
    id: "container-app",
    name: "Containerized Web App",
    description: "Standard Docker image built and deployed via CI/CD",
    icon: "Box",
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
    icon: "Cloud",
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
    id: "custom",
    name: "Custom Integration Pipeline",
    description: "Configure your own deployment workflows from scratch",
    icon: "Wrench",
    columns: ["Setup", "Docker Container", "GitHub Actions"],
    fields: [],
    tags: [],
  },
];
