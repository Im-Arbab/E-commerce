export default function Loader({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-ink/60">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-circuit" />
      <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}
