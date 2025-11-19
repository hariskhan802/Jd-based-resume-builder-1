// utils/generatedJson.js
/**
 * parseGeneratedJson(rawString)
 * - tries to extract a single JSON object from messy model output
 * - performs common cleanups (remove code fences, trailing commas, unquoted keys)
 * - returns { ok, data, rawPreview, extractedPreview, cleanedPreview, error }
 */

function findBalancedJson(s) {
  // find first '{' and get matching closing brace using stack count
  const first = s.indexOf("{");
  if (first === -1) return null;
  let depth = 0;
  for (let i = first; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth === 0) {
      return s.slice(first, i + 1);
    }
  }
  return null;
}

function cleanupCommonIssues(s) {
  let out = s;

  // remove code fences
  out = out.replace(/```(?:json)?/gi, "");

  // convert fancy quotes to straight
  out = out.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  // remove any "assistant:" or "output:" prefixes that often appear
  out = out.replace(/^\s*(assistant|output|response|result)\s*[:|-]\s*/i, "");

  // remove trailing commas before } or ]
  out = out.replace(/,(\s*[}\]])/g, "$1");

  // ensure property names are quoted: { name: "x" } -> { "name": "x" }
  // only convert simple cases to avoid upsetting valid strings.
  out = out.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');

  // replace single-quoted strings with double quotes (simple heuristic)
  out = out.replace(/'([^']*?)'/g, (_, inner) => {
    // if single quotes contain a double quote inside, keep single to avoid breaking
    if (inner.includes('"')) return `'${inner}'`;
    return `"${inner}"`;
  });

  // remove trailing commas in arrays/objects again
  out = out.replace(/,(\s*[}\]])/g, "$1");

  return out;
}

export function parseGeneratedJson(raw) {
  const rawPreview = raw?.slice?.(0, 2000) ?? String(raw).slice(0, 2000);

  if (!raw || typeof raw !== "string") {
    return { ok: false, error: "No output from model", rawPreview };
  }

  // Step 1: try fast JSON.parse (maybe model was clean)
  let attempt = raw.trim();
  attempt = attempt.replace(/^\uFEFF/, ""); // remove BOM

  // Remove surrounding backticks if present
  attempt = attempt.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

  try {
    const parsed = JSON.parse(attempt);
    return { ok: true, data: parsed, rawPreview, extractedPreview: attempt, cleanedPreview: attempt };
  } catch (e) {
    // continue to extraction/cleanup
  }

  // Step 2: attempt to locate first balanced {...}
  const extracted = findBalancedJson(raw);
  const extractedPreview = extracted ? extracted.slice(0, 2000) : null;

  // Step 3: cleanup heuristics and try parse
  let cleaned = extracted ?? raw;
  cleaned = cleanupCommonIssues(cleaned);
  // final trim
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    return { ok: true, data: parsed, rawPreview, extractedPreview, cleanedPreview: cleaned };
  } catch (err) {
    // Last-ditch tries: try to wrap top-level like response: { ... } or "resume": {...}
    // Search for first '{' again and try from there
    const firstBrace = cleaned.indexOf("{");
    if (firstBrace !== -1 && firstBrace > 0) {
      const tail = cleaned.slice(firstBrace);
      try {
        const parsed = JSON.parse(tail);
        return { ok: true, data: parsed, rawPreview, extractedPreview: tail.slice(0, 2000), cleanedPreview: tail.slice(0, 2000) };
      } catch (e) {
        // continue
      }
    }

    // give back helpful debug info
    return {
      ok: false,
      error: "Failed to parse JSON from model output",
      rawPreview,
      extractedPreview,
      cleanedPreview: cleaned.slice(0, 2000),
    };
  }
}
