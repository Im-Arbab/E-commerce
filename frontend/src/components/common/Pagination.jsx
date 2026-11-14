export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const nums = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-8" aria-label="Pagination">
      <button
        className="btn-outline !px-3 !py-1.5 text-xs"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      {nums.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`h-8 w-8 rounded-xs text-xs font-mono ${
            n === page ? "bg-ink text-paper" : "text-ink/60 hover:bg-ink/5"
          }`}
          aria-current={n === page ? "page" : undefined}
        >
          {n}
        </button>
      ))}
      <button
        className="btn-outline !px-3 !py-1.5 text-xs"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
