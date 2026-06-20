import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Lightbulb, Check, X, Loader2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProjectSuggestionsWidget() {
    const queryClient = useQueryClient();
    
    const { data: suggestions = [], isLoading } = useQuery({
        queryKey: ['project_suggestions'],
        queryFn: () => base44.entities.ProjectSuggestion.filter({ status: 'pending' }),
        refetchInterval: 30000
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }) => base44.entities.ProjectSuggestion.update(id, { status }),
        onSuccess: (_, { status }) => {
            queryClient.invalidateQueries({ queryKey: ['project_suggestions'] });
            if(status === 'approved') toast.success("Suggestion approved! Don't forget to apply it to your project.");
        }
    });

    if (isLoading) return null;
    if (suggestions.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-amber-900 font-heading">AI Coach Suggestions</h3>
                <span className="bg-amber-200 text-amber-800 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ml-2">New</span>
            </div>
            
            <div className="space-y-3 relative z-10">
                {suggestions.map(s => (
                    <div key={s.id} className="bg-white/80 backdrop-blur border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-white transition-colors">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <FileEdit className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-xs font-semibold text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-md">{s.projectName}</span>
                            </div>
                            <h4 className="font-semibold text-slate-800 text-sm mb-1">{s.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{s.description}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                            <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: s.id, status: 'rejected' })} className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-xs">
                                <X className="w-3.5 h-3.5 mr-1" /> Dismiss
                            </Button>
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: s.id, status: 'approved' })} className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs">
                                <Check className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}