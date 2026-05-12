'use client'

import { useMemo, useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { EnrichedUser } from './page'

type SortKey = 'name' | 'posts' | 'completed' | 'pending'
type SortDir = 'asc' | 'desc'
type Filter = 'all' | 'has_pending' | 'no_completed'

const PAGE_SIZE = 5

const SORT_DEFAULTS: Record<SortKey, SortDir> = {
  name: 'asc',
  posts: 'desc',
  completed: 'desc',
  pending: 'desc',
}

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
]

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
  const sz = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${color} ${sz}`}
    >
      {initials}
    </span>
  )
}

export default function UsersClient({ users }: { users: EnrichedUser[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const q = searchParams.get('q') ?? ''
  const sortKey = (searchParams.get('sort') as SortKey) ?? 'name'
  const sortDir = (searchParams.get('dir') as SortDir) ?? 'asc'
  const filter = (searchParams.get('filter') as Filter) ?? 'all'
  const pageParam = Number(searchParams.get('page') ?? '1')

  function setParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) next.delete(k)
      else next.set(k, v)
    }
    const qs = next.toString()
    startTransition(() => {
      router.replace(qs ? `?${qs}` : '?', { scroll: false })
    })
  }

  function handleSort(key: SortKey) {
    const newDir =
      key === sortKey
        ? sortDir === 'asc'
          ? 'desc'
          : 'asc'
        : SORT_DEFAULTS[key]
    setParams({ sort: key, dir: newDir, page: null })
  }

  function navigateToUser(id: number) {
    const qs = searchParams.toString()
    const back = encodeURIComponent(`/users${qs ? `?${qs}` : ''}`)
    router.push(`/users/${id}?back=${back}`)
  }

  const filtered = useMemo(() => {
    const lower = q.toLowerCase()
    let result = users.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
    )
    if (filter === 'has_pending') result = result.filter((u) => u.pendingTodos > 0)
    if (filter === 'no_completed') result = result.filter((u) => u.completedTodos === 0)

    return [...result].sort((a, b) => {
      const cmp =
        sortKey === 'name'
          ? a.name.localeCompare(b.name)
          : sortKey === 'posts'
          ? a.totalPosts - b.totalPosts
          : sortKey === 'completed'
          ? a.completedTodos - b.completedTodos
          : a.pendingTodos - b.pendingTodos
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [users, q, sortKey, sortDir, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, isNaN(pageParam) ? 1 : pageParam), totalPages)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const isFiltered = q !== '' || filter !== 'all'
  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, filtered.length)

  return (
    <div className={`space-y-4 transition-opacity duration-150 ${isPending ? 'opacity-50' : ''}`}>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => setParams({ q: e.target.value || null, page: null })}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm transition placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900"
          />
        </div>

        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4h18M7 8h10M11 12h2" />
          </svg>
          <select
            value={filter}
            onChange={(e) =>
              setParams({ filter: e.target.value === 'all' ? null : e.target.value, page: null })
            }
            className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900"
          >
            <option value="all">All users</option>
            <option value="has_pending">Has pending todos</option>
            <option value="no_completed">No completed todos</option>
          </select>
        </div>
      </div>

      {/* Active filter chip */}
      {isFiltered && (
        <div className="flex items-center gap-2">
          {filter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-800">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.553.894l-4 2A1 1 0 016 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              {filter === 'has_pending' ? 'Has pending todos' : 'No completed todos'}
            </span>
          )}
          <button
            onClick={() => setParams({ q: null, filter: null, page: null })}
            className="text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline dark:hover:text-slate-200"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full text-sm" role="grid">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
              <ColHeader col="name" label="User" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader col="posts" label="Posts" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader col="completed" label="Done" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader col="pending" label="Pending" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState isFiltered={isFiltered} onClear={() => setParams({ q: null, filter: null, page: null })} />
                </td>
              </tr>
            ) : (
              paginated.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => navigateToUser(user.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigateToUser(user.id)
                    }
                  }}
                  tabIndex={0}
                  aria-label={`View details for ${user.name}`}
                  className="cursor-pointer transition-colors hover:bg-indigo-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400 dark:hover:bg-indigo-950/20"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <div className="min-w-0">
                        <div className="max-w-48 truncate font-semibold text-slate-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="max-w-48 truncate text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                      {user.totalPosts}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 tabular-nums text-emerald-600 dark:text-emerald-400">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {user.completedTodos}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {user.pendingTodos > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                        {user.pendingTodos}
                      </span>
                    ) : (
                      <span className="tabular-nums text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {filtered.length === 0 ? (
          <EmptyState isFiltered={isFiltered} onClear={() => setParams({ q: null, filter: null, page: null })} />
        ) : (
          paginated.map((user) => (
            <button
              key={user.id}
              onClick={() => navigateToUser(user.id)}
              className="group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={user.name} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </div>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-indigo-400 dark:text-slate-600 dark:group-hover:text-indigo-500"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="mt-3 flex gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Stat label="posts" value={user.totalPosts} />
                <Stat label="done" value={user.completedTodos} color="emerald" />
                {user.pendingTodos > 0 ? (
                  <Stat label="pending" value={user.pendingTodos} color="amber" />
                ) : (
                  <Stat label="pending" value={0} />
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer: count + pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Showing{' '}
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {filtered.length === 0 ? '0' : `${from}–${to}`}
          </span>{' '}
          of{' '}
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {filtered.length}
          </span>{' '}
          users
        </p>
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => setParams({ page: p === 1 ? null : String(p) })}
          />
        )}
      </div>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  function pageNumbers(): (number | '…')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const items: (number | '…')[] = [1]
    if (page > 3) items.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      items.push(i)
    }
    if (page < totalPages - 2) items.push('…')
    items.push(totalPages)
    return items
  }

  const btnBase =
    'rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400'

  return (
    <nav aria-label="Pagination" className="flex items-center gap-0.5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={`${btnBase} p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pageNumbers().map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`${btnBase} min-w-8 px-2 py-1 ${
              p === page
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={`${btnBase} p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7 7 7" />
        </svg>
      </button>
    </nav>
  )
}

function Stat({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color?: 'emerald' | 'amber'
}) {
  const text = color === 'emerald'
    ? 'text-emerald-600 dark:text-emerald-400'
    : color === 'amber'
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-slate-500 dark:text-slate-400'
  return (
    <span className={`text-xs ${text}`}>
      <span className="font-semibold tabular-nums">{value}</span>{' '}
      <span className="text-slate-400 dark:text-slate-500">{label}</span>
    </span>
  )
}

function EmptyState({
  isFiltered,
  onClear,
}: {
  isFiltered: boolean
  onClear: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-300">
          {isFiltered ? 'No users match your filters' : 'No users found'}
        </p>
        {isFiltered && (
          <p className="mt-0.5 text-sm text-slate-400">
            Try adjusting your search or filter criteria.
          </p>
        )}
      </div>
      {isFiltered && (
        <button
          onClick={onClear}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}

function ColHeader({
  col,
  label,
  currentKey,
  dir,
  onSort,
}: {
  col: SortKey
  label: string
  currentKey: SortKey
  dir: SortDir
  onSort: (col: SortKey) => void
}) {
  const active = col === currentKey
  return (
    <th
      scope="col"
      onClick={() => onSort(col)}
      className={`cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400 ${
        active
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-30'}`}>
          {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  )
}
