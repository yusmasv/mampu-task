'use client'

import { useState } from 'react'

export type Post = { id: number; title: string; body: string }

const INITIAL = 3

export default function PostsList({ posts }: { posts: Post[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? posts : posts.slice(0, INITIAL)

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
        <svg className="h-8 w-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-slate-400">No posts yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {visible.map((post, i) => (
        <div
          key={post.id}
          className="group rounded-xl border border-slate-100 bg-white p-4 shadow-xs transition hover:border-slate-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700"
        >
          <div className="flex items-start gap-3">
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-xs font-semibold text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">
                {post.title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {post.body}
              </p>
            </div>
          </div>
        </div>
      ))}

      {posts.length > INITIAL && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {expanded ? 'Show less' : `Show all ${posts.length} posts`}
        </button>
      )}
    </div>
  )
}
