import { KanbanBoard } from "@/types/kanban";
import { LayoutGrid, Plus, Trash2, Settings, Users, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BoardSidebarProps {
  boards: KanbanBoard[];
  activeBoardId: string | null;
  onSelectBoard: (id: string) => void;
  onNewBoard: () => void;
  onDeleteBoard: (id: string) => void;
}

const BoardSidebar = ({ boards, activeBoardId, onSelectBoard, onNewBoard, onDeleteBoard }: BoardSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useUsers();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-6 w-6" />
              {!collapsed && <span>Boards</span>}
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onNewBoard}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {boards.map((board) => (
                <SidebarMenuItem key={board.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectBoard(board.id)}
                    isActive={board.id === activeBoardId}
                    className="group/item"
                  >
                    <LayoutGrid className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{board.config.name}</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 w-6 shrink-0 opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive hover:bg-transparent transition-opacity"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the board "{board.config.name}" and all its cards. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteBoard(board.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Board
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {boards.length === 0 && !collapsed && (
                <p className="px-3 py-2 text-xs text-muted-foreground">No boards yet</p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && <span>Settings</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/user-preferences"}
                  className="group/item"
                >
                  <Link to="/user-preferences">
                    <Settings className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>User Preferences</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/organizations"}
                  className="group/item"
                >
                  <Link to="/organizations">
                    <Users className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Organizations</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="group/item text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Logout {currentUser?.name}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default BoardSidebar;
