import { SidebarProvider } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BoardSidebar from "@/components/BoardSidebar";
import { useBoards } from "@/hooks/useBoards";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const UserPreferences = () => {
    const { currentUser, updateUser } = useUsers();

    // Note: Using useBoards just to provide standard sidebar props for now
    const {
        boards,
        activeBoardId,
        selectBoard,
        startCreating,
        deleteBoard,
    } = useBoards();

    if (!currentUser) return null;

    const handleUpdatePreference = (key: keyof typeof currentUser.preferences, value: any) => {
        updateUser({
            ...currentUser,
            preferences: {
                ...currentUser.preferences,
                [key]: value,
            }
        });
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
                    <div className="max-w-2xl w-full mx-auto space-y-8 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">User Preferences</h1>
                                <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
                            </div>
                            <Button variant="outline" asChild className="gap-2">
                                <Link to="/">
                                    <X className="h-4 w-4" /> Close
                                </Link>
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* Profile details read-only display */}
                            <div className="p-6 border border-border rounded-lg bg-card">
                                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Profile</h2>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground">Name</Label>
                                        <div className="font-medium">{currentUser.name}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Email</Label>
                                        <div className="font-medium">{currentUser.email}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="p-6 border border-border rounded-lg bg-card space-y-6">
                                <h2 className="text-xl font-semibold text-card-foreground">App Preferences</h2>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Theme</Label>
                                        <p className="text-sm text-muted-foreground">Select your color theme preference.</p>
                                    </div>
                                    <Select
                                        value={currentUser.preferences.theme}
                                        onValueChange={(val) => handleUpdatePreference("theme", val)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="system">System</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Default Board</Label>
                                        <p className="text-sm text-muted-foreground">Select the board to open by default.</p>
                                    </div>
                                    <Select
                                        value={currentUser.preferences.defaultBoardId || "none"}
                                        onValueChange={(val) => handleUpdatePreference("defaultBoardId", val === "none" ? undefined : val)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select board" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {boards.map(b => (
                                                <SelectItem key={b.id} value={b.id}>{b.config.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Receive updates via email.</p>
                                    </div>
                                    <Switch
                                        checked={currentUser.preferences.emailNotifications}
                                        onCheckedChange={(val) => handleUpdatePreference("emailNotifications", val)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Push Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Receive browser push notifications.</p>
                                    </div>
                                    <Switch
                                        checked={currentUser.preferences.pushNotifications}
                                        onCheckedChange={(val) => handleUpdatePreference("pushNotifications", val)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default UserPreferences;
