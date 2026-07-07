// apps/api/src/services/diff-summary.service.ts
import { env } from "../config/env";
import { getAiClient, getAiModel } from "../config/openai";
import { getBillVersionDiff } from "./bill-diff.service";

type DiffSummaryInput = {
  billId: string;
  fromVersionId: string;
  toVersionId: string;
};

function compactDiffForPrompt(diff: Awaited<ReturnType<typeof getBillVersionDiff>>) {
  return {
    billId: diff.billId,
    fromVersion: diff.fromVersion,
    toVersion: diff.toVersion,
    summary: diff.summary,
    changedClauses: diff.clauses
      .filter((clause) => clause.changeType !== "unchanged")
      .slice(0, 5)
      .map((clause) => ({
        heading: clause.heading,
        changeType: clause.changeType,
        beforeText: clause.beforeText?.slice(0, 600),
        afterText: clause.afterText?.slice(0, 600),
      })),
  };
}

function buildPrompt(diffPayload: ReturnType<typeof compactDiffForPrompt>) {
  return `
You are summarizing deterministic legislative bill version diffs.

Rules:
- Use only the diff JSON provided.
- Do not invent legal effects, motives, or implications.
- Mention uncertainty if the diff text is incomplete.
- Cite clause headings exactly from the provided diff.
- Return valid JSON only.
- Do not wrap the JSON in markdown fences.

Required JSON shape:
{
  "summary": "Plain-English summary in 4-8 sentences.",
  "keyChanges": [
    {
      "clause": "Clause or heading from diff",
      "changeType": "added | removed | modified",
      "explanation": "Plain-English explanation based only on before/after text."
    }
  ],
  "limitations": ["Any important limitations or missing context."]
}

Diff JSON:
${JSON.stringify(diffPayload, null, 2)}
`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 30000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`AI request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

async function generateSummaryText(prompt: string) {
  const client = getAiClient();
  const model = getAiModel();

  if (env.AI_PROVIDER === "gemini") {
    const response = await withTimeout(
      client.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })
    );

    return response.choices[0]?.message?.content ?? "";
  }

  const response = await withTimeout(
    client.responses.create({
      model,
      input: prompt,
    })
  );

  return response.output_text;
}
function parseModelJson(outputText: string) {
  const cleaned = outputText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function summarizeBillVersionDiff(input: DiffSummaryInput) {
  const diff = await getBillVersionDiff(input);
  const compactDiff = compactDiffForPrompt(diff);

  try {
    const outputText = await generateSummaryText(buildPrompt(compactDiff));

    try {
      return {
        diffSummary: parseModelJson(outputText),
        deterministicSummary: diff.summary,
        fromVersion: diff.fromVersion,
        toVersion: diff.toVersion,
        usedAi: true,
        aiProvider: env.AI_PROVIDER,
        aiModel: getAiModel(),
      };
    } catch {
      return {
        diffSummary: {
          summary: outputText,
          keyChanges: [],
          limitations: ["Model response was not valid JSON, so it was returned as plain text."],
        },
        deterministicSummary: diff.summary,
        fromVersion: diff.fromVersion,
        toVersion: diff.toVersion,
        usedAi: true,
        aiProvider: env.AI_PROVIDER,
        aiModel: getAiModel(),
      };
    }
  } catch (error) {
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