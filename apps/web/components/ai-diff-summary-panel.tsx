// apps/web/components/ai-diff-summary-panel.tsx
"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import {
  summarizeBillDiff,
  type BillVersion,
  type DiffSummaryResponse,
} from "../lib/api-client";

type AiDiffSummaryPanelProps = {
  billId: string;
  versions: BillVersion[];
};

export function AiDiffSummaryPanel({ billId, versions }: AiDiffSummaryPanelProps) {
  const textVersions = useMemo(
    () => versions.filter((version) => Boolean(version.textContent)),
    [versions]
  );

  const [fromVersionId, setFromVersionId] = useState(textVersions[0]?.id ?? "");
  const [toVersionId, setToVersionId] = useState(textVersions[1]?.id ?? textVersions[0]?.id ?? "");
  const [summary, setSummary] = useState<DiffSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerateSummary() {
    if (!fromVersionId || !toVersionId) {
      setError("Select two bill versions first.");
      return;
    }

    if (fromVersionId === toVersionId) {
      setError("Select two different bill versions.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await summarizeBillDiff(billId, {
        fromVersionId,
        toVersionId,
      });

      setSummary(result);
    } catch (summaryError) {
      setError(summaryError instanceof Error ? summaryError.message : "Could not generate summary.");
    } finally {
      setIsLoading(false);
    }
  }

  if (versions.length < 2) {
    return (
      <section className="card ai-summary-panel">
        <div>
          <p className="eyebrow">AI version summary</p>
          <h3>More versions needed</h3>
          <p className="muted">
            This bill needs at least two versions before a version summary can be generated.
          </p>
        </div>
      </section>
    );
  }

  if (textVersions.length < 2) {
    return (
      <section className="card ai-summary-panel">
        <div>
          <p className="eyebrow">AI version summary</p>
          <h3>Text extraction pending</h3>
          <p className="muted">
            At least two bill versions need extracted text before AI summaries can be generated.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card ai-summary-panel">
      <div className="ai-summary-panel__header">
        <div>
          <p className="eyebrow">AI version summary</p>
          <h3>Explain what changed</h3>
          <p className="muted">
            The backend compares extracted text deterministically, then asks AI to summarize the structured diff.
          </p>
        </div>
        <Sparkles size={22} aria-hidden="true" />
      </div>

      <div className="ai-summary-controls">
        <label>
          <span>From version</span>
          <select value={fromVersionId} onChange={(event) => setFromVersionId(event.target.value)}>
            {textVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.versionLabel}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>To version</span>
          <select value={toVersionId} onChange={(event) => setToVersionId(event.target.value)}>
            {textVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.versionLabel}
              </option>
            ))}
          </select>
        </label>

        <button className="button" type="button" onClick={handleGenerateSummary} disabled={isLoading}>
          <Sparkles size={16} aria-hidden="true" />
          {isLoading ? "Generating..." : "Generate summary"}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {summary ? (
        <div className="ai-summary-result">
          <div className="ai-summary-meta">
            <span className="status-pill">
              {summary.usedAi ? `AI: ${summary.aiProvider ?? "provider"}` : "Fallback"}
            </span>
            <span className="muted">
              Added {summary.deterministicSummary.added}, removed{" "}
              {summary.deterministicSummary.removed}, modified{" "}
              {summary.deterministicSummary.modified}
            </span>
          </div>

          <p>{summary.diffSummary.summary}</p>

          {summary.diffSummary.keyChanges.length > 0 ? (
            <div>
              <h4>Key changes</h4>
              <ul className="key-change-list">
                {summary.diffSummary.keyChanges.map((change, index) => (
                  <li key={`${change.clause}-${index}`}>
                    <strong>{change.clause}</strong>
                    <span className="status-pill">{change.changeType}</span>
                    <p>{change.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {summary.diffSummary.limitations.length > 0 ? (
            <div>
              <h4>Limitations</h4>
              <ul className="limitation-list">
                {summary.diffSummary.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}