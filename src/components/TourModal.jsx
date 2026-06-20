import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Target, Users, X, ChevronRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const TOUR_STEPS = [
  {
    title: "Welcome to DebateLab",
    desc: "Your complete AI-powered debate prep platform. Let's take a quick tour of what you can do.",
    icon: <Users className="w-10 h-10 text-blue-500" />
  },
  {
    title: "Generate Contentions",
    desc: "Enter your resolution and let our AI generate complete, tournament-ready arguments with claims, warrants, and impacts.",
    icon: <FileText className="w-10 h-10 text-indigo-500" />
  },
  {
    title: "Practice Rounds",
    desc: "Debate directly against an AI opponent. When you're done, get a full Reason for Decision (RFD) from our AI judge.",
    icon: <Target className="w-10 h-10 text-green-500" />
  },
  {
    title: "AI Coaching",
    desc: "Review your performance across practice rounds to identify strengths, weaknesses, and areas for improvement.",
    icon: <Brain className="w-10 h-10 text-violet-500" />
  }
];

export default function TourModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("debatelab_tour_seen");
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("debatelab_tour_seen", "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-8 text-center relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
              {currentStep.icon}
            </div>
          </div>

          <h2 className="text-2xl font-bold font-heading text-slate-900 mb-3">{currentStep.title}</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            {currentStep.desc}
          </p>

          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-slate-200'}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" className="text-slate-500 font-medium" onClick={handleClose}>
                Skip
              </Button>
              <Button onClick={handleNext} className="gap-1.5 rounded-xl font-medium px-6">
                {step === TOUR_STEPS.length - 1 ? (
                  <>Get Started <Check className="w-4 h-4" /></>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}