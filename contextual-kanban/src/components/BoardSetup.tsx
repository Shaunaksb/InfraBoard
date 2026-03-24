import { useState } from "react";
import { BoardConfig, BoardTemplate, FieldConfig, FieldType, TagConfig } from "@/types/kanban";
import { TAG_COLORS } from "@/data/templates";
import { useTemplates } from "@/hooks/useTemplates";
import { useUsers } from "@/hooks/useUsers";
import { useOrganizations } from "@/hooks/useOrganizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, X, ArrowLeft, ArrowRight, Trash2, Eye, Users } from "lucide-react";

interface BoardSetupProps {
  onCreateBoard: (config: BoardConfig) => void;
}

type Step = "template" | "configure";

const BoardSetup = ({ onCreateBoard }: BoardSetupProps) => {
  const [step, setStep] = useState<Step>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null);
  const [boardName, setBoardName] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [tags, setTags] = useState<TagConfig[]>([]);
  const [focusColumns, setFocusColumns] = useState<string[]>([]);
  const [sharedWithUsers, setSharedWithUsers] = useState<string[]>([]);
  const [sharedWithOrgs, setSharedWithOrgs] = useState<string[]>([]);
  const { users, currentUser } = useUsers();
  const { myOrganizations } = useOrganizations();
  const { templates, isLoading } = useTemplates();

  const selectTemplate = (template: BoardTemplate) => {
    setSelectedTemplate(template);
    setBoardName(template.id === "custom" ? "" : template.name);
    setColumns([...template.columns]);
    setFields([...template.fields]);
    setTags([...template.tags]);
    setFocusColumns([...template.columns]);
    setStep("configure");
  };

  const addColumn = () => {
    setColumns([...columns, `Column ${columns.length + 1}`]);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, value: string) => {
    const updated = [...columns];
    updated[index] = value;
    setColumns(updated);
  };

  const addField = () => {
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      name: "",
      type: "text",
      placeholder: "",
    };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<FieldConfig>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const addTag = () => {
    const newTag: TagConfig = {
      id: `tag_${Date.now()}`,
      name: "",
      color: TAG_COLORS[tags.length % TAG_COLORS.length].value,
    };
    setTags([...tags, newTag]);
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const updateTag = (index: number, updates: Partial<TagConfig>) => {
    const updated = [...tags];
    updated[index] = { ...updated[index], ...updates };
    setTags(updated);
  };

  const handleCreate = () => {
    if (!boardName.trim() || columns.length === 0) return;
    const validColumns = columns.filter((c) => c.trim());
    onCreateBoard({
      name: boardName.trim(),
      columns: validColumns,
      fields: fields.filter((f) => f.name.trim()),
      tags: tags.filter((t) => t.name.trim()),
      focusColumns: focusColumns.filter((fc) => validColumns.includes(fc)),
      sharedWithUsers,
      sharedWithOrgs,
    });
  };

  if (step === "template") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 relative">
        <div className="absolute top-4 left-4">
          <SidebarTrigger />
        </div>
        <div className="w-full max-w-3xl animate-fade-in">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Create your board</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Choose a template or start from scratch
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isLoading ? (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                Loading templates...
              </div>
            ) : templates.map((template) => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template)}
                className="group relative rounded-lg border border-border bg-card p-6 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-card-hover"
              >
                <span className="mb-3 block text-3xl">{template.icon || "📋"}</span>
                <h3 className="text-lg font-semibold text-card-foreground">{template.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                {template.id !== "custom" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {template.columns.map((col) => (
                      <span key={col} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {col}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 relative">
      <div className="absolute top-4 left-4">
        <SidebarTrigger />
      </div>
      <div className="w-full max-w-2xl animate-slide-up">
        <button
          onClick={() => setStep("template")}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to templates
        </button>

        <h2 className="text-2xl font-bold text-foreground">
          Configure your board
        </h2>
        <p className="mt-1 mb-8 text-muted-foreground">
          Customize columns, fields, and tags for your cards
        </p>

        {/* Board Name */}
        <div className="mb-8">
          <Label className="text-sm font-medium text-foreground">Board Name</Label>
          <Input
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            placeholder="My Board"
            className="mt-1.5"
          />
        </div>

        {/* Columns */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Columns</Label>
            <Button variant="ghost" size="sm" onClick={addColumn} className="h-7 gap-1 text-xs text-primary">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {columns.map((col, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={col}
                  onChange={(e) => updateColumn(i, e.target.value)}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => removeColumn(i)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Card Fields</Label>
            <Button variant="ghost" size="sm" onClick={addField} className="h-7 gap-1 text-xs text-primary">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          <div className="space-y-3">
            {fields.map((field, i) => (
              <div key={field.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={field.name}
                        onChange={(e) => updateField(i, { name: e.target.value })}
                        placeholder="Field name"
                        className="flex-1"
                      />
                      <Select
                        value={field.type}
                        onValueChange={(v) => updateField(i, { type: v as FieldType, options: v === "select" ? ["Option 1"] : undefined })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {field.type === "select" && (
                      <div className="pl-1">
                        <p className="mb-1 text-xs text-muted-foreground">Options (comma-separated)</p>
                        <Input
                          value={field.options?.join(", ") || ""}
                          onChange={(e) => updateField(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                          placeholder="Option 1, Option 2, ..."
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeField(i)} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">No fields yet. Add fields to capture card details.</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Tags</Label>
            <Button variant="ghost" size="sm" onClick={addTag} className="h-7 gap-1 text-xs text-primary">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <div
                key={tag.id}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5"
              >
                <select
                  value={tag.color}
                  onChange={(e) => updateTag(i, { color: e.target.value })}
                  className="h-4 w-4 cursor-pointer appearance-none rounded-full border-0 p-0"
                  style={{ backgroundColor: `hsl(${tag.color})` }}
                >
                  {TAG_COLORS.map((c) => (
                    <option key={c.value} value={c.value}>{c.name}</option>
                  ))}
                </select>
                <Input
                  value={tag.name}
                  onChange={(e) => updateTag(i, { name: e.target.value })}
                  placeholder="Tag name"
                  className="h-6 w-24 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
                <button onClick={() => removeTag(i)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No tags yet. Add tags to categorize cards.</p>
            )}
          </div>
        </div>

        {/* Focus Mode Columns */}
        {columns.length > 0 && (
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium text-foreground">Focus Mode Columns</Label>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Select which columns to show when Focus Mode is active. All columns are included by default.
            </p>
            <div className="space-y-2">
              {columns.filter((c) => c.trim()).map((col) => (
                <label key={col} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Checkbox
                    checked={focusColumns.includes(col)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFocusColumns((prev) => [...prev, col]);
                      } else {
                        setFocusColumns((prev) => prev.filter((c) => c !== col));
                      }
                    }}
                  />
                  {col}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Sharing options */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium text-foreground">Sharing</Label>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Select who can view and interact with this board.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Organizations */}
            {myOrganizations.length > 0 && (
              <div className="p-4 border border-border rounded-lg bg-card/50">
                <p className="text-sm font-semibold mb-3">Share with Organizations</p>
                <div className="space-y-2">
                  {myOrganizations.map((org) => (
                    <label key={org.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <Checkbox
                        checked={sharedWithOrgs.includes(org.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSharedWithOrgs((prev) => [...prev, org.id]);
                          else setSharedWithOrgs((prev) => prev.filter((id) => id !== org.id));
                        }}
                      />
                      {org.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Users */}
            <div className="p-4 border border-border rounded-lg bg-card/50">
              <p className="text-sm font-semibold mb-3">Share with Users</p>
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                {users.filter(u => u.id !== currentUser?.id).map((user) => (
                  <label key={user.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <Checkbox
                      checked={sharedWithUsers.includes(user.id)}
                      onCheckedChange={(checked) => {
                        if (checked) setSharedWithUsers((prev) => [...prev, user.id]);
                        else setSharedWithUsers((prev) => prev.filter((id) => id !== user.id));
                      }}
                    />
                    {user.name} ({user.email})
                  </label>
                ))}
                {users.length <= 1 && (
                  <p className="text-xs text-muted-foreground">No other users available to share with.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCreate}
          disabled={!boardName.trim() || columns.length === 0}
          className="w-full gap-2"
          size="lg"
        >
          Create Board <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BoardSetup;
