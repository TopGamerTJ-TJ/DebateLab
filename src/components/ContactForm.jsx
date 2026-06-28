import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, CheckCircle } from "lucide-react";

const SUBJECTS = [
  "General Question",
  "Bug Report",
  "Feature Request",
  "Account Issue",
  "Billing / Payments",
  "Safety / Report a User",
  "Other",
];

export default function ContactForm() {
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => { if (u?.email) setEmail(u.email); }).catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!subject || !email || !body.trim()) return;
    setSending(true);
    try {
      // Save to DB for admin panel
      await base44.entities.ContactRequest.create({ subject, email, body });
      setSent(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mt-8">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h3 className="font-bold text-green-800 font-heading mb-1">Message Sent!</h3>
        <p className="text-green-700 text-sm">We'll get back to you at {email} as soon as possible.</p>
        <button onClick={() => { setSent(false); setBody(""); setSubject(""); }} className="mt-4 text-xs text-green-600 hover:underline">Send another message</button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-8">
      <div className="flex items-center gap-2 mb-5">
        <Mail className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-bold text-slate-900 font-heading">Contact Support</h3>
          <p className="text-xs text-slate-400">Reach us at DebateLab@outlook.com</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Subject</label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
            <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Your Email</label>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Message</label>
          <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Describe your question or issue in detail..." rows={4} className="resize-none text-sm" />
        </div>
        <Button onClick={handleSend} disabled={!subject || !email || !body.trim() || sending} className="w-full gap-2">
          <Send className="w-4 h-4" />{sending ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </div>
  );
}