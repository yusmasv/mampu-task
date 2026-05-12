import { render, screen } from '@testing-library/react'
import UsersPage from '../page'
import type { EnrichedUser } from '../page'

// Mock UsersClient to isolate server-component data logic from client hooks
jest.mock('../UsersClient', () => ({
  __esModule: true,
  default: ({ users }: { users: EnrichedUser[] }) => (
    <ul aria-label="user-list">
      {users.map((u) => (
        <li key={u.id} aria-label={u.name}>
          {u.name}|posts={u.totalPosts}|done={u.completedTodos}|pending={u.pendingTodos}
        </li>
      ))}
    </ul>
  ),
}))

const RAW_USERS = [
  { id: 1, name: 'Alice', email: 'alice@a.com', website: 'a.com' },
  { id: 2, name: 'Bob', email: 'bob@b.com', website: 'b.com' },
]
// Alice: 2 posts — Bob: 1 post
const RAW_POSTS = [
  { userId: 1, id: 1 },
  { userId: 1, id: 2 },
  { userId: 2, id: 3 },
]
// Alice: 1 done, 2 pending — Bob: 2 done, 0 pending
const RAW_TODOS = [
  { userId: 1, id: 1, completed: true },
  { userId: 1, id: 2, completed: false },
  { userId: 1, id: 3, completed: false },
  { userId: 2, id: 4, completed: true },
  { userId: 2, id: 5, completed: true },
]

function mockFetch(overrides: Partial<Record<'users' | 'posts' | 'todos', unknown>> = {}) {
  ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
    const ok = (data: unknown) =>
      Promise.resolve({ ok: true, status: 200, json: async () => data })

    if (url.endsWith('/users')) return ok(overrides.users ?? RAW_USERS)
    if (url.endsWith('/posts')) return ok(overrides.posts ?? RAW_POSTS)
    if (url.endsWith('/todos')) return ok(overrides.todos ?? RAW_TODOS)
    return Promise.reject(new Error(`Unexpected URL: ${url}`))
  })
}

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  jest.restoreAllMocks()
})

// ─── Data fetching ────────────────────────────────────────────────────────────

describe('UsersPage data fetching', () => {
  it('fetches users, posts, and todos', async () => {
    mockFetch()
    await UsersPage().then((el) => render(el))
    expect(global.fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/users'
    )
    expect(global.fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/posts'
    )
    expect(global.fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos'
    )
  })

  it('renders the page heading', async () => {
    mockFetch()
    render(await UsersPage())
    expect(screen.getByRole('heading', { name: /users/i })).toBeInTheDocument()
  })
})

// ─── Activity signal enrichment ───────────────────────────────────────────────

describe('activity signal enrichment', () => {
  it('computes totalPosts per user', async () => {
    mockFetch()
    render(await UsersPage())
    const alice = screen.getByRole('listitem', { name: 'Alice' })
    expect(alice.textContent).toContain('posts=2')
    const bob = screen.getByRole('listitem', { name: 'Bob' })
    expect(bob.textContent).toContain('posts=1')
  })

  it('computes completedTodos per user', async () => {
    mockFetch()
    render(await UsersPage())
    expect(screen.getByRole('listitem', { name: 'Alice' }).textContent).toContain('done=1')
    expect(screen.getByRole('listitem', { name: 'Bob' }).textContent).toContain('done=2')
  })

  it('computes pendingTodos per user', async () => {
    mockFetch()
    render(await UsersPage())
    expect(screen.getByRole('listitem', { name: 'Alice' }).textContent).toContain('pending=2')
    expect(screen.getByRole('listitem', { name: 'Bob' }).textContent).toContain('pending=0')
  })

  it('defaults all counts to 0 for a user with no posts or todos', async () => {
    mockFetch({ posts: [], todos: [] })
    render(await UsersPage())
    const alice = screen.getByRole('listitem', { name: 'Alice' })
    expect(alice.textContent).toContain('posts=0')
    expect(alice.textContent).toContain('done=0')
    expect(alice.textContent).toContain('pending=0')
  })
})

// ─── Error states ─────────────────────────────────────────────────────────────

describe('error states', () => {
  it('throws when the users endpoint returns a non-ok response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    })
    await expect(UsersPage()).rejects.toThrow('Failed to fetch users (500)')
  })

  it('throws when the posts endpoint fails', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.endsWith('/users'))
        return Promise.resolve({ ok: true, json: async () => RAW_USERS })
      return Promise.resolve({ ok: false, status: 503, json: async () => ({}) })
    })
    await expect(UsersPage()).rejects.toThrow('Failed to fetch posts (503)')
  })
})
