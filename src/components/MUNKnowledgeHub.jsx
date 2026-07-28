import { useState } from "react";
import { ChevronDown, BookOpen, HelpCircle, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MUN_GLOSSARY, MUN_FAQ, MUN_TEMPLATES } from "@/lib/munGuide";
import ReactMarkdown from "react-markdown";

export default function MUNKnowledgeHub() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("glossary");
  const [query, setQuery] = useState("");
  const [activeTemplate, setActiveTemplate] = useState(0);

  const q = query.trim().toLowerCase();
  const glossary = q
    ? MUN_GLOSSARY.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q))
    : MUN_GLOSSARY;
  const faqs = q
    ? MUN_FAQ.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    : MUN_FAQ;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 font-heading text-sm">MUN Mastery Hub</h4>
            <p className="text-slate-500 text-xs mt-0.5">Glossary, FAQ, and templates from the Complete Student Guide to Model UN.</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-slate-100">
          {/* Section tabs */}
          <div className="flex gap-1 p-3 bg-slate-50 border-b border-slate-100 overflow-x-auto">
            {[
              { id: "glossary", label: "Glossary", icon: BookOpen, count: MUN_GLOSSARY.length },
              { id: "faq", label: "FAQ", icon: HelpCircle, count: MUN_FAQ.length },
              { id: "templates", label: "Templates", icon: FileText, count: MUN_TEMPLATES.length },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${section === s.id ? "bg-primary text-white" : "text-slate-600 hover:bg-white"}`}
              >
                <s.icon className="w-3.5 h-3.5" /> {s.label} ({s.count})
              </button>
            ))}
          </div>

          {section !== "templates" && (
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={`Search ${section}...`}
                  className="pl-9 text-sm h-9"
                />
              </div>
            </div>
          )}

          <div className="p-4 max-h-[420px] overflow-y-auto">
            {section === "glossary" && (
              <div className="space-y-3">
                {glossary.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No terms match your search.</p>}
                {glossary.map((g, i) => (
                  <div key={i} className="border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <div className="font-semibold text-slate-900 text-sm">{g.term}</div>
                    <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{g.def}</p>
                  </div>
                ))}
              </div>
            )}

            {section === "faq" && (
              <div className="space-y-3">
                {faqs.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No questions match your search.</p>}
                {faqs.map((f, i) => (
                  <details key={i} className="group border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-slate-900 text-sm">
                      {f.q}
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                    </summary>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            )}

            {section === "templates" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {MUN_TEMPLATES.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTemplate(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTemplate === i ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Blank Template</div>
                    <pre className="bg-slate-50 rounded-xl p-4 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed border border-slate-100">{MUN_TEMPLATES[activeTemplate].blank}</pre>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Filled Example</div>
                    <pre className="bg-blue-50 rounded-xl p-4 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed border border-blue-100">{MUN_TEMPLATES[activeTemplate].filled}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}