// apps/api/src/config/openai.ts
import OpenAI from "openai";

import { env } from "./env";

export function getAiClient() {
  if (env.AI_PROVIDER === "gemini") {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    return new OpenAI({
      apiKey: env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }

  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

export function getAiModel() {
  return env.AI_PROVIDER === "gemini" ? env.GEMINI_MODEL : env.OPENAI_MODEL;
}