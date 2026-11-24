export default function Loading() {
  return (
    <div role="status" className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-muted">Loading&hellip;</p>
      <div className="mt-6 space-y-3" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
