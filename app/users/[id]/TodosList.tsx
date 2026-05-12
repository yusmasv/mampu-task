'use client'

import { useState } from 'react'

export type Todo = { id: number; title: string; completed: boolean }

export default function TodosList({ todos }: { todos: Todo[] }) {
  const [showDone, setShowDone] = useState(false)

  const pending = todos.filter((t) => !t.completed)
  const done = todos.filter((t) => t.completed)

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
        <svg className="h-8 w-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm text-slate-400">No todos yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-800/40">
      {/* Pending */}
      {pending.length > 0 && (
        <div className="px-4 py-3">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending
            </span>
            <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-700">
              {pending.length}
            </span>
          </div>
          <ul className="space-y-1" role="list" aria-label="Pending todos">
            {pending.map((t) => (
              <li key={t.id} className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-slate-300 dark:border-slate-600"
                  aria-hidden="true"
                />
                <span className="text-sm capitalize text-slate-700 dark:text-slate-300">
                  {t.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Divider */}
      {pending.length > 0 && done.length > 0 && (
        <div className="mx-4 border-t border-slate-100 dark:border-slate-800" />
      )}

      {/* Completed — collapsed by default */}
      {done.length > 0 && (
        <div className="px-4 py-3">
          <button
            onClick={() => setShowDone((s) => !s)}
            className="flex w-full items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
            aria-expanded={showDone}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Completed
            </span>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-700">
              {done.length}
            </span>
            <svg
              className={`ml-auto h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${showDone ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDone && (
            <ul className="mt-2.5 space-y-1" role="list" aria-label="Completed todos">
              {done.map((t) => (
                <li key={t.id} className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                    fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm capitalize text-slate-400 line-through dark:text-slate-500">
                    {t.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
