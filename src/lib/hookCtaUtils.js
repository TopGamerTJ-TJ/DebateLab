/**
 * Extracts potential hooks (opening lines) and calls-to-action (closing lines)
 * from existing documents, and builds an anti-repetition instruction for AI prompts.
 * This ensures AI-generated speeches never reuse a hook or call-to-action that's
 * already been used elsewhere in the same project.
 */
export function extractHooksAndCtas(docs) {
  if (!docs || docs.length === 0) return { hooks: [], ctas: [] };
  const hooks = [];
  const ctas = [];
  docs.forEach(d => {
    const content = (d.content || '').trim();
    if (!content || content.length < 30) return;
    // Strip markdown headers to get to actual speech text
    const clean = content.replace(/^#{1,6}\s+.*$/gm, '').trim();
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 15);
    if (sentences.length >= 2) {
      hooks.push(sentences.slice(0, 2).join(' ').trim());
      if (sentences.length > 2) {
        ctas.push(sentences.slice(-2).join(' ').trim());
      }
    }
  });
  return { hooks: hooks.slice(0, 8), ctas: ctas.slice(0, 8) };
}

export function buildAntiRepetitionText(hooks, ctas) {
  const parts = [];
  if (hooks.length > 0) {
    parts.push('PREVIOUSLY USED HOOKS (DO NOT REUSE THESE — write a completely different opening hook with a different device, statistic, anecdote, or rhetorical approach):');
    hooks.forEach((h, i) => parts.push(`${i + 1}. "${h.slice(0, 250)}"`));
  }
  if (ctas.length > 0) {
    parts.push('\nPREVIOUSLY USED CALLS TO ACTION (DO NOT REUSE THESE — write a completely different closing call to action with different language and appeal):');
    ctas.forEach((c, i) => parts.push(`${i + 1}. "${c.slice(0, 250)}"`));
  }
  if (parts.length === 0) return '';
  parts.push('\nCRITICAL — ANTI-REPETITION RULE: Every hook (opening) and call to action (closing) must be UNIQUE across this project. Never reuse the same hook, opening device, call to action, or closing appeal — even if it appeared in a different speech. Each must use a completely different rhetorical approach, different wording, and different framing. If you find yourself reaching for a similar opening or closing, STOP and write something entirely new.');
  return parts.join('\n');
}

/**
 * A standalone anti-repetition instruction for generators that don't have
 * access to existing documents but still need the rule enforced.
 */
export const ANTI_REPETITION_RULE = `ANTI-REPETITION RULE: Never reuse the same hook (opening device) or call to action (closing appeal) that has appeared in any other speech or document in this project. Each hook must use a completely different rhetorical device (statistic, anecdote, question, scenario, quote, etc.) and each call to action must use different language and framing. Vary your openings and closings entirely every single time.`;