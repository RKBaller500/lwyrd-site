interface ProgressBarProps {
  current: number;
  total: number | null;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total ? Math.round((current / total) * 100) : null;
  return (
    <div className="intake-progress">
      <div className="intake-progress-meta">
        <span>
          Question {current}{total ? ` of ${total}` : ""}
        </span>
        <span>
          {pct !== null ? `${pct}% complete` : ""}
        </span>
      </div>
      <div className="intake-progress-track">
        <div
          className="intake-progress-fill"
          style={{ width: pct !== null ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}
