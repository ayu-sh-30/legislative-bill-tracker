// apps/web/components/bill-timeline.tsx
import { CheckCircle2, Circle } from "lucide-react";

import type { BillStage } from "../lib/api-client";

type BillTimelineProps = {
  stages: BillStage[];
};

function formatDate(value: string | null) {
  if (!value) {
    return "Date not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function BillTimeline({ stages }: BillTimelineProps) {
  if (stages.length === 0) {
    return (
      <div className="card empty-state">
        <h2>No timeline events</h2>
        <p className="muted">Timeline data has not been loaded for this bill yet.</p>
      </div>
    );
  }

  return (
    <ol className="timeline">
      {stages.map((stage, index) => {
        const isLatest = index === stages.length - 1;

        return (
          <li className="timeline__item" key={stage.id}>
            <div className="timeline__marker" aria-hidden="true">
              {isLatest ? <CheckCircle2 size={20} /> : <Circle size={18} />}
            </div>

            <div className="timeline__content card">
              <div className="timeline__header">
                <h3>{stage.stage}</h3>
                <span className={isLatest ? "status-pill" : "timeline__date"}>
                  {formatDate(stage.stageDate)}
                </span>
              </div>

              <p className="muted">
                {stage.house ?? "House not available"}
              </p>

              {stage.description ? (
                <p>{stage.description}</p>
              ) : (
                <p className="muted">No description available.</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}