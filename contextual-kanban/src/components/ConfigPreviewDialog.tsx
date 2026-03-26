import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, Copy, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";

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
  const [editingMode, setEditingMode] = useState<Record<string, boolean>>({});

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
              <div className="flex-1 overflow-hidden mt-2 relative border border-border rounded-md flex flex-col">
                {files.map(file => (
                  <TabsContent key={file} value={file} className="m-0 flex-1 w-full outline-none data-[state=active]:flex flex-col relative group">
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-8 gap-1.5 text-xs shadow-sm bg-background/90 hover:bg-background"
                        onClick={() => setEditingMode(prev => ({ ...prev, [file]: !prev[file] }))}
                      >
                        {editingMode[file] ? <><Check className="h-3.5 w-3.5 text-green-500" /> Done</> : <><Pencil className="h-3.5 w-3.5" /> Edit</>}
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 shadow-sm bg-background/90 hover:bg-background"
                        onClick={() => {
                          navigator.clipboard.writeText(pipelineData[file]);
                          toast.success("Copied to clipboard");
                        }}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    {editingMode[file] ? (
                      <Textarea 
                        value={pipelineData[file]}
                        onChange={(e) => setPipelineData(prev => ({ ...prev, [file]: e.target.value }))}
                        className="flex-1 w-full resize-none border-0 font-mono text-sm whitespace-pre focus-visible:ring-0 rounded-none bg-muted/30 p-4 kanban-scrollbar text-foreground"
                        spellCheck={false}
                        autoFocus
                      />
                    ) : (
                      <pre className="flex-1 w-full overflow-y-auto m-0 p-4 text-sm font-mono whitespace-pre-wrap break-all bg-muted/10 text-foreground kanban-scrollbar">
                        <code>{pipelineData[file]}</code>
                      </pre>
                    )}
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
