import { KanbanCard, BoardConfig } from "@/types/kanban";
import { Draggable } from "@hello-pangea/dnd";
import { GripVertical, Paperclip } from "lucide-react";

interface KanbanCardItemProps {
  card: KanbanCard;
  index: number;
  config: BoardConfig;
  onClick: () => void;
}

const KanbanCardItem = ({ card, index, config, onClick }: KanbanCardItemProps) => {
  const cardTags = config.tags.filter((t) => card.tags.includes(t.id));
  const descField = config.fields.find((f) => f.type === "textarea");
  const descValue = descField ? card.fields[descField.id] : undefined;

  // Show a couple of non-empty field values as summary
  const summaryFields = config.fields
    .filter((f) => f.type !== "textarea" && card.fields[f.id])
    .slice(0, 2);

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={onClick}
          className={`group cursor-pointer rounded-lg border border-border bg-card p-3 transition-shadow ${
            snapshot.isDragging ? "shadow-card-drag" : "hover:shadow-card-hover"
          }`}
        >
          <div className="flex items-start gap-1.5">
            <div {...provided.dragHandleProps} className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              {cardTags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {cardTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
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
              <p className="text-sm font-medium text-card-foreground leading-snug">{card.title}</p>
              {descValue && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{descValue}</p>
              )}
              {summaryFields.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {summaryFields.map((f) => (
                    <span key={f.id} className="text-[11px] text-muted-foreground">
                      <span className="font-medium">{f.name}:</span> {card.fields[f.id]}
                    </span>
                  ))}
                </div>
              )}
              {(card.attachments?.length ?? 0) > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  <span>{card.attachments!.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCardItem;
