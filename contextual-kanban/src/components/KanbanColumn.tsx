import { useState } from "react";
import { KanbanColumn as KanbanColumnType, KanbanCard, BoardConfig } from "@/types/kanban";
import { Droppable } from "@hello-pangea/dnd";
import KanbanCardItem from "./KanbanCardItem";
import CardDialog from "./CardDialog";
import CardPreviewDialog from "./CardPreviewDialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  column: KanbanColumnType;
  config: BoardConfig;
  allCards: KanbanCard[];
  onAddCard: (columnId: string, card: Omit<KanbanCard, "id" | "order" | "createdAt"> & { newFiles?: File[] }) => void;
  onEditCard: (card: KanbanCard & { newFiles?: File[] }) => void;
  onDeleteCard: (cardId: string) => void;
}

const KanbanColumnComponent = ({ column, config, allCards, onAddCard, onEditCard, onDeleteCard }: KanbanColumnProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);

  return (
    <div className="flex h-full min-w-[250px] max-w-[400px] flex-1 shrink-0 flex-col rounded-xl bg-column p-2">
      <div className="mb-2 flex items-center justify-between px-2 py-1.5">
        <h3 className="text-sm font-semibold tracking-wide text-column-header uppercase">
          {column.title}
        </h3>
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          {column.cards.length}
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 overflow-y-auto rounded-lg p-1 kanban-scrollbar transition-colors ${snapshot.isDraggingOver ? "bg-accent/50" : ""
              }`}
          >
            {column.cards.map((card, index) => (
              <KanbanCardItem
                key={card.id}
                card={card}
                index={index}
                config={config}
                onClick={() => {
                  setEditingCard(card);
                  setPreviewOpen(true);
                }}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Button
        variant="ghost"
        onClick={() => {
          setEditingCard(null);
          setDialogOpen(true);
        }}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Plus className="h-4 w-4" /> Add card
      </Button>

      {/* Preview dialog */}
      {editingCard && (
        <CardPreviewDialog
          open={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setEditingCard(null);
          }}
          onEdit={() => {
            setPreviewOpen(false);
            setDialogOpen(true);
          }}
          card={editingCard}
          config={config}
        />
      )}

      {/* Edit/Create dialog */}
      <CardDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingCard(null);
        }}
        onSave={(cardData) => {
          if (editingCard) {
            onEditCard({ ...editingCard, ...cardData });
          } else {
            onAddCard(column.id, cardData);
          }
        }}
        onDelete={editingCard ? () => {
          onDeleteCard(editingCard.id);
          setDialogOpen(false);
          setEditingCard(null);
        } : undefined}
        config={config}
        columnId={column.id}
        editCard={editingCard}
        allCards={allCards}
      />
    </div>
  );
};

export default KanbanColumnComponent;
