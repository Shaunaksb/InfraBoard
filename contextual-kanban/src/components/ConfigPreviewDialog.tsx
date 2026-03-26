import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ConfigPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCards: Record<string, string>;
  boardId: string;
}

export default function ConfigPreviewDialog({ open, onClose, selectedCards, boardId }: ConfigPreviewDialogProps) {
  const [pipelineData, setPipelineData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (open && Object.keys(selectedCards).length > 0) {
      generatePipeline();
    }
  }, [open, selectedCards]);

  const getAuthToken = () => {
    return localStorage.getItem("kanban_auth_token") || "";
  };

  const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || "http://localhost:8000";
  };

  const generatePipeline = async () => {
    setLoading(true);
    setPipelineData({});
    try {
      const cardIds = Object.values(selectedCards);
      const res = await fetch(`${getBaseUrl()}/api/v1/boards/${boardId}/generate_preview/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ selected_card_ids: cardIds })
      });
      if (!res.ok) throw new Error("Failed to generate pipeline");
      const data = await res.json();
      setPipelineData(data);
      if (Object.keys(data).length > 0) {
        setActiveTab(Object.keys(data)[0]);
      } else {
        toast.info("No configurations were generated. Ensure selected cards belong to valid DevOps tools.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error generating pipeline preview.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPipeline = async () => {
    try {
      const cardIds = Object.values(selectedCards);
      const res = await fetch(`${getBaseUrl()}/api/v1/boards/${boardId}/download_config/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ selected_card_ids: cardIds })
      });
      if (!res.ok) throw new Error("Failed to download pipeline");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pipeline_${boardId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Pipeline downloaded successfully");
    } catch (e) {
      console.error(e);
      toast.error("Error downloading pipeline bundle.");
    }
  };

  const files = Object.keys(pipelineData);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Pipeline Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0 pt-2">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : files.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
                {files.map(file => (
                  <TabsTrigger
                    key={file}
                    value={file}
                    className="relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    {file}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex-1 overflow-y-auto mt-2 rounded-md bg-muted/50 p-4 kanban-scrollbar outline-none border border-border">
                {files.map(file => (
                  <TabsContent key={file} value={file} className="m-0 h-full outline-none">
                    <pre className="text-sm font-mono whitespace-pre-wrap break-all text-foreground">
                      <code>{pipelineData[file]}</code>
                    </pre>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <p>No configuration generated.</p>
              <p className="text-sm mt-1">Select valid tool cards to generate your pipeline.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 gap-2 border-t mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={downloadPipeline} disabled={loading || files.length === 0} className="gap-2">
            <Download className="h-4 w-4" /> Download Pipeline (ZIP)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
