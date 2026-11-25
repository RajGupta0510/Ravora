/**
 * Araiven stores its reasoning as a JSON document (summary, whyThisAsset, ...), and the
 * recommendation engine sometimes prefixes it with a sentence. The UI must show readable
 * text, never the raw JSON, so this turns either shape into a summary plus labelled sections.
 */

export interface ReasoningSection {
  label: string;
  text?: string;
  items?: string[];
}

export interface ParsedReasoning {
  /** One readable paragraph, safe to show on a card. */
  summary: string;
  /** Detail rows for the drawer. Empty when the source was plain text. */
  sections: ReasoningSection[];
}

const SECTION_LABELS: [string, string][] = [
  ['whyThisAsset', 'Why this asset'],
  ['whyNow', 'Why now'],
  ['supportingEvidence', 'Supporting evidence'],
  ['potentialRisks', 'Potential risks'],
  ['invalidationTrigger', 'What would invalidate it'],
  ['suggestedAction', 'Suggested action'],
];

function toSection(label: string, value: unknown): ReasoningSection | null {
  if (Array.isArray(value)) {
    const items = value.map((v) => String(v).trim()).filter(Boolean);
    return items.length ? { label, items } : null;
  }
  if (typeof value === 'string' && value.trim()) return { label, text: value.trim() };
  return null;
}

export function parseReasoning(raw: string | null | undefined): ParsedReasoning {
  const text = (raw ?? '').trim();
  if (!text) return { summary: '', sections: [] };

  const start = text.indexOf('{');
  if (start === -1) return { summary: text, sections: [] };

  try {
    const obj = JSON.parse(text.slice(start)) as Record<string, unknown>;
    const lead = text.slice(0, start); // e.g. "Araiven recommends allocating 14% to BTC because: "
    const summary = typeof obj.summary === 'string' ? obj.summary.trim() : '';
    const sections = SECTION_LABELS.map(([key, label]) => toSection(label, obj[key])).filter(
      (s): s is ReasoningSection => s !== null
    );
    return { summary: `${lead}${summary}`.trim() || text, sections };
  } catch {
    // Not valid JSON: show the text as it is, trimmed of any dangling brace fragment.
    return { summary: text.slice(0, start).trim() || text, sections: [] };
  }
}
