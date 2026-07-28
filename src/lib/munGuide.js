// Structured MUN mastery reference, derived from "The Complete Student Guide
// to Model United Nations". Consumed by the Feedback Generator (to evaluate
// MUN documents), the AI coach (MUN projects), and the Knowledge Hub on the
// profile page (glossary / FAQ / templates).

// Condensed evaluative framework used to ground AI feedback & coaching.
export const MUN_GUIDE_SUMMARY = `MODEL UNITED NATIONS — MASTERY FRAMEWORK

1. WHAT MUN IS
MUN is a simulation where students represent countries and solve international problems through diplomacy. Four ideas: it is a simulation (you become your assigned country, personal opinions are secondary); it is about diplomacy (negotiation over arguing, solving problems peacefully); it is about solving problems (excellent delegates propose specific realistic solutions, not just name the problem); it is a team activity (you need allies to pass resolutions).

2. RESEARCH — THE SPEAR SYSTEM
Study your country's: Speeches, Programs, Events, Agreements, Reports. Answer the three magic questions: Why does this topic matter to my country? What has my country already done? What does my country want to do next? Build a Country Intelligence File: basic identity, geography, economy, allies, international organizations, current challenges. Ask: Who are we? What do we need? What do we fear? What do we want? Who agrees with us?

3. TOPIC RESEARCH — THE DETECTIVE METHOD
What is the problem? Why does it exist? Who is affected? What has already been tried? Why did existing solutions succeed or fail? What should happen next? Use the Four-Layer method: definitions → causes → previous actions → new solutions. Every problem should connect to a solution.

4. SOLUTIONS — SMART + THE THREE REQUIREMENTS
Every good solution answers: Who? How? Who pays? Solutions should be Specific, Measurable, Achievable, Realistic, Time-Based. Four building blocks: Education, Funding, Technology, International Cooperation. Never propose something that already failed unless you improve it. Prepare one small, one medium, and one large solution for negotiation flexibility.

5. OPENING SPEECH — THE HPA FORMULA
Hook (question, statistic, quote, or short story) → Point (one clear sentence of country position) → Action (what should happen). Speak slower than feels natural, pause for confidence, look up. 30s: one problem, one position, one solution. 60s: hook + position + two solutions + call to action. 90s: hook + background + policy + multiple solutions + call to action.

6. PUBLIC SPEAKING
Slow down, pause, look up. Good posture, natural hand gestures, calm professional expression. Control volume, pace, and tone. Do not read like a robot, do not memorize every word (memorize ideas), do not talk too fast, do not use words you cannot pronounce.

7. MODERATED CAUCUS
Structured discussion with short timed speeches (30-60s). Four-part formula: state the problem, explain country position, offer a solution, invite cooperation. Do not repeat your opening speech — add something new. End with "The delegation welcomes further discussion with interested member states." Build influence: introduce → expand → connect to others' proposals. Disagree politely: criticize ideas, not people.

8. UNMODERATED CAUCUS
Free negotiation time — where most awards are won. Move immediately when it begins. Golden opening line: "Hi, I'm the delegate of [country]. What ideas are you working on?" Join medium-sized groups (6-15). Follow the 70/30 rule: 70% listening, 30% speaking. Become useful: take notes, organize ideas, draft clauses, summarize. Ask: What solutions are we considering? What still needs work? How can I help?

9. NEGOTIATION & ALLIANCES
Negotiate to build agreements, not win arguments. The five questions: What do they want? Why? What do we agree on? Where do we disagree? Can we compromise? Use the Bridge Technique to combine separate groups' ideas. Use diplomatic language ("The delegation has concerns regarding that proposal" not "You're wrong"). Conditional agreement: "I support this if X is included." People support ideas they helped create — make it "our" idea.

10. RESOLUTION WRITING
Preambulatory clauses = WHY (Recognizing, Noting with concern, Reaffirming). Operative clauses = WHAT (Establishes, Calls upon, Encourages, Recommends, Requests, Supports, Invites, Promotes). Every strong resolution answers: Problem, Cause, Solution, Implementation, Funding, Evaluation. Use subclauses (a, b, c; i, ii, iii) for detail. Elite clauses include: action verb, mechanism, sub-steps, enforcement, funding. Anchor to real institutions (UNDP, WHO, UNHCR, IMF/World Bank). Ask: "If this passed tomorrow, how would it actually work?"

11. POSITION PAPERS
Structure: topic background (brief, factual) → country position (clear stance) → past actions (proof of credibility) → proposed solutions. Use policy language, not opinion ("recognizes as a strategic priority", "supports phased multilateral implementation"). Reference real systems and propose structured solutions. Sounds like government writing, not student writing.

12. PARLIAMENTARY PROCEDURE
General Speaker's List (broad positioning) vs Moderated Caucus (focused influence battles). Motions control committee flow. Points: Point of Order (rules broken), Point of Inquiry (procedural question), Point of Personal Privilege (comfort/technical). Voting: simple majority, two-thirds majority, roll call. Strategic delegates motion early to shape debate and steer topic direction.

13. CRISIS COMMITTEES
Continuous storyline with crisis updates. Use directives (short action commands) instead of resolutions. Each delegate has portfolio powers (money, military, intelligence, influence). Act immediately — the first 10 minutes matter most. Stabilize yourself → expand influence → control the narrative. Public vs private directives. The fastest meaningful actor becomes the most powerful.

14. WHAT JUDGES REWARD
Clarity of thought, consistency of influence (your ideas appear in speeches, clauses, and the final resolution), responsiveness (adapting when blocs shift), and committee utility (helping the committee move forward). Stay in "controlled calm" or "strategic urgency." Speak with authority without dominance — make your solution feel inevitable, not optional. The best delegates make the committee easier to move forward.

15. COMMON MISTAKES
Thinking MUN is only public speaking; trying to dominate; ignoring country policy; over-speaking without changing outcomes; ignoring unmoderated caucus; no clause ownership; emotional debating; no procedural awareness; making impossible promises; ignoring cost/logistics/politics.`;

