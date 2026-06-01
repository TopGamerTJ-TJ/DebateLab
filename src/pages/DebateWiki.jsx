import { useState } from "react";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const ARTICLES = {
  "Parliamentary Debate": [
    { title: "British Parliamentary Format", content: "British Parliamentary (BP) debate features four teams: Opening Government (OG), Opening Opposition (OO), Closing Government (CG), and Closing Opposition (CO). Each team consists of two speakers. Speeches are 7 minutes each. Teams are ranked 1st through 4th, with ranking determining speaker points. The winning team receives 3 points, second place 2 points, etc. Points of Information (POIs) may be offered during the first 6 minutes of each speech, excluding the first and last minutes (which are protected time). The Prime Minister opens the round defining the motion and presenting the government case." },
    { title: "Points of Information (POIs)", content: "Points of Information are short interjections offered by the opposing bench during a speech. To offer a POI, a debater stands and says 'On a point of information' or 'POI.' The speaker may accept or decline. Accepted POIs should be 10-15 seconds maximum. Declining too many POIs appears weak; accepting too many loses control. Strategic POIs expose contradictions, force concessions, or set up future arguments. The speaker currently speaking may respond to POIs by extending their time." },
    { title: "The Matter vs. Manner Distinction", content: "In parliamentary debate, judges evaluate both Matter (the content of arguments — logic, evidence, reasoning) and Manner (how it is delivered — eye contact, voice projection, confidence, clarity). Matter typically carries more weight in judging decisions, but poor Manner can undermine strong content. Matter includes argument quality, clash, and comparative weighing. Manner includes eye contact, vocal variety, pacing, use of notes, and rhetorical effectiveness." },
    { title: "Government vs. Opposition Strategy", content: "Government strategy: Define the motion clearly and favorably. Build 2-3 distinct arguments with clear warrants and impacts. Anticipate opposition attacks and pre-empt them. Maintain a consistent government narrative throughout all speeches. Closing Government must provide an 'extension' — a new substantive argument not made by Opening Government. Opposition strategy: Attack the government definition if it is unreasonably narrow. Provide a clear opposition case with competing values or framework. Prioritize clashing directly with the strongest government arguments. Never let the government's biggest impact stand unaddressed." },
  ],
  "Public Forum Debate": [
    { title: "PF Round Format & Timing", content: "Public Forum Debate rounds follow this sequence: Affirmative Constructive (4 min) → Negative Constructive (4 min) → Crossfire (3 min) → Affirmative Rebuttal (4 min) → Negative Rebuttal (4 min) → Crossfire (3 min) → Affirmative Summary (3 min) → Negative Summary (3 min) → Grand Crossfire (3 min) → Affirmative Final Focus (2 min) → Negative Final Focus (2 min). Each debater gets 2 minutes of prep time to use between speeches." },
    { title: "Weighing Mechanisms in PF", content: "Weighing mechanisms allow debaters to compare their impacts to their opponents'. The four standard mechanisms are: Magnitude (how big is the harm?), Probability (how likely is it to occur?), Timeframe (when does it happen?), and Scope (how many people are affected?). Effective weighing establishes your framework (the lens through which the judge should evaluate impacts) and then applies it comparatively: 'Even if they win their climate argument, our economic impact is more probable and immediate.' Always weigh, never just assert." },
    { title: "Summary and Final Focus Strategy", content: "The Summary speech (3 min) is the most strategic speech in PF. You must: extend only 1-2 arguments (collapse your case), respond to the opponent's strongest arguments, establish your voting issues, and begin heavy weighing. Dropping an argument in Summary usually means it's gone — judges typically won't extend it to Final Focus for you. The Final Focus (2 min) is the last speech judges hear before deliberating. Choose your single clearest voting issue, weigh it decisively, and close with a compelling impact statement. Introduce nothing new." },
    { title: "Crossfire Best Practices", content: "Crossfire is not a debate — it's an interrogation. Best practices: Ask short, specific, yes/no questions whenever possible. Build toward admissions you'll use in the next speech. Stay calm and strategic — emotional crossfire rarely wins rounds. If the opponent gives a long answer, redirect: 'So is that a yes or no?' Never argue in crossfire (save that for your speech). Common crossfire objectives: establish that they haven't answered your argument, get an admission that your evidence is stronger, or expose internal inconsistencies in their case." },
  ],
  "Strategy & Speaking": [
    { title: "Argument Structure: CWEI", content: "The most effective argument structure in competitive debate is CWEI: Claim (state your argument clearly and assertively), Warrant (explain the mechanism — WHY is this true? What is the causal chain?), Evidence (support your warrant with data, studies, or expert opinion), and Impact (so what? Why does this matter? State magnitude, scope, and timeframe). Every argument you make should have all four elements. Judges are most moved by arguments with clear warrants and substantial impacts." },
    { title: "Impact Calculus", content: "Impact calculus is the process of comparing the consequences of arguments to determine which side's impacts are more significant. Key dimensions: Magnitude (how large is the harm or benefit?), Probability (certainty of occurrence), Timeframe (immediate vs. long-term), Scope (individual vs. systemic), Reversibility (can the harm be undone?). Strong impact calculus sounds like: 'Our argument is more significant because the probability is near-certain (X study shows 87% likelihood), the magnitude affects 2 billion people (scope), and it will occur within 5 years (timeframe) — compared to their argument which is speculative and delayed.'" },
    { title: "Rebuttal Techniques", content: "Effective rebuttals follow the structure: Identify the argument (name it clearly), Explain the flaw (logical, empirical, or relevance-based), Impact the drop or concession (why does winning this rebuttal matter?). Key rebuttal techniques: Turn (their argument is actually good for your side), Takeout (their argument doesn't function — the warrant is broken), Non-unique (the problem exists regardless of the resolution), Mitigate (their impact is smaller than they claim), and Weigh (even if true, our impact is larger). The strongest rebuttal is a Turn — it gives you offensive ground." },
    { title: "Public Speaking Tips for Debate", content: "Effective debate delivery: Speak at a comfortable pace — do not spread (excessive speed). Vary your tone and pitch for emphasis. Make eye contact with the judge, not your flow sheet. Project confidence through posture and voice. Use strategic pauses before and after key arguments. Avoid filler words (um, uh, like, basically). Signpost your arguments ('My first argument is... Second...') so judges can follow your flow. Refer to opponents respectfully but assertively. The most persuasive debaters speak conversationally but deliberately — not reading notes." },
  ],
  "Model UN": [
    { title: "Position Paper Writing", content: "A position paper establishes your country's official stance on the committee topic. Standard structure: (1) Country background and relevant history, (2) Current status of the issue in your country, (3) Your country's official policy position and national interest, (4) Proposed solutions that align with your country's interests. Position papers should cite actual UN documents, treaties, and resolutions. Use formal diplomatic language ('The delegation of X...'). Avoid first person. A strong position paper demonstrates research depth and clearly signals your country's bloc alignment." },
    { title: "Draft Resolution Format", content: "A draft resolution has two parts: Preambulatory clauses (recognizing, affirming, recalling, noting) set context and reference existing frameworks. Operative clauses (calls upon, urges, encourages, decides, requests) propose specific actions. Each clause begins with a specific verb and ends with a semicolon (except the last, which ends with a period). Preambulatory clauses are italicized in formal format. Operative clauses are numbered. Signatories must be 20% of committee. Sponsors are primary authors. A strong resolution is realistic, specific, and achievable within the UN system." },
    { title: "Bloc Strategy and Caucusing", content: "Informal caucus (unmoderated) is where most of the real diplomacy happens. Use it to: form a voting bloc, co-sponsor resolutions, and negotiate language. Key caucus skills: Know your country's alliances before committee begins. Approach natural allies first (regional blocs, shared interests). Compromise on language — 'strongly urges' vs 'urges' matters. Build a working paper before a draft resolution. In crisis committees, be the first to form a bloc. Position yourself as a bridge builder between opposing blocs to increase your award chances." },
  ],
  "Terminology": [
    { title: "Core Debate Vocabulary", content: "Flow: The note-taking system used in debate to track arguments and responses column by column. Drop: When a debater fails to respond to an argument (dropped arguments are often conceded). Clash: Direct engagement between opposing arguments on the same point. Framework: The lens or value system through which arguments should be evaluated. Burden: The obligation a team must meet to win the round. Cross-apply: Using an argument made in one context to address a different point. Turn: A rebuttal showing an opponent's argument actually supports your side. Crystallize: In final speeches, distilling the round to its most important voting issues." },
    { title: "Advanced Debate Terms", content: "K (Kritik): A philosophical challenge to the assumptions or language used in a debate (common in policy and parliamentary). DA (Disadvantage): An argument that the resolution/plan causes net harm. CP (Counterplan): An alternative policy that achieves similar benefits without the disadvantage. Impact scenario: A specific, described chain of events leading to a harm or benefit. Internal link: The chain of causation connecting a warrant to its impact. Brink: The point at which a small change causes a catastrophic result. Linear DA: A disadvantage where more of the plan causes more harm. Timeframe advantage: Your impacts happen sooner, making them preferable." },
  ],
};

