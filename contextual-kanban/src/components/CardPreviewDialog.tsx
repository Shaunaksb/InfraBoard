import { KanbanCard, BoardConfig, FileAttachment, ConfigFieldSchema } from "@/types/kanban";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Download, FileIcon, Play } from "lucide-react";

interface CardPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  card: KanbanCard;
  config: BoardConfig;
  configFields?: ConfigFieldSchema[];
  toolName?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CardPreviewDialog = ({ open, onClose, onEdit, card, config, configFields = [], toolName }: CardPreviewDialogProps) => {
  const cardTags = config.tags.filter((t) => card.tags.includes(t.id));
  const attachments = card.attachments || [];

  const renderAttachment = (att: FileAttachment) => {
    if (att.type.startsWith("image/")) {
      return (
        <div key={att.id} className="space-y-1">
          <img src={att.url} alt={att.name} className="w-full rounded-lg border border-border object-contain max-h-64" />
          <p className="text-xs text-muted-foreground">{att.name} · {formatBytes(att.size)}</p>
        </div>
      );
    }
    if (att.type.startsWith("video/")) {
      return (
        <div key={att.id} className="space-y-1">
          <video src={att.url} controls className="w-full rounded-lg border border-border max-h-64" />
          <p className="text-xs text-muted-foreground">{att.name} · {formatBytes(att.size)}</p>
        </div>
      );
    }
    return (
      <div key={att.id} className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2">
        <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">{att.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(att.size)}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            fetch(att.url)
              .then(res => res.blob())
              .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = att.name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              })
              .catch(err => console.error("Download failed:", err));
          }}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto kanban-scrollbar sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg">{card.title}</DialogTitle>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Tags */}
          {cardTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {cardTags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: `hsl(${tag.color} / 0.15)`,
                    color: `hsl(${tag.color})`,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Fields */}
          {config.fields.map((field) => {
            const value = card.fields[field.id];
            if (!value) return null;
            return (
              <div key={field.id}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{field.name}</p>
                {field.type === "textarea" ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
                ) : field.type === "url" ? (
                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline break-all">{value}</a>
                ) : (
                  <p className="text-sm text-foreground">{value}</p>
                )}
              </div>
            );
          })}

          {/* Config Data */}
          {configFields.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                {toolName || "Tool"} Configuration
              </p>
              <div className="rounded-lg border border-border bg-card/50 p-3 space-y-3">
                {configFields.map((field) => {
                  const value = card.config_data?.[field.id];
                  if (value === undefined || value === "") return null;
                  
                  return (
                    <div key={field.id}>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{field.label}</p>
                      {field.type === 'checkbox' ? (
                        <p className="text-sm text-foreground">{value ? 'Enabled' : 'Disabled'}</p>
                      ) : (
                        <p className="text-sm text-foreground break-all">{String(value)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Attachments ({attachments.length})
              </p>
              <div className="space-y-3">
                {attachments.map(renderAttachment)}
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground pt-2">
            Created {new Date(card.createdAt).toLocaleDateString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardPreviewDialog;
