export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Page title */}
      <div className="shimmer mb-6 h-8 w-20 rounded-lg" />

      {/* Controls */}
      <div className="mb-4 flex gap-3">
        <div className="shimmer h-10 w-72 rounded-xl" />
        <div className="shimmer h-10 w-44 rounded-xl" />
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block dark:border-slate-700 dark:bg-slate-900">
        {/* Header row */}
        <div className="flex gap-8 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
          {['w-16', 'w-10', 'w-10', 'w-14'].map((w, i) => (
            <div key={i} className={`shimmer h-3 rounded ${w}`} />
          ))}
        </div>

        {/* Body rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-8 border-b border-slate-100 px-4 py-3.5 last:border-0 dark:border-slate-800"
          >
            {/* Avatar + name */}
            <div className="flex flex-1 items-center gap-3">
              <div className="shimmer h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <div className="shimmer h-4 w-36 rounded" />
                <div className="shimmer h-3 w-44 rounded" />
              </div>
            </div>
            <div className="shimmer h-4 w-5 rounded" />
            <div className="shimmer h-4 w-5 rounded" />
            <div className="shimmer h-5 w-8 rounded-full" />
          </div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <div className="shimmer h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="shimmer h-4 w-36 rounded" />
                <div className="shimmer h-3 w-48 rounded" />
              </div>
            </div>
            <div className="mt-3 flex gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              {['w-14', 'w-12', 'w-16'].map((w, j) => (
                <div key={j} className={`shimmer h-3 rounded ${w}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
