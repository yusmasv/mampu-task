import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/users"
        className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to list
      </Link>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800" />
          <svg
            className="relative h-10 w-10 text-slate-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-500 dark:bg-red-900/50 dark:text-red-400">
            ?
          </span>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            User not found
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No user exists with this ID. It may have been removed or the link is incorrect.
          </p>
        </div>

        <Link
          href="/users"
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          Browse all users
        </Link>
      </div>
    </main>
  )
}
