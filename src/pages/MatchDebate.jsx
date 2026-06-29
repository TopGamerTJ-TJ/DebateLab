import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Swords, Plus, Clock, Users, Globe, Trophy, PlayCircle, Eye } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";

export default function MatchDebate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    topic: "",
    format: "1v1",
    timePerSide: "5",
    prepTime: "3",
    sidePreference: "random",
    visibility: "public"
  });

  const { data: lobbies = [], isLoading: loadingLobbies } = useQuery({
    queryKey: ['debateLobbies'],
    queryFn: () => base44.entities.DebateLobby.filter({ status: "open" }),
    refetchInterval: 5000
  });

  const { data: myMatches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['myMatches', user?.id],
    queryFn: async () => {
      const proMatches = await base44.entities.DebateMatch.filter({ proPlayerId: user.id });
      const conMatches = await base44.entities.DebateMatch.filter({ conPlayerId: user.id });
      // Remove duplicates just in case (shouldn't happen)
      const all = [...proMatches, ...conMatches];
      const unique = all.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
      return unique.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
    },
    enabled: !!user?.id,
    refetchInterval: 5000
  });

  const createLobbyMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.DebateLobby.create({
        topic: data.topic,
        format: data.format,
        timePerSide: parseInt(data.timePerSide),
        prepTime: parseInt(data.prepTime),
        creatorId: user.id,
        creatorName: user.full_name || user.email,
        creatorSidePreference: data.sidePreference,
        visibility: data.visibility,
        status: "open"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debateLobbies'] });
      setCreateOpen(false);
      toast({ title: "Debate lobby created!" });
    }
  });

  const joinLobbyMutation = useMutation({
    mutationFn: async ({ lobbyId, sidePreference }) => {
      const res = await base44.functions.invoke("joinDebateLobby", { lobbyId, joinedUserSidePreference: sidePreference });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['debateLobbies'] });
      queryClient.invalidateQueries({ queryKey: ['myMatches'] });
      toast({ title: "Joined match!" });
      navigate(`/match/${data.match.id}`);
    },
    onError: (err) => {
      toast({ title: "Error joining lobby", description: err.message, variant: "destructive" });
    }
  });

  const handleCreate = () => {
    if (!form.topic) return toast({ title: "Please enter a topic", variant: "destructive" });
    createLobbyMutation.mutate(form);
  };

  const handleJoin = (lobby) => {
    joinLobbyMutation.mutate({ lobbyId: lobby.id, sidePreference: "random" }); // Could show a dialog to pick side
  };

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight flex items-center gap-3">
            <Swords className="w-8 h-8 text-primary" />
            Live Match Arena
          </h1>
          <p className="text-slate-500 mt-1">Create matches, set rules, and debate live against others.</p>
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Create Debate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Debate Lobby</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic / Resolution</label>
                <Input placeholder="e.g. AI should be banned in schools" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select value={form.format} onValueChange={v => setForm({...form, format: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1v1">1v1 Debate</SelectItem>
                      <SelectItem value="team" disabled>Team (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <Select value={form.visibility} onValueChange={v => setForm({...form, visibility: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="ranked">Ranked Match</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Per Side</label>
                  <Select value={form.timePerSide} onValueChange={v => setForm({...form, timePerSide: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Minutes</SelectItem>
                      <SelectItem value="5">5 Minutes</SelectItem>
                      <SelectItem value="10">10 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prep Time</label>
                  <Select value={form.prepTime} onValueChange={v => setForm({...form, prepTime: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Minute</SelectItem>
                      <SelectItem value="3">3 Minutes</SelectItem>
                      <SelectItem value="5">5 Minutes</SelectItem>
                      <SelectItem value="10">10 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Your Side Preference</label>
                  <Select value={form.sidePreference} onValueChange={v => setForm({...form, sidePreference: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random / Assign me</SelectItem>
                      <SelectItem value="pro">Pro (Affirmative)</SelectItem>
                      <SelectItem value="con">Con (Negative)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createLobbyMutation.isPending || !form.topic}>
                {createLobbyMutation.isPending ? "Creating..." : "Post Lobby"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" /> Active Lobbies
          </h2>
          
          <div className="space-y-4">
            {loadingLobbies ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
              </div>
            ) : lobbies.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">No active lobbies</h3>
                <p className="text-sm text-slate-500">Be the first to create a debate lobby!</p>
              </div>
            ) : (
              lobbies.map(lobby => (
                <div key={lobby.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-primary/50 transition-all flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${lobby.visibility === 'ranked' ? 'bg-amber-100 text-amber-700' : lobby.visibility === 'tournament' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {lobby.visibility.toUpperCase()}
                      </span>
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {lobby.format}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {lobby.prepTime}m prep, {lobby.timePerSide}m debate
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{lobby.topic}</h3>
                    <p className="text-sm text-slate-500">Hosted by <span className="font-medium text-slate-700">{lobby.creatorName}</span></p>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2">
                    {lobby.creatorId === user?.id ? (
                      <Button variant="outline" disabled className="w-full sm:w-auto">Waiting for opponent...</Button>
                    ) : (
                      <Button onClick={() => handleJoin(lobby)} disabled={joinLobbyMutation.isPending} className="w-full sm:w-auto">
                        Join Match
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-green-500" /> My Matches
          </h2>
          
          <div className="space-y-3">
            {loadingMatches ? (
               <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ) : myMatches.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center">
                <p className="text-sm text-slate-500">You don't have any active or past matches.</p>
              </div>
            ) : (
              myMatches.map(match => (
                <Link key={match.id} to={`/match/${match.id}`} className="block bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      match.status === 'prep' ? 'bg-amber-100 text-amber-700' :
                      match.status === 'live' ? 'bg-red-100 text-red-700 animate-pulse' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {match.status === 'prep' ? 'PREP PHASE' : match.status === 'live' ? 'LIVE NOW' : 'ENDED'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(match.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 line-clamp-2 mb-2">{match.topic}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{match.proPlayerName} vs {match.conPlayerName}</span>
                    {match.isRanked && <Trophy className="w-3 h-3 text-amber-500" />}
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
             <button onClick={() => toast({ title: "Spectator Mode coming soon!" })} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                   <Eye className="w-5 h-5 text-purple-600" />
                 </div>
                 <div className="text-left">
                   <h4 className="font-semibold text-slate-900">Spectator Mode</h4>
                   <p className="text-xs text-slate-500">Watch live high-ELO debates</p>
                 </div>
               </div>
             </button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}