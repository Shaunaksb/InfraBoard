import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import BoardSidebar from "@/components/BoardSidebar";
import BoardSetup from "@/components/BoardSetup";
import KanbanBoardView from "@/components/KanbanBoardView";
import { useBoards } from "@/hooks/useBoards";

const Index = () => {
  const {
    boards,
    activeBoard,
    activeBoardId,
    showSetup,
    addBoard,
    selectBoard,
    deleteBoard,
    updateBoard,
    startCreating,
    cancelCreating,
  } = useBoards();

  const showBoardSetup = showSetup || boards.length === 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <BoardSidebar
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={selectBoard}
          onNewBoard={startCreating}
          onDeleteBoard={deleteBoard}
        />
        <div className="flex-1 flex flex-col">
          {showBoardSetup ? (
            <BoardSetup onCreateBoard={addBoard} />
          ) : activeBoard ? (
            <KanbanBoardView board={activeBoard} onBoardChange={updateBoard} />
          ) : null}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
