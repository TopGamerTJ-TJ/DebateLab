import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Loader2, Sparkles, Timer, Share2, RotateCcw, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { haptic, shareContent } from "@/lib/native";
import AnimatedPage from "@/components/AnimatedPage";

const FEEDBACK_SCHEMA = {
  type: "object",
  properties: {
    clarity: { type: "number" },
    persuasiveness: { type: "number" },
    structure: { type: "number" },
    pacing: { type: "number" },
    overall: { type: "number" },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    summary: { type: "string" }
  }
};

const ScoreBar = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}/10</span>
    </div>
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (value || 0) * 10)}%` }} />
    </div>
  </div>
);

export default function VoicePractice() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [micError, setMicError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    setMicError("");
    setTranscript("");
    setFeedback(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = handleStop;
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      haptic(15);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch {
      setMicError("Microphone access is required for voice practice. Please enable it in your device settings.");
    }
  };

  const stopRecording = () => {
    haptic([10, 30, 10]);
    clearInterval(timerRef.current);
    setRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  const handleStop = async () => {
    setProcessing(true);
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "speech.webm", { type: "audio/webm" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const text = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
      setTranscript(text || "");

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert debate coach. A student delivered this spoken speech${prompt ? ` on the prompt: "${prompt}"` : ""}. Evaluate the transcript for a competitive debate context. Score each dimension 1-10 and give concrete, specific feedback.\n\nTranscript:\n"""${text}"""`,
        response_json_schema: FEEDBACK_SCHEMA
      });
      setFeedback(result);
      haptic([10, 40, 10, 40, 10]);
    } catch {
      toast({ title: "Couldn't analyze your speech. Please try again.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setTranscript("");
    setFeedback(null);
    setElapsed(0);
    haptic(10);
  };

  const handleShare = async () => {
    if (!feedback) return;
    const res = await shareContent({
      title: "My DebateLab Speech Score",
      text: `I scored ${feedback.overall}/10 on my debate speech practice! ${feedback.summary || ""}`
    });
    if (res === "copied") toast({ title: "Copied to clipboard" });
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <AnimatedPage>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 text-violet-200 text-sm font-medium">
            <Mic className="w-4 h-4" /> Voice Practice
          </div>
          <h1 className="text-2xl font-bold font-heading mb-1">Practice out loud</h1>
          <p className="text-violet-100 text-sm max-w-md">Record a speech with your microphone and get instant AI coaching on clarity, structure, and delivery.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Prompt or resolution (optional)</label>
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. This House would ban single-use plastics"
            rows={2}
            className="resize-none text-sm mb-5"
            disabled={recording || processing}
          />

          {micError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {micError}
            </div>
          )}

          <div className="flex flex-col items-center py-4">
            {recording ? (
              <>
                <div className="flex items-center gap-2 text-2xl font-bold font-heading text-slate-900 mb-4">
                  <Timer className="w-5 h-5 text-red-500 animate-pulse" /> {fmt(elapsed)}
                </div>
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors active:scale-95"
                >
                  <Square className="w-8 h-8 text-white fill-white" />
                </button>
                <p className="text-xs text-slate-500 mt-3">Tap to stop and analyze</p>
              </>
            ) : processing ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                <p className="text-sm text-slate-600">Transcribing & analyzing your speech…</p>
              </div>
            ) : (
              <>
                <button
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center shadow-lg transition-colors active:scale-95"
                >
                  <Mic className="w-8 h-8 text-white" />
                </button>
                <p className="text-xs text-slate-500 mt-3">Tap to start recording</p>
              </>
            )}
          </div>
        </div>

        {transcript && !processing && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
            <h3 className="font-bold text-slate-900 font-heading text-sm mb-2">Transcript</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{transcript}</p>
          </div>
        )}

        {feedback && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-900 font-heading">AI Coach Feedback</h3>
              </div>
              <div className="text-2xl font-bold font-heading text-primary">{feedback.overall}/10</div>
            </div>

            <div className="space-y-3 mb-5">
              <ScoreBar label="Clarity" value={feedback.clarity} />
              <ScoreBar label="Persuasiveness" value={feedback.persuasiveness} />
              <ScoreBar label="Structure" value={feedback.structure} />
              <ScoreBar label="Pacing" value={feedback.pacing} />
            </div>

            {feedback.summary && <p className="text-sm text-slate-600 leading-relaxed mb-4">{feedback.summary}</p>}

            {feedback.strengths?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {feedback.strengths.map((s, i) => <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-green-500">✓</span>{s}</li>)}
                </ul>
              </div>
            )}

            {feedback.improvements?.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">To Improve</h4>
                <ul className="space-y-1">
                  {feedback.improvements.map((s, i) => <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-amber-500">→</span>{s}</li>)}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={reset} className="flex-1 gap-2"><RotateCcw className="w-4 h-4" /> New Recording</Button>
              <Button onClick={handleShare} className="flex-1 gap-2"><Share2 className="w-4 h-4" /> Share</Button>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}