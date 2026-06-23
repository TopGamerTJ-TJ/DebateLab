import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentionGenerator from "@/components/ContentionGenerator";
import AIAssistant from "@/components/AIAssistant";
import { BookOpen, Target, Archive, Layers, Columns, Brain, FileText, Lightbulb, Users, Shield, Zap, ArrowRight } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";

const ToolCard = ({ icon, title, desc, to, tag }) => (
  <Link to={to} className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">{icon}</div>
      {tag && <span className="text-xs bg-blue-100 text-blue-600 font-medium px-2 py-0.5 rounded-full">{tag}</span>}
    </div>
    <h4 className="font-semibold text-slate-900 text-sm group-hover:text-primary transition-colors">{title}</h4>
    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
    <div className="flex items-center gap-1 text-xs text-primary mt-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
      Open <ArrowRight className="w-3 h-3" />
    </div>
  </Link>
);

const InfoCard = ({ icon, title, items }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h4 className="font-bold text-slate-900 font-heading text-sm">{title}</h4>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-slate-600 flex gap-2">
          <span className="text-primary shrink-0 font-bold">→</span>{item}
        </li>
      ))}
    </ul>
  </div>
);

export default function ParliamentaryDebate() {
  return (
    <AnimatedPage>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-blue-200 text-sm">
          <span>🏛️</span> Parliamentary Debate
        </div>
        <h1 className="text-3xl font-bold font-heading mb-2">Parliamentary Debate Hub</h1>
        <p className="text-blue-100 max-w-2xl">Master British Parliamentary, Asian Parliamentary, and Middle School Parliamentary formats. Generate contentions, practice rounds, and get AI-powered coaching.</p>
        <div className="flex flex-wrap gap-3 mt-5">
          {["British Parliamentary (BP)", "Asian Parliamentary (AP)", "Middle School (MSPDP)"].map(f => (
            <span key={f} className="bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">{f}</span>
          ))}
        </div>
      </div>

      <Tabs defaultValue="contentions">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-6 w-full sm:w-auto">
          <TabsTrigger value="contentions" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Contentions</TabsTrigger>
          <TabsTrigger value="overview" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="tools" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Tools</TabsTrigger>
          <TabsTrigger value="assistant" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">AI Coach</TabsTrigger>
        </TabsList>

        <TabsContent value="contentions">
          <ContentionGenerator format="parliamentary" />
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoCard
              icon={<BookOpen className="w-4 h-4 text-primary" />}
              title="BP Speaker Roles"
              items={["Prime Minister: Opens government case, defines motion", "Deputy PM: Extends and defends", "Leader of Opp: Clashes with PM, sets opp case", "Deputy LOO: Attacks DPM, extends", "Members: Introduce new material (extension)", "Whips: Summarize and weigh the round"]}
            />
            <InfoCard
              icon={<Shield className="w-4 h-4 text-indigo-500" />}
              title="Core Strategy"
              items={["Define the motion clearly and favorably", "Build a cohesive case with 2-3 main arguments", "Clash directly — don't dodge the best args", "Use POIs to disrupt and gain time", "Weigh your impacts vs. the opposition", "End with a clear narrative the judge can follow"]}
            />
            <InfoCard
              icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
              title="Argument Structure"
              items={["Claim: State your argument clearly", "Warrant: Explain WHY it's true (mechanism)", "Impact: State WHY it matters (magnitude/scope)", "Evidence: Support with data or expert opinion", "Weighing: Compare your impact to theirs", "Extension: Add material in later speeches"]}
            />
            <InfoCard
              icon={<Users className="w-4 h-4 text-green-500" />}
              title="Points of Information"
              items={["Offer POIs during 1st-6th minute of 7-min speeches", "Keep POIs short (10-15 seconds)", "Ask questions that expose contradictions", "Accept 1-2 POIs per speech to appear confident", "Use POIs to set traps for later", "Decline gracefully if overwhelmed"]}
            />
            <InfoCard
              icon={<Zap className="w-4 h-4 text-purple-500" />}
              title="Winning Tips"
              items={["Clash on the biggest arguments, not peripherals", "Tell a story — judges remember narratives", "Never concede impact, always weigh", "Use consistent framework throughout", "Second half of round: crystallize, don't add", "Be assertive but not aggressive"]}
            />
            <InfoCard
              icon={<FileText className="w-4 h-4 text-rose-500" />}
              title="Speech Timing (BP)"
              items={["Opening speeches: 7 minutes each", "Points of info: offered mins 1-6", "Member speeches: 7 minutes each", "Government whip: 7 minutes (no POIs)", "Opposition whip: 7 minutes (no POIs)", "Prep time: 15 minutes total"]}
            />
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ToolCard to="/practice" icon={<Target className="w-5 h-5 text-blue-600" />} title="Practice Rounds" desc="AI simulates opponents and judges for realistic round practice" tag="AI Powered" />

            <ToolCard to="/case-vault" icon={<Layers className="w-5 h-5 text-rose-600" />} title="Case Vault" desc="Store and manage complete government and opposition cases" />
            <ToolCard to="/flowing-tool" icon={<Columns className="w-5 h-5 text-cyan-600" />} title="Flowing Tool" desc="Digital flow sheet for tracking arguments and responses" />
            <ToolCard to="/ai-coach" icon={<Brain className="w-5 h-5 text-violet-600" />} title="AI Performance Coach" desc="Analytics, weakness detection, and practice recommendations" tag="Analytics" />
            <ToolCard to="/wiki" icon={<BookOpen className="w-5 h-5 text-teal-600" />} title="Debate Wiki" desc="Terminology glossary, format guides, and strategy articles" />
          </div>
        </TabsContent>

        <TabsContent value="assistant">
          <AIAssistant format="parliamentary" placeholder="Ask about Parliamentary debate structure, motions, speaker roles, strategy..." />
        </TabsContent>
      </Tabs>
    </div>
    </AnimatedPage>
  );
}