// Curated glossary (condensed from the full 60-term reference).
export const MUN_GLOSSARY = [
  { term: "Model United Nations (MUN)", def: "A simulation of international diplomacy where students represent countries to solve global issues through public speaking, negotiation, writing, and procedural strategy." },
  { term: "Delegate", def: "The assigned representative of a country (or, in crisis, an individual) responsible for speeches, negotiations, amendments, and resolutions." },
  { term: "Chair", def: "The moderator who enforces procedure, controls speaking order and motions, and evaluates delegate performance." },
  { term: "Committee", def: "The simulated body (e.g. General Assembly, Security Council, WHO) where debate takes place, with specific jurisdiction and rules." },
  { term: "General Speaker's List (GSL)", def: "The main structured speaking order where delegates speak in turn on the broad topic to set positions and early alliances." },
  { term: "Moderated Caucus", def: "A focused debate on a subtopic with short timed speeches; the primary arena for influence battles." },
  { term: "Unmoderated Caucus", def: "Informal negotiation time where delegates leave seats to form alliances, lobby, and draft resolutions; where most deals are made." },
  { term: "Motion", def: "A formal request to change debate structure (e.g. caucuses, voting); must be recognized by the chair." },
  { term: "Point of Order", def: "A procedural correction raised when rules are violated." },
  { term: "Point of Inquiry", def: "A question to the chair about procedure." },
  { term: "Point of Personal Privilege", def: "Raised when a delegate cannot participate properly (hearing, room conditions); can interrupt speakers." },
  { term: "Resolution", def: "The committee's final written policy document, containing solutions in clause form, voted on by the body." },
  { term: "Preambulatory Clause", def: "A clause explaining context and background (Recognizing, Noting with concern); not voted on." },
  { term: "Operative Clause", def: "A clause describing action (Establishes, Calls upon, Recommends); the most important, voted-on part." },
  { term: "Subclause", def: "A detailed subdivision of an operative clause, labeled a), b), c) and i), ii), iii), showing command of policy detail." },
  { term: "Amendment", def: "A change to an existing resolution — adding, removing, or modifying clauses — used during debate or voting." },
  { term: "Sponsor", def: "A delegate who helped write and strongly supports a resolution, defending it during debate." },
  { term: "Signatory", def: "A delegate who supports discussion of a resolution but not necessarily its content; a low-commitment role." },
  { term: "Working Paper", def: "An informal draft of ideas before it becomes a formal resolution; flexible and collaborative." },
  { term: "Bloc", def: "A temporary group of aligned delegates formed around shared goals to pass a specific resolution vision." },
  { term: "Bloc Leader", def: "A delegate who coordinates a bloc, guiding resolution writing and negotiations with informal authority." },
  { term: "Lobbying", def: "Informal negotiation between delegates, mostly during unmoderated caucus, to form alliances." },
  { term: "Yield", def: "Giving remaining speaking time to questions, another delegate, or the chair." },
  { term: "Directive", def: "A short action command in crisis committees that directly changes the situation; can be public or private." },
  { term: "Portfolio Powers", def: "Special abilities (money, military, intelligence, influence) assigned to crisis delegates for hidden actions." },
  { term: "Crisis Update", def: "New information introduced by staff that changes the situation and forces rapid adaptation." },
  { term: "Sovereignty", def: "A country's right to govern itself; the UN cannot force sovereign states to obey." },
  { term: "Veto Power", def: "The ability of the five permanent Security Council members to block any substantive resolution." },
  { term: "Quorum", def: "The minimum number of delegates required for formal debate or voting to begin." },
  { term: "Simple Majority", def: "More than half of voting delegates; required for most General Assembly resolutions." },
  { term: "Two-Thirds Majority", def: "Required for important decisions and major resolutions." },
  { term: "Roll Call Vote", def: "A voting method where each country is called individually and responds yes, no, or abstain." },
  { term: "Abstention", def: "A neutral vote that neither supports nor opposes; used strategically to avoid political consequences." },
  { term: "Procedural Vote", def: "A vote on process (not content); all delegates must vote and no veto applies." },
  { term: "Substantive Vote", def: "A vote on actual resolution content; determines whether policy passes." },
  { term: "Consensus", def: "Agreement without formal voting; creates stronger legitimacy but is difficult to achieve." },
  { term: "Right of Reply", def: "A response allowed when a delegate is directly insulted or misrepresented; granted by the chair." },
  { term: "Floor", def: "Current speaking privilege; a delegate 'has the floor' when recognized by the chair." },
  { term: "Country Policy", def: "The official position of the government a delegate represents; the foundation of committee work." },
  { term: "Diplomacy", def: "The practice of solving international problems through communication and negotiation rather than conflict." },
  { term: "Strategic Silence", def: "Deliberately not speaking to gather information and let others reveal positions first." },
];

