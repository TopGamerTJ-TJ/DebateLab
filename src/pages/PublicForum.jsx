import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentionGenerator from "@/components/ContentionGenerator";
import AIAssistant from "@/components/AIAssistant";
import { BookOpen, Target, Archive, Layers, Columns, Brain, Scale, Zap, MessageSquare, FileText, ArrowRight } from "lucide-react";

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

export default function PublicForum() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-blue-200 text-sm">
          <span>🎤</span> Public Forum Debate
        </div>
        <h1 className="text-3xl font-bold font-heading mb-2">Public Forum Debate Hub</h1>
        <p className="text-blue-100 max-w-2xl">Master NSDA Public Forum. Analyze resolutions, build contentions, perfect crossfire, and dominate with strategic weighing mechanisms.</p>
        <div className="flex flex-wrap gap-3 mt-5">
          {["Resolution Analysis", "Weighing Mechanisms", "Crossfire Prep", "Impact Calculus"].map(f => (
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
          <ContentionGenerator format="public_forum" />
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoCard
              icon={<FileText className="w-4 h-4 text-primary" />}
              title="PF Round Format"
              items={["AC (Affirmative Constructive): 4 min", "NC (Negative Constructive): 4 min", "Crossfire 1: 3 min", "AR (Affirmative Rebuttal): 4 min", "NR (Negative Rebuttal): 4 min", "Crossfire 2: 3 min", "AS (Affirmative Summary): 3 min", "NS (Negative Summary): 3 min", "Grand Crossfire: 3 min", "Final Focus Aff/Neg: 2 min each"]}
            />
            <InfoCard
              icon={<Scale className="w-4 h-4 text-indigo-500" />}
              title="Weighing Mechanisms"
              items={["Magnitude: How big is the impact?", "Probability: How likely is it to occur?", "Timeframe: When does the impact happen?", "Scope: How many people are affected?", "Reversibility: Can harm be undone?", "Always weigh your impacts vs. opponent's"]}
            />
            <InfoCard
              icon={<MessageSquare className="w-4 h-4 text-purple-500" />}
              title="Crossfire Strategy"
              items={["Establish facts you can use later", "Force opponents into narrow positions", "Ask yes/no questions for admissions", "Never argue — you're asking questions", "Stay calm and strategic, not combative", "Use answers in your next speech"]}
            />
            <InfoCard
              icon={<Zap className="w-4 h-4 text-amber-500" />}
              title="Summary Speech Tips"
              items={["Only extend 1-2 key arguments", "Respond to the strongest opp args", "Set up your Final Focus here", "Weigh throughout the speech", "Clear voters: tell the judge how to vote", "3 minutes — be ruthlessly selective"]}
            />
            <InfoCard
              icon={<Target className="w-4 h-4 text-green-500" />}
              title="Final Focus Strategy"
              items={["2 minutes — choose 1-2 voting issues max", "Crystallize the round story", "Big-picture weighing at the top", "Address the most important clash", "End with a powerful impact statement", "Don't introduce new arguments"]}
            />
            <InfoCard
              icon={<BookOpen className="w-4 h-4 text-rose-500" />}
              title="Evidence Principles"
              items={["Cite source name, date, and publication", "Paraphrase but don't distort", "Have original ready for card checks", "Quality > quantity of evidence", "Recency matters for current events", "Academic sources beat news in weighing"]}
            />
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ToolCard to="/practice" icon={<Target className="w-5 h-5 text-blue-600" />} title="Practice Rounds" desc="AI simulates PF opponents for full-round practice with judge feedback" tag="AI Powered" />
            <ToolCard to="/evidence-locker" icon={<Archive className="w-5 h-5 text-amber-600" />} title="Evidence Locker" desc="Save, organize, and cite your PF research evidence" />
            <ToolCard to="/case-vault" icon={<Layers className="w-5 h-5 text-rose-600" />} title="Case Vault" desc="Store and manage aff and neg cases for current resolution" />
            <ToolCard to="/flowing-tool" icon={<Columns className="w-5 h-5 text-cyan-600" />} title="Flowing Tool" desc="Digital flow sheet for tracking arguments across all speeches" />
            <ToolCard to="/ai-coach" icon={<Brain className="w-5 h-5 text-violet-600" />} title="AI Performance Coach" desc="Track progress, detect weaknesses, and get practice plans" tag="Analytics" />
            <ToolCard to="/wiki" icon={<BookOpen className="w-5 h-5 text-teal-600" />} title="Debate Wiki" desc="PF format guides, glossary, and strategy articles" />
          </div>
        </TabsContent>

        <TabsContent value="assistant">
          <AIAssistant format="public_forum" placeholder="Ask about PF resolutions, crossfire strategy, weighing mechanisms, evidence..." />
        </TabsContent>
      </Tabs>
    </div>
  );
}