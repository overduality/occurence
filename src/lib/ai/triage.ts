import type { TriageMode, TriageResult } from "@/types/outterring";
import { enforceTriageContracts } from "./contracts";
import { fallbackTriage } from "./heuristics";
import { triageWithGemini, triageWithOllama, triageWithOpenAI } from "./providers";

export async function triageInput(
  rawText: string,
  forcedMode: TriageMode = "auto"
): Promise<TriageResult> {
  const trimmed = rawText.trim();
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
  const ollamaModel = process.env.OLLAMA_MODEL?.trim();
  const ollamaUrl = process.env.OLLAMA_BASE_URL?.trim();

  // 1. If 9Router or custom OpenAI-compatible Gateway is explicitly configured, use it first
  if (openAiBaseUrl) {
    try {
      const res = await triageWithOpenAI(
        trimmed,
        forcedMode,
        openAiKey || "9router",
        openAiBaseUrl,
        openAiModel
      );
      return enforceTriageContracts(res, trimmed);
    } catch (e) {
      console.warn("9Router/Gateway triage unavailable, falling back:", e);
    }
  }

  // 2. Direct Google Gemini
  if (geminiKey) {
    try {
      const res = await triageWithGemini(trimmed, forcedMode, geminiKey);
      return enforceTriageContracts(res, trimmed);
    } catch (e) {
      console.warn("Gemini triage unavailable, falling back:", e);
    }
  }

  // 3. Official OpenAI (if no custom base URL specified)
  if (openAiKey && !openAiBaseUrl) {
    try {
      const res = await triageWithOpenAI(
        trimmed,
        forcedMode,
        openAiKey,
        undefined,
        openAiModel
      );
      return enforceTriageContracts(res, trimmed);
    } catch (e) {
      console.warn("OpenAI triage unavailable, falling back:", e);
    }
  }

  // 4. Local Ollama
  if (ollamaModel && ollamaUrl) {
    try {
      const res = await triageWithOllama(trimmed, forcedMode, ollamaUrl, ollamaModel);
      return enforceTriageContracts(res, trimmed);
    } catch (e) {
      console.warn("Ollama triage unavailable, falling back to local heuristic engine:", e);
    }
  }

  return fallbackTriage(trimmed, forcedMode);
}
