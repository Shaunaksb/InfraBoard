export type FieldType = "text" | "textarea" | "date" | "select" | "number" | "url";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  pushNotifications: boolean;
  defaultBoardId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  preferences: UserPreferences;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[]; // List of User IDs
}

export interface FieldConfig {
  id: string;
  name: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // for select type
  placeholder?: string;
}

export interface TagConfig {
  id: string;
  name: string;
  color: string; // HSL CSS variable name like "primary" or custom
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  columns: string[];
  fields: FieldConfig[];
  tags: TagConfig[];
}

export interface BoardConfig {
  name: string;
  columns: string[];
  fields: FieldConfig[];
  tags: TagConfig[];
  focusColumns?: string[];
  ownerId?: string;
  sharedWithUsers?: string[]; // user IDs
  sharedWithOrgs?: string[]; // org IDs
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  fields: Record<string, string>;
  tags: string[]; // tag IDs
  attachments?: FileAttachment[];
  columnId: string;
  order: number;
  createdAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export type KanbanBoard = {
  id: string;
  config: BoardConfig;
  columns: KanbanColumn[];
};