// FAQ derived from the guide's common mistakes and award-winning strategies.
export const MUN_FAQ = [
  { q: "Is Model UN just a debate competition?", a: "No. It's a simulation of diplomacy. You represent a country, advocate that country's policies (not your personal opinions), and work with others to negotiate and solve international problems. Collaboration usually beats dominating." },
  { q: "Do I argue as myself?", a: "No. You temporarily become your assigned country's diplomat. If your country opposes a policy you personally support, you represent your country's position — that's exactly what real diplomats do." },
  { q: "What should I research first?", a: "Three things: your country (use the SPEAR system — Speeches, Programs, Events, Agreements, Reports), your topic (the Detective Method: what, why, who, what's been tried), and realistic solutions. Ask the three magic questions: Why does this matter to my country? What has my country done? What does it want next?" },
  { q: "What makes a strong solution?", a: "Realism. A good solution answers Who? How? Who pays? Use SMART criteria (Specific, Measurable, Achievable, Realistic, Time-Based). 'Eliminate world hunger' is impossible; 'establish regional agricultural training centers in ten countries over five years' is strong." },
  { q: "How do I write a strong opening speech?", a: "Use the HPA formula: Hook (question, statistic, quote, or short story) → Point (one clear sentence of your country's position) → Action (what should happen). Speak slower than feels natural, pause, and look up at the room." },
  { q: "Where are awards actually won?", a: "Unmoderated caucuses and negotiation, not just speeches. Move immediately when an unmod starts, join medium groups, follow the 70/30 rule (listen 70%, speak 30%), and become useful by organizing ideas and drafting clauses. Allies build resolutions; resolutions build awards." },
  { q: "How should I write a resolution?", a: "Preambulatory clauses explain WHY (Recognizing, Noting with concern); operative clauses explain WHAT (Establishes, Calls upon). Every clause should answer Problem, Cause, Solution, Implementation, Funding, and Evaluation. Anchor to real institutions like UNDP or WHO, and use subclauses for detail." },
  { q: "How do I disagree politely?", a: "Criticize ideas, not people. Say 'The delegation has concerns regarding that proposal' instead of 'You're wrong.' Use conditional agreement: 'I support this if X is included.' People support ideas they helped create — make it 'our' idea." },
  { q: "What do judges actually reward?", a: "Not the most speaking. Judges reward clarity of thought, consistency of influence (your ideas appear in speeches, clauses, and the final resolution), responsiveness to change, and committee utility — making the committee function better. Speak with authority, not dominance." },
  { q: "How does a crisis committee differ?", a: "Crisis is fast and unpredictable. You use directives (short action commands) instead of resolutions, and each delegate has portfolio powers (money, military, intelligence). Act immediately — the first 10 minutes matter most. The fastest meaningful actor becomes the most powerful." },
  { q: "What's the biggest beginner mistake?", a: "Thinking MUN is only public speaking and trying to dominate everyone. Collaboration, country policy fidelity, and realistic solutions matter far more than sounding smart or giving the most speeches." },
  { q: "How do I control committee flow?", a: "Master parliamentary procedure. Motion strategically and early to shape debate direction, steer topic narrowing, and control draft wording. The delegate who controls what the committee talks about — and when — controls the outcome." },
];

