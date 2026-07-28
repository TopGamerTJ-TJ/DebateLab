import {
  ScrollText, Globe, Landmark, Gavel, FileText,
  MessageSquare, FileCheck, Mic, AlertTriangle
} from "lucide-react";

const ANTI_REPETITION_SPEECH = `\n- ANTI-REPETITION: Never reuse the same hook (opening device) or call to action (closing appeal) that has appeared in any other speech in this project. Each hook must use a completely different rhetorical device (statistic, anecdote, question, scenario, quote) and each call to action must use different language and framing. Vary your openings and closings entirely every single time.`;

// Each preset defines a document type users can generate.
// Fields are dynamic — the UI renders them based on type (text/textarea/select).
// buildPrompt() constructs the LLM prompt from field values.
// parseItems() splits the LLM output into individual saveable items.
// cleanItem() strips any helper text (e.g. "Why it works" notes).
// titleFromItem() extracts a title from generated content.

export const PRESETS = [
  // ═══ RESOLUTIONS & TOPICS ═══
  {
    id: 'resolutions',
    category: 'Resolutions & Topics',
    label: 'Debate Resolutions',
    icon: ScrollText,
    docLabel: 'Resolution',
    color: 'indigo',
    description: 'Generate competition-ready resolutions for any debate format',
    multi: true,
    fields: [
      { key: 'format', label: 'Format', type: 'select', options: ['Public Forum', 'Policy (CX)', 'Lincoln-Douglas', 'Parliamentary', 'Model Congress', 'Model UN', 'Any'], default: 'Public Forum' },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Novice', 'Intermediate', 'Advanced', 'TOC-level'], default: 'Intermediate' },
      { key: 'topicArea', label: 'Topic area (optional)', type: 'text', placeholder: 'e.g. climate policy, AI regulation, healthcare...' },
      { key: 'count', label: 'How many?', type: 'select', options: ['3', '5', '8', '10'], default: '5' },
    ],
    buildPrompt: (f) => `You are an expert debate tournament director who writes competition-ready resolutions.

Generate ${f.count} ${f.difficulty}-level ${f.format} resolutions${f.topicArea ? ` related to the topic area: "${f.topicArea}"` : ''}.

Requirements:
- Each resolution must be phrased correctly for the format:
  • PF / Policy / LD: Start with "Resolved: " and use proper policy-style wording
  • Parliamentary: Use "This House believes that..." or "This House would..."
  • Model Congress: Phrase as a bill topic ("A Bill to..." or topic for legislation)
  • Model UN: Use formal UN resolution operative clauses ("Urges Member States to...", "Calls upon...")
- Each resolution must be debatable from both sides (pro and con)
- Each must be specific enough to research but broad enough for clash
- Number them 1, 2, 3, etc.
- Below each resolution, add a one-line "Why it works" note explaining the core clash/tension

IMPORTANT:
- ORIGINALITY: Every resolution must be unique and distinct. No repetitive phrasing or formulaic structures.
- STAY ON TOPIC: ${f.topicArea ? `Every resolution must directly relate to "${f.topicArea}".` : "Make each resolution about a genuinely different subject area."}`,
    parseItems: (text) => text.split(/\n(?=\d+\.\s)/).map(b => b.trim()).filter(Boolean),
    cleanItem: (text) => text.split('\n').filter(l => !/^Why it works/i.test(l)).join('\n').trim(),
    titleFromItem: (text) => text.split('\n')[0].replace(/^\d+\.\s*/, '').replace(/^Resolved:\s*/i, '').trim().slice(0, 120) || 'Debate Resolution',
  },

  // ═══ MUN DOCUMENTS ═══
  {
    id: 'mun_resolution',
    category: 'MUN',
    label: 'UN Resolution',
    icon: Globe,
    docLabel: 'MUN Resolution',
    color: 'emerald',
    description: 'Formal UN resolution with preambulatory and operative clauses',
    multi: false,
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. Climate change mitigation in developing nations', required: true },
      { key: 'committee', label: 'Committee', type: 'text', placeholder: 'e.g. GA-1 (DISEC), ECOSOC, WHO...' },
      { key: 'country', label: 'Your country', type: 'text', placeholder: 'e.g. France, Brazil, Japan...' },
      { key: 'allies', label: 'Allied countries (optional)', type: 'text', placeholder: 'e.g. Germany, Japan, Australia' },
      { key: 'stance', label: 'Your position / what the resolution should do', type: 'textarea', placeholder: 'What outcome do you want? What actions should the resolution call for?' },
    ],
    buildPrompt: (f) => `You are an expert Model UN delegate who writes winning resolutions.

Write a formal UN General Assembly resolution on: "${f.topic}"
${f.committee ? `Committee: ${f.committee}` : ''}
${f.country ? `Sponsor country: ${f.country}` : ''}
${f.allies ? `Co-sponsors: ${f.allies}` : ''}
${f.stance ? `Desired outcome: ${f.stance}` : ''}

Structure the resolution with proper UN formatting:
1. **Committee header** (e.g. "The General Assembly," or the appropriate committee name)
2. **Preambulatory clauses** — Start each with a proper preambulatory phrase (Guided by, Recalling, Deeply concerned, Acknowledging, etc.) and end with commas
3. **Operative clauses** — Start each with a proper operative verb (Urges, Calls upon, Recommends, Encourages, Requests, Decides, etc.), numbered 1, 2, 3..., ending with semicolons (last clause ends with a period)

Each operative clause should be specific, actionable, and realistic. Include sub-clauses (a, b, c) where appropriate.

IMPORTANT:
- ORIGINALITY: Write a genuine, specific resolution — not generic filler.
- STAY ON TOPIC: Every clause must directly address "${f.topic}".`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `Resolution: ${f.topic}`.slice(0, 120),
  },
  {
    id: 'mun_position_paper',
    category: 'MUN',
    label: 'Position Paper',
    icon: FileText,
    docLabel: 'Position Paper',
    color: 'emerald',
    description: 'Country position paper outlining stance and proposed solutions',
    multi: false,
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. Nuclear non-proliferation', required: true },
      { key: 'committee', label: 'Committee', type: 'text', placeholder: 'e.g. GA-1 (DISEC)' },
      { key: 'country', label: 'Your country', type: 'text', placeholder: 'e.g. France', required: true },
      { key: 'additional', label: 'Additional context (optional)', type: 'textarea', placeholder: 'Specific policies, treaties, or facts you want included' },
    ],
    buildPrompt: (f) => `You are an expert Model UN delegate writing a position paper.

Country: ${f.country}
Committee: ${f.committee || 'General Assembly'}
Topic: "${f.topic}"
${f.additional ? `Additional context: ${f.additional}` : ''}

Write a standard MUN position paper with these sections:
1. **Background** — Brief history of the issue and why it matters globally
2. **Country Policy** — ${f.country}'s historical stance, relevant treaties signed/ratified, and official position
3. **Justification** — Why ${f.country} holds this position (political, economic, cultural reasons)
4. **Proposed Solutions** — 2-3 actionable proposals ${f.country} would support in committee

Keep it concise (1-2 pages equivalent), persuasive, and well-structured.

IMPORTANT:
- ORIGINALITY: Write specific, country-accurate content. Avoid generic filler.
- STAY ON TOPIC: All content must directly address "${f.topic}" from ${f.country}'s perspective.`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `Position Paper: ${f.country} — ${f.topic}`.slice(0, 120),
  },
  {
    id: 'mun_opening_speech',
    category: 'MUN',
    label: 'Opening Speech',
    icon: Mic,
    docLabel: 'MUN Speech',
    color: 'emerald',
    description: 'General speakers list opening speech (60-90 seconds)',
    multi: false,
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. Global food security', required: true },
      { key: 'country', label: 'Your country', type: 'text', placeholder: 'e.g. Brazil', required: true },
      { key: 'committee', label: 'Committee', type: 'text', placeholder: 'e.g. FAO' },
      { key: 'stance', label: 'Your position', type: 'textarea', placeholder: 'What is your country\'s main point or call to action?' },
    ],
    buildPrompt: (f) => `You are an expert Model UN delegate writing an opening speech.

Country: ${f.country}
${f.committee ? `Committee: ${f.committee}` : ''}
Topic: "${f.topic}"
${f.stance ? `Key message: ${f.stance}` : ''}

Write a 60-90 second opening speech for the general speakers list (approx. 200-300 words).

Structure:
1. **Hook** — Open with a striking statistic, question, or anecdote
2. **Problem** — Briefly frame the issue and why it matters
3. **Country stance** — State ${f.country}'s position clearly
4. **Call to action** — End with a specific appeal to fellow delegates

Tone: formal, diplomatic, persuasive. Write as if speaking aloud.

IMPORTANT:
- ORIGINALITY: Write a genuine, specific speech — not generic filler.
- STAY ON TOPIC: Everything must directly relate to "${f.topic}".${ANTI_REPETITION_SPEECH}`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `Opening Speech: ${f.country} — ${f.topic}`.slice(0, 120),
  },
  {
    id: 'mun_working_paper',
    category: 'MUN',
    label: 'Working Paper',
    icon: FileCheck,
    docLabel: 'Working Paper',
    color: 'emerald',
    description: 'Draft working paper with key clauses and proposals',
    multi: false,
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. Renewable energy transition', required: true },
      { key: 'committee', label: 'Committee', type: 'text', placeholder: 'e.g. UNEP' },
      { key: 'country', label: 'Your country', type: 'text', placeholder: 'e.g. Germany' },
      { key: 'proposals', label: 'Key proposals to include', type: 'textarea', placeholder: 'What solutions or clauses do you want in the working paper?' },
    ],
    buildPrompt: (f) => `You are an expert Model UN delegate writing a working paper.

${f.committee ? `Committee: ${f.committee}` : ''}
${f.country ? `Sponsor: ${f.country}` : ''}
Topic: "${f.topic}"
${f.proposals ? `Key proposals: ${f.proposals}` : ''}

Write a working paper with:
1. **Header** — Topic, committee, sponsors
2. **Problem statement** — 1-2 paragraphs framing the issue
3. **Proposed clauses** — 4-6 operative-style clauses outlining proposed solutions, each starting with an operative verb (Urges, Calls upon, Recommends, etc.)
4. **Implementation notes** — Brief note on feasibility and next steps

This is less formal than a full resolution but should be structured and ready to present in moderated caucus.

IMPORTANT:
- ORIGINALITY: Write specific, actionable proposals — not generic filler.
- STAY ON TOPIC: All content must directly address "${f.topic}".`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `Working Paper: ${f.topic}`.slice(0, 120),
  },
  {
    id: 'mun_moderated_caucus',
    category: 'MUN',
    label: 'Moderated Caucus Speech',
    icon: Mic,
    docLabel: 'MUN Speech',
    color: 'emerald',
    description: 'Short focused speech for a moderated caucus (45-60 seconds)',
    multi: false,
    fields: [
      { key: 'topic', label: 'Overall topic', type: 'text', placeholder: 'e.g. Global food security', required: true },
      { key: 'subTopic', label: 'Sub-topic / caucus focus', type: 'text', placeholder: 'e.g. Sustainable agriculture in Sub-Saharan Africa', required: true },
      { key: 'country', label: 'Your country', type: 'text', placeholder: 'e.g. Kenya', required: true },
      { key: 'committee', label: 'Committee', type: 'text', placeholder: 'e.g. FAO' },
      { key: 'stance', label: 'Your position / proposed solution', type: 'textarea', placeholder: 'What solution or point do you want to advocate?' },
    ],
    buildPrompt: (f) => `You are an expert Model UN delegate writing a moderated caucus speech.

Country: ${f.country}
${f.committee ? `Committee: ${f.committee}` : ''}
Overall topic: "${f.topic}"
Caucus sub-topic: "${f.subTopic}"
${f.stance ? `Key message: ${f.stance}` : ''}

Write a 45-60 second moderated caucus speech (approx. 120-180 words). This is NOT a full opening speech — it's a focused, punchy speech on ONE specific sub-topic.

Structure:
1. **Hook** — Open with a striking fact or brief anecdote about THIS sub-topic (not the overall topic)
2. **Country position** — State ${f.country}'s stance on this specific issue clearly and concisely
3. **Proposed solution** — Offer one concrete, realistic solution or proposal
4. **Call to action** — End with a brief appeal to fellow delegates to support this approach

Tone: concise, assertive, diplomatic. Get straight to the point — moderated caucus speeches are short.

IMPORTANT:
- ORIGINALITY: Write a genuine, specific speech — not generic filler.
- STAY ON TOPIC: Everything must directly relate to "${f.subTopic}".${ANTI_REPETITION_SPEECH}`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `Mod Caucus: ${f.country} — ${f.subTopic}`.slice(0, 120),
  },
  {
    id: 'mun_crisis_directive',
    category: 'MUN',
    label: 'Crisis Directive',
    icon: AlertTriangle,
    docLabel: 'Crisis Directive',
    color: 'emerald',
    description: 'Crisis committee directive with operative orders and rationale',
    multi: false,
    fields: [
      { key: 'crisis', label: 'Crisis scenario', type: 'textarea', placeholder: 'e.g. A cyberattack has disabled the power grid across three EU nations...', required: true },
      { key: 'committee', label: 'Crisis committee', type: 'text', placeholder: 'e.g. UN Security Council, NATO, Historical Cabinet...' },
      { key: 'country', label: 'Your country/role', type: 'text', placeholder: 'e.g. United States, Secretary of Defense...' },
      { key: 'objectives', label: 'Your objectives (optional)', type: 'textarea', placeholder: 'What outcomes do you want the directive to achieve?' },
    ],
    buildPrompt: (f) => `You are an expert Model UN crisis delegate writing a crisis directive.

${f.committee ? `Committee: ${f.committee}` : ''}
${f.country ? `Role/Country: ${f.country}` : ''}
Crisis scenario: "${f.crisis}"
${f.objectives ? `Your objectives: ${f.objectives}` : ''}

Write a formal crisis directive with:
1. **Directive header** — Committee name, directive title, sponsors
2. **Sitational overview** — 1-2 paragraphs summarizing the crisis and immediate threat (show you understand the scenario)
3. **Operative orders** — 3-5 numbered directives, each a clear, actionable order:
   - Use directive language ("Orders," "Directs," "Authorizes," "Mandates")
   - Each order should specify WHO does WHAT and by WHEN
   - Include sub-clauses (a, b, c) where appropriate
4. **Rationale** — 1 paragraph explaining why these actions are necessary and proportional
5. **Resource allocation** — Brief note on what resources/manpower are needed

Tone: urgent, authoritative, decisive. This is a crisis — act like a leader under pressure.

IMPORTANT:
- ORIGINALITY: Write specific, scenario-appropriate directives — not generic filler.
- STAY ON TOPIC: All directives must directly respond to "${f.crisis}".`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `Crisis Directive: ${f.crisis.slice(0, 60)}`.slice(0, 120),
  },

  // ═══ MODEL CONGRESS ═══
  {
    id: 'moco_bill',
    category: 'Model Congress',
    label: 'Bill',
    icon: Landmark,
    docLabel: 'Bill',
    color: 'blue',
    description: 'Formal bill for Model Congress with proper legislative formatting',
    multi: false,
    fields: [
      { key: 'topic', label: 'Bill topic', type: 'text', placeholder: 'e.g. Expand renewable energy infrastructure', required: true },
      { key: 'sponsor', label: 'Sponsor (optional)', type: 'text', placeholder: 'Your name or character' },
      { key: 'details', label: 'What the bill should do', type: 'textarea', placeholder: 'Specific provisions, programs, or changes you want included' },
    ],
    buildPrompt: (f) => `You are an expert Model Congress legislator who writes well-structured bills.

Write a formal bill on: "${f.topic}"
${f.sponsor ? `Sponsor: ${f.sponsor}` : ''}
${f.details ? `Key provisions: ${f.details}` : ''}

Use proper bill formatting:
1. **Bill number placeholder** (e.g. "HB ____")
2. **Title** — A clear, descriptive title for the bill
3. **BE IT ENACTED by the [Congress/House/Senate] here assembled that:**
4. **Section 1: Short Title** — Give the bill a memorable short title
5. **Section 2: Findings** — 3-5 "Whereas" clauses explaining the problem
6. **Section 3: Provisions** — The actual legislation, broken into numbered subsections. Each provision should be specific and implementable.
7. **Section 4: Enforcement** — How the bill will be enforced and by which agency
8. **Section 5: Funding** — Funding source or authorization
9. **Section 6: Effective Date** — When the bill takes effect

IMPORTANT:
- ORIGINALITY: Write a genuine, specific bill with real provisions — not generic filler.
- STAY ON TOPIC: Every section must directly relate to "${f.topic}".`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `Bill: ${f.topic}`.slice(0, 120),
  },
  {
    id: 'moco_amendment',
    category: 'Model Congress',
    label: 'Amendment',
    icon: FileCheck,
    docLabel: 'Amendment',
    color: 'blue',
    description: 'Amendment to an existing bill',
    multi: false,
    fields: [
      { key: 'billTitle', label: 'Bill being amended', type: 'text', placeholder: 'e.g. Clean Energy Act of 2025', required: true },
      { key: 'change', label: 'What the amendment changes', type: 'textarea', placeholder: 'What do you want to add, remove, or modify?', required: true },
      { key: 'rationale', label: 'Rationale (optional)', type: 'text', placeholder: 'Why this amendment is needed' },
    ],
    buildPrompt: (f) => `You are an expert Model Congress legislator writing an amendment.

Bill: "${f.billTitle}"
Proposed change: ${f.change}
${f.rationale ? `Rationale: ${f.rationale}` : ''}

Write a formal amendment with:
1. **Amendment header** — "Amendment to [Bill Name]"
2. **Strike/Insert language** — Use "Strike [existing text] and insert [new text]" format
3. **Specific changes** — Clear, numbered changes to the bill's sections
4. **Justification** — 1-2 sentences explaining why this amendment improves the bill

IMPORTANT:
- ORIGINALITY: Write a genuine, specific amendment — not generic filler.
- STAY ON TOPIC: All changes must directly relate to the proposed change: "${f.change}".`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `Amendment: ${f.billTitle}`.slice(0, 120),
  },
  {
    id: 'moco_speech',
    category: 'Model Congress',
    label: 'Floor Speech',
    icon: Mic,
    docLabel: 'Speech',
    color: 'blue',
    description: 'Persuasive floor speech for or against a bill',
    multi: false,
    fields: [
      { key: 'billTitle', label: 'Bill name', type: 'text', placeholder: 'e.g. Clean Energy Act', required: true },
      { key: 'side', label: 'Position', type: 'select', options: ['Support (Pro)', 'Oppose (Con)'], default: 'Support (Pro)' },
      { key: 'points', label: 'Key points to make (optional)', type: 'textarea', placeholder: 'Arguments, evidence, or points you want included' },
    ],
    buildPrompt: (f) => `You are an expert Model Congress legislator delivering a floor speech.

Bill: "${f.billTitle}"
Position: ${f.side}
${f.points ? `Key points: ${f.points}` : ''}

Write a 2-3 minute floor speech (approx. 400-600 words) that:
1. **Opens** — Address the chair ("Mr./Madam Speaker,") and state your position clearly
2. **Argues** — Present 2-3 strong arguments ${f.side.includes('Pro') ? 'in favor of' : 'against'} the bill
3. **Responds** — Anticipate and counter at least one opposing argument
4. **Closes** — End with a strong call to vote ${f.side.includes('Pro') ? 'yes' : 'no'}

Tone: persuasive, formal, confident. Write as if speaking on the chamber floor.

IMPORTANT:
- ORIGINALITY: Write specific, genuine arguments — not generic filler.
- STAY ON TOPIC: All arguments must directly relate to "${f.billTitle}".${ANTI_REPETITION_SPEECH}`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `Speech: ${f.side.includes('Pro') ? 'Pro' : 'Con'} — ${f.billTitle}`.slice(0, 120),
  },

  // ═══ DEBATE TEXTS ═══
  {
    id: 'case_outline',
    category: 'Debate Texts',
    label: 'Case Outline',
    icon: FileText,
    docLabel: 'Case',
    color: 'violet',
    description: 'Structured affirmative or negative case outline',
    multi: false,
    fields: [
      { key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'e.g. Resolved: The US should implement a carbon tax', required: true },
      { key: 'side', label: 'Side', type: 'select', options: ['Affirmative', 'Negative'], default: 'Affirmative' },
      { key: 'format', label: 'Format', type: 'select', options: ['Public Forum', 'Policy (CX)', 'Lincoln-Douglas', 'Parliamentary'], default: 'Public Forum' },
      { key: 'focus', label: 'Key arguments or values (optional)', type: 'textarea', placeholder: 'Specific contentions, values, or criteria you want included' },
    ],
    buildPrompt: (f) => `You are an expert debate coach writing a structured case outline.

Resolution: "${f.resolution}"
Side: ${f.side}
Format: ${f.format}
${f.focus ? `Key focus: ${f.focus}` : ''}

Write a complete ${f.side} case outline for ${f.format}:

1. **Framework** — Definitions, ${f.format === 'Lincoln-Douglas' ? 'value and value criterion' : 'weighing mechanism or criteria'}
2. **${f.side === 'Affirmative' ? 'Contentions' : 'Off-case positions / Contentions'}** — 2-3 major arguments, each with:
   - **Claim** — The assertion in one sentence
   - **Warrant** — The reasoning/logic (2-3 sentences)
   - **Impact** — Why this matters / what's at stake (2-3 sentences)
   - **Evidence** — Type of evidence needed (don't fabricate specific cards, but suggest what kind of evidence supports this)
3. **Preempts** — Anticipate 1-2 key opposing arguments and preempt them
4. **Summary** — A brief concluding impact summary

IMPORTANT:
- ORIGINALITY: Write unique, specific arguments — not generic filler.
- STAY ON TOPIC: All arguments must directly support the ${f.side} on "${f.resolution}".`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `${f.side} Case: ${f.resolution.slice(0, 60)}`.slice(0, 120),
  },
  {
    id: 'constructive_speech',
    category: 'Debate Texts',
    label: 'Constructive Speech',
    icon: Mic,
    docLabel: 'Speech',
    color: 'violet',
    description: 'Full written constructive speech ready to deliver',
    multi: false,
    fields: [
      { key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'The debate resolution', required: true },
      { key: 'side', label: 'Side', type: 'select', options: ['Affirmative', 'Negative'], default: 'Affirmative' },
      { key: 'format', label: 'Format', type: 'select', options: ['Public Forum', 'Policy (CX)', 'Lincoln-Douglas', 'Parliamentary'], default: 'Public Forum' },
      { key: 'time', label: 'Speech length (minutes)', type: 'select', options: ['3', '4', '6', '8', '10'], default: '4' },
      { key: 'content', label: 'Key points to include (optional)', type: 'textarea', placeholder: 'Specific arguments or contentions you want covered' },
    ],
    buildPrompt: (f) => `You are an expert debate coach writing a full constructive speech.

Resolution: "${f.resolution}"
Side: ${f.side}
Format: ${f.format}
Target length: ${f.time} minutes (approx. ${parseInt(f.time) * 150}-${parseInt(f.time) * 170} words)
${f.content ? `Key points: ${f.content}` : ''}

Write a complete, deliverable ${f.side} constructive speech:

1. **Introduction** — Hook the audience, state the resolution, present your side
2. **Framework** — Brief definitions and weighing mechanism
3. **Contentions** — 2-3 fully developed arguments, each with:
   - Clear claim statement
   - Logical warrant/reasoning
   - Impact analysis (why it matters)
   - Transitional phrasing between points
4. **Conclusion** — Summarize key impacts and vote issue

Write in spoken, conversational-yet-formal debate style. Include signposting ("My first contention is...", "Turning to my second point...").

IMPORTANT:
- ORIGINALITY: Write unique, specific arguments — not generic filler.
- STAY ON TOPIC: All content must directly support the ${f.side} on "${f.resolution}".${ANTI_REPETITION_SPEECH}`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `${f.side} Constructive: ${f.resolution.slice(0, 60)}`.slice(0, 120),
  },
  {
    id: 'rebuttal_brief',
    category: 'Debate Texts',
    label: 'Rebuttal Brief',
    icon: Gavel,
    docLabel: 'Rebuttal Brief',
    color: 'violet',
    description: 'Pre-written rebuttals against anticipated opposing arguments',
    multi: false,
    fields: [
      { key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'The debate resolution', required: true },
      { key: 'side', label: 'Your side', type: 'select', options: ['Affirmative', 'Negative'], default: 'Affirmative' },
      { key: 'format', label: 'Format', type: 'select', options: ['Public Forum', 'Policy (CX)', 'Lincoln-Douglas', 'Parliamentary'], default: 'Public Forum' },
      { key: 'oppArgs', label: 'Opposing arguments to rebut (optional)', type: 'textarea', placeholder: 'What arguments do you expect the other side to make?' },
    ],
    buildPrompt: (f) => `You are an expert debate coach writing a rebuttal brief.

Resolution: "${f.resolution}"
Your side: ${f.side}
Format: ${f.format}
${f.oppArgs ? `Expected opposing arguments: ${f.oppArgs}` : 'Anticipate the strongest arguments from the opposing side.'}

Write a structured rebuttal brief:

1. **Anticipated opposing arguments** — List the 3-4 strongest arguments the other side will make
2. **For each argument**, provide:
   - **Their argument** (1-2 sentences as they'd present it)
   - **Your rebuttal** — 3-4 sentences refuting it (attack the warrant, impact, or link)
   - **Counter-impact** — Why your impact outweighs theirs
3. **Weighing** — A paragraph on why your side's impacts outweigh even if the opponent wins some arguments
4. **Key cross-examination questions** — 2-3 strategic questions to expose weaknesses in their case

IMPORTANT:
- ORIGINALITY: Write specific, strategic rebuttals — not generic filler.
- STAY ON TOPIC: All rebuttals must directly engage arguments about "${f.resolution}".`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `${f.side} Rebuttal Brief: ${f.resolution.slice(0, 60)}`.slice(0, 120),
  },
  {
    id: 'cross_ex_questions',
    category: 'Debate Texts',
    label: 'Cross-Ex Questions',
    icon: MessageSquare,
    docLabel: 'Cross-Ex Questions',
    color: 'violet',
    description: 'Strategic cross-examination questions for any debate format',
    multi: false,
    fields: [
      { key: 'resolution', label: 'Resolution', type: 'textarea', placeholder: 'The debate resolution', required: true },
      { key: 'side', label: 'Your side', type: 'select', options: ['Affirmative', 'Negative'], default: 'Negative' },
      { key: 'focus', label: 'What to expose (optional)', type: 'textarea', placeholder: 'Weaknesses you want to expose: links, impacts, evidence quality...' },
    ],
    buildPrompt: (f) => `You are an expert debate coach writing strategic cross-examination questions.

Resolution: "${f.resolution}"
Your side: ${f.side}
${f.focus ? `Focus: ${f.focus}` : ''}

Write 15-20 strategic cross-examination questions for the ${f.side} side. Organize them into categories:

1. **Clarification questions** — 3-5 questions to pin down the opponent's exact claims
2. **Warrant challenges** — 4-6 questions attacking the logic/reasoning of their arguments
3. **Impact challenges** — 3-5 questions minimizing or turning their impacts
4. **Evidence challenges** — 2-4 questions probing the quality/recency of their evidence
5. **Trap questions** — 2-3 leading questions that set up concessions for later speeches

Each question should be:
- Short and specific (one question at a time)
- Leading (designed to get a yes/no or specific answer)
- Strategic (designed to set up a later argument)

IMPORTANT:
- ORIGINALITY: Write specific, strategic questions — not generic filler.
- STAY ON TOPIC: All questions must directly relate to "${f.resolution}".`,
    parseItems: (text) => [text.trim()],
    cleanItem: (text) => text.trim(),
    titleFromItem: (text, f) => `${f.side} CX Questions: ${f.resolution.slice(0, 60)}`.slice(0, 120),
  },
];

export const CATEGORIES = [...new Set(PRESETS.map(p => p.category))];

export const COLOR_CLASSES = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700', ring: 'ring-indigo-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700', ring: 'ring-emerald-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', ring: 'ring-blue-200' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', btn: 'bg-violet-600 hover:bg-violet-700', ring: 'ring-violet-200' },
};