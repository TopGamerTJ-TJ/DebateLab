import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, BookOpen, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";

const FORMATS = [
  { id: "parliamentary", label: "Parliamentary", color: "bg-blue-600" },
  { id: "public_forum", label: "Public Forum", color: "bg-indigo-600" },
  { id: "model_un", label: "Model UN", color: "bg-teal-600" },
  { id: "model_congress", label: "Model Congress", color: "bg-purple-600" },
];

const GUIDES = {
  parliamentary: `## Parliamentary Debate — Complete Guide

### What is Parliamentary Debate?
Parliamentary debate (Parli) is a format modeled on British parliamentary procedure. It emphasizes quick thinking, logical argumentation, and persuasive speaking. The two main variants are **British Parliamentary (BP)** and **American Parliamentary (APDA/NPDA)**.

### Format Structure (British Parliamentary — 4 teams)
- **Opening Government (OG)**: Proposes the motion, sets the case line
- **Opening Opposition (OO)**: Refutes OG, establishes opposition case  
- **Closing Government (CG)**: Extends with new material, doesn't undercut OG
- **Closing Opposition (CO)**: Extends opposition, wins independently

Each speaker gets **7 minutes** (BP). POIs (Points of Information) may be offered between minutes 1–6.

### Format Structure (NPDA — 2 teams)
- PM Speech: 7 min | LOC: 8 min | MG: 8 min | MO: 8 min | LOR: 4 min | PMR: 5 min

### Motions & Definitions
- The **Government** defines the motion. Definitions must be **reasonable** and **debatable**
- Avoid tautological, truistic, or time-set definitions
- **Squirreling** (running away from the spirit of the motion) is penalized by judges

### Argument Structure: PEEL / AREL
- **P**oint (Claim): Your main assertion
- **E**vidence (Warrant): Proof/reasoning supporting it
- **E**xplain (Impact): Why it matters
- **L**ink (Extension): Connect back to the burden/framing

### Points of Information (POIs)
- Offered by standing and saying "Point of Information" or "On that point"
- Speaker may accept or decline
- Must be **brief** (max 15 seconds)
- Strong debaters accept 1–2 POIs per speech to show confidence
- Use POIs to expose logical gaps or concessions

### Rebuttal Strategy
- **Identify** the argument clearly before attacking it
- **Attack the warrant** (reasoning), not just the claim
- **Impact-turn**: Their argument actually helps your side
- **Link-turn**: The mechanism they describe supports you
- Never ignore a strong opposing argument — judges notice

### Weighing & Comparative Analysis
Judges want to know **why your world is better**. Use:
- **Magnitude**: Scale of the impact (millions affected vs. thousands)
- **Probability**: How likely the impact is to materialize
- **Reversibility**: Can the harm be undone?
- **Immediacy**: Timeline of the impact

### Summary/Crystallization (PMR/LOR)
- Identify 2–3 key voting issues
- Explain why you WIN each
- Don't introduce new arguments
- "The reason you vote [side] is..."

### Common Mistakes
1. Reading arguments without explanation
2. Ignoring the strongest opposing arguments
3. Failing to weigh impacts against each other
4. Defining motions too broadly or too narrowly
5. Dropping points in cross-examination
6. Not adapting to the judge's paradigm

### Speaker Points (NPDA: 0–30 scale)
- 27–28: Average/above average
- 29: Exceptional
- 30: Perfect (extremely rare)
- Improve with: vocal variety, eye contact, roadmaps, and signposting

### Advanced Strategies
- **Framing**: Set the criteria by which the debate should be judged early
- **Turns**: Show their argument helps you (link-turn or impact-turn)
- **Theory**: Run procedural arguments if motions/definitions are unfair
- **Counter-plans**: Propose alternative mechanisms that solve better
- **Kritiks** (NPDA): Challenge the assumptions or language of the motion`,

  public_forum: `## Public Forum Debate — Complete Guide

### What is Public Forum?
Public Forum (PF) is a two-person team debate format created by NSDA. It emphasizes **persuasion, evidence, and public accessibility**. Resolutions change monthly and cover current events topics.

### Round Structure (NSDA Standard)
| Speech | Team | Time |
|--------|------|------|
| Pro Case | Team A | 4 min |
| Con Case | Team B | 4 min |
| Crossfire 1 | Both | 3 min |
| Pro Rebuttal | Team A | 4 min |
| Con Rebuttal | Team B | 4 min |
| Crossfire 2 | Both | 3 min |
| Pro Summary | Team A | 3 min |
| Con Summary | Team B | 3 min |
| Grand Crossfire | Both | 3 min |
| Pro Final Focus | Team A | 2 min |
| Con Final Focus | Team B | 2 min |
| Prep Time | Each | 2 min |

### Constructive Cases
Structure each case with **2–3 contentions**, each following:
- **Contention Title** (e.g., "C1: Economic Harm")
- **Claim**: Main argument in 1–2 sentences
- **Warrant**: Logical mechanism/reasoning
- **Evidence**: Cited cards with author, publication, date
- **Impact**: Magnitude and scope of the harm/benefit
- **Weighing Tag**: Pre-weigh against likely opposition

### Evidence Standards
- Must include: **author, publication, date, direct quote**
- **Paraphrase** with original language available
- Cards should be **highlighted** (underlining key parts)
- Never misrepresent or take out of context — ethics violation
- Currency matters: prefer recent evidence (within 3–5 years unless uniquely authoritative)

### Crossfire Strategy
**First Crossfire (after cases):**
- Expose assumptions in opponent's evidence
- Get concessions that help your case
- Ask: "Does your evidence account for X?"
- Never ask yes/no questions without a follow-up
- Control pacing — don't let opponents filibuster

**Grand Crossfire:**
- More collaborative and strategic
- Target key voting issues
- Get opponents to agree to your framing

### Rebuttal Phase
- Prioritize: attack their **most impactful** contention first
- Use **line-by-line** structure: address each point methodically
- Include **evidence indicts**: challenge source, methodology, or recency
- **Rebuild** your case if they attacked it (2nd rebuttal)

### Summary Speech — CRITICAL
- **Must extend** every argument you plan to win in Final Focus
- Dropped arguments in summary = **conceded** in Final Focus
- Focus on 2–3 voting issues maximum
- Tell a coherent story: "The world under Pro/Con looks like X"
- Address the **impact calculus** directly

### Final Focus (2 minutes)
- **Do NOT introduce new arguments**
- Win the 1–2 issues you extended in Summary
- Clear framing: "Vote Pro/Con because..."
- Impact weigh: magnitude, probability, timeframe, scope

### Weighing Mechanisms
| Mechanism | Description |
|-----------|-------------|
| **Magnitude** | How many people affected, how severely |
| **Probability** | How likely the impact actually occurs |
| **Timeframe** | Immediate vs. long-term |
| **Scope** | Local, national, or global |
| **Reversibility** | Can the harm be undone? |
| **Specificity** | How directly tied to the resolution |

### Theory in PF
- **Disclosure theory**: Opponents must disclose cases
- **Paraphrasing theory**: Opponent misrepresented evidence
- Run theory with a **shell**: Interpretation → Violation → Standard → Voters
- Most judges prefer substance; use theory sparingly

### Common PF Mistakes
1. No weighing in Final Focus
2. Extending dropped arguments from Rebuttal (not Summary)
3. Reading new cards in Summary
4. Ignoring opponent's best argument
5. Not flowing properly — missing key concessions
6. Evidence that doesn't support the claim made

### Flowing Tips
- Use a **column-based** flow sheet (1 column per speech)
- Abbreviate aggressively: "mag > prob" for "magnitude outweighs probability"
- Mark **drops** with a circle, **concessions** with a checkmark
- Track which contentions are extended vs. dropped`,

  model_un: `## Model United Nations — Complete Guide

### What is Model UN?
Model UN (MUN) simulates United Nations committees where delegates represent countries, debate international issues, and draft resolutions. It develops research, diplomacy, public speaking, and negotiation skills.

### Committee Types
- **General Assembly (GA)**: Largest body, all 193 UN members, non-binding resolutions
- **Security Council (SC)**: 15 members, P5 veto power, binding resolutions
- **Economic & Social Council (ECOSOC)**: Economic/social/humanitarian issues
- **Specialized Agencies**: WHO, UNICEF, UNHCR, etc.
- **Historical Committees**: Simulate past crises
- **Crisis Committees**: Fast-paced, dynamic directives

### Country Research — Essential
For every conference, research your country's:
1. **Geography & Demographics**: Location, population, neighbors
2. **Political System**: Government type, current leadership
3. **Economy**: GDP, major industries, trade partners
4. **Foreign Policy**: Alliances, treaties, historical stances
5. **UN Voting Record**: How they've voted on similar issues
6. **Position on the Topic**: Official statements, past resolutions supported

### Position Paper Structure
\`\`\`
[Country Name] — [Committee Name]
Topic: [Topic Title]

I. Introduction / Country Background
[1–2 sentences establishing relevance]

II. Country's Position
[Specific stance with evidence from official sources]

III. Past International Action
[UN resolutions, treaties your country supported/opposed]

IV. Proposed Solutions
[2–3 specific, actionable policy recommendations]
\`\`\`

### Draft Resolution Structure
**Preambulatory Clauses** (describe the situation, cite past actions):
- Noting, Recognizing, Affirming, Bearing in mind, Recalling...

**Operative Clauses** (what the committee will DO):
- Urges, Calls upon, Encourages, Requests, Condemns, Demands...
- Each clause must be numbered and end with a semicolon (last with period)

**Format**:
\`\`\`
Resolution [Number]
Sponsors: [Countries]
Signatories: [Countries]

The [Committee Name],
[Preambulatory clause 1],
[Preambulatory clause 2],

1. [Operative clause 1];
2. [Operative clause 2];
3. [Operative clause 3].
\`\`\`

### Parliamentary Procedure
- **Motion to Open Speakers List**: Begins formal debate
- **Moderated Caucus**: Structured debate with speaking time (e.g., 20 min total, 90 sec/delegate)
- **Unmoderated Caucus**: Free time to network and draft resolutions
- **Motion to Table/Postpone**: Delays or shelves a resolution
- **Point of Order**: Procedural mistake
- **Point of Personal Privilege**: Personal discomfort (hearing, temperature)
- **Point of Parliamentary Inquiry**: Question about procedure

### Speeches — Opening & Debate
**Structure a 90-second speech:**
1. Address the Chair ("Honorable Chair, fellow delegates...")
2. State your country's position clearly
3. Provide 1–2 supporting arguments/evidence
4. End with a policy recommendation

### Bloc Strategy & Diplomacy
- **Find allies** with similar interests early (unmod caucuses)
- **Draft resolution** in Google Docs collaboratively
- **Negotiate compromise** — be willing to modify language
- **Lobby signatories** — you need support to introduce a resolution
- **Monitor rival blocs** — merge or oppose as strategic

### Speeches for Awards
Judges score on:
- **Preparation**: Country knowledge, position paper quality
- **Participation**: Speaking frequency, quality of contributions
- **Diplomacy**: Coalition building, compromise
- **Writing**: Resolution language quality
- **Procedure**: Correct use of parliamentary procedure

### Working Paper vs. Draft Resolution
| | Working Paper | Draft Resolution |
|-|--------------|-----------------|
| **Format** | Informal, no required structure | Formal preambulatory/operative format |
| **Status** | Ideas, not yet voted on | Ready to be voted on |
| **Purpose** | Organize thinking | Official committee output |

### Crisis Committee Skills
- **Write directives**: Short, specific action orders (not full resolutions)
- **React to updates**: Crisis staff introduce new developments
- **Personal gain**: Some crises allow you to accumulate resources/power
- **Stay in character**: Represent your role/country consistently`,

  model_congress: `## Model Congress — Complete Guide

### What is Model Congress?
Model Congress simulates the United States Congress (or sometimes state legislatures). Students author legislation, debate bills on the floor, and practice democratic deliberation. Common competitions: YMCA Youth & Government, JSA, NCFL.

### Types of Legislation
- **Bill**: Proposes a new law or amends existing law
- **Resolution**: Expresses the sense of Congress (non-binding)
- **Joint Resolution**: Similar to a bill, can be binding or ceremonial
- **Amendment**: Modifies a pending bill

### Bill Format
\`\`\`
A BILL
To [brief description of purpose]

BE IT ENACTED by the Senate and House of Representatives of the 
United States of America in Congress assembled,

SECTION 1. SHORT TITLE
This Act may be cited as the "[Name] Act of [Year]."

SECTION 2. FINDINGS
Congress finds that—
  (1) [finding 1];
  (2) [finding 2].

SECTION 3. DEFINITIONS
In this Act—
  (1) "[Term]" means [definition].

SECTION 4. [MAIN PROVISION TITLE]
[The actual legislative language]

SECTION 5. FUNDING
There is authorized to be appropriated $[amount] for fiscal year [year]...

SECTION 6. EFFECTIVE DATE
This Act shall take effect [date or "upon enactment"].

Authored by: [Your Name], [School]
\`\`\`

### Authorship Speech (1st Affirmative)
Your bill — **you must defend it best**. Structure (3–5 min):
1. **Hook**: Compelling statistic or story about the problem
2. **Problem Statement**: What issue does your bill address?
3. **Mechanism**: How does your bill solve it?
4. **Solvency Evidence**: Why will this approach work?
5. **Pre-empt objections**: Address 1–2 likely counterarguments
6. **Call to action**: "I urge a Do Pass recommendation"

### Floor Debate Structure
- **1st Affirmative**: Author of the bill (3–5 min)
- **1st Negative**: First opposition speech
- **Alternating**: Aff/Neg/Aff/Neg...
- **Amendment Process**: Any delegate can move to amend during debate
- **Presiding Officer**: Student chair runs procedure
- **Docket**: Order of bills determined by committee/docket selection

### Effective Floor Speeches (1–3 min)
**Affirmative speech structure:**
1. Agree with the problem framing
2. Defend the mechanism with evidence
3. Respond to the strongest negative argument
4. "Vote Do Pass on this legislation"

**Negative speech structure:**
1. Acknowledge merits but pivot to flaws
2. Present counterargument with evidence
3. Propose what should happen instead (if anything)
4. "Vote Do Not Pass"

### Amendment Strategy
- Amendments can **strengthen** OR **weaken** legislation
- Friendly amendment: Improves the bill, author accepts
- Hostile amendment: Weakens bill, oppose vigorously
- Motion to amend: "Mr./Madam Chair, I move to amend Section [X] by [change]"
- Amendments require a second and a vote

### Parliamentary Procedure (Congress)
- **Recognition**: "Mr./Madam Chair" to be recognized
- **Yield**: Give remaining time to another delegate ("I yield to [name]") or the chair
- **Point of Order**: Procedural error
- **Point of Information**: Question directed to the speaker (if they yield)
- **Division of the House**: Request a counted vote
- **Motion to Table**: Remove bill from consideration
- **Previous Question**: End debate and move to vote

### Scoring Criteria (Judges)
| Criterion | What Judges Look For |
|-----------|---------------------|
| **Argumentation** | Logic, evidence quality, depth of analysis |
| **Rhetoric** | Delivery, persuasiveness, confidence |
| **Knowledge** | Bill expertise, procedure, current events |
| **Participation** | Frequency and quality of contributions |
| **Procedure** | Correct use of parliamentary rules |

### Evidence & Research Tips
- Use **CBO scores**, **academic studies**, and **government data**
- Cite **congressional testimony** for credibility
- Know your bill's **fiscal impact**
- Research **similar legislation** that passed or failed
- Quote **bipartisan supporters** when possible

### Common Mistakes
1. Only speaking once or twice — be active throughout
2. Not knowing your own bill's details
3. Using emotional appeals without evidence
4. Ignoring the strongest counterargument
5. Speaking too fast — enunciate clearly for the record
6. Not yielding properly or interrupting procedure`,
};

