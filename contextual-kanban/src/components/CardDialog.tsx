import { useState, useRef, useMemo } from "react";
import { KanbanCard, BoardConfig, FieldConfig, FileAttachment } from "@/types/kanban";
import { calculateSimilarity } from "@/utils/fuzzySearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Paperclip, X, Video, Circle, Square, FileIcon, Play } from "lucide-react";
import { useScreenRecorder } from "@/hooks/useScreenRecorder";

interface CardDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (card: Omit<KanbanCard, "id" | "order" | "createdAt">) => void;
  onDelete?: () => void;
  config: BoardConfig;
  columnId: string;
  editCard?: KanbanCard | null;
  allCards: KanbanCard[];
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const CardDialog = ({ open, onClose, onSave, onDelete, config, columnId, editCard, allCards }: CardDialogProps) => {
  const [title, setTitle] = useState(editCard?.title || "");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(editCard?.fields || {});
  const [selectedTags, setSelectedTags] = useState<string[]>(editCard?.tags || []);
  const [attachments, setAttachments] = useState<FileAttachment[]>(editCard?.attachments || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state: recState, elapsed, blob, startRecording, stopRecording, reset: resetRecorder } = useScreenRecorder();

  const similarCards = useMemo(() => {
    if (title.trim().length <= 2 || editCard) return [];
    return allCards
      .map(card => ({ card, score: calculateSimilarity(title, card.title) }))
      .filter(match => match.score > 0.6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [title, allCards, editCard]);

  const [pendingFiles, setPendingFiles] = useState<{ id: string; file: File | Blob; name: string; url: string; size: number; isVideo: boolean }[]>([]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const newPending = Array.from(files).map((file) => ({
      id: `new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      isVideo: file.type.startsWith("video/"),
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);
  };

  const removeAttachment = (id: string, isExisting: boolean) => {
    if (isExisting) {
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } else {
      setPendingFiles((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleSaveRecording = () => {
    if (!blob) return;
    const newPending = {
      id: `rec_${Date.now()}`,
      file: blob,
      name: `recording-${new Date().toISOString().slice(0, 19)}.webm`,
      url: URL.createObjectURL(blob),
      size: blob.size,
      isVideo: true,
    };
    setPendingFiles((prev) => [...prev, newPending]);
    resetRecorder();
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      fields: fieldValues,
      tags: selectedTags,
      attachments, // We'll pass the existing ones
      columnId,
      newFiles: pendingFiles.map(pf => pf.file) // Pass standard JS files for upload
    } as any); // using 'any' to bypass strict type here temporarily, better to update the props interface
    setTitle("");
    setFieldValues({});
    setSelectedTags([]);
    setAttachments([]);
    setPendingFiles([]);
    onClose();
  };

  const renderField = (field: FieldConfig) => {
    const value = fieldValues[field.id] || "";
    const onChange = (val: string) => setFieldValues({ ...fieldValues, [field.id]: val });

    switch (field.type) {
      case "textarea":
        return <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className="min-h-[80px]" />;
      case "select":
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "date":
        return <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} />;
      case "number":
        return <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
      case "url":
        return <Input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "https://..."} />;
      default:
        return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto kanban-scrollbar sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editCard ? "Edit Card" : "New Card"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-sm font-medium">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card title" className="mt-1" autoFocus />

            {similarCards.length > 0 && (
              <div className="mt-2 space-y-1">
                {similarCards.map(({ card, score }) => (
                  <div key={card.id} className="flex items-start gap-2 text-xs rounded-md bg-destructive/10 text-destructive px-2 py-1.5 border border-destructive/20">
                    <span className="font-semibold shrink-0 mt-0.5 whitespace-nowrap">{(score * 100).toFixed(0)}% Match:</span>
                    <span className="truncate" title={card.title}>{card.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {config.fields.map((field) => (
            <div key={field.id}>
              <Label className="text-sm font-medium">{field.name}</Label>
              <div className="mt-1">{renderField(field)}</div>
            </div>
          ))}

          {config.tags.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {config.tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${selectedTags.includes(tag.id)
                      ? "ring-2 ring-offset-1 ring-offset-card"
                      : "opacity-60 hover:opacity-100"
                      }`}
                    style={{
                      backgroundColor: `hsl(${tag.color} / 0.15)`,
                      color: `hsl(${tag.color})`,
                      ...(selectedTags.includes(tag.id) ? { ringColor: `hsl(${tag.color})` } : {}),
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div>
            <Label className="text-sm font-medium">Attachments</Label>
            <div className="mt-2 space-y-2">
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm">
                  {att.type.startsWith("video/") ? (
                    <Play className="h-4 w-4 shrink-0 text-primary" />
                  ) : att.type.startsWith("image/") ? (
                    <img src={att.url} alt={att.name} className="h-8 w-8 shrink-0 rounded object-cover" />
                  ) : (
                    <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">{att.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(att.size)}</p>
                  </div>
                  <button onClick={() => removeAttachment(att.id, true)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {pendingFiles.map((pf) => (
                <div key={pf.id} className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                  {pf.isVideo ? (
                    <Play className="h-4 w-4 shrink-0 text-primary" />
                  ) : pf.file.type.startsWith("image/") ? (
                    <img src={pf.url} alt={pf.name} className="h-8 w-8 shrink-0 rounded object-cover" />
                  ) : (
                    <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">{pf.name} <span className="text-[10px] text-primary">(Pending)</span></p>
                    <p className="text-xs text-muted-foreground">{formatBytes(pf.size)}</p>
                  </div>
                  <button onClick={() => removeAttachment(pf.id, false)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Recording indicator */}
              {recState === "recording" && (
                <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                  <Circle className="h-3 w-3 animate-pulse fill-destructive text-destructive" />
                  <span className="text-sm font-medium text-destructive">Recording {formatTime(elapsed)}</span>
                  <Button variant="destructive" size="sm" className="ml-auto h-7 gap-1 text-xs" onClick={stopRecording}>
                    <Square className="h-3 w-3" /> Stop
                  </Button>
                </div>
              )}

              {recState === "stopped" && blob && (
                <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
                  <Video className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">Recording ready ({formatBytes(blob.size)})</span>
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetRecorder}>Discard</Button>
                    <Button size="sm" className="h-7 text-xs" onClick={handleSaveRecording}>Attach</Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-3.5 w-3.5" /> Attach file
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={startRecording}
                  disabled={recState === "recording"}
                >
                  <Video className="h-3.5 w-3.5" /> Record screen
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {editCard && onDelete && (
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)} className="gap-1.5">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
            <div className="flex flex-1 gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={!title.trim()}>
                {editCard ? "Save" : "Add Card"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default CardDialog;
