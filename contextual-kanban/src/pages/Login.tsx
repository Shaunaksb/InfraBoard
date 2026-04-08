import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            toast.error("Please enter your email and password");
            return;
        }

        setIsLoading(true);
        try {
            const result = await authApi.login({ email, password });

            // Store JWT token for subsequent API calls
            localStorage.setItem("kanban_auth_token", result.token);

            // Sync user into query cache so PrivateRoute recognises the session
            queryClient.setQueryData(["currentUser"], result.user);

            toast.success(`Welcome back, ${result.user.name}!`);
            navigate(returnTo);
        } catch (err: any) {
            const message =
                err?.response?.data?.detail ||
                err?.response?.data?.error ||
                "Invalid email or password. Please try again.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1">
                    <div className="flex flex-col items-center justify-center mb-4 space-y-2">
                        <img src="/infraboard.png" alt="InfraBoard Logo" className="h-12 w-auto" />
                        <CardTitle className="text-2xl font-bold tracking-tight">Login to InfraBoard</CardTitle>
                    </div>
                    <CardDescription className="text-center">
                        Enter your credentials below to login to your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
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
                            {isLoading ? "Logging in…" : "Login"}
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            Don't have an account?{" "}
                            <Link to={`/signup${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;
