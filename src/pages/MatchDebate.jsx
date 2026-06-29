import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useBans } from "@/components/BanGate";
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
  const { banMatch, reason } = useBans();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    topic: "",
    format: "1v1",
    timePerSide: "5",
    prepTime: "3",
    sidePreference: "random",
    visibility: "public",
    scheduledInMinutes: "0" // 0 means now
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
        scheduledTime: data.scheduledInMinutes !== "0" ? new Date(Date.now() + parseInt(data.scheduledInMinutes) * 60000).toISOString() : null,
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
    joinLobbyMutation.mutate({ lobbyId: lobby.id, sidePreference: "random" });
  };

  if (banMatch) {
    return (
      <AnimatedPage className="max-w-2xl mx-auto px-6 py-16 min-h-[calc(100dvh-4rem)] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-10 rounded-2xl text-center">
          <h2 className="text-xl font-bold mb-3">Access Restricted</h2>
          <p>You have been banned from participating in live match debates.</p>
          {reason && <p className="mt-4 text-sm font-medium border-t border-red-200 pt-4">Reason: {reason}</p>}
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-6 sm:px-8 py-10 sm:py-12">
      {/* Header */}
      <header className="mb-10 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Swords className="w-7 h-7 text-primary" />
              Live Match Arena
            </h1>
            <p className="text-slate-500 mt-2 ml-10">Create matches, set rules, and debate live against others.</p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <Plus className="w-4 h-4 mr-2" /> Create Debate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
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
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Schedule</label>
                    <Select value={form.scheduledInMinutes} onValueChange={v => setForm({...form, scheduledInMinutes: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Start Now</SelectItem>
                        <SelectItem value="15">In 15 Minutes</SelectItem>
                        <SelectItem value="30">In 30 Minutes</SelectItem>
                        <SelectItem value="60">In 1 Hour</SelectItem>
                        <SelectItem value="120">In 2 Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createLobbyMutation.isPending || !form.topic} className="w-full">
                  {createLobbyMutation.isPending ? "Creating..." : "Post Lobby"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left: Active Lobbies */}
        <section className="lg:col-span-7">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-blue-600" /> Active Lobbies
          </h2>

          <div className="space-y-4">
            {loadingLobbies ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-xl" />)}
              </div>
            ) : lobbies.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
                <Users className="w-10 h-10 text-slate-300 mb-4" />
                <h3 className="font-semibold text-slate-900 mb-1">No active lobbies</h3>
                <p className="text-slate-500 text-sm">Be the first to create one!</p>
              </div>
            ) : (
              lobbies.map(lobby => (
                <div key={lobby.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${lobby.visibility === 'ranked' ? 'bg-amber-100 text-amber-800' : lobby.visibility === 'tournament' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {lobby.visibility.toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                          {lobby.format.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {lobby.prepTime}m prep · {lobby.timePerSide}m debate
                        </span>
                        {lobby.scheduledTime && (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                            Scheduled: {new Date(lobby.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-1.5 leading-snug">{lobby.topic}</h3>
                      <p className="text-sm text-slate-500">Hosted by <span className="font-medium text-slate-700">{lobby.creatorName}</span></p>
                    </div>

                    <div className="shrink-0">
                      {lobby.creatorId === user?.id ? (
                        <Button variant="outline" disabled className="w-full sm:w-auto">Waiting...</Button>
                      ) : (
                        <Button onClick={() => handleJoin(lobby)} disabled={joinLobbyMutation.isPending} className="w-full sm:w-auto">
                          Join Match
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right: My Matches + Spectator */}
        <section className="lg:col-span-5 space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-5">
              <PlayCircle className="w-5 h-5 text-green-600" /> My Matches
            </h2>

            <div className="space-y-3">
              {loadingMatches ? (
                <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
              ) : myMatches.length === 0 ? (
                <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 text-center">
                  <p className="text-sm text-slate-500">You don't have any active or past matches.</p>
                </div>
              ) : (
                myMatches.map(match => (
                  <Link key={match.id} to={`/match/${match.id}`} className="block bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                        match.status === 'prep' ? 'bg-amber-100 text-amber-800' :
                        match.status === 'live' ? 'bg-red-100 text-red-800 animate-pulse' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {match.status === 'prep' ? 'PREP PHASE' : match.status === 'live' ? 'LIVE NOW' : 'ENDED'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(match.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 line-clamp-2 mb-3 group-hover:text-primary transition-colors">{match.topic}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="truncate">{match.proPlayerName} <span className="text-slate-400 mx-1">vs</span> {match.conPlayerName}</span>
                      {match.isRanked && <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Spectator Mode */}
          <button
            onClick={() => toast({ title: "Spectator Mode coming soon!" })}
            className="w-full flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-slate-300 transition-all text-left"
          >
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Spectator Mode</h4>
              <p className="text-sm text-slate-500 mt-0.5">Watch live high-ELO debates</p>
            </div>
          </button>
        </section>
      </div>
    </AnimatedPage>
  );
}