// Plug-and-play templates from Chapter 24.
export const MUN_TEMPLATES = [
  {
    name: "Opening Speech (HPA Formula)",
    blank: "Honorable Chair, distinguished delegates,\n\n[HOOK — question, statistic, quote, or short story]\n\nThe delegation of [COUNTRY] believes that [COUNTRY POLICY].\n\nTo address this issue, [COUNTRY] encourages:\n1. [Solution one]\n2. [Solution two]\n3. [Solution three]\n\nThe delegation looks forward to working with fellow member states toward practical and sustainable solutions.\n\nThank you.",
    filled: "Honorable Chair, distinguished delegates,\n\nEvery year millions of tons of plastic waste threaten the health of our oceans and the people who depend upon them.\n\nThe delegation of Japan believes that marine pollution is an international challenge requiring international cooperation.\n\nJapan encourages the development of regional cleanup partnerships, technology sharing programs, and stronger recycling initiatives to protect future generations.\n\nThe delegation welcomes cooperation with all member states.\n\nThank you."
  },
  {
    name: "Moderated Caucus Speech (4-Part)",
    blank: "The delegation of [COUNTRY] recognizes that [PROBLEM].\n[COUNTRY] supports [POSITION] and [SOLUTION].\nThe delegation welcomes collaboration with member states interested in [COOPERATION].",
    filled: "The delegation of Japan recognizes that delayed information sharing increases the severity of pandemics. Japan supports stronger international scientific cooperation and the creation of regional disease monitoring centers. The delegation welcomes collaboration with member states interested in strengthening early warning systems."
  },
  {
    name: "Resolution Clause",
    blank: "Establishes [AGENCY/PROGRAM] under [INSTITUTION], which shall:\na) [Action one]\nb) [Action two]\nc) [Action three] through [FUNDING MECHANISM] funding.",
    filled: "Establishes a UN Climate Adaptation Fund under UNDP, which shall:\na) finance infrastructure resilience projects in coastal regions,\nb) coordinate disaster preparedness training programs,\nc) operate through a hybrid World Bank and IMF green bond system."
  },
  {
    name: "Position Paper",
    blank: "[COUNTRY] recognizes [TOPIC] as [STRATEGIC PRIORITY].\n[COUNTRY] has [PAST ACTIONS / REAL SYSTEMS].\n[COUNTRY] supports [STRUCTURED SOLUTIONS], including:\n- [Solution with mechanism]\n- [Solution with financing]\n- [Solution with implementation]\n[COUNTRY] emphasizes [BALANCING PRINCIPLE].",
    filled: "The United States recognizes climate change as a strategic economic and national security challenge, particularly impacting coastal infrastructure resilience and agricultural stability. The United States has re-engaged in multilateral climate frameworks and enacted domestic investment into decarbonization and clean energy innovation. The United States supports a hybrid global climate governance model, including carbon-adjusted trade mechanisms, UNDP-managed climate adaptation financing, and public-private partnerships for carbon capture. The United States emphasizes that global climate solutions must balance environmental urgency with economic feasibility."
  },
  {
    name: "Crisis Directive",
    blank: "Title: [TITLE]\nAction: [ACTION]\nResources: [RESOURCES]\nOutcome: [EXPECTED OUTCOME]",
    filled: "Title: Coastal Defense Initiative\nAction: Deploy naval units to protect shipping lanes\nResources: National navy and emergency funds\nOutcome: Stabilized trade routes"
  },
  {
    name: "Lobbying Script",
    blank: "We both agree on [SHARED INTEREST].\nI suggest we combine efforts on [PROPOSAL].\nThis would allow us to secure [OUTCOME] in the final resolution.",
    filled: "We both agree on climate adaptation funding. I suggest we combine efforts on establishing a shared UN monitoring system. This would allow us to secure stronger enforcement mechanisms in the final resolution."
  },
  {
    name: "Amendment",
    blank: "Motion to amend clause [NUMBER] by [REPLACING/ADDING/REMOVING] \"[OLD WORDING]\" with \"[NEW WORDING]\".",
    filled: "Motion to amend clause 3 by replacing \"voluntary compliance\" with \"mandatory reporting framework.\""
  },
  {
    name: "Research Sheet (Master Template)",
    blank: "COUNTRY:\nCOMMITTEE:\nTOPIC:\nMAIN PROBLEM:\nTHREE MAIN CAUSES:\nWHY THIS MATTERS TO MY COUNTRY:\nWHAT MY COUNTRY HAS ALREADY DONE:\nTHREE POSSIBLE SOLUTIONS:\nFIVE POSSIBLE ALLIES:\nFIVE POSSIBLE QUESTIONS:\nOPENING SPEECH COMPLETE: YES / NO",
    filled: "COUNTRY: Japan\nCOMMITTEE: WHO\nTOPIC: Future Pandemic Preparedness\nMAIN PROBLEM: Pandemics spread rapidly through global travel.\nTHREE MAIN CAUSES: Slow response, weak monitoring, poor cooperation.\nWHY THIS MATTERS: Japan relies on trade and is exposed to imported outbreaks.\nWHAT MY COUNTRY HAS DONE: National disease monitoring and international cooperation.\nTHREE POSSIBLE SOLUTIONS: Global disease monitoring, emergency medical teams, shared research databases.\nFIVE POSSIBLE ALLIES: South Korea, Singapore, Canada, Australia, Germany."
  },
];

// Operative clause starter verbs.
export const MUN_OPERATIVE_STARTERS = [
  "Establishes", "Calls upon", "Encourages", "Recommends", "Requests", "Supports", "Invites", "Promotes"
];

// Preambulatory clause starter phrases.
export const MUN_PREAMBULATORY_STARTERS = [
  "Recognizing", "Noting with concern", "Reaffirming", "Deeply concerned", "Acknowledging", "Recalling", "Emphasizing", "Guided by"
];