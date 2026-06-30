import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, ThumbsDown, ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import AnimatedPage from "@/components/AnimatedPage";
import ReportBlockActions from "@/components/moderation/ReportBlockActions";
import { getVisibleItems, hasObjectionableContent } from "@/lib/moderation";

export default function ForumPostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const { data: post } = useQuery({ 
    queryKey: ['forum_post', id], 
    queryFn: () => base44.entities.ForumPost.get(id)
  });

  const { data: comments = [] } = useQuery({ 
    queryKey: ['forum_comments', id], 
    queryFn: () => base44.entities.ForumComment.filter({ postId: id }) 
  });

  const { data: votes = [] } = useQuery({ 
    queryKey: ['forum_votes', user?.id], 
    queryFn: () => base44.entities.ForumVote.filter({ user_id: user?.id }),
    enabled: !!user
  });

  const { data: blockedUsers = [] } = useQuery({
    queryKey: ['blocked_users', user?.id],
    queryFn: () => base44.entities.BlockedUser.filter({ blockerId: user?.id }),
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await base44.entities.UserProfile.filter({ created_by_id: user.id });
      return res[0] || null;
    },
    enabled: !!user
  });

  const isProfileComplete = profile && profile.displayName;

  const createComment = useMutation({
    mutationFn: async (data) => {
      if (hasObjectionableContent(data.content)) {
        throw new Error("Please revise content that may violate community rules.");
      }
      const comment = await base44.entities.ForumComment.create({ 
        ...data, 
        postId: id,
        authorName: profile?.displayName || user?.full_name || 'Anonymous',
        upvotes: 0,
        downvotes: 0
      });
      
      let targetUserId = null;
      let title = "New Reply";
      if (data.parentCommentId) {
         const parent = await base44.entities.ForumComment.get(data.parentCommentId);
         if (parent && parent.created_by_id !== user.id) targetUserId = parent.created_by_id;
      } else if (post && post.created_by_id !== user.id) {
         targetUserId = post.created_by_id;
         title = "New Comment on your Post";
      }

      if (targetUserId) {
         const targetProfile = await base44.entities.UserProfile.filter({ created_by_id: targetUserId });
         if (!targetProfile[0] || targetProfile[0].notificationsEnabled !== false) {
             await base44.entities.UserNotification.create({
                userId: targetUserId,
                title,
                message: `${profile?.displayName || "Someone"} replied: "${data.content.substring(0, 50)}..."`,
                link: `/forum/${id}`,
                type: "forum"
             });
         }
      }
      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum_comments', id] });
      setCommentText("");
      setReplyTo(null);
      toast({ title: "Comment posted!" });
    }
  });

  const deletePost = useMutation({
    mutationFn: (postId) => base44.entities.ForumPost.delete(postId),
    onSuccess: () => {
      toast({ title: "Post deleted" });
      window.location.href = "/forum";
    }
  });

  const deleteComment = useMutation({
    mutationFn: (commentId) => base44.entities.ForumComment.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum_comments', id] });
      toast({ title: "Comment deleted" });
    }
  });

  const handleVote = async (item, itemType, voteValue) => {
    if (!user) return;
    const existingVote = votes.find(v => v.itemId === item.id && v.itemType === itemType);
    
    let newUpvotes = item.upvotes || 0;
    let newDownvotes = item.downvotes || 0;
    
    if (existingVote) {
      if (existingVote.voteValue === voteValue) {
        if (voteValue === 1) newUpvotes--;
        if (voteValue === -1) newDownvotes--;
      } else {
        if (voteValue === 1) { newUpvotes++; newDownvotes--; }
        if (voteValue === -1) { newDownvotes++; newUpvotes--; }
      }
    } else {
      if (voteValue === 1) newUpvotes++;
      if (voteValue === -1) newDownvotes++;
    }
    
    // Optimistic UI updates
    if (itemType === 'post') {
      queryClient.setQueryData(['forum_post', id], old => old ? { ...old, upvotes: newUpvotes, downvotes: newDownvotes } : old);
    } else {
      queryClient.setQueryData(['forum_comments', id], (old = []) => 
        old.map(c => c.id === item.id ? { ...c, upvotes: newUpvotes, downvotes: newDownvotes } : c)
      );
    }
    queryClient.setQueryData(['forum_votes', user?.id], (old = []) => {
      if (existingVote) {
        if (existingVote.voteValue === voteValue) return old.filter(v => v.id !== existingVote.id);
        return old.map(v => v.id === existingVote.id ? { ...v, voteValue } : v);
      }
      return [...old, { id: 'temp-'+Date.now(), itemId: item.id, itemType, voteValue, user_id: user.id }];
    });

    try {
      if (existingVote) {
        if (existingVote.voteValue === voteValue) {
          await base44.entities.ForumVote.delete(existingVote.id);
        } else {
          await base44.entities.ForumVote.update(existingVote.id, { voteValue });
        }
      } else {
        await base44.entities.ForumVote.create({
          itemId: item.id,
          itemType,
          voteValue,
          user_id: user.id
        });
      }
      
      if (itemType === 'post') {
        await base44.entities.ForumPost.update(item.id, { upvotes: newUpvotes, downvotes: newDownvotes });
      } else {
        await base44.entities.ForumComment.update(item.id, { upvotes: newUpvotes, downvotes: newDownvotes });
      }
    } finally {
      if (itemType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['forum_post', id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['forum_comments', id] });
      }
      queryClient.invalidateQueries({ queryKey: ['forum_votes'] });
    }
  };

  if (!post) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto"></div></div>;

  const blockedIds = new Set(blockedUsers.map((b) => b.blockedUserId));
  if (blockedIds.has(post.created_by_id)) {
    return <AnimatedPage><div className="max-w-3xl mx-auto px-6 py-16 text-center text-slate-500">You blocked this user, so this post is hidden from your feed.</div></AnimatedPage>;
  }

  const postVote = votes.find(v => v.itemId === post.id && v.itemType === 'post')?.voteValue;
  const postScore = (post.upvotes || 0) - (post.downvotes || 0);

  // Group comments by parent
  const visibleComments = getVisibleItems(comments, blockedUsers);
  const topLevelComments = visibleComments ? visibleComments.filter(c => !c.parentCommentId).sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0)) : [];
  const getReplies = (parentId) => visibleComments ? visibleComments.filter(c => c.parentCommentId === parentId).sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0)) : [];

  const CommentNode = ({ comment, depth = 0 }) => {
    const commentVote = votes.find(v => v.itemId === comment.id && v.itemType === 'comment')?.voteValue;
    const score = (comment.upvotes || 0) - (comment.downvotes || 0);
    const replies = getReplies(comment.id);
    
    return (
      <div className={`mt-4 ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-slate-100' : ''}`}>
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button onClick={() => handleVote(comment, 'comment', 1)} className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-orange-500">
              <ThumbsUp className={`w-4 h-4 ${commentVote === 1 ? 'text-orange-500 fill-orange-500' : ''}`} />
            </button>
            <span className={`text-xs font-bold ${commentVote === 1 ? 'text-orange-500' : commentVote === -1 ? 'text-indigo-500' : 'text-slate-600'}`}>{score}</span>
            <button onClick={() => handleVote(comment, 'comment', -1)} className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-500">
              <ThumbsDown className={`w-4 h-4 ${commentVote === -1 ? 'text-indigo-500 fill-indigo-500' : ''}`} />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-700">{comment.authorName || 'Anonymous'}</span>
              <span className="text-xs text-slate-400">• {new Date(comment.created_date).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-slate-800 mb-2 leading-relaxed">{comment.content}</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} 
                className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1.5 p-2 -m-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Reply
              </button>
              <ReportBlockActions user={user} item={comment} itemType="comment" postId={id} content={comment.content} authorName={comment.authorName} toast={toast} />
              {user?.id === comment.created_by_id && (
                <button 
                  onClick={() => deleteComment.mutate(comment.id)} 
                  className="text-xs font-medium text-red-400 hover:text-red-600 flex items-center gap-1.5 p-2 -m-2 rounded-lg hover:bg-red-50 transition-colors ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
            
            {replyTo === comment.id && (
              <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <Textarea 
                  value={commentText} 
                  onChange={e => setCommentText(e.target.value)} 
                  placeholder={`Replying to ${comment.authorName}...`} 
                  className="bg-white mb-2 text-sm" 
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setReplyTo(null); setCommentText(""); }}>Cancel</Button>
                  <Button size="sm" onClick={() => {
                    if (!isProfileComplete) {
                      toast({ title: "Profile Incomplete", description: "Please set a Display Name in your Profile to comment.", variant: "destructive" });
                      return;
                    }
                    if (hasObjectionableContent(commentText)) {
                      toast({ title: "Content blocked", description: "Please revise content that may violate community rules.", variant: "destructive" });
                      return;
                    }
                    createComment.mutate({ content: commentText, parentCommentId: comment.id });
                  }} disabled={!commentText || createComment.isPending}>Reply</Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {replies.map(reply => (
          <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 font-medium p-2 -m-2 rounded-lg hover:bg-slate-100 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Forum
        </Link>
        
        <div className="bg-white border border-slate-200 rounded-xl p-0 flex shadow-sm mb-6">
          <div className="w-12 sm:w-16 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-4 gap-1.5 rounded-l-xl shrink-0">
            <button onClick={() => handleVote(post, 'post', 1)} className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-full hover:bg-slate-200 group">
              <ThumbsUp className={`w-6 h-6 ${postVote === 1 ? 'text-orange-500 fill-orange-500' : 'text-slate-400 group-hover:text-orange-500'}`} />
            </button>
            <span className={`text-base font-bold ${postVote === 1 ? 'text-orange-500' : postVote === -1 ? 'text-indigo-500' : 'text-slate-700'}`}>{postScore}</span>
            <button onClick={() => handleVote(post, 'post', -1)} className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-full hover:bg-slate-200 group">
              <ThumbsDown className={`w-6 h-6 ${postVote === -1 ? 'text-indigo-500 fill-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'}`} />
            </button>
          </div>
          
          <div className="p-5 sm:p-6 flex-1 min-w-0">
            <div className="text-xs text-slate-500 mb-2 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">{post.authorName || 'Anonymous'}</span>
              <span>•</span>
              <span>{new Date(post.created_date).toLocaleString()}</span>
              {post.format && (
                <>
                  <span>•</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{post.format}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-4">{post.title}</h1>
            <div className="prose prose-slate max-w-none text-slate-800 mb-4 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {post.content}
            </div>
            
            <ReportBlockActions user={user} item={post} itemType="post" content={`${post.title}\n${post.content}`} authorName={post.authorName} toast={toast} />

            {post.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
                <img src={post.imageUrl} alt="Post attachment" className="w-full h-auto object-contain max-h-[600px] bg-slate-50" />
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-slate-500 font-medium mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> {comments.length} Comments
              </div>
              {user?.id === post.created_by_id && (
                <button 
                  onClick={() => deletePost.mutate(post.id)} 
                  className="text-red-400 hover:text-red-600 flex items-center gap-1.5 p-2 -m-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Post
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Comment Input */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Leave a comment</h3>
          <Textarea 
            value={replyTo === null ? commentText : ""} 
            onChange={e => { if (replyTo === null) setCommentText(e.target.value); }} 
            placeholder="What are your thoughts?" 
            className="mb-3 bg-white" 
            rows={3}
            onFocus={() => setReplyTo(null)}
          />
          <div className="flex justify-end">
            <Button onClick={() => {
              if (!isProfileComplete) {
                toast({ title: "Profile Incomplete", description: "Please set a Display Name in your Profile to comment.", variant: "destructive" });
                return;
              }
              if (hasObjectionableContent(commentText)) {
                toast({ title: "Content blocked", description: "Please revise content that may violate community rules.", variant: "destructive" });
                return;
              }
              createComment.mutate({ content: commentText, parentCommentId: null });
            }} disabled={replyTo !== null || !commentText || createComment.isPending}>
              Post Comment
            </Button>
          </div>
        </div>
        
        {/* Comments Tree */}
        <div className="space-y-6">
          {topLevelComments.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No comments yet.</div>
          ) : (
            topLevelComments.map(comment => (
              <CommentNode key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}