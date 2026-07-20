import ReactMarkdown from "react-markdown";

const components = {
  h1: ({ node, ...p }) => <h1 className="text-xl font-bold text-slate-900 mt-5 mb-2 font-heading" {...p} />,
  h2: ({ node, ...p }) => <h2 className="text-lg font-bold text-slate-900 mt-5 mb-2 font-heading" {...p} />,
  h3: ({ node, ...p }) => <h3 className="text-base font-bold text-slate-900 mt-4 mb-1.5 font-heading" {...p} />,
  h4: ({ node, ...p }) => <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1 font-heading" {...p} />,
  h5: ({ node, ...p }) => <h5 className="text-xs font-bold text-slate-900 mt-2 mb-1 font-heading uppercase tracking-wide" {...p} />,
  p: ({ node, ...p }) => <p className="text-sm text-slate-700 leading-relaxed my-2" {...p} />,
  ul: ({ node, ...p }) => <ul className="list-disc pl-5 my-2 space-y-1 text-sm text-slate-700" {...p} />,
  ol: ({ node, ...p }) => <ol className="list-decimal pl-5 my-2 space-y-1 text-sm text-slate-700" {...p} />,
  li: ({ node, ...p }) => <li className="text-sm text-slate-700 leading-relaxed" {...p} />,
  strong: ({ node, ...p }) => <strong className="font-semibold text-slate-900" {...p} />,
  em: ({ node, ...p }) => <em className="italic text-slate-600" {...p} />,
  blockquote: ({ node, ...p }) => <blockquote className="border-l-4 border-slate-200 pl-3 italic text-slate-600 my-2 text-sm" {...p} />,
  pre: ({ node, ...p }) => <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto my-3 text-xs font-mono text-slate-700" {...p} />,
  code: ({ node, ...p }) => <code className="text-pink-600 bg-slate-100 px-1 py-0.5 rounded text-[13px] font-mono" {...p} />,
  hr: () => <hr className="border-slate-200 my-4" />,
  a: ({ node, ...p }) => <a className="text-primary underline" target="_blank" rel="noreferrer" {...p} />,
  table: ({ node, ...p }) => <div className="overflow-x-auto my-3"><table className="w-full text-xs border-collapse" {...p} /></div>,
  th: ({ node, ...p }) => <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold text-slate-700" {...p} />,
  td: ({ node, ...p }) => <td className="border border-slate-200 px-2 py-1 text-slate-700" {...p} />,
};

export default function MarkdownContent({ content, className = "" }) {
  if (!content) return null;
  return (
    <div className={className}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}