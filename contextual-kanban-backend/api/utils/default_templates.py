"""
Default board templates seeded to every new user upon registration.
Structures follow the frontend BoardTemplate interface with FieldConfig and TagConfig.
"""

DEFAULT_TEMPLATES = [
    {
        "name": "Software Development",
        "description": "Standard agile workflow for software teams",
        "icon": "Code",
        "columns": ["Backlog", "To Do", "In Progress", "Review", "Done"],
        "fields": [
            {"id": "priority", "name": "Priority", "type": "select", "required": True, "options": ["Low", "Medium", "High", "Critical"], "placeholder": "Select priority"},
            {"id": "assignee", "name": "Assignee", "type": "text", "required": False, "placeholder": "Enter assignee name"},
            {"id": "due_date", "name": "Due Date", "type": "date", "required": False, "placeholder": "Select due date"},
            {"id": "story_points", "name": "Story Points", "type": "number", "required": False, "placeholder": "Estimate effort"},
            {"id": "description", "name": "Description", "type": "textarea", "required": False, "placeholder": "Describe the task"},
            {"id": "pr_link", "name": "PR Link", "type": "url", "required": False, "placeholder": "https://github.com/..."},
        ],
        "tags": [
            {"id": "bug", "name": "Bug", "color": "hsl(0, 80%, 60%)"},
            {"id": "feature", "name": "Feature", "color": "hsl(210, 80%, 60%)"},
            {"id": "improvement", "name": "Improvement", "color": "hsl(150, 70%, 50%)"},
            {"id": "documentation", "name": "Documentation", "color": "hsl(45, 90%, 55%)"},
            {"id": "refactor", "name": "Refactor", "color": "hsl(280, 60%, 60%)"},
        ],
    },
    {
        "name": "Project Management",
        "description": "General project tracking with milestones",
        "icon": "Briefcase",
        "columns": ["Planning", "In Progress", "On Hold", "Completed"],
        "fields": [
            {"id": "priority", "name": "Priority", "type": "select", "required": True, "options": ["Low", "Medium", "High"], "placeholder": "Select priority"},
            {"id": "owner", "name": "Owner", "type": "text", "required": False, "placeholder": "Responsible person"},
            {"id": "deadline", "name": "Deadline", "type": "date", "required": False, "placeholder": "Select deadline"},
            {"id": "budget", "name": "Budget", "type": "number", "required": False, "placeholder": "Enter budget"},
            {"id": "notes", "name": "Notes", "type": "textarea", "required": False, "placeholder": "Additional notes"},
        ],
        "tags": [
            {"id": "milestone", "name": "Milestone", "color": "hsl(200, 80%, 55%)"},
            {"id": "blocked", "name": "Blocked", "color": "hsl(0, 70%, 55%)"},
            {"id": "urgent", "name": "Urgent", "color": "hsl(30, 90%, 55%)"},
        ],
    },
    {
        "name": "Marketing Campaign",
        "description": "Plan and execute marketing campaigns",
        "icon": "Megaphone",
        "columns": ["Ideas", "Planning", "In Progress", "Review", "Published"],
        "fields": [
            {"id": "channel", "name": "Channel", "type": "select", "required": True, "options": ["Social Media", "Email", "Blog", "Paid Ads", "Events"], "placeholder": "Select channel"},
            {"id": "target_audience", "name": "Target Audience", "type": "text", "required": False, "placeholder": "Describe audience"},
            {"id": "launch_date", "name": "Launch Date", "type": "date", "required": False, "placeholder": "Select launch date"},
            {"id": "content_brief", "name": "Content Brief", "type": "textarea", "required": False, "placeholder": "Describe the content"},
            {"id": "reference_link", "name": "Reference Link", "type": "url", "required": False, "placeholder": "https://..."},
        ],
        "tags": [
            {"id": "social", "name": "Social", "color": "hsl(210, 75%, 55%)"},
            {"id": "content", "name": "Content", "color": "hsl(160, 70%, 50%)"},
            {"id": "paid", "name": "Paid", "color": "hsl(45, 85%, 55%)"},
            {"id": "organic", "name": "Organic", "color": "hsl(120, 60%, 50%)"},
        ],
    },
    {
        "name": "Bug Tracker",
        "description": "Track and resolve software bugs systematically",
        "icon": "Bug",
        "columns": ["Reported", "Triaged", "In Progress", "Testing", "Resolved"],
        "fields": [
            {"id": "severity", "name": "Severity", "type": "select", "required": True, "options": ["Low", "Medium", "High", "Critical"], "placeholder": "Select severity"},
            {"id": "reported_by", "name": "Reported By", "type": "text", "required": False, "placeholder": "Reporter name"},
            {"id": "steps_to_reproduce", "name": "Steps to Reproduce", "type": "textarea", "required": False, "placeholder": "Describe reproduction steps"},
            {"id": "environment", "name": "Environment", "type": "select", "required": False, "options": ["Production", "Staging", "Development", "Local"], "placeholder": "Select environment"},
            {"id": "issue_link", "name": "Issue Link", "type": "url", "required": False, "placeholder": "https://github.com/issues/..."},
        ],
        "tags": [
            {"id": "regression", "name": "Regression", "color": "hsl(0, 80%, 55%)"},
            {"id": "ui", "name": "UI", "color": "hsl(260, 70%, 60%)"},
            {"id": "backend", "name": "Backend", "color": "hsl(30, 80%, 55%)"},
            {"id": "performance", "name": "Performance", "color": "hsl(180, 70%, 45%)"},
        ],
    },
    {
        "name": "Content Calendar",
        "description": "Organize and schedule content creation",
        "icon": "Calendar",
        "columns": ["Ideas", "Writing", "Editing", "Scheduled", "Published"],
        "fields": [
            {"id": "content_type", "name": "Content Type", "type": "select", "required": True, "options": ["Blog Post", "Video", "Podcast", "Infographic", "Newsletter"], "placeholder": "Select type"},
            {"id": "author", "name": "Author", "type": "text", "required": False, "placeholder": "Author name"},
            {"id": "publish_date", "name": "Publish Date", "type": "date", "required": False, "placeholder": "Select publish date"},
            {"id": "word_count", "name": "Word Count", "type": "number", "required": False, "placeholder": "Target word count"},
            {"id": "outline", "name": "Outline", "type": "textarea", "required": False, "placeholder": "Content outline"},
        ],
        "tags": [
            {"id": "seo", "name": "SEO", "color": "hsl(120, 65%, 45%)"},
            {"id": "trending", "name": "Trending", "color": "hsl(340, 80%, 55%)"},
            {"id": "evergreen", "name": "Evergreen", "color": "hsl(90, 60%, 45%)"},
        ],
    },
    {
        "name": "Personal Tasks",
        "description": "Simple personal task management",
        "icon": "User",
        "columns": ["To Do", "In Progress", "Done"],
        "fields": [
            {"id": "priority", "name": "Priority", "type": "select", "required": False, "options": ["Low", "Medium", "High"], "placeholder": "Select priority"},
            {"id": "due_date", "name": "Due Date", "type": "date", "required": False, "placeholder": "Select due date"},
            {"id": "notes", "name": "Notes", "type": "textarea", "required": False, "placeholder": "Additional notes"},
        ],
        "tags": [
            {"id": "personal", "name": "Personal", "color": "hsl(210, 70%, 55%)"},
            {"id": "work", "name": "Work", "color": "hsl(30, 75%, 55%)"},
            {"id": "health", "name": "Health", "color": "hsl(150, 65%, 50%)"},
            {"id": "learning", "name": "Learning", "color": "hsl(270, 60%, 60%)"},
        ],
    },
]
