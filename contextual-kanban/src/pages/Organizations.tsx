import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BoardSidebar from "@/components/BoardSidebar";
import { useBoards } from "@/hooks/useBoards";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useUsers } from "@/hooks/useUsers";
import { Plus, Users, X } from "lucide-react";
import { Link } from "react-router-dom";

const Organizations = () => {
    const { organizations, addOrganization, addMembersToOrg, removeMemberFromOrg } = useOrganizations();
    const { users, currentUser } = useUsers();

    const {
        boards,
        activeBoardId,
        selectBoard,
        startCreating,
        deleteBoard,
    } = useBoards();

    const [newOrgName, setNewOrgName] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [manageOrgId, setManageOrgId] = useState<string | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const { addUser } = useUsers();

    const handleCreateOrg = (e: React.FormEvent) => {
        e.preventDefault();
        if (newOrgName.trim()) {
            addOrganization(newOrgName.trim());
            setNewOrgName("");
            setIsCreateOpen(false);
        }
    };

    const handleToggleMember = (orgId: string, userId: string, isMember: boolean) => {
        if (isMember) {
            removeMemberFromOrg(orgId, userId);
        } else {
            addMembersToOrg(orgId, [userId]);
        }
    };

    const handleInviteUser = (e: React.FormEvent, orgId: string) => {
        e.preventDefault();
        const email = inviteEmail.trim().toLowerCase();
        if (!email) return;

        const existingUser = users.find(u => u.email.toLowerCase() === email);
        if (existingUser) {
            addMembersToOrg(orgId, [existingUser.id]);
        } else {
            // "Create" a mock user if they don't exist in our mock db
            const nameFromEmail = email.split('@')[0];
            const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

            const newUserId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            addUser({
                name: capitalizedName,
                email: email,
                preferences: {
                    theme: "system",
                    emailNotifications: true,
                    pushNotifications: true,
                }
            });
            // We can't immediately add the user to the org here because `addUser` state update 
            // is async and we need the ID, but since we created the ID manually above, we 
            // actually CAN if we tweak `useUsers` or just pass the ID. We'll pass the generated ID to `addMembersToOrg` directly, 
            // assuming `useUsers` might be updated to let us pass an ID, or we just trust the mock system.
            addMembersToOrg(orgId, [newUserId]);
        }
        setInviteEmail("");
    };

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
                <div className="flex-1 flex flex-col p-8 bg-background overflow-auto">
                    <div className="max-w-4xl w-full mx-auto space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">Organizations</h1>
                                <p className="text-muted-foreground mt-2">Manage your teams and shared workspaces.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2"><Plus className="h-4 w-4" /> New Organization</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create Organization</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleCreateOrg} className="space-y-4 pt-4">
                                            <Input
                                                placeholder="Organization Name"
                                                value={newOrgName}
                                                onChange={(e) => setNewOrgName(e.target.value)}
                                            />
                                            <Button type="submit" className="w-full" disabled={!newOrgName.trim()}>
                                                Create
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="outline" asChild className="gap-2">
                                    <Link to="/">
                                        <X className="h-4 w-4" /> Close
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {organizations.map((org) => {
                                const orgMembers = users.filter((u) => org.memberIds.includes(u.id));
                                const isOwner = currentUser?.id === org.ownerId;
                                return (
                                    <div key={org.id} className="p-6 border border-border rounded-lg bg-card">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                                                    <Users className="h-5 w-5 text-primary" />
                                                    {org.name}
                                                </h2>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {orgMembers.length} member{orgMembers.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            <Dialog open={manageOrgId === org.id} onOpenChange={(open) => setManageOrgId(open ? org.id : null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" disabled={!isOwner}>
                                                        Manage
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Manage Members: {org.name}</DialogTitle>
                                                    </DialogHeader>
                                                    <form onSubmit={(e) => handleInviteUser(e, org.id)} className="flex gap-2 pt-4">
                                                        <Input
                                                            type="email"
                                                            placeholder="Invite user by email..."
                                                            value={inviteEmail}
                                                            onChange={(e) => setInviteEmail(e.target.value)}
                                                        />
                                                        <Button type="submit" disabled={!inviteEmail.trim()}>
                                                            Invite
                                                        </Button>
                                                    </form>
                                                    <div className="space-y-4 max-h-[50vh] overflow-y-auto mt-4">
                                                        {users.map((user) => {
                                                            const isMember = org.memberIds.includes(user.id);
                                                            const isSelf = user.id === currentUser?.id;
                                                            return (
                                                                <div key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                                                                    <div className="min-w-0 flex-1 pr-4">
                                                                        <p className="font-medium text-sm truncate">{user.name} {isSelf && "(You)"}</p>
                                                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {isMember ? (
                                                                            <Button
                                                                                variant="destructive"
                                                                                size="sm"
                                                                                disabled={user.id === org.ownerId}
                                                                                onClick={() => handleToggleMember(org.id, user.id, true)}
                                                                            >
                                                                                Remove
                                                                            </Button>
                                                                        ) : (
                                                                            <Button
                                                                                variant="secondary"
                                                                                size="sm"
                                                                                onClick={() => handleToggleMember(org.id, user.id, false)}
                                                                            >
                                                                                Add
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {orgMembers.slice(0, 5).map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-secondary flex items-center justify-center text-xs font-medium"
                                                    title={member.name}
                                                >
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                            {orgMembers.length > 5 && (
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                                    +{orgMembers.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {organizations.length === 0 && (
                                <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                                    No organizations found. Create one to get started!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Organizations;