const SYSTEM_PROMPTS = {
  parliamentary: "You are an expert Parliamentary debate coach. You know British Parliamentary (BP) and American Parliamentary (NPDA/APDA) formats inside and out. Help debaters with motions, case construction, POIs, rebuttals, and competitive strategy. Be specific, tactical, and tournament-focused.",
  public_forum: "You are an elite Public Forum debate coach. You have deep expertise in NSDA PF rules, evidence standards, crossfire strategy, summary/final focus technique, and impact weighing. Give tournament-ready advice with specific tactical guidance.",
  model_un: "You are a veteran Model UN coach and advisor. You know GA, Security Council, crisis committees, and specialized agencies. Help delegates with country research, position papers, resolution drafting, bloc strategy, and floor speeches. Be diplomatically precise.",
  model_congress: "You are an expert Model Congress coach. You know bill drafting, floor debate procedure, authorship speeches, amendment strategy, and parliamentary rules for Youth & Government and similar programs. Give practical, competition-ready advice.",
};

function FormatChat({ formatId }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi! I'm your ${FORMATS.find(f => f.id === formatId)?.label} coach. Ask me anything — case strategy, specific rules, how to handle a tough round, or anything else.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    const history = [...messages, userMsg].map(m => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`).join("\n");
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPTS[formatId]}\n\nConversation:\n${history}\n\nCoach:`,
    });
    setMessages(prev => [...prev, { role: "assistant", content: result }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 rounded-xl">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed prose prose-sm ${m.role === "user" ? "bg-blue-600 text-white prose-invert" : "bg-white border border-slate-200 text-slate-800"}`}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-3">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask your coach anything..."
          className="resize-none text-sm"
          rows={2}
        />
        <Button onClick={send} disabled={loading || !input.trim()} className="self-end h-[62px] px-4">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function DebateFormats() {
  const [activeFormat, setActiveFormat] = useState("parliamentary");
  const [activeTab, setActiveTab] = useState("guide");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Debate Formats</h1>
        <p className="text-slate-500 text-sm mt-1">Comprehensive guides and AI coaching for every competitive format</p>
      </div>

      {/* Format selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => { setActiveFormat(f.id); setActiveTab("guide"); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeFormat === f.id ? `${f.color} text-white shadow-sm` : "bg-white border border-slate-200 text-slate-600 hover:border-primary/30"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab("guide")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === "guide" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Guide
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === "chat" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> AI Coach
        </button>
      </div>

      {/* Content */}
      {activeTab === "guide" ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm prose prose-slate max-w-none prose-headings:font-heading prose-h2:text-xl prose-h3:text-base prose-h3:font-semibold">
          <ReactMarkdown>{GUIDES[activeFormat]}</ReactMarkdown>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-slate-900 font-heading">
              {FORMATS.find(f => f.id === activeFormat)?.label} AI Coach
            </h3>
          </div>
          <FormatChat key={activeFormat} formatId={activeFormat} />
        </div>
      )}
    </div>
  );
}