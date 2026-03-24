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
    id: "software-dev",
    name: "Software Development",
    description: "Track features, bugs, and tasks across your sprint",
    icon: "💻",
    columns: ["Backlog", "To Do", "In Progress", "Review", "Done"],
    fields: [
      { id: "description", name: "Description", type: "textarea", placeholder: "Describe the task..." },
      { id: "assignee", name: "Assignee", type: "text", placeholder: "Who's working on this?" },
      { id: "estimate", name: "Story Points", type: "number", placeholder: "0" },
      { id: "due_date", name: "Due Date", type: "date" },
      { id: "priority", name: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"] },
    ],
    tags: [
      { id: "feature", name: "Feature", color: "172 66% 40%" },
      { id: "bug", name: "Bug", color: "0 72% 55%" },
      { id: "improvement", name: "Improvement", color: "210 80% 55%" },
      { id: "tech-debt", name: "Tech Debt", color: "25 95% 55%" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Campaign",
    description: "Plan and execute marketing campaigns and content",
    icon: "📣",
    columns: ["Ideas", "Planning", "Creating", "Review", "Published"],
    fields: [
      { id: "description", name: "Description", type: "textarea", placeholder: "Campaign details..." },
      { id: "channel", name: "Channel", type: "select", options: ["Social", "Email", "Blog", "Ads", "PR"] },
      { id: "budget", name: "Budget", type: "number", placeholder: "0" },
      { id: "deadline", name: "Deadline", type: "date" },
      { id: "link", name: "Reference URL", type: "url", placeholder: "https://..." },
    ],
    tags: [
      { id: "social", name: "Social", color: "210 80% 55%" },
      { id: "email", name: "Email", color: "152 60% 42%" },
      { id: "content", name: "Content", color: "270 60% 55%" },
      { id: "urgent", name: "Urgent", color: "0 72% 55%" },
    ],
  },
  {
    id: "personal",
    name: "Personal Tasks",
    description: "Organize your personal goals and daily tasks",
    icon: "✅",
    columns: ["To Do", "In Progress", "Done"],
    fields: [
      { id: "notes", name: "Notes", type: "textarea", placeholder: "Additional notes..." },
      { id: "due_date", name: "Due Date", type: "date" },
      { id: "category", name: "Category", type: "select", options: ["Work", "Personal", "Health", "Learning"] },
    ],
    tags: [
      { id: "important", name: "Important", color: "0 72% 55%" },
      { id: "quick-win", name: "Quick Win", color: "152 60% 42%" },
      { id: "recurring", name: "Recurring", color: "210 80% 55%" },
    ],
  },
  {
    id: "custom",
    name: "Custom Board",
    description: "Start from scratch with your own columns, fields, and tags",
    icon: "🎨",
    columns: ["To Do", "In Progress", "Done"],
    fields: [],
    tags: [],
  },
];
