import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBoards } from "@/hooks/useBoards";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const { joinSharedBoard } = useBoards();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Support referral links
    const boardId = searchParams.get("boardId");
    const returnTo = searchParams.get("returnTo") || "/";

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const result = await authApi.signup({ name, email, password });

            // Store JWT token for subsequent API calls
            localStorage.setItem("kanban_auth_token", result.token);

            // Sync user into query cache so PrivateRoute recognises the session
            queryClient.setQueryData(["currentUser"], result.user);

            toast.success(`Account created! Welcome, ${result.user.name}!`);

            // Auto-join board if referred via share link
            if (boardId) {
                joinSharedBoard(boardId, result.user.id);
                toast.info("You've been added to the shared board.");
            }

            navigate(returnTo);
        } catch (err: any) {
            const data = err?.response?.data;
            // DRF returns field-level errors as { field: ["message"] }
            if (data && typeof data === "object") {
                const firstError = Object.values(data).flat()[0];
                toast.error(String(firstError) || "Signup failed. Please try again.");
            } else {
                toast.error("Signup failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription>
                        Enter your details below to create your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Creating account…" : "Sign Up"}
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            Already have an account?{" "}
                            <Link to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="text-primary hover:underline">
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Signup;
