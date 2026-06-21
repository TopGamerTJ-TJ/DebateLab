import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, ThumbsUp, ThumbsDown, Image as ImageIcon, Plus, Flame, Clock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import AnimatedPage from "@/components/AnimatedPage";

export default function Forum() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [sortMode, setSortMode] = useState("hot"); // hot or new
  const [form, setForm] = useState({ title: "", content: "", imageUrl: "", format: "" });

  const { data: posts = [] } = useQuery({ 
    queryKey: ['forum_posts'], 
    queryFn: () => base44.entities.ForumPost.list('-created_date', 100) 
  });

  const { data: votes = [] } = useQuery({ 
    queryKey: ['forum_votes', user?.id], 
    queryFn: () => base44.entities.ForumVote.filter({ user_id: user?.id }),
    enabled: !!user,
  });

  const createPost = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create({ 
      ...data, 
      authorName: user?.full_name || 'Anonymous',
      upvotes: 0,
      downvotes: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum_posts'] });
      setShowForm(false);
      setForm({ title: "", content: "", imageUrl: "", format: "" });
      toast({ title: "Post created!" });
    }
  });

  const handleVote = async (post, voteValue) => {
    if (!user) return;
    const existingVote = votes.find(v => v.itemId === post.id && v.itemType === 'post');
    
    let newUpvotes = post.upvotes || 0;
    let newDownvotes = post.downvotes || 0;
    
    if (existingVote) {
      if (existingVote.voteValue === voteValue) {
        // Remove vote
        await base44.entities.ForumVote.delete(existingVote.id);
        if (voteValue === 1) newUpvotes--;
        if (voteValue === -1) newDownvotes--;
      } else {
        // Change vote
        await base44.entities.ForumVote.update(existingVote.id, { voteValue });
        if (voteValue === 1) { newUpvotes++; newDownvotes--; }
        if (voteValue === -1) { newDownvotes++; newUpvotes--; }
      }
    } else {
      // New vote
      await base44.entities.ForumVote.create({
        itemId: post.id,
        itemType: 'post',
        voteValue,
        user_id: user.id
      });
      if (voteValue === 1) newUpvotes++;
      if (voteValue === -1) newDownvotes++;
    }
    
    await base44.entities.ForumPost.update(post.id, { upvotes: newUpvotes, downvotes: newDownvotes });
    queryClient.invalidateQueries({ queryKey: ['forum_posts'] });
    queryClient.invalidateQueries({ queryKey: ['forum_votes'] });
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortMode === 'hot') {
      const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
      const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
      return scoreB - scoreA;
    }
    return new Date(b.created_date) - new Date(a.created_date);
  });

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading text-slate-900">Debate Forum</h1>
            <p className="text-slate-500">Discuss strategies, share cases, and ask questions.</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Create Post</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create a Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" />
                <Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="What's on your mind?" rows={5} className="resize-none" />
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="Image URL (optional)" />
                </div>
                <Input value={form.format} onChange={e => setForm({...form, format: e.target.value})} placeholder="Format tags (e.g. PF, LD, Policy) (optional)" />
                <Button onClick={() => createPost.mutate(form)} disabled={!form.title || !form.content || createPost.isPending} className="w-full">
                  Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
          <Button variant={sortMode === 'hot' ? 'secondary' : 'ghost'} size="sm" onClick={() => setSortMode('hot')} className="gap-2 rounded-full">
            <Flame className={`w-4 h-4 ${sortMode === 'hot' ? 'text-orange-500' : ''}`} /> Hot
          </Button>
          <Button variant={sortMode === 'new' ? 'secondary' : 'ghost'} size="sm" onClick={() => setSortMode('new')} className="gap-2 rounded-full">
            <Clock className={`w-4 h-4 ${sortMode === 'new' ? 'text-blue-500' : ''}`} /> New
          </Button>
        </div>

        <div className="space-y-4">
          {sortedPosts.map(post => {
            const userVote = votes.find(v => v.itemId === post.id && v.itemType === 'post')?.voteValue;
            const score = (post.upvotes || 0) - (post.downvotes || 0);

            return (
              <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-0 flex shadow-sm hover:shadow-md transition-all">
                {/* Voting sidebar */}
                <div className="w-12 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-3 gap-1 rounded-l-xl shrink-0">
                  <button onClick={() => handleVote(post, 1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 rounded-full hover:bg-slate-200 group">
                    <ThumbsUp className={`w-5 h-5 ${userVote === 1 ? 'text-orange-500 fill-orange-500' : 'text-slate-400 group-hover:text-orange-500'}`} />
                  </button>
                  <span className={`text-sm font-bold ${userVote === 1 ? 'text-orange-500' : userVote === -1 ? 'text-indigo-500' : 'text-slate-700'}`}>{score}</span>
                  <button onClick={() => handleVote(post, -1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 rounded-full hover:bg-slate-200 group">
                    <ThumbsDown className={`w-5 h-5 ${userVote === -1 ? 'text-indigo-500 fill-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-4 flex-1 min-w-0">
                  <Link to={`/forum/${post.id}`} className="block">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{post.authorName || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(post.created_date).toLocaleDateString()}</span>
                      {post.format && (
                        <>
                          <span>•</span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{post.format}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-3">{post.content}</p>
                    
                    {post.imageUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden max-h-64 border border-slate-100">
                        <img src={post.imageUrl} alt="Post attachment" className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-2">
                      <div className="flex items-center gap-1.5 hover:bg-slate-100 p-2 -m-2 rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4" /> Discuss
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
          
          {sortedPosts.length === 0 && (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-700">No posts yet</h3>
              <p className="text-slate-500 mt-1">Be the first to start a discussion!</p>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}