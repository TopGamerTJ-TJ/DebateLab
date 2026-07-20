import AnimatedPage from "@/components/AnimatedPage";
import ResearchAgent from "@/components/ResearchAgent";
import { Globe } from "lucide-react";

export default function Research() {
  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-heading">Research Agent</h1>
            <p className="text-sm text-slate-500">Search the web for debate intelligence — no project required. Save results to your library anytime.</p>
          </div>
        </div>
        <ResearchAgent />
      </div>
    </AnimatedPage>
  );
}