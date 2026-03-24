import { useState, useCallback, useEffect } from "react";
import { KanbanBoard, KanbanCard, BoardConfig } from "@/types/kanban";
import { useLocalStorage } from "./useLocalStorage";
import { useUsers } from "./useUsers";
import { boardsApi } from "@/lib/api";
import { toast } from "sonner";

const createBoardId = () => `board_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const createInitialBoard = (config: BoardConfig, ownerId?: string): KanbanBoard => {
  const boardId = createBoardId();
  return {
    id: boardId,
    config: {
      ...config,
      ownerId: config.ownerId || ownerId,
      sharedWithUsers: config.sharedWithUsers || [],
      sharedWithOrgs: config.sharedWithOrgs || [],
    },
    columns: config.columns.map((title) => ({
      id: `${boardId}-${title.toLowerCase().replace(/\s+/g, "-")}`,
      title,
      cards: [],
    })),
  };
};

export function useBoards() {
  const [boards, setBoards] = useLocalStorage<KanbanBoard[]>("kanban_boards", []);
  const [activeBoardId, setActiveBoardId] = useLocalStorage<string | null>("kanban_active_board_id", null);
  const [showSetup, setShowSetup] = useState(false);
  const { currentUserId, currentUser } = useUsers();

  useEffect(() => {
    if (boards.length > 0 && !activeBoardId && !showSetup) {
      setActiveBoardId(currentUser?.preferences?.defaultBoardId || boards[0].id);
    }
  }, [boards.length, activeBoardId, showSetup, currentUser?.preferences?.defaultBoardId, setActiveBoardId]);

  // Fetch boards from backend on mount
  useEffect(() => {
    let mounted = true;
    boardsApi.getBoards().then((serverBoards) => {
      if (mounted && serverBoards) {
        setBoards(serverBoards);
        if (serverBoards.length > 0) {
          if (!activeBoardId || !serverBoards.find(b => b.id === activeBoardId)) {
            setActiveBoardId(serverBoards[0].id);
          }
        } else {
          setActiveBoardId(null);
        }
      }
    }).catch(console.error);
    return () => { mounted = false; };
  }, []); // Run once on mount

  const activeBoard = boards.find((b) => b.id === activeBoardId) || null;

  const addBoard = useCallback(async (config: BoardConfig) => {
    const board = createInitialBoard(config, currentUserId || undefined);
    setBoards((prev) => [...prev, board]);
    setActiveBoardId(board.id);
    setShowSetup(false);

    // Sync to backend — send the local board ID so they stay in sync
    try {
      await boardsApi.createBoard(config, board.id);

      // If there are initial sharing settings, sync them in a separate call 
      // since the Django create endpoint marks memberIds as read-only
      if ((config.sharedWithUsers && config.sharedWithUsers.length > 0) ||
        (config.sharedWithOrgs && config.sharedWithOrgs.length > 0)) {
        await boardsApi.shareBoard(board.id, {
          userIds: config.sharedWithUsers || [],
          orgIds: config.sharedWithOrgs || []
        });
      }
    } catch {
      // Board saved locally — backend sync failed silently
    }
  }, [currentUserId, setActiveBoardId, setBoards]);

  const selectBoard = useCallback((id: string) => {
    setActiveBoardId(id);
    setShowSetup(false);
  }, [setActiveBoardId]);

  const deleteBoard = useCallback(async (id: string) => {
    // Optimistic local delete
    setBoards((prev) => prev.filter((b) => b.id !== id));
    setActiveBoardId((prev) => prev === id ? null : prev);

    // Sync to backend
    try {
      if (!id.startsWith("brd_") && !id.startsWith("board_")) {
        // If it's somehow a purely local legacy board, do nothing more
        console.warn("Deleting local-only or legacy board ID:", id);
      } else {
        await boardsApi.deleteBoard(id);
      }
    } catch {
      toast.error("Board deleted locally — backend sync failed.");
    }
  }, [setActiveBoardId, setBoards]);

  const updateBoard = useCallback((updated: KanbanBoard | ((prev: KanbanBoard) => KanbanBoard)) => {
    setBoards((prevBoards) => prevBoards.map((b) => {
      if (b.id === activeBoardId) {
        const finalBoard = typeof updated === 'function' ? updated(b) : updated;
        // Sync to backend 
        if (finalBoard.id && !finalBoard.id.startsWith("brd_") && finalBoard.id !== "board_1") {
          boardsApi.updateBoard(finalBoard.id, finalBoard).catch(console.error);
        } else {
          boardsApi.updateBoard(finalBoard.id, finalBoard).catch(console.error);
        }
        return finalBoard;
      }
      return b;
    }));
  }, [setBoards, activeBoardId]);

  const shareBoard = useCallback(async (boardId: string, userIds: string[], orgIds: string[], emails: string[]) => {
    // 1. Send to backend
    try {
      await boardsApi.shareBoard(boardId, { userIds, orgIds, emails });
    } catch (err) {
      console.error("Failed to share board with backend:", err);
      toast.error("Failed to save sharing settings to the server.");
      return false; // Return failure explicitly if needed
    }

    // 2. Optimistic local update so UI reflects the new state
    setBoards((prevBoards) => prevBoards.map((b) => {
      if (b.id === boardId) {
        return {
          ...b,
          config: {
            ...b.config,
            sharedWithUsers: userIds,
            sharedWithOrgs: orgIds,
          }
        };
      }
      return b;
    }));
    toast.success("Sharing settings updated successfully.");
    return true;
  }, [setBoards]);

  const joinSharedBoard = useCallback((boardId: string, userId: string) => {
    setBoards((prev) => prev.map((b) => {
      if (b.id === boardId) {
        const alreadyJoined = b.config.sharedWithUsers?.includes(userId) || b.config.ownerId === userId;
        if (!alreadyJoined) {
          return {
            ...b,
            config: {
              ...b.config,
              sharedWithUsers: [...(b.config.sharedWithUsers || []), userId]
            }
          };
        }
      }
      return b;
    }));
  }, [setBoards]);

  const startCreating = useCallback(() => {
    setShowSetup(true);
  }, []);

  const cancelCreating = useCallback(() => {
    setShowSetup(false);
    if (boards.length > 0 && !activeBoardId) {
      setActiveBoardId(currentUser?.preferences?.defaultBoardId || boards[0].id);
    }
  }, [boards, activeBoardId, setActiveBoardId, currentUser]);

  return {
    boards,
    activeBoard,
    activeBoardId,
    showSetup,
    addBoard,
    selectBoard,
    deleteBoard,
    updateBoard,
    joinSharedBoard,
    shareBoard,
    startCreating,
    cancelCreating,
  };
}
