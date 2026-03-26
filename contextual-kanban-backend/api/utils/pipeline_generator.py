def generate_dockerfile(config_data):
    base_image = config_data.get('base_image', 'python:3.9-slim')
    run_commands = config_data.get('run_commands', '')
    expose_port = config_data.get('expose_port', '8000')

    template = f"FROM {base_image}\n"
    template += f"WORKDIR /app\n"
    template += f"COPY . /app\n"
    if run_commands:
        template += f"RUN {run_commands}\n"
    if expose_port:
        template += f"EXPOSE {expose_port}\n"
    template += f"CMD [\"python\", \"manage.py\", \"runserver\", \"0.0.0.0:{expose_port}\"]\n"
    
    return template

def generate_terraform(config_data):
    provider = config_data.get('provider', 'aws')
    instance_type = config_data.get('instance_type', 't2.micro')

    template = f"provider \"{provider}\" {{\n"
    template += f"  region = \"us-east-1\"\n"
    template += f"}}\n\n"
    template += f"resource \"aws_instance\" \"app_server\" {{\n"
    template += f"  ami           = \"ami-0c55b159cbfafe1f0\"\n"
    template += f"  instance_type = \"{instance_type}\"\n"
    template += f"}}\n"
    
    return template

def generate_github_actions(config_data):
    branch = config_data.get('branch', 'main')

    template = f"name: CI Pipeline\n"
    template += f"on:\n"
    template += f"  push:\n"
    template += f"    branches: [ \"{branch}\" ]\n"
    template += f"jobs:\n"
    template += f"  build:\n"
    template += f"    runs-on: ubuntu-latest\n"
    template += f"    steps:\n"
    template += f"    - uses: actions/checkout@v3\n"
    template += f"    - name: Run Scripts\n"
    template += f"      run: echo \"Pipeline running...\"\n"
    
    return template

def generate_pipeline(tool_type, config_data):
    if tool_type == 'docker':
        return {"Dockerfile": generate_dockerfile(config_data)}
    elif tool_type == 'terraform':
        return {"main.tf": generate_terraform(config_data)}
    elif tool_type == 'github_actions':
        return {".github/workflows/deploy.yml": generate_github_actions(config_data)}
    return {}
