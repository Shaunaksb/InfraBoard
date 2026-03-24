import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUsers } from "@/hooks/useUsers";
import { useBoards } from "@/hooks/useBoards";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * Functional route that handles referral links formatted as: `/share/:boardId`
 */
const ShareRedirect = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { currentUser } = useUsers();
    const { joinSharedBoard, boards } = useBoards();
    const navigate = useNavigate();

    useEffect(() => {
        if (!boardId) {
            navigate("/");
            return;
        }

        if (currentUser) {
            // Check if board exists
            const boardExists = boards.some(b => b.id === boardId);
            if (!boardExists) {
                toast.error("This shared board link is invalid or the board has been deleted.");
                navigate("/");
                return;
            }

            // User is logged in, append board and redirect
            joinSharedBoard(boardId, currentUser.id);
            toast.success("Successfully joined the shared board!");
            navigate("/");
        } else {
            // User is not logged in, redirect to signup with embedded boardId hook
            toast.info("Please sign up to access this shared board.");
            navigate(`/signup?boardId=${boardId}`);
        }
    }, [boardId, currentUser, navigate, joinSharedBoard, boards]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Resolving secure shared link...</p>
            </div>
        </div>
    );
};

export default ShareRedirect;
