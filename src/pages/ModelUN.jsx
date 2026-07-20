import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AIAssistant from "@/components/AIAssistant";
import ContextInput from "@/components/ContextInput";
import ConferenceContextPicker, { buildConferenceContextText } from "@/components/ConferenceContextPicker";
import { Globe, Sparkles, Loader2, FileText, Trash2, Star, Save, Copy, Download, BookOpen, Maximize2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MarkdownContent from "@/components/MarkdownContent";
import DocumentViewer from "@/components/DocumentViewer";

const DOC_TYPES = [
  { value: "position_paper", label: "Position Paper (NMUN)" },
  { value: "draft_resolution", label: "Draft Resolution (THIMUN)" },
  { value: "working_paper", label: "Working Paper" },
  { value: "amendment", label: "Amendment" },
  { value: "opening_speech", label: "Opening Speech" },
  { value: "country_profile", label: "Country Profile & Research" },
  { value: "bloc_strategy", label: "Bloc Strategy Memo" },
  { value: "committee_prep", label: "Committee Prep Pack" },
];

const COMMITTEES = [
  "UNSC - Security Council",
  "GA1 - Disarmament & International Security",
  "GA2 - Economic & Financial",
  "GA3 - Social, Cultural & Humanitarian",
  "GA4 - Special Political & Decolonization",
  "GA5 - Administrative & Budgetary",
  "GA6 - Legal",
  "ECOSOC",
  "UNHRC - Human Rights Council",
  "WHO - World Health Organization",
  "UNICEF",
  "UNEP - Environment Programme",
  "UNESCO",
  "IMF",
  "WTO",
  "UNHCR",
  "Crisis Committee",
  "Other",
];

const MUN_FRAMEWORK_CONTEXT = `

MUN FRAMEWORK & DIPLOMATIC CONTEXT (ground all output in this):
5 STAGES OF MUN: Research → Debate → Negotiate → Resolution → Action.

UN STRUCTURE:
- General Assembly: 193 member states, each gets 1 vote. Resolutions are NOT enforceable — they are recommendations. Unrecognized countries may observe but cannot vote. GA-passed resolutions do not automatically advance elsewhere.
- Security Council: resolves urgent international peace & security issues. 5 permanent members (US, UK, China, France, Russia — all WWII allies) + 10 rotating. Only permanent members hold VETO. A substantive matter requires all 5 permanent members to vote YES (any veto kills it). The Council CAN authorize military force, sanctions, and peacekeepers, and CAN enforce its resolutions. The GA refers resolutions/treaties to the Council for enforcement.
- Sustainable Development Goals (SDGs): targets for completion by 2030; used to track progress (likely not all met by 2030).

BASE DISCUSSIONS ON: national interests, security, economics, politics, and history.

P.E.G.S. COUNTRY ANALYSIS (understand your country through these lenses):
- Political: who leads the government; democracy? monarchy? military?
- Economic: rich? developing? major industries; influencing factors.
- Geographic: location; allies & neighbors; natural resources.
- Society: population; culture; ethnic groups; beliefs; struggles.

SPEECH STRUCTURE (especially ~1-minute speeches): better to do ONE thing well than many things poorly.
- Hook: a surprising statistic, thoughtful quote, provocative question, or VERY short story.
- Point: one-sentence main point with 2-3 supporting points. Talk about your country's POLICY, not just the problem (e.g., "The issue is X; my country believes Y").
- Call to action: a get-in-touch note, policy support request, feedback, or specific ways to help.`;

function buildPrompt(docType, form) {
  const { country, committee, topic } = form;

  if (docType === "position_paper") {
    return `You are writing an official Model UN Position Paper following NMUN (National Model United Nations) format exactly, per the official NMUN Position Paper Guide.

Member State: ${country}
Committee: ${committee}
Topic: ${topic}

Write a complete, authentic position paper following this EXACT NMUN format:

---
Delegation from ${country}
Position Paper for the ${committee}

[SHORT INTRODUCTORY PARAGRAPH: 2-3 sentences introducing the topic(s) on the committee's agenda and ${country}'s commitment to addressing them. Written as a policy statement from ${country}'s foreign ministry.]

${topic}

[PARAGRAPH 1 — GLOBAL/REGIONAL CONTEXT: Provide the factual background on the topic, including relevant statistics, geographic context, and the scope of the problem. Written from ${country}'s perspective but framing the global situation. Use formal diplomatic language.]

[PARAGRAPH 2 — PAST INTERNATIONAL ACTION: Describe what the international/regional community has previously done to address the topic — relevant UN resolutions (cite real resolution numbers, e.g., A/RES/70/1, S/RES/1373), treaties, conferences, and agency efforts.]

[PARAGRAPH 3 — ${country.toUpperCase()}'S POSITION & NATIONAL ACTION: State ${country}'s official stance. Reference actual treaties ${country} has signed/ratified, votes on relevant resolutions, national policies, and statements by government officials. Be specific and factual about ${country}'s real foreign policy.]

[PARAGRAPH 4 — PROPOSED SOLUTIONS: 3-5 specific, actionable policy proposals ${country} will advocate for in committee. Number each proposal. Make them feasible, aligned with ${country}'s interests, and within the ${committee}'s actual mandate.]
---

CRITICAL NMUN FORMATTING RULES (follow exactly):
- This is written as a POLICY STATEMENT from ${country}'s foreign ministry — DO NOT include academic citations, footnotes, endnotes, or in-text parenthetical references. NMUN explicitly forbids formal citations. You may informally acknowledge a source in the text (e.g., "as noted by the Secretary-General's 2023 report"), but no bibliography or "References" section.
- Do NOT include university name, national flags, or national symbols.
- Keep it to roughly two pages (be substantive but not excessive).
- Use formal diplomatic language throughout. Include real statistics, real treaty names, and real UN resolution numbers woven into the prose.
- Make it tournament-quality that would win a Position Paper Award.`;
  }

  if (docType === "draft_resolution") {
    return `You are writing an official Model UN Draft Resolution following THIMUN format exactly.

Country/Bloc: ${country}
Committee: ${committee}
Topic: ${topic}

Write a complete, authentic draft resolution in this EXACT THIMUN format:

---
COMMITTEE: [Committee Name in Full]
TOPIC: [Topic Title]
SUBMITTED BY: ${country}
CO-SUBMITTED BY: [List 3-5 realistic co-submitting countries with similar positions]

THE [COMMITTEE NAME],

[PREAMBULATORY CLAUSES - minimum 5, use correct phrasing verbs in italics:]
Affirming that [relevant UN charter article or principle],
Bearing in mind [relevant context],
Deeply concerned about [specific problem with statistics],
Emphasizing the importance of [key principle],
Fully aware of [relevant prior resolution, e.g., previous efforts],
Guided by [relevant international law/treaty],
Noting with concern [specific quantified problem],
Recognizing [relevant fact or prior action],
Recalling [specific UN resolution number, e.g., A/RES/74/2],
Welcoming [recent positive development],

[OPERATIVE CLAUSES - minimum 8, numbered, specific and actionable:]
1. Calls upon all Member States to [specific action];

2. Encourages [body/states] to [action with mechanism], including through:
   a. [specific sub-action],
   b. [specific sub-action],
   c. [specific sub-action];

3. Requests the Secretary-General to [specific request with timeline];

4. Urges Member States to [action], particularly those [qualifier];

5. Decides to establish [mechanism/body] with the following mandate:
   a. [mandate point],
   b. [mandate point];

6. Further calls upon [body] to [action] in accordance with [relevant law];

7. Strongly encourages [action with funding mechanism];

8. Recommends [specific measurable recommendation];

9. Invites [relevant UN body or NGOs] to [collaborative action];

10. Decides to remain seized of the matter.
---

Use correct THIMUN preambulatory and operative verbs. Preambulatory clauses end with commas, operative clauses with semicolons (last with period). Make all operative clauses specific, measurable, and realistic for a UN committee to pass.`;
  }

  if (docType === "working_paper") {
    return `Write a Model UN Working Paper for:
Country/Bloc: ${country}
Committee: ${committee}
Topic: ${topic}

A Working Paper is the precursor to a Draft Resolution — it has NOT yet been approved by the Dais as a formal draft resolution, but it ALREADY follows the standard resolution format (preambulatory + operative clauses). Once the Dais approves it, it becomes a Draft Resolution. Format it as follows (matching real conference standards like AMUN/THIMUN):

---
WORKING PAPER [number to be assigned by the Dais]

Committee: ${committee}
Topic: ${topic}

Sponsors: ${country} and [list 2-4 realistic co-sponsoring Member States — sponsors help write the paper and agree to vote YES on it]
Signatories: [list 4-6 realistic signatory Member States — signatories only support the idea being introduced for debate; they are NOT obligated to vote yes]

THE ${committee.toUpperCase()},

[PREAMBULATORY CLAUSES — minimum 5. Each clause begins with a preambulatory phrase (italicized conceptually) and ends with a COMMA. Do NOT repeat the same opening phrase. Use real precedents:]
Affirming [relevant UN Charter article or principle],
Recalling [real UN resolution number, e.g., A/RES/70/1],
Deeply concerned [about the specific problem with a real statistic],
Noting with appreciation [recent positive development or past UN effort],
Guided by [relevant international treaty or convention],
Emphasizing [key principle at stake],
Bearing in mind [relevant contextual fact],
Aware of [quantified scope of the issue],

[OPERATIVE CLAUSES — minimum 6, numbered, each begins with an operative verb and ends with a SEMICOLON (the final clause ends with a PERIOD). Each clause = one specific actionable policy. Use sub-clauses (a, b, c) for detail:]
1. Calls upon all Member States to [specific action with mechanism];

2. Recommends the establishment of [body/program] with the following mandate:
   a. [specific mandate point],
   b. [specific mandate point],
   c. [specific mandate point];

3. Requests the Secretary-General to [specific request with a timeline];

4. Encourages Member States, particularly [qualifier], to [action];

5. Decides to [specific measurable decision with funding mechanism named];

6. Invites [relevant UN body, specialized agency, or NGOs] to [collaborative action];

7. Further resolves to [follow-up action, e.g., report back at the next session];
---

CRITICAL FORMAT RULES:
- The entire resolution is ONE long sentence. Preambulatory clauses separated by commas; operative clauses by semicolons; the whole thing ends with a period.
- Preambulatory clause starters must NOT repeat (no two clauses starting with "Recalling").
- Use correct preambulatory phrases (Affirming, Alarmed by, Bearing in mind, Deeply concerned, Emphasizing, Guided by, Having adopted, Noting with concern, Reaffirming, Recalling, Recognizing, Welcoming, etc.).
- Use correct operative phrases (Calls upon, Decides, Encourages, Endorses, Invites, Recommends, Requests, Resolves, Strongly urges, Urges, etc.).
- Operative clauses must be specific, measurable, realistic, and within the ${committee}'s actual mandate. Include real numbers, timelines, named agencies, and funding mechanisms.
- This is still labeled "Working Paper" (not "Draft Resolution") because the Dais has not yet approved it.`;
  }

  if (docType === "opening_speech") {
    return `Write a Model UN opening speech for:
Country: ${country}
Committee: ${committee}
Topic: ${topic}
Length: 90 seconds (approximately 200-225 words when spoken at normal pace)

The speech must follow this structure:

---
OPENING SPEECH — ${country}
${committee} | ${topic}

[SALUTATION]
"Honorable Chairperson, distinguished delegates, esteemed guests..."

[HOOK - 1-2 sentences] 
[Compelling statistic, quote, or anecdote that frames the urgency of the topic]

[COUNTRY'S POSITION - 2-3 sentences]
[State ${country}'s official position clearly and confidently. Reference ${country}'s national interest, treaties signed, or historical relationship with the issue]

[KEY ARGUMENT - 2-3 sentences]
[One strong argument with evidence or statistic that supports ${country}'s approach]

[PROPOSED APPROACH - 2 sentences]
[What ${country} will advocate for in committee]

[CALL TO COLLABORATION - 1-2 sentences]
[Invite allies/bloc partners and express willingness to work across delegations]

[CLOSING]
"The Delegation of ${country} stands ready to work constructively toward a comprehensive resolution. Thank you."
---

Use formal diplomatic language. Include real statistics and reference ${country}'s actual foreign policy positions. The speech should be memorable and set the tone for ${country}'s strategy.`;
  }

  if (docType === "country_profile") {
    return `Write a comprehensive Model UN Country Research Profile for:
Country: ${country}
Committee: ${committee}
Topic: ${topic}

Provide a thorough research document following this structure:

---
COUNTRY RESEARCH PROFILE
Country: ${country}
Committee: ${committee}
Topic: ${topic}
Prepared for: [Conference Name]

═══════════════════════════════════════
SECTION 1: COUNTRY OVERVIEW
═══════════════════════════════════════
• Official Name: 
• Government Type:
• Population: 
• GDP (PPP): 
• UN Member Since:
• Current UNSC Status (member/observer):
• Regional Blocs: (e.g., AU, EU, ASEAN, G77, NAM)

═══════════════════════════════════════
SECTION 2: POSITION ON ${topic.toUpperCase()}
═══════════════════════════════════════
[3-4 paragraphs: ${country}'s official position, national interests at stake, domestic political considerations, and public statements by government officials]

═══════════════════════════════════════
SECTION 3: HISTORICAL INVOLVEMENT
═══════════════════════════════════════
[Key events, treaties signed/ratified, past votes on related resolutions with actual resolution numbers]

═══════════════════════════════════════
SECTION 4: ALLIANCES & BLOC STRATEGY
═══════════════════════════════════════
Natural Allies: [List 4-5 countries with rationale]
Likely Opposition: [List 2-3 countries with rationale]
Swing Votes: [List 3 countries to persuade]
Recommended Bloc: [Describe coalition-building strategy]

═══════════════════════════════════════
SECTION 5: KEY ARGUMENTS TO MAKE
═══════════════════════════════════════
1. [Strong argument #1 with evidence]
2. [Strong argument #2 with evidence]
3. [Strong argument #3 with evidence]

═══════════════════════════════════════
SECTION 6: ANTICIPATED OPPOSITION & RESPONSES
═══════════════════════════════════════
Opposition Argument 1: [argument]
${country}'s Response: [rebuttal]

Opposition Argument 2: [argument]
${country}'s Response: [rebuttal]

═══════════════════════════════════════
SECTION 7: KEY CLAUSES TO PUSH FOR
═══════════════════════════════════════
[5 specific operative clause language suggestions ${country} should push for]

═══════════════════════════════════════
SECTION 8: SOURCES & FURTHER READING
═══════════════════════════════════════
[5 real sources: government websites, UN documents, academic papers]
---

Fill all sections with accurate, researched content. Use real statistics and actual policy positions.`;
  }

  if (docType === "bloc_strategy") {
    return `Write a Model UN Bloc Strategy Memo for:
Country: ${country}
Committee: ${committee}
Topic: ${topic}

Format as a strategic internal document:

---
CONFIDENTIAL BLOC STRATEGY MEMO
Delegation of: ${country}
Committee: ${committee}
Topic: ${topic}

EXECUTIVE SUMMARY
[2 sentences: ${country}'s goal and overall strategy]

PHASE 1: PRE-CONFERENCE (Lobbying)
Target Countries to Recruit:
1. [Country] — Rationale: [why they'll join your bloc]
2. [Country] — Rationale: [shared interests]
3. [Country] — Rationale: [leverage/incentive]
4. [Country] — Rationale:
5. [Country] — Rationale:

Key Talking Points for Lobbying:
• [Point 1 that will resonate with potential allies]
• [Point 2]
• [Point 3]

PHASE 2: OPENING DEBATE STRATEGY
Moderated Caucus Topics to Push: [2-3 topics that favor your position]
Unmoderated Caucus Goals: [What to accomplish in unmods]
First Draft Resolution Target: [Who to co-submit with]

PHASE 3: RESOLUTION DRAFTING
Non-Negotiable Clauses: [3 clauses you must keep]
Compromise Clauses: [2 clauses you can trade away]
Deal-breaker Clauses: [2 clauses you'll vote NO on]

BLOC DYNAMICS
Likely Voting Blocs in Committee:
• [Bloc 1 name]: [countries] — Likely position
• [Bloc 2 name]: [countries] — Likely position  
• [Bloc 3 name]: [countries] — Likely position

${country}'s Positioning: [Which bloc to lead/join and why]

AWARDS STRATEGY
To win Best Delegate, ${country} should:
1. [Specific action for awards]
2. [Specific action for awards]
3. [Specific action for awards]
---`;
  }

  if (docType === "amendment") {
    return `Write a Model UN Amendment for:
Submitting Country: ${country}
Committee: ${committee}
Topic: ${topic}

Format following THIMUN amendment procedure:

---
AMENDMENT
Committee: ${committee}
Topic: ${topic}
Submitted by: ${country}

This amendment proposes to modify Draft Resolution [Resolution Number] as follows:

FRIENDLY AMENDMENT (if applicable):
ADD to operative clause [X]:
"[new language to add]"

HOSTILE AMENDMENT:
DELETE operative clause [X]:
[Quote the clause to be deleted]

REPLACE operative clause [X] with:
"[New replacement language that better serves ${country}'s interests]"

JUSTIFICATION:
${country} submits this amendment because [2-3 sentences explaining why the original clause is problematic and how this amendment improves the resolution while maintaining broad support]

SPONSORING DELEGATIONS:
[List 3-5 countries likely to support this amendment]

IMPACT OF AMENDMENT:
Before: [What the clause said/did]
After: [What the amended clause says/does]
Net Effect: [How this changes policy outcomes]
---

Make the amendment realistic, strategic, and diplomatically defensible.`;
  }

  // committee_prep default
  return `Write a comprehensive Model UN Committee Prep Pack for:
Country: ${country}
Committee: ${committee}
Topic: ${topic}

Create a complete preparation guide including:

---
COMMITTEE PREP PACK
Delegation: ${country} | Committee: ${committee}
Topic: ${topic}

📋 QUICK REFERENCE CARD
• ${country}'s Position: [1-sentence summary]
• Key Statistic to Remember: [compelling stat]
• ${country}'s #1 Goal: [main objective]
• Biggest Ally: [country]
• Main Opponent: [country]

📚 BACKGROUND BRIEF
[3 paragraphs: What is the issue, why it matters, current state of international action]

🎯 POLICY PRIORITIES
1. [Priority #1 with justification]
2. [Priority #2 with justification]  
3. [Priority #3 with justification]

💬 SPEECH SNIPPETS (ready to use)
Opening Hook: "[compelling 1-sentence opener]"
Key Argument: "[2-sentence argument with stat]"
Call to Action: "[1-sentence call for cooperation]"

🤝 LOBBYING SCRIPTS
To potential ally [Country A]: "[Brief pitch]"
To swing vote [Country B]: "[Tailored argument]"

⚡ CROSSFIRE PREP
Q: "Why should [issue] be handled at [level] rather than nationally?"
A: "[${country}'s response]"

Q: "[Anticipated tough question]"
A: "[Prepared response]"

📋 DRAFT CLAUSE TEMPLATES
Operative: "Urges all Member States to [${country}'s preferred action];"
Preambulatory: "Noting with deep concern the [specific problem facing ${country}],"

📖 KEY SOURCES TO CITE
[3 specific UN documents or reports with real names]
---`;
}

export default function ModelUN() {
  const [form, setForm] = useState({ title: "", type: "position_paper", country: "", committee: "", topic: "", content: "" });
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState({ country: "", committee: "", topic: "", docType: "position_paper", context: "" });
  const [conferenceProfile, setConferenceProfile] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);
  const [fullscreenDoc, setFullscreenDoc] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: docs = [] } = useQuery({ queryKey: ['mun_docs'], queryFn: () => base44.entities.MUNDocument.list('-created_date') });

  const createDoc = useMutation({
    mutationFn: (data) => base44.entities.MUNDocument.create(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['mun_docs'] });
      const previousDocs = queryClient.getQueryData(['mun_docs']);
      queryClient.setQueryData(['mun_docs'], old => [
        { id: 'temp-' + Date.now(), ...newData, created_date: new Date().toISOString() },
        ...(old || [])
      ]);
      setForm({ title: "", type: "position_paper", country: "", committee: "", topic: "", content: "" });
      return { previousDocs };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['mun_docs'], context.previousDocs);
      toast({ title: "Error saving document", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['mun_docs'] });
    },
    onSuccess: () => {
      toast({ title: "Document saved to library!" });
    }
  });

  const deleteDoc = useMutation({
    mutationFn: (id) => base44.entities.MUNDocument.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mun_docs'] })
  });

  const toggleFavorite = useMutation({
    mutationFn: ({ id, val }) => base44.entities.MUNDocument.update(id, { isFavorite: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mun_docs'] })
  });

  const generateDoc = async () => {
    if (!aiPrompt.country || !aiPrompt.committee || !aiPrompt.topic) {
      toast({ title: "Please fill country, committee, and topic", variant: "destructive" }); return;
    }
    setGenerating(true);
    const contextNote = aiPrompt.context ? `\n\nADDITIONAL CONTEXT FROM THE DELEGATE (prioritize these instructions): ${aiPrompt.context}\n` : "";
    const conferenceText = buildConferenceContextText(conferenceProfile);
    const conferenceNote = conferenceText ? `\n\n${conferenceText}\nAdhere to the conference rules/context above.\n` : "";
    const prompt = buildPrompt(aiPrompt.docType, { country: aiPrompt.country, committee: aiPrompt.committee, topic: aiPrompt.topic });
    const content = await base44.integrations.Core.InvokeLLM({ prompt: prompt + MUN_FRAMEWORK_CONTEXT + contextNote + conferenceNote, model: "claude_sonnet_4_6" });
    const label = DOC_TYPES.find(d => d.value === aiPrompt.docType)?.label || aiPrompt.docType;
    setForm({
      title: `${aiPrompt.country} — ${label} — ${aiPrompt.committee}`,
      type: aiPrompt.docType,
      country: aiPrompt.country,
      committee: aiPrompt.committee,
      topic: aiPrompt.topic,
      content
    });
    setGenerating(false);
    toast({ title: "Document generated! Review and save it." });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 lg:pb-8">
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-teal-200 text-sm"><span>🌍</span> Model United Nations</div>
        <h1 className="text-3xl font-bold font-heading mb-2">Model UN Hub</h1>
        <p className="text-teal-100 max-w-2xl">Professionally-formatted documents identical to real THIMUN/NMUN standards — position papers, draft resolutions, speeches, bloc strategy, and more.</p>
      </div>

      <Tabs defaultValue="generate">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-6">
          <TabsTrigger value="generate" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">📝 AI Document Generator</TabsTrigger>
          <TabsTrigger value="library" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">📁 My Documents ({docs.length})</TabsTrigger>
          <TabsTrigger value="guide" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">📖 Format Guide</TabsTrigger>
          <TabsTrigger value="assistant" className="text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">🤖 AI Coach</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Generator inputs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-teal-600" /></div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading">Professional Document Generator</h3>
                  <p className="text-xs text-slate-500">THIMUN/NMUN authentic format • Claude AI</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Document Type</label>
                  <Select value={aiPrompt.docType} onValueChange={v => setAiPrompt({ ...aiPrompt, docType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Country / Delegation</label>
                  <Input value={aiPrompt.country} onChange={e => setAiPrompt({ ...aiPrompt, country: e.target.value })} placeholder="e.g., Brazil, Germany, People's Republic of China" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Committee</label>
                  <Select value={aiPrompt.committee} onValueChange={v => setAiPrompt({ ...aiPrompt, committee: v })}>
                    <SelectTrigger><SelectValue placeholder="Select committee" /></SelectTrigger>
                    <SelectContent>{COMMITTEES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input className="mt-2" value={aiPrompt.committee} onChange={e => setAiPrompt({ ...aiPrompt, committee: e.target.value })} placeholder="Or type custom committee name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Topic / Agenda Item</label>
                  <Input value={aiPrompt.topic} onChange={e => setAiPrompt({ ...aiPrompt, topic: e.target.value })} placeholder="e.g., Nuclear Non-Proliferation, Climate Migration, Cybersecurity" />
                </div>
                <ContextInput
                  value={aiPrompt.context}
                  onChange={v => setAiPrompt({ ...aiPrompt, context: v })}
                  placeholder="e.g., Emphasize my country's economic ties, this is a crisis committee, keep it under one page..."
                />
                <ConferenceContextPicker
                  value={conferenceProfile?.id || ""}
                  onChange={(_, p) => setConferenceProfile(p)}
                />
                <Button onClick={generateDoc} disabled={generating} className="w-full h-11 gap-2 font-semibold bg-teal-600 hover:bg-teal-700">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Generating authentic document..." : "Generate Document"}
                </Button>
                {generating && <p className="text-xs text-center text-slate-400">Using Claude AI for highest quality output...</p>}
              </div>
            </div>

            {/* Document editor */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5 text-slate-400" />
                  <h3 className="font-bold text-slate-900 font-heading">Document Editor</h3>
                </div>
                {form.content && (
                  <button onClick={() => copyToClipboard(form.content)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors">
                    <Copy className="w-3.5 h-3.5" /> Copy All
                  </button>
                )}
              </div>
              <div className="space-y-3 flex-1">
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Document title" />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country" />
                  <Input value={form.committee} onChange={e => setForm({ ...form, committee: e.target.value })} placeholder="Committee" />
                </div>
                <Textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Generated document will appear here. You can edit before saving."
                  rows={14}
                  className="resize-none text-xs font-mono leading-relaxed flex-1"
                />
                <Button onClick={() => createDoc.mutate(form)} disabled={!form.title || !form.content || createDoc.isPending} className="w-full gap-2 bg-teal-600 hover:bg-teal-700">
                  <Save className="w-4 h-4" /> Save to Library
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library">
          {viewDoc ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div>
                  <div className="text-xs text-teal-600 font-medium mb-1 capitalize">{viewDoc.type?.replace(/_/g, ' ')}</div>
                  <h3 className="font-bold text-slate-900 font-heading">{viewDoc.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyToClipboard(viewDoc.content)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button onClick={() => setFullscreenDoc(viewDoc)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
                  </button>
                  <button onClick={() => setViewDoc(null)} className="text-xs text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                    ← Back to Library
                  </button>
                </div>
              </div>
              <div className="p-6">
                <MarkdownContent content={viewDoc.content} />
              </div>
            </div>
          ) : docs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No MUN documents yet. Use the AI generator to create your first one.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map(doc => (
                <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewDoc(doc)}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium capitalize">{doc.type?.replace(/_/g, ' ')}</span>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleFavorite.mutate({ id: doc.id, val: !doc.isFavorite })} className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                        <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                      <button onClick={() => deleteDoc.mutate(doc.id)} className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{doc.title}</h4>
                  <div className="flex gap-2 text-xs text-slate-500 mb-2">
                    {doc.country && <span>{doc.country}</span>}
                    {doc.committee && <><span>•</span><span>{doc.committee}</span></>}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3">{doc.content}</p>
                  <div className="mt-3 text-xs text-teal-600 font-medium">Click to view full document →</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="guide">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 font-heading text-lg">Document Format Guide</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              {[
                { title: "Position Paper (NMUN)", color: "bg-blue-50 border-blue-200", desc: "4-5 sections: Background, Country Position, Past UN Action, Proposed Solutions, References. 1-2 pages. Formal diplomatic language. No operative clauses.", tip: "Cite real UN resolution numbers and use ${country}'s actual policy stances." },
                { title: "Draft Resolution (THIMUN)", color: "bg-teal-50 border-teal-200", desc: "Preambulatory clauses (context, past action) + Operative clauses (what committee does). Preamb end with comma, operative with semicolon (last: period).", tip: "Min 5 preambulatory, 8+ operative clauses. Operative clauses must be specific and measurable." },
                { title: "Opening Speech", color: "bg-purple-50 border-purple-200", desc: "90 seconds = ~200-225 words. Hook → Position → Key Argument → Proposal → Collaboration → Close. Address 'Honorable Chair, distinguished delegates...'", tip: "Memorize, don't read. Make eye contact. End with your country name clearly stated." },
                { title: "Working Paper", color: "bg-amber-50 border-amber-200", desc: "Informal pre-resolution document. No strict clause structure. Sections: Problem, Issues, Proposed Framework, Funding, Oversight, Support.", tip: "Use working papers to build consensus before formalizing a draft resolution." },
                { title: "Amendment", color: "bg-rose-50 border-rose-200", desc: "Friendly (author accepts) or Hostile (majority vote needed). Must specify: ADD/DELETE/REPLACE + clause number + new language + justification.", tip: "Use amendments strategically to weaken opposing resolutions or strengthen your own." },
                { title: "Country Profile", color: "bg-green-50 border-green-200", desc: "Research document for delegates. Covers: geography, policy positions, alliances, voting record, lobbying strategy, key arguments.", tip: "Know your country's actual treaties, GDP, UN voting record, and current leadership." },
              ].map(item => (
                <div key={item.title} className={`rounded-xl border p-4 ${item.color}`}>
                  <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed mb-2">{item.desc}</p>
                  <div className="bg-white/70 rounded-lg px-3 py-2 text-xs text-slate-500">
                    💡 <strong>Pro tip:</strong> {item.tip}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6">
              <h4 className="font-bold text-slate-900 mb-3">Key Preambulatory Verbs (for Draft Resolutions)</h4>
              <div className="grid sm:grid-cols-3 gap-2 text-xs text-slate-600">
                {["Affirming", "Alarmed by", "Bearing in mind", "Believing", "Concerned", "Confident", "Conscious", "Convinced", "Declaring", "Deeply concerned", "Emphasizing", "Expecting", "Expressing", "Fully aware", "Further recalling", "Guided by", "Having adopted", "Keeping in mind", "Noting", "Noting with concern", "Observing", "Reaffirming", "Realizing", "Recalling", "Recognizing", "Seeking", "Taking into account", "Viewing with appreciation", "Welcoming"].map(v => (
                  <span key={v} className="bg-white border border-slate-200 rounded-md px-2 py-1 font-medium">{v}</span>
                ))}
              </div>
              <h4 className="font-bold text-slate-900 mt-5 mb-3">Key Operative Verbs</h4>
              <div className="grid sm:grid-cols-3 gap-2 text-xs text-slate-600">
                {["Accepts", "Affirms", "Approves", "Authorizes", "Calls upon", "Commends", "Condemns", "Confirms", "Decides", "Declares", "Demands", "Deplores", "Designates", "Encourages", "Endorses", "Expresses", "Further invites", "Further urges", "Invites", "Notes", "Reaffirms", "Recommends", "Regrets", "Requests", "Strongly condemns", "Strongly urges", "Supports", "Takes note", "Urges"].map(v => (
                  <span key={v} className="bg-white border border-slate-200 rounded-md px-2 py-1 font-medium">{v}</span>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assistant">
          <AIAssistant format="model_un" placeholder="Ask about country positions, resolution writing, bloc strategy, committee procedures, how to win Best Delegate..." />
        </TabsContent>
      </Tabs>

      <DocumentViewer doc={fullscreenDoc} onClose={() => setFullscreenDoc(null)} />
    </div>
  );
}