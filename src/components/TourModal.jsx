import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, FileText, Target, Users, X, ChevronRight, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TOUR_STEPS = [
  {
    id: "welcome",
    title: "Welcome to DebateLab",
    desc: "Your complete AI-powered debate prep platform. Let's take a quick tour of what you can do.",
    icon: <Users className="w-10 h-10 text-blue-500" />
  },
  {
    id: "contentions",
    title: "Generate Contentions",
    desc: "Enter your resolution and let our AI generate complete, tournament-ready arguments with claims, warrants, and impacts.",
    icon: <FileText className="w-10 h-10 text-indigo-500" />
  },
  {
    id: "practice",
    title: "Practice Rounds",
    desc: "Debate directly against an AI opponent. When you're done, get a full Reason for Decision (RFD) from our AI judge.",
    icon: <Target className="w-10 h-10 text-green-500" />
  },
  {
    id: "coach",
    title: "AI Coaching",
    desc: "Review your performance across practice rounds to identify strengths, weaknesses, and areas for improvement.",
    icon: <Brain className="w-10 h-10 text-violet-500" />
  },
  {
    id: "profile",
    title: "Complete Your Profile",
    desc: "We need this so you can post on forums, share content, and add friends. You can skip this and do it later.",
    icon: <Users className="w-10 h-10 text-orange-500" />
  }
];

export default function TourModal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ displayName: "", skillLevel: "", preferredFormat: "" });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await base44.entities.UserProfile.list();
      return res[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        displayName: profile.displayName || user?.full_name || "",
        skillLevel: profile.skillLevel || "",
        preferredFormat: profile.preferredFormat || ""
      }));
    } else if (user) {
      setFormData(prev => ({ ...prev, displayName: user.full_name || "" }));
    }
  }, [profile, user]);

  const saveProfile = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return base44.entities.UserProfile.update(profile.id, data);
      } else {
        return base44.entities.UserProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

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

  const handleNext = async () => {
    if (TOUR_STEPS[step].id === "profile") {
      if (formData.displayName || formData.skillLevel || formData.preferredFormat) {
        await saveProfile.mutateAsync(formData);
      }
      handleClose();
    } else if (step < TOUR_STEPS.length - 1) {
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
        <div className="p-8 relative">
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

          <h2 className="text-2xl font-bold font-heading text-slate-900 mb-3 text-center">{currentStep.title}</h2>
          <p className="text-slate-500 mb-8 leading-relaxed text-center">
            {currentStep.desc}
          </p>

          {currentStep.id === "profile" && (
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Display Name</label>
                <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} placeholder="How you appear to others" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Skill Level</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                  value={formData.skillLevel} 
                  onChange={e => setFormData({...formData, skillLevel: e.target.value})}
                >
                  <option value="" disabled>Select Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred Format</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                  value={formData.preferredFormat} 
                  onChange={e => setFormData({...formData, preferredFormat: e.target.value})}
                >
                  <option value="" disabled>Select Format</option>
                  <option value="parliamentary">Parliamentary</option>
                  <option value="public_forum">Public Forum</option>
                  <option value="model_un">Model UN</option>
                  <option value="model_congress">Model Congress</option>
                  <option value="lincoln_douglas">Lincoln Douglas</option>
                  <option value="policy">Policy</option>
                </select>
              </div>
            </div>
          )}

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
              <Button onClick={handleNext} disabled={currentStep.id === "profile" && saveProfile.isPending} className="gap-1.5 rounded-xl font-medium px-6">
                {step === TOUR_STEPS.length - 1 ? (
                  <>{saveProfile.isPending ? "Saving..." : "Get Started"} {!saveProfile.isPending && <Check className="w-4 h-4" />}</>
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