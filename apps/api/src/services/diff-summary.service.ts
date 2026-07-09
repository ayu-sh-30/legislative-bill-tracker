// apps/api/src/services/diff-summary.service.ts
import { env } from "../config/env";
import { getAiClient, getAiModel } from "../config/openai";
import { getBillVersionDiff } from "./bill-diff.service";

type DiffSummaryInput = {
  billId: string;
  fromVersionId: string;
  toVersionId: string;
};

type DiffSummary = {
  summary: string;
  keyChanges: Array<{
    clause: string;
    changeType: string;
    explanation: string;
  }>;
  limitations: string[];
};

function compactDiffForPrompt(diff: Awaited<ReturnType<typeof getBillVersionDiff>>) {
  return {
    fromVersion: {
      id: diff.fromVersion.id,
      label: diff.fromVersion.label,
    },
    toVersion: {
      id: diff.toVersion.id,
      label: diff.toVersion.label,
    },
    summary: diff.summary,
    changedClauses: diff.clauses
      .filter((clause) => clause.changeType !== "unchanged")
      .slice(0, 2)
      .map((clause) => ({
        heading: clause.heading,
        changeType: clause.changeType,
        beforeText: clause.beforeText?.slice(0, 180) ?? null,
        afterText: clause.afterText?.slice(0, 180) ?? null,
      })),
  };
}

function buildPrompt(diffPayload: ReturnType<typeof compactDiffForPrompt>) {
  return `
Return only JSON. No markdown.

Shape:
{"summary":"2 sentence summary","keyChanges":[{"clause":"exact heading","changeType":"added|removed|modified","explanation":"1 sentence"}],"limitations":["short limitation if any"]}

Rules:
Use only this diff. Do not invent legal impact. Cite headings exactly.

Diff:
${JSON.stringify(diffPayload)}
`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 25000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`AI request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

function fallbackSummaryFromAiText(
  outputText: string,
  compactDiff: ReturnType<typeof compactDiffForPrompt>
): DiffSummary {
  return {
    summary:
      outputText.trim() ||
      "The AI provider returned an empty response. Deterministic diff metadata is shown instead.",
    keyChanges: compactDiff.changedClauses.map((clause) => ({
      clause: clause.heading,
      changeType: clause.changeType,
      explanation:
        "This clause changed in the deterministic diff. The AI response was not structured, so this explanation uses deterministic metadata.",
    })),
    limitations: [
      "AI returned unstructured text, so deterministic clause metadata was used for key changes.",
    ],
  };
}

function parseModelJson(
  outputText: string,
  compactDiff: ReturnType<typeof compactDiffForPrompt>
): DiffSummary {
  const cleaned = outputText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart < 0 || jsonEnd <= jsonStart) {
    return fallbackSummaryFromAiText(cleaned, compactDiff);
  }

  try {
    const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1)) as Partial<DiffSummary>;

    return {
      summary:
        typeof parsed.summary === "string"
          ? parsed.summary
          : "AI summary was returned without a valid summary field.",
      keyChanges: Array.isArray(parsed.keyChanges)
        ? parsed.keyChanges.map((change) => ({
            clause:
              typeof change.clause === "string"
                ? change.clause
                : "Unspecified clause",
            changeType:
              typeof change.changeType === "string"
                ? change.changeType
                : "modified",
            explanation:
              typeof change.explanation === "string"
                ? change.explanation
                : "AI did not provide a valid explanation for this change.",
          }))
        : compactDiff.changedClauses.map((clause) => ({
            clause: clause.heading,
            changeType: clause.changeType,
            explanation:
              "This clause changed in the deterministic diff. AI key changes were not structured.",
          })),
      limitations: Array.isArray(parsed.limitations)
        ? parsed.limitations.filter((item): item is string => typeof item === "string")
        : [],
    };
  } catch {
    return fallbackSummaryFromAiText(cleaned, compactDiff);
  }
}

async function generateSummaryText(prompt: string) {
  const client = getAiClient();
  const model = getAiModel();

  console.log(
    `[AI] Starting summary request provider=${env.AI_PROVIDER} model=${model} promptChars=${prompt.length}`
  );

  if (env.AI_PROVIDER === "gemini") {
    const response = await withTimeout(
      client.chat.completions.create({
        model,
        reasoning_effort: "low",
        temperature: 0.1,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You summarize bill diffs. Return compact JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      })
    );

    const output = response.choices[0]?.message?.content ?? "";
    console.log(`[AI] Gemini summary completed outputChars=${output.length}`);

    return output;
  }

  const response = await withTimeout(
    client.responses.create({
      model,
      input: prompt,
      temperature: 0.1,
      max_output_tokens: 400,
    })
  );

  console.log(
    `[AI] OpenAI summary completed outputChars=${response.output_text.length}`
  );

  return response.output_text;
}

export async function summarizeBillVersionDiff(input: DiffSummaryInput) {
  const diff = await getBillVersionDiff(input);
  const compactDiff = compactDiffForPrompt(diff);

  try {
    const outputText = await generateSummaryText(buildPrompt(compactDiff));
    const diffSummary = parseModelJson(outputText, compactDiff);

    return {
      diffSummary,
      deterministicSummary: diff.summary,
      fromVersion: diff.fromVersion,
      toVersion: diff.toVersion,
      usedAi: true,
      aiProvider: env.AI_PROVIDER,
      aiModel: getAiModel(),
    };
  } catch (error) {
    console.error("[AI] Summary request failed", error);

    return {
      diffSummary: {
        summary:
          "AI summary is currently unavailable. The deterministic diff was generated successfully and can be reviewed directly.",
        keyChanges: compactDiff.changedClauses.map((clause) => ({
          clause: clause.heading,
          changeType: clause.changeType,
          explanation:
            "This clause changed in the deterministic diff. AI explanation was skipped because the model request failed.",
        })),
        limitations: [
          error instanceof Error ? error.message : "AI provider request failed",
          "Fallback summary uses deterministic diff metadata only.",
        ],
      },
      deterministicSummary: diff.summary,
      fromVersion: diff.fromVersion,
      toVersion: diff.toVersion,
      usedAi: false,
      aiProvider: env.AI_PROVIDER,
      aiModel: getAiModel(),
    };
  }
}