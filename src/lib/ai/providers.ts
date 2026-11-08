import type { TriageMode, TriageResult } from "@/types/outterring";

export function buildTriagePrompt(rawText: string, forcedMode: TriageMode): string {
  const modeDirective =
    forcedMode === "auto"
      ? `Classify input into ONE of three types:
- "doc": if it starts with "Note:", "Doc:", "Catat:", or contains reference notes, meeting notes, markdown documentation, or architectural thoughts.
- "sprint": if it starts with "Sprint:", lists 3+ distinct tasks/clauses separated by commas/newlines, or describes a multi-step feature/project needing decomposition.
- "task": for a single actionable work item.`
      : `You MUST classify and structure this input strictly as type "${forcedMode}".`;

  return `You are Occuring's AI Auto-Triage & Micro-Slicer engine for builders with executive dysfunction.
Analyze raw input: ${JSON.stringify(rawText)}

${modeDirective}

STRICT MICRO-SLICER RULES:
1. Every task or sprint step MUST be 5 to 15 minutes.
2. ALWAYS start every step title and kickstartAction with a concrete physical verb (e.g., "Open...", "Write 3 bullet points...", "Run command...", "Create...", "Verify...").
3. ALWAYS provide a 2-minute friction-breaking kickstartAction for the step.
4. For "sprint", return 3 to 5 activeSteps MAX; place any overflow steps into parkedSteps.

Return STRICT JSON matching:
{
  "type": "task" | "sprint" | "doc",
  "task": {
    "title": "Physical-verb action title",
    "description": "1-sentence context",
    "estimatedMinutes": 10,
    "priority": "low" | "medium" | "high" | "urgent",
    "kickstartAction": "Physical 2-minute kickstart action",
    "whyItMatters": "1-sentence momentum anchor",
    "subtasks": ["Open...", "Write...", "Verify..."]
  },
  "sprint": {
    "title": "Concise Micro-Sprint title",
    "goal": "1-sentence sprint outcome",
    "activeSteps": [/* 3 to 5 task objects as above */],
    "parkedSteps": [/* optional overflow task objects */]
  },
  "doc": {
    "title": "Clean document title",
    "content": "Well-structured Markdown note",
    "category": "architecture" | "runbook" | "meeting" | "ideas" | "general",
    "tags": ["tag1", "tag2"]
  }
}`;
}

export function cleanAndParseJson<T>(content: string): T {
  const trimmed = content.trim();
  const cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

export function resolveOpenAIEndpoint(baseUrl?: string): string {
  const base = (baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  return base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
}

export async function triageWithGemini(
  rawText: string,
  forcedMode: TriageMode,
  apiKey: string
): Promise<TriageResult> {
  const prompt = buildTriagePrompt(rawText, forcedMode);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return JSON.parse(text) as TriageResult;
}

export async function triageWithOpenAI(
  rawText: string,
  forcedMode: TriageMode,
  apiKey: string,
  baseUrl?: string,
  modelName = "gpt-4o-mini"
): Promise<TriageResult> {
  const prompt = buildTriagePrompt(rawText, forcedMode);
  const endpoint = resolveOpenAIEndpoint(baseUrl);

  let res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok && (res.status === 400 || res.status === 422)) {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(12000),
    });
  }

  if (!res.ok) throw new Error(`OpenAI/9Router HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI/9Router response content");
  return cleanAndParseJson<TriageResult>(content);
}

export async function triageWithOllama(
  rawText: string,
  forcedMode: TriageMode,
  baseUrl: string,
  model: string
): Promise<TriageResult> {
  const prompt = buildTriagePrompt(rawText, forcedMode);
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      format: "json",
      stream: false,
    }),
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.response) as TriageResult;
}
