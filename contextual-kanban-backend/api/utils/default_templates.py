"""
Default board templates seeded to every new user upon registration.
Structures follow the frontend BoardTemplate interface with FieldConfig and TagConfig.
"""

DEFAULT_TEMPLATES = [
    {
        "name": "Containerized Web App",
        "description": "Standard Docker image built and deployed via CI/CD",
        "icon": "Box",
        "columns": ["Docker Build", "Terraform Infra", "GitHub Actions Deploy"],
        "fields": [
            {"id": "environment", "name": "Environment", "type": "select", "required": True, "options": ["Production", "Staging", "Development"], "placeholder": "Select environment"},
            {"id": "owner", "name": "Owner", "type": "text", "required": False, "placeholder": "Responsible team"},
        ],
        "tags": [
            {"id": "frontend", "name": "Frontend", "color": "hsl(210, 80%, 60%)"},
            {"id": "backend", "name": "Backend", "color": "hsl(150, 70%, 50%)"},
        ],
    },
    {
        "name": "Serverless Infrastructure",
        "description": "Provision and deploy cloud-native serverless components",
        "icon": "Cloud",
        "columns": ["Terraform Base", "GitHub Actions CI", "Terraform App"],
        "fields": [
            {"id": "region", "name": "Cloud Region", "type": "text", "required": True, "placeholder": "us-east-1"},
            {"id": "runtime", "name": "Runtime", "type": "select", "required": False, "options": ["Node.js", "Python", "Go"], "placeholder": "Select runtime"},
        ],
        "tags": [
            {"id": "api", "name": "API Gateway", "color": "hsl(45, 90%, 55%)"},
            {"id": "db", "name": "Database", "color": "hsl(280, 60%, 60%)"},
        ],
    },
    {
        "name": "Custom Integration Pipeline",
        "description": "Configure your own deployment workflows from scratch",
        "icon": "Wrench",
        "columns": ["Setup", "Docker Container", "GitHub Actions"],
        "fields": [
            {"id": "trigger", "name": "Trigger Event", "type": "select", "required": False, "options": ["Push", "PR", "Manual"], "placeholder": "Trigger"},
        ],
        "tags": [
            {"id": "experimental", "name": "Experimental", "color": "hsl(0, 80%, 60%)"},
        ],
    },
]
