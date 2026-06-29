import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Clock, Send, Shield, AlertCircle, Trophy, BrainCircuit } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";

export default function MatchRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const { data: match, isLoading: loadingMatch } = useQuery({
    queryKey: ['debateMatch', id],
    queryFn: () => base44.entities.DebateMatch.get(id),
    refetchInterval: 2000
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['debateMessages', id],
    queryFn: () => base44.entities.DebateMessage.filter({ matchId: id }),
    refetchInterval: 2000
  });

  // Calculate phase and time
  useEffect(() => {
    if (!match) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const started = new Date(match.startedAt).getTime();
      const prepEnd = started + (match.prepTimeSeconds * 1000);
      const debateEnd = prepEnd + (match.timePerSideSeconds * 2 * 1000); // simplified global timer for now

      if (now < prepEnd) {
        if (match.status !== "prep") {
          base44.entities.DebateMatch.update(id, { status: "prep" });
        }
        setTimeLeft(Math.max(0, Math.floor((prepEnd - now) / 1000)));
      } else if (now >= prepEnd && now < debateEnd) {
        if (match.status !== "live") {
          base44.entities.DebateMatch.update(id, { status: "live" });
        }
        setTimeLeft(Math.max(0, Math.floor((debateEnd - now) / 1000)));
      } else {
        if (match.status !== "ended") {
          base44.entities.DebateMatch.update(id, { status: "ended" });
          evaluateMatch();
        }
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [match]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const evaluateMatch = async () => {
    // Only one player triggers the evaluation to avoid double runs
    if (match.proPlayerId !== user.id) return;
    
    try {
      const msgs = await base44.entities.DebateMessage.filter({ matchId: id });
      const prompt = `Evaluate this debate match and pick a winner based on logic, rebuttal quality, clarity, consistency, and persuasion.
Topic: ${match.topic}
Pro Player: ${match.proPlayerName}
Con Player: ${match.conPlayerName}

Transcript:
${msgs.map(m => `[${m.role.toUpperCase()}] ${m.senderName}: ${m.content}`).join('\n')}

Output a JSON object:
{
  "winnerRole": "pro" | "con" | "tie",
  "reasoning": "Brief explanation of why they won",
  "proScore": 0-100,
  "conScore": 0-100
}`;

      const res = await base44.integrations.Core.InvokeLLM({ 
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            winnerRole: { type: "string" },
            reasoning: { type: "string" },
            proScore: { type: "number" },
            conScore: { type: "number" }
          }
        }
      });

      const result = res;
      let winnerId = null;
      if (result.winnerRole === "pro") winnerId = match.proPlayerId;
      if (result.winnerRole === "con") winnerId = match.conPlayerId;

      await base44.entities.DebateMatch.update(id, {
        winnerId,
        aiEvaluation: result.reasoning,
        proScore: result.proScore,
        conScore: result.conScore
      });

      // Update user stats
      if (winnerId) {
        const winnerProfile = await base44.entities.UserProfile.filter({ created_by_id: winnerId });
        if (winnerProfile.length > 0) {
          await base44.entities.UserProfile.update(winnerProfile[0].id, {
            wins: (winnerProfile[0].wins || 0) + 1
          });
        }
        
        const loserId = winnerId === match.proPlayerId ? match.conPlayerId : match.proPlayerId;
        const loserProfile = await base44.entities.UserProfile.filter({ created_by_id: loserId });
        if (loserProfile.length > 0) {
          await base44.entities.UserProfile.update(loserProfile[0].id, {
            losses: (loserProfile[0].losses || 0) + 1
          });
        }
      }
      
    } catch (e) {
      console.error("Evaluation failed", e);
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const myRole = match.proPlayerId === user.id ? "pro" : "con";
      return await base44.entities.DebateMessage.create({
        matchId: id,
        senderId: user.id,
        senderName: user.full_name || user.email,
        role: myRole,
        type: messages.length < 2 ? "opening" : "rebuttal",
        content: input
      });
    },
    onSuccess: () => {
      setInput("");
      queryClient.invalidateQueries({ queryKey: ['debateMessages', id] });
    }
  });

  if (loadingMatch) return <div className="p-8 text-center">Loading match...</div>;
  if (!match) return <div className="p-8 text-center text-red-500">Match not found.</div>;

  const isPlayer = match.proPlayerId === user.id || match.conPlayerId === user.id;
  const myRole = match.proPlayerId === user.id ? "pro" : match.conPlayerId === user.id ? "con" : "spectator";
  
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100dvh-4rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between shrink-0 mb-4">
        <div>
          <span className={`text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block ${
            match.status === 'prep' ? 'bg-amber-100 text-amber-700' :
            match.status === 'live' ? 'bg-red-100 text-red-700 animate-pulse' :
            'bg-slate-100 text-slate-700'
          }`}>
            {match.status === 'prep' ? 'PREP PHASE' : match.status === 'live' ? 'LIVE DEBATE' : 'ENDED'}
          </span>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">{match.topic}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className={`font-medium ${myRole === 'pro' ? 'text-primary' : 'text-slate-600'}`}>PRO: {match.proPlayerName}</span>
            <span className="text-slate-400">vs</span>
            <span className={`font-medium ${myRole === 'con' ? 'text-red-600' : 'text-slate-600'}`}>CON: {match.conPlayerName}</span>
          </div>
        </div>
        
        <div className="text-center bg-slate-50 border border-slate-200 rounded-xl p-3 min-w-[120px]">
          <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> {match.status === 'prep' ? 'Prep Time' : 'Time Left'}
          </div>
          <div className={`text-2xl font-bold font-mono ${match.status === 'prep' ? 'text-amber-600' : match.status === 'live' ? 'text-slate-900' : 'text-slate-400'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 relative overflow-hidden">
        {match.status === "prep" && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Shield className="w-12 h-12 text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Preparation Phase</h2>
            <p className="text-slate-600 max-w-md mb-6">Review the topic, structure your opening statement, and gather your evidence. The chat will unlock when the timer reaches zero.</p>
            <div className="text-4xl font-bold text-amber-600 font-mono tracking-wider">{formatTime(timeLeft)}</div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 && match.status === "live" && (
            <div className="text-center text-slate-500 mt-10">
              The debate has started! Pro side makes the opening argument.
            </div>
          )}
          
          {messages.map((m, i) => {
            const isMe = m.senderId === user.id;
            const isPro = m.role === "pro";
            
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isPro ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {m.role}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{m.senderName}</span>
                </div>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* End Screen overlay */}
        {match.status === "ended" && match.aiEvaluation && (
          <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col items-center p-8 overflow-y-auto">
            <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Debate Concluded</h2>
            <div className="text-xl font-medium text-slate-600 mb-8">
              Winner: <span className="font-bold text-slate-900">{match.winnerId === match.proPlayerId ? match.proPlayerName : match.winnerId === match.conPlayerId ? match.conPlayerName : "Tie"}</span>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 max-w-2xl w-full mb-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-3">
                <BrainCircuit className="w-5 h-5 text-blue-600" /> AI Judge Evaluation
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">{match.aiEvaluation}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PRO SCORE</div>
                  <div className="text-3xl font-bold text-blue-600">{match.proScore}/100</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CON SCORE</div>
                  <div className="text-3xl font-bold text-red-600">{match.conScore}/100</div>
                </div>
              </div>
            </div>
            
            <Button onClick={() => navigate('/match')} size="lg">Return to Arena</Button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={match.status === "prep" ? "Chat locked during prep phase..." : match.status === "ended" ? "Debate ended." : "Type your argument..."}
              disabled={match.status !== "live" || !isPlayer || sendMessageMutation.isPending}
              className="resize-none min-h-[60px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && match.status === "live" && isPlayer) sendMessageMutation.mutate();
                }
              }}
            />
            <Button 
              onClick={() => sendMessageMutation.mutate()} 
              disabled={!input.trim() || match.status !== "live" || !isPlayer || sendMessageMutation.isPending}
              className="h-auto shrink-0 w-14 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}