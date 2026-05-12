import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PostsList, { type Post } from './PostsList'
import TodosList, { type Todo } from './TodosList'

export const revalidate = 60

type User = {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
  address: { street: string; suite: string; city: string; zipcode: string }
  company: { name: string; catchPhrase: string }
}

const AVATAR_COLORS = [
  'from-indigo-500 to-violet-500',
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-cyan-500',
  'from-cyan-500 to-blue-500',
  'from-rose-500 to-orange-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
]

function avatarGradient(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function avatarInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

async function getUser(id: string): Promise<User | null> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch user (${res.status})`)
  const data: unknown = await res.json()
  if (!data || typeof data !== 'object' || !('id' in data)) return null
  return data as User
}

async function getUserPosts(id: string): Promise<Post[]> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}/posts`)
  if (!res.ok) throw new Error(`Failed to fetch posts (${res.status})`)
  return res.json()
}

async function getUserTodos(id: string): Promise<Todo[]> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}/todos`)
  if (!res.ok) throw new Error(`Failed to fetch todos (${res.status})`)
  return res.json()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const user = await getUser(id)
  if (!user) return { title: 'User not found' }
  return {
    title: `${user.name} — Users`,
    description: `${user.username} · ${user.email} · ${user.company.name}`,
  }
}

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams])

  const rawBack = typeof sp.back === 'string' ? decodeURIComponent(sp.back) : ''
  const backHref = rawBack.startsWith('/users') ? rawBack : '/users'

  const [user, posts, todos] = await Promise.all([
    getUser(id),
    getUserPosts(id),
    getUserTodos(id),
  ])

  if (!user) notFound()

  const pendingCount = todos.filter((t) => !t.completed).length
  const doneCount = todos.filter((t) => t.completed).length
  const gradient = avatarGradient(user.name)
  const initials = avatarInitials(user.name)

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">

      {/* Back link */}
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to list
      </Link>

      {/* Identity card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">

        {/* Gradient header */}
        <div className={`bg-linear-to-br ${gradient} px-6 pb-5 pt-6`}>
          <div className="flex items-end gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white shadow-inner ring-2 ring-white/30 backdrop-blur-sm">
              {initials}
            </div>
            <div className="pb-0.5">
              <h1 className="text-xl font-bold text-white drop-shadow-sm">
                {user.name}
              </h1>
              <p className="text-sm text-white/75">@{user.username}</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <InfoSection title="Contact" icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          }>
            <Field label="Email" value={user.email} />
            <Field label="Phone" value={user.phone} />
            <Field
              label="Website"
              value={
                <a
                  href={`https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 transition hover:text-indigo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {user.website}
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              }
            />
          </InfoSection>

          <InfoSection title="Address" icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          }>
            <Field label="Street" value={`${user.address.street}, ${user.address.suite}`} />
            <Field label="City" value={user.address.city} />
            <Field label="Zip" value={user.address.zipcode} />
          </InfoSection>

          <InfoSection title="Company" icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          }>
            <Field label="Name" value={user.company.name} />
            <Field label="Catchphrase" value={<em className="not-italic text-slate-500 dark:text-slate-400">&ldquo;{user.company.catchPhrase}&rdquo;</em>} />
          </InfoSection>
        </div>
      </div>

      {/* Activity strip */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <ActivityCard
          value={posts.length}
          label="posts"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          }
          color="indigo"
        />
        <ActivityCard
          value={doneCount}
          label="completed"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          }
          color="emerald"
        />
        <ActivityCard
          value={pendingCount}
          label="pending"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          }
          color={pendingCount > 0 ? 'amber' : 'gray'}
        />
      </div>

      {/* Posts */}
      <section className="mt-6" aria-label="Posts">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Posts
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {posts.length}
          </span>
        </h2>
        <PostsList posts={posts} />
      </section>

      {/* Todos */}
      <section className="mt-6" aria-label="Todos">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Todos
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {todos.length}
          </span>
        </h2>
        <TodosList todos={todos} />
      </section>
    </main>
  )
}

function InfoSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="px-6 py-4">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          {icon}
        </svg>
        {title}
      </h2>
      <dl className="space-y-2">{children}</dl>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 text-sm">
      <dt className="w-20 shrink-0 text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="min-w-0 wrap-break-word font-medium text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  )
}

function ActivityCard({
  value,
  label,
  icon,
  color,
}: {
  value: number
  label: string
  icon: React.ReactNode
  color: 'indigo' | 'emerald' | 'amber' | 'gray'
}) {
  const styles = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'text-indigo-500', val: 'text-indigo-700 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-500', val: 'text-emerald-700 dark:text-emerald-400' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',   icon: 'text-amber-500',   val: 'text-amber-700 dark:text-amber-400' },
    gray:    { bg: 'bg-slate-50 dark:bg-slate-800/60',   icon: 'text-slate-400',   val: 'text-slate-600 dark:text-slate-400' },
  }
  const s = styles[color]
  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl p-3 ${s.bg}`}>
      <svg className={`h-5 w-5 ${s.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {icon}
      </svg>
      <span className={`text-xl font-bold tabular-nums ${s.val}`}>{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  )
}
