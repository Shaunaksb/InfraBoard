import { useState, useCallback, useEffect } from "react";
import { KanbanBoard, KanbanCard, BoardConfig } from "@/types/kanban";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import KanbanColumnComponent from "./KanbanColumn";
import { LayoutGrid, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { useUsers } from "@/hooks/useUsers";
import ShareBoardDialog from "./ShareBoardDialog";
import { useTemplates } from "@/hooks/useTemplates";
import { cardsApi } from "@/lib/api";
import { toast } from "sonner";
import { useMemo } from "react";

interface KanbanBoardViewProps {
  board: KanbanBoard;
  onBoardChange: (board: KanbanBoard | ((prev: KanbanBoard) => KanbanBoard)) => void;
}

const KanbanBoardView = ({ board, onBoardChange }: KanbanBoardViewProps) => {
  const { currentUser, updateUser } = useUsers();
  const theme = currentUser?.preferences.theme || "system";
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleDark = () => {
    if (currentUser) {
      updateUser({
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          theme: isDark ? "light" : "dark",
        },
      });
    }
  };
  const [focusMode, setFocusMode] = useState(false);
  const [focusColumns, setFocusColumns] = useState<string[]>(
    board.config.focusColumns || board.columns.map((c) => c.id)
  );
  const sidebar = useSidebar();
  const { addTemplate } = useTemplates();
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Sync sidebar with focus mode
  useEffect(() => {
    if (focusMode) {
      sidebar.setOpen(false);
    } else {
      sidebar.setOpen(true);
    }
  }, [focusMode]);

  const setBoard = useCallback(
    (updater: KanbanBoard | ((prev: KanbanBoard) => KanbanBoard)) => {
      onBoardChange(updater); // TypeScript now matches correctly
    },
    [onBoardChange]
  );

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => ({ ...col, cards: [...col.cards] }));
      const sourceCol = newColumns.find((c) => c.id === source.droppableId)!;
      const destCol = newColumns.find((c) => c.id === destination.droppableId)!;
      const [moved] = sourceCol.cards.splice(source.index, 1);
      moved.columnId = destination.droppableId;
      destCol.cards.splice(destination.index, 0, moved);
      return { ...prev, columns: newColumns };
    });
  }, [setBoard]);

  const addCard = useCallback(
    async (columnId: string, cardData: Omit<KanbanCard, "id" | "order" | "createdAt"> & { newFiles?: File[] }) => {
      // Optimistic local card for immediate UI feedback
      const { newFiles, ...cardBaseData } = cardData as any;
      const tempCard: KanbanCard = {
        ...cardBaseData,
        id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        order: board.columns.find((c) => c.id === columnId)?.cards.length ?? 0,
        createdAt: new Date().toISOString(),
        attachments: [], // We'll fill this in after upload
      };
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === columnId ? { ...col, cards: [...col.cards, tempCard] } : col
        ),
      }));

      try {
        let serverCard = await cardsApi.createCard(board.id, columnId, cardBaseData);
        
        // Upload any attached files
        if (newFiles && newFiles.length > 0) {
           for (const file of newFiles) {
               await cardsApi.uploadAttachment(board.id, serverCard.id, file);
           }
           // Re-fetch or manually construct the updated card but for now let's just assume the attachments exist or re-fetch card
           // Actually, since we don't have a single GET card endpoint, we can just rely on the upload response which returns FileAttachment
        }
        
        // Replace the temp card with the server-returned card
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            cards: col.cards.map((c) => (c.id === tempCard.id ? serverCard : c)),
          })),
        }));
      } catch {
        toast.error("Card saved locally — backend sync failed.");
      }
    },
    [board.id, board.columns, setBoard]
  );

  const editCard = useCallback(async (updatedCard: KanbanCard & { newFiles?: File[] }) => {
    const { newFiles, ...cardBaseData } = updatedCard as any;

    try {
      // Find old card to diff attachments for deletion
      const oldCard = board.columns.flatMap(c => c.cards).find(c => c.id === updatedCard.id);
      if (oldCard && oldCard.attachments) {
         const newAttIds = updatedCard.attachments?.map(a => a.id) || [];
         const deletedAtts = oldCard.attachments.filter(a => !newAttIds.includes(a.id));
         for (const att of deletedAtts) {
             await cardsApi.deleteAttachment(board.id, updatedCard.id, att.id);
         }
      }

      const serverCard = await cardsApi.updateCard(board.id, updatedCard.id, cardBaseData);
      
      if (newFiles && newFiles.length > 0) {
          for (const file of newFiles) {
              await cardsApi.uploadAttachment(board.id, serverCard.id, file);
          }
      }

      // Optimistic local update
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          cards: col.cards.map((c) => (c.id === updatedCard.id ? serverCard : c)),
        })),
      }));

    } catch {
      toast.error("Card updated locally — backend sync failed.");
    }
  }, [board.id, board.columns, setBoard]);

  const deleteCard = useCallback(async (cardId: string) => {
    // Optimistic local delete
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      })),
    }));

    try {
      await cardsApi.deleteCard(board.id, cardId);
    } catch {
      toast.error("Card deleted locally — backend sync failed.");
    }
  }, [board.id, setBoard]);

  const toggleFocusColumn = (colId: string) => {
    setFocusColumns((prev) =>
      prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId]
    );
  };

  const visibleColumns = focusMode
    ? board.columns.filter((col) => focusColumns.includes(col.id))
    : board.columns;

  const allCards = useMemo(() => board.columns.flatMap(c => c.cards), [board.columns]);

  const handleSaveAsTemplate = async () => {
    try {
      setIsSavingTemplate(true);
      await addTemplate({
        name: `${board.config.name} Template`,
        description: "Custom user-generated template",
        icon: "⭐",
        columns: board.config.columns,
        fields: board.config.fields,
        tags: board.config.tags
      });
      toast.success("Board saved as a reusable Template!");
    } catch (err) {
      toast.error("Failed to save template.");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LayoutGrid className="h-5 w-5 text-primary ml-1" />
          <h1 className="text-lg font-bold text-foreground">{board.config.name}</h1>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {board.columns.reduce((sum, col) => sum + col.cards.length, 0)} cards
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${focusMode ? "text-primary" : "text-muted-foreground"}`}
                title="Configure focus columns"
              >
                {focusMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Focus Mode</span>
                  <Button
                    variant={focusMode ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setFocusMode((v) => !v)}
                  >
                    {focusMode ? "On" : "Off"}
                  </Button>
                </div>
                <div className="space-y-2">
                  {board.columns.map((col) => (
                    <label key={col.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <Checkbox
                        checked={focusColumns.includes(col.id)}
                        onCheckedChange={() => toggleFocusColumn(col.id)}
                      />
                      {col.title}
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <ShareBoardDialog board={board} onUpdateBoard={onBoardChange} />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveAsTemplate}
            disabled={isSavingTemplate}
            className="text-sm border border-dashed border-border"
            title="Save board schema as a Template"
          >
            {isSavingTemplate ? "Saving..." : "Save as Template"}
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleDark} className="h-8 w-8 text-muted-foreground" title="Toggle dark mode">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-6 kanban-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex w-full gap-4 h-full">
            {visibleColumns.map((column) => (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                config={board.config}
                allCards={allCards}
                onAddCard={addCard}
                onEditCard={editCard}
                onDeleteCard={deleteCard}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default KanbanBoardView;
