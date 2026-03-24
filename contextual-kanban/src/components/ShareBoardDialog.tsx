import { useState } from "react";
import { KanbanBoard } from "@/types/kanban";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUsers } from "@/hooks/useUsers";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useBoards } from "@/hooks/useBoards";
import { Users, Share2 } from "lucide-react";

interface ShareBoardDialogProps {
    board: KanbanBoard;
    onUpdateBoard: (updatedBoard: KanbanBoard) => void;
}

const ShareBoardDialog = ({ board, onUpdateBoard }: ShareBoardDialogProps) => {
    const [open, setOpen] = useState(false);
    const { users, currentUser } = useUsers();
    const { myOrganizations } = useOrganizations();
    const { shareBoard } = useBoards();

    const [sharedWithUsers, setSharedWithUsers] = useState<string[]>(board.config.sharedWithUsers || []);
    const [sharedWithOrgs, setSharedWithOrgs] = useState<string[]>(board.config.sharedWithOrgs || []);

    const handleSave = async () => {
        const success = await shareBoard(board.id, sharedWithUsers, sharedWithOrgs, []);
        if (success) {
            onUpdateBoard({
                ...board,
                config: {
                    ...board.config,
                    sharedWithUsers,
                    sharedWithOrgs,
                }
            });
            setOpen(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setSharedWithUsers(board.config.sharedWithUsers || []);
            setSharedWithOrgs(board.config.sharedWithOrgs || []);
        }
        setOpen(isOpen);
    };

    // Only the owner can share the board
    const isOwner = currentUser?.id === board.config.ownerId;

    if (!isOwner) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" /> Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Share "{board.config.name}"</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" /> Members & Organizations
                        </h4>
                        <p className="text-xs text-muted-foreground">Select who can access and collaborate on this board.</p>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Organizations */}
                            {myOrganizations.length > 0 && (
                                <div className="border border-border p-3 rounded-md">
                                    <Label className="text-xs font-semibold mb-2 block">Organizations</Label>
                                    <div className="space-y-2 max-h-[150px] overflow-auto">
                                        {myOrganizations.map((org) => (
                                            <label key={org.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer p-1 rounded hover:bg-muted/50">
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
                            <div className="border border-border p-3 rounded-md">
                                <Label className="text-xs font-semibold mb-2 block">Users</Label>
                                <div className="space-y-2 max-h-[150px] overflow-auto">
                                    {users.filter(u => u.id !== currentUser?.id).map((user) => (
                                        <label key={user.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer p-1 rounded hover:bg-muted/50">
                                            <Checkbox
                                                checked={sharedWithUsers.includes(user.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setSharedWithUsers((prev) => [...prev, user.id]);
                                                    else setSharedWithUsers((prev) => prev.filter((id) => id !== user.id));
                                                }}
                                            />
                                            <span className="truncate" title={user.email}>{user.name}</span>
                                        </label>
                                    ))}
                                    {users.length <= 1 && (
                                        <p className="text-xs text-muted-foreground p-1">No other users.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareBoardDialog;
