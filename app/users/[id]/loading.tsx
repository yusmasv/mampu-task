export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/* Back link */}
      <div className="shimmer mb-6 h-5 w-24 rounded-lg" />

      {/* Identity card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {/* Gradient header placeholder */}
        <div className="h-28 bg-slate-200 dark:bg-slate-700" />

        {/* Sections */}
        {[
          ['w-14', 3],
          ['w-16', 3],
          ['w-16', 2],
        ].map(([labelW, rows], si) => (
          <div
            key={si}
            className="border-t border-slate-100 px-6 py-4 dark:border-slate-800"
          >
            <div className={`shimmer mb-3 h-3 rounded ${labelW}`} />
            <div className="space-y-2.5">
              {Array.from({ length: rows as number }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shimmer h-4 w-20 rounded" />
                  <div className="shimmer h-4 w-40 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Activity strip */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <div className="shimmer h-5 w-5 rounded" />
            <div className="shimmer h-6 w-8 rounded" />
            <div className="shimmer h-3 w-14 rounded" />
          </div>
        ))}
      </div>

      {/* Posts skeleton */}
      <div className="mt-6">
        <div className="shimmer mb-3 h-4 w-16 rounded" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <div className="shimmer h-5 w-5 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-3/4 rounded" />
                  <div className="shimmer h-3 w-full rounded" />
                  <div className="shimmer h-3 w-5/6 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Todos skeleton */}
      <div className="mt-6">
        <div className="shimmer mb-3 h-4 w-14 rounded" />
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="shimmer mb-3 h-3 w-16 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="shimmer h-4 w-4 rounded border" />
                <div className="shimmer h-3.5 rounded" style={{ width: `${50 + (i * 17) % 40}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
