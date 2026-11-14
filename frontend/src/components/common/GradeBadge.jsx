const GRADE_MAP = {
  "Grade A - Like New": { letter: "A", cls: "grade-stamp-a" },
  "Grade B - Good": { letter: "B", cls: "grade-stamp-b" },
  "Grade C - Fair": { letter: "C", cls: "grade-stamp-c" },
};

export default function GradeBadge({ condition, withLabel = false, size = "md" }) {
  const info = GRADE_MAP[condition] || { letter: "?", cls: "grade-stamp" };
  const dims = size === "sm" ? "h-7 w-7 text-xs" : "";

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`${info.cls} ${dims}`} title={condition}>
        {info.letter}
      </span>
      {withLabel && <span className="text-sm font-medium text-ink/80">{condition}</span>}
    </div>
  );
}
