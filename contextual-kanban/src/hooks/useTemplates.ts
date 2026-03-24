import { useState, useEffect } from "react";
import { BoardTemplate } from "@/types/kanban";
import { templatesApi } from "@/lib/api";
import { BOARD_TEMPLATES as INITIAL_FALLBACK_TEMPLATES } from "@/data/templates";
import { useLocalStorage } from "./useLocalStorage";

export function useTemplates() {
    const [templates, setTemplates] = useState<BoardTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // We maintain a local cache for custom templates created while offline/backend-less.
    const [customLocalTemplates, setCustomLocalTemplates] = useLocalStorage<BoardTemplate[]>("kanban_custom_templates", []);

    useEffect(() => {
        let mounted = true;
        const fetchTemplates = async () => {
            try {
                setIsLoading(true);
                // Attempt to fetch from API
                const data = await templatesApi.getTemplates();
                if (mounted) {
                    // Combine API results with any local custom offline templates
                    setTemplates([...data, ...customLocalTemplates]);
                    setError(null);
                }
            } catch (err: any) {
                if (mounted) {
                    setError(err);
                    // GRACEFUL FALLBACK: If backend fails or is offline, use default static templates + local custom
                    setTemplates([...INITIAL_FALLBACK_TEMPLATES, ...customLocalTemplates]);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        fetchTemplates();
        return () => { mounted = false; };
    }, [customLocalTemplates]);

    const addTemplate = async (template: Omit<BoardTemplate, "id">) => {
        try {
            const newBackendTemplate = await templatesApi.createTemplate(template);
            setTemplates(prev => [...prev, newBackendTemplate]);
            return newBackendTemplate;
        } catch (err) {
            // OFFLINE FALLBACK: Save entirely locally
            const customLocal: BoardTemplate = {
                ...template,
                id: `tpl_local_${Date.now()}`
            };
            setCustomLocalTemplates(prev => [...prev, customLocal]);
            return customLocal;
        }
    };

    const deleteTemplate = async (id: string) => {
        try {
            await templatesApi.deleteTemplate(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            // Check if it's a local template
            if (id.startsWith("tpl_local_")) {
                setCustomLocalTemplates(prev => prev.filter(t => t.id !== id));
            } else {
                throw err; // Backend template deletion truly failed
            }
        }
    };

    return {
        templates,
        isLoading,
        error,
        addTemplate,
        deleteTemplate
    };
}
