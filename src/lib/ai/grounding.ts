import type { GroundingAdvice } from "@/types/outterring";
import { deriveKickstart, ensurePhysicalVerb } from "./verbs";
import { resolveOpenAIEndpoint, cleanAndParseJson } from "./providers";

export async function groundWithGemini(taskTitle: string, apiKey: string): Promise<GroundingAdvice> {
  const prompt = `You are Occuring's Grounding Anchor ("I'm Lost").
The user clicked "I'm Lost" while working on: ${JSON.stringify(taskTitle)}.

STRICT RULES:
- ZERO GUILT, ZERO LECTURING. Do NOT mention idle time, distractions, or falling behind.
- Re-orient in ONE calm sentence where they left off ("reorientation").
- Provide ONE immediate 2-minute physical-verb micro-action ("microAction") starting with "Open...", "Write...", "Run...", or "Read...".

Respond strictly in JSON:
{
  "reorientation": "One calm sentence re-orienting where they left off.",
  "microAction": "One physical 2-minute micro-action.",
  "suggestedAction": "continue" | "break_smaller"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(6000),
    }
  );
  if (!res.ok) throw new Error(`Gemini grounding HTTP ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini grounding");
  const parsed = JSON.parse(text) as GroundingAdvice;
  return {
    reorientation: parsed.reorientation,
    microAction: ensurePhysicalVerb(parsed.microAction),
    suggestedAction: parsed.suggestedAction || "continue",
  };
}

export async function groundWithOpenAI(
  taskTitle: string,
  apiKey: string,
  baseUrl?: string,
  modelName = "gpt-4o-mini"
): Promise<GroundingAdvice> {
  const endpoint = resolveOpenAIEndpoint(baseUrl);
  const systemPrompt =
    "You are Occuring Grounding Anchor. Zero guilt, zero mention of idle time. Return JSON with 'reorientation' (1 sentence), 'microAction' (1 physical-verb 2-minute step), 'suggestedAction' ('continue' | 'break_smaller').";

  let res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Active step: ${taskTitle}` },
      ],
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(8000),
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
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Active step: ${taskTitle}` },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
  }

  if (!res.ok) throw new Error(`OpenAI/9Router grounding HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI/9Router grounding response");
  const parsed = cleanAndParseJson<GroundingAdvice>(content);
  return {
    reorientation: parsed.reorientation,
    microAction: ensurePhysicalVerb(parsed.microAction),
    suggestedAction: parsed.suggestedAction || "continue",
  };
}

export async function getGroundingAdvice(
  activeTaskTitle?: string,
  existingKickstart?: string
): Promise<GroundingAdvice> {
  const safeTitle = activeTaskTitle?.trim() || "your current workspace focus";
  const openAiBaseUrl =
    process.env.OPENAI_BASE_URL?.trim() ||
    process.env.NINEROUTER_BASE_URL?.trim();
  const openAiModel =
    process.env.OPENAI_MODEL?.trim() ||
    process.env.NINEROUTER_MODEL?.trim() ||
    (openAiBaseUrl ? "local" : "gpt-4o-mini");
  const openAiKey =
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.NINEROUTER_API_KEY?.trim() ||
    (openAiBaseUrl ? "9router" : undefined);
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  // 1. If 9Router or custom Gateway is configured, use it first
  if (openAiBaseUrl && activeTaskTitle) {
    try {
      return await groundWithOpenAI(
        safeTitle,
        openAiKey || "9router",
        openAiBaseUrl,
        openAiModel
      );
    } catch (e) {
      console.warn("9Router/Gateway grounding fallback triggered:", e);
    }
  }

  // 2. Direct Gemini
  if (geminiKey && activeTaskTitle) {
    try {
      return await groundWithGemini(safeTitle, geminiKey);
    } catch (e) {
      console.warn("Gemini grounding fallback triggered:", e);
    }
  }

  // 3. Official OpenAI
  if (openAiKey && !openAiBaseUrl && activeTaskTitle) {
    try {
      return await groundWithOpenAI(
        safeTitle,
        openAiKey,
        undefined,
        openAiModel
      );
    } catch (e) {
      console.warn("OpenAI grounding fallback triggered:", e);
    }
  }

  if (!activeTaskTitle) {
    return {
      reorientation: "Your active focus slot is currently open and ready for a single micro-step.",
      microAction: "Open Quick Capture (Cmd + K) and type 1 small 5-minute action you want to move forward.",
      suggestedAction: "switch_task",
    };
  }

  const microAction = existingKickstart?.trim()
    ? ensurePhysicalVerb(existingKickstart.trim())
    : deriveKickstart(safeTitle);

  return {
    reorientation: `You left off anchored on "${safeTitle}"—ignore everything else in the backlog right now.`,
    microAction,
    suggestedAction: "continue",
  };
}
