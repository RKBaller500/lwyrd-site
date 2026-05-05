interface ProgressBarProps {
  current: number;
  total: number | null;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total ? Math.round((current / total) * 100) : null;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-medium">
          Question {current}{total ? ` of ${total}` : ""}
        </span>
        <span className="text-xs text-slate-400">
          {pct !== null ? `${pct}% complete` : ""}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#ddd7cc] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#002452] rounded-full transition-all duration-500"
          style={{ width: pct !== null ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}
