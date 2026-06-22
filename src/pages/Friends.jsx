import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, MessageCircle, Check, X, Search, Clock, Loader2, Target } from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import PullToRefresh from "@/components/PullToRefresh";
import { useToast } from "@/components/ui/use-toast";

export default function Friends() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState("friends");
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [msgInput, setMsgInput] = useState("");

  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', user?.id],
    queryFn: () => base44.entities.Friendship.filter({
      $or: [{ requesterId: user?.id }, { recipientId: user?.id }]
    }, '-created_date', 100),
    enabled: !!user
  });

  const { data: myFriendCodes = [] } = useQuery({
    queryKey: ['myFriendCode', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const codes = await base44.entities.UserFriendCode.filter({ userId: user.id });
      if (codes.length === 0) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let newCode = '';
        for (let i = 0; i < 6; i++) newCode += chars.charAt(Math.floor(Math.random() * chars.length));
        const created = await base44.entities.UserFriendCode.create({
          code: newCode,
          userId: user.id,
          userName: user.full_name || "Debater"
        });
        return [created];
      }
      return codes;
    },
    enabled: !!user
  });
  const myCode = myFriendCodes[0]?.code || "Loading...";

  const { data: directMessages = [], isLoading: loadingMsgs } = useQuery({
    queryKey: ['dms', user?.id, selectedFriend],
    queryFn: () => {
      if (!selectedFriend) return [];
      return base44.entities.DirectMessage.filter({
        $or: [
          { senderId: user?.id, receiverId: selectedFriend },
          { senderId: selectedFriend, receiverId: user?.id }
        ]
      }, 'created_date', 100);
    },
    enabled: !!user && !!selectedFriend,
    refetchInterval: 3000
  });

  const sendFriendRequest = useMutation({
    mutationFn: async (code) => {
      const results = await base44.entities.UserFriendCode.filter({ code: code.toUpperCase().trim() });
      if(results.length === 0) throw new Error("Friend code not found");
      const targetUser = results[0];
      if(targetUser.userId === user.id) throw new Error("You cannot add yourself");
      
      const existing = await base44.entities.Friendship.filter({
        $or: [
          { requesterId: user.id, recipientId: targetUser.userId },
          { requesterId: targetUser.userId, recipientId: user.id }
        ]
      });
      if(existing.length > 0) throw new Error("Friendship already exists or pending");

      return base44.entities.Friendship.create({
        requesterId: user.id,
        requesterName: user.full_name || "Debater",
        recipientId: targetUser.userId,
        recipientName: targetUser.userName,
        status: "pending"
      });
    },
    onSuccess: () => {
      setFriendCodeInput("");
      toast({ title: "Friend request sent!" });
      queryClient.invalidateQueries(['friendships']);
    },
    onError: (err) => toast({ title: err.message || "Error sending request", variant: "destructive" })
  });

  const respondRequest = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Friendship.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['friendships'])
  });

  const sendMessage = useMutation({
    mutationFn: () => base44.entities.DirectMessage.create({
      senderId: user.id,
      receiverId: selectedFriend,
      content: msgInput
    }),
    onSuccess: () => {
      setMsgInput("");
      queryClient.invalidateQueries(['dms', user?.id, selectedFriend]);
    }
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['friendships']);
    if(selectedFriend) await queryClient.invalidateQueries(['dms']);
  };

  const pendingRequests = friendships.filter(f => f.status === "pending" && f.recipientId === user?.id);
  const sentRequests = friendships.filter(f => f.status === "pending" && f.requesterId === user?.id);
  const activeFriends = friendships.filter(f => f.status === "accepted");

  return (
    <AnimatedPage>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
          
          <div className="w-full md:w-80 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-900 font-heading mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary"/> Friends & Collab</h2>
              <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100 text-center">
                <div className="text-xs text-slate-500 mb-1">Your Friend Code</div>
                <div className="font-mono text-lg font-bold text-slate-700 bg-white p-2 rounded border border-slate-200 tracking-widest select-all">{myCode}</div>
              </div>
              
              <div className="flex gap-2">
                <Input value={friendCodeInput} onChange={e=>setFriendCodeInput(e.target.value)} placeholder="Enter Friend Code" className="text-xs" />
                <Button size="sm" onClick={() => sendFriendRequest.mutate(friendCodeInput)} disabled={!friendCodeInput.trim() || sendFriendRequest.isPending}>
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Pending Requests ({pendingRequests.length})</h3>
                <div className="space-y-2">
                  {pendingRequests.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                      <span className="text-sm font-medium">{r.requesterName}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => respondRequest.mutate({id: r.id, status: 'accepted'})}><Check className="w-4 h-4"/></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => respondRequest.mutate({id: r.id, status: 'rejected'})}><X className="w-4 h-4"/></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-700">My Friends</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {activeFriends.length === 0 ? (
                  <div className="text-center p-4 text-sm text-slate-400">No friends yet.</div>
                ) : (
                  activeFriends.map(f => {
                    const friendId = f.requesterId === user?.id ? f.recipientId : f.requesterId;
                    const friendName = f.requesterId === user?.id ? f.recipientName : f.requesterName;
                    const isSelected = selectedFriend === friendId;
                    return (
                      <button key={f.id} onClick={() => setSelectedFriend(friendId)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-50 text-slate-700'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {friendName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0 truncate">{friendName}</div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[800px]">
            {selectedFriend ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50 rounded-t-2xl">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {activeFriends.find(f => (f.requesterId === selectedFriend || f.recipientId === selectedFriend))?.requesterId === selectedFriend ? 
                      activeFriends.find(f => f.requesterId === selectedFriend)?.requesterName?.charAt(0) : 
                      activeFriends.find(f => f.recipientId === selectedFriend)?.recipientName?.charAt(0)}
                  </div>
                  <div className="font-bold text-slate-900">Direct Message</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {directMessages.length === 0 ? (
                    <div className="text-center text-slate-400 mt-20 text-sm">Send a message to start the conversation!</div>
                  ) : (
                    directMessages.map(m => {
                      const isMe = m.senderId === user?.id;
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                            {m.content}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl flex gap-2">
                  <Input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendMessage.mutate()} placeholder="Type a message..." className="bg-slate-50" />
                  <Button onClick={() => sendMessage.mutate()} disabled={!msgInput.trim() || sendMessage.isPending}>Send</Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <MessageCircle className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-medium text-slate-600">Select a friend to chat</h3>
                <p className="text-sm">Or add a new friend using their code to collaborate on projects.</p>
              </div>
            )}
          </div>

        </div>
      </PullToRefresh>
    </AnimatedPage>
  );
}