export default function DebateWiki() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Parliamentary Debate");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = Object.keys(ARTICLES);

  const getArticle = () => {
    if (selectedArticle) {
      const allArticles = Object.values(ARTICLES).flat();
      return allArticles.find(a => a.title === selectedArticle);
    }
    return null;
  };

  const filteredArticles = search
    ? Object.values(ARTICLES).flat().filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()))
    : ARTICLES[selectedCat] || [];

  const article = getArticle();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-slate-300 text-sm"><BookOpen className="w-4 h-4" /> Debate Wiki</div>
        <h1 className="text-3xl font-bold font-heading mb-2">Debate Wiki</h1>
        <p className="text-slate-300 max-w-2xl">Your complete reference guide for parliamentary debate, public forum, Model UN, strategy, speaking, and terminology.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={e => { setSearch(e.target.value); setSelectedArticle(null); }} placeholder="Search articles..." className="pl-9" />
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        {!search && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-fit">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button key={cat} onClick={() => { setSelectedCat(cat); setSelectedArticle(null); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCat === cat && !selectedArticle ? 'bg-blue-50 text-primary font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={search ? "lg:col-span-4" : "lg:col-span-3"}>
          {article ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <button onClick={() => setSelectedArticle(null)} className="text-sm text-primary hover:underline mb-5 flex items-center gap-1">← Back</button>
              <h2 className="text-2xl font-bold text-slate-900 font-heading mb-6">{article.title}</h2>
              <div className="prose text-slate-700 leading-relaxed text-sm">
                {article.content.split('. ').map((sentence, i, arr) => (
                  <span key={i}>{sentence}{i < arr.length - 1 ? '. ' : ''}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {search && <p className="text-sm text-slate-500">{filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''} for "{search}"</p>}
              {filteredArticles.map((art, i) => (
                <div key={i} onClick={() => setSelectedArticle(art.title)} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-primary/30 cursor-pointer transition-all group">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 font-heading group-hover:text-primary transition-colors">{art.title}</h4>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{art.content}</p>
                </div>
              ))}
              {filteredArticles.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No articles found for "{search}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}