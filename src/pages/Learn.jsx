import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Mic, PenTool, CheckCircle2, ChevronRight, Lock } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";

const COURSE_MODULES = [
  {
    id: "basics",
    title: "The Basics of Speaking",
    description: "Master public speaking, delivery, body language, and confidence building.",
    lessons: [
      { title: "Overcoming Speaking Anxiety", duration: "5 min", completed: true },
      { title: "Body Language & Posture", duration: "8 min", completed: false },
      { title: "Vocal Variety & Pacing", duration: "10 min", completed: false }
    ]
  },
  {
    id: "arguments",
    title: "Argument Structuring",
    description: "Learn how to build strong contentions with Claims, Warrants, and Impacts.",
    lessons: [
      { title: "The CWI Framework", duration: "12 min", completed: false },
      { title: "Finding the Right Evidence", duration: "15 min", completed: false },
      { title: "Organization and Time Management", duration: "7 min", completed: false }
    ]
  },
  {
    id: "rebuttals",
    title: "Clash & Rebuttals",
    description: "Strategies for cross-examination, dismantling arguments, and weighing.",
    lessons: [
      { title: "Cross-Examination Techniques", duration: "10 min", completed: false },
      { title: "Building a Strong Rebuttal", duration: "15 min", completed: false },
      { title: "Impact Weighing", duration: "12 min", completed: false }
    ]
  }
];

export default function Learn() {
  const { user } = useAuth();
  
  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await base44.entities.UserProfile.list();
      return res[0] || null;
    },
    enabled: !!user
  });

  const getPathTitle = () => {
    if (!profile) return "Debate";
    if (profile.learningPathType === "model_un") return "Model UN";
    if (profile.learningPathType === "model_congress") return "Model Congress";
    if (profile.learningPathFormat === "parliamentary") return "Parliamentary Debate";
    return "Public Forum Debate";
  };

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-primary/10 rounded-3xl p-8 mb-8 border border-primary/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-slate-900">Your Personalized Curriculum</h1>
              <p className="text-slate-600 font-medium">{getPathTitle()} Path</p>
            </div>
          </div>
          <p className="text-slate-700 max-w-2xl leading-relaxed">
            Welcome to your customized learning journey. These interactive lessons are designed to improve your 
            {profile?.learningPathType === "model_un" ? " diplomacy and resolution writing " : " argumentation and delivery "}
            skills, from the fundamentals of public speaking to advanced rebuttal construction.
          </p>
        </div>

        <div className="space-y-6">
          {COURSE_MODULES.map((module, i) => (
            <div key={module.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold tracking-wider text-primary uppercase">Module {i + 1}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{module.title}</h2>
                <p className="text-slate-500">{module.description}</p>
              </div>
              <div className="divide-y divide-slate-100">
                {module.lessons.map((lesson, j) => (
                  <div key={j} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        lesson.completed ? "bg-green-100 text-green-600" : 
                        (i === 0 && j === 1) ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                      }`}>
                        {lesson.completed ? <CheckCircle2 className="w-5 h-5" /> : 
                         (i === 0 && j === 1) ? <PenTool className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className={`font-medium ${lesson.completed ? 'text-slate-900' : 'text-slate-700'}`}>{lesson.title}</h4>
                        <p className="text-xs text-slate-500">{lesson.duration}</p>
                      </div>
                    </div>
                    <Button variant={lesson.completed ? "ghost" : (i === 0 && j === 1) ? "default" : "outline"} size="sm" className="shrink-0" disabled={!lesson.completed && !(i === 0 && j === 1)}>
                      {lesson.completed ? "Review" : (i === 0 && j === 1) ? "Start" : "Locked"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
}