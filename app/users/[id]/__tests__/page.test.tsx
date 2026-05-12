import { render, screen } from '@testing-library/react'
import UserDetailPage from '../page'

const mockNotFound = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}))

const MOCK_USER = {
  id: 1,
  name: 'Alice Smith',
  username: 'alice',
  email: 'alice@example.com',
  phone: '555-0100',
  website: 'alice.com',
  address: { street: 'Maple St', suite: 'Apt 1', city: 'Springfield', zipcode: '12345' },
  company: { name: 'Acme Corp', catchPhrase: 'Making things better' },
}

const MOCK_POSTS = [
  { id: 1, title: 'First post', body: 'First body' },
  { id: 2, title: 'Second post', body: 'Second body' },
  { id: 3, title: 'Third post', body: 'Third body' },
  { id: 4, title: 'Fourth post', body: 'Fourth body' },
]

const MOCK_TODOS = [
  { id: 1, title: 'Buy groceries', completed: false },
  { id: 2, title: 'Read book', completed: true },
  { id: 3, title: 'Exercise', completed: false },
]

function mockFetch(opts: { user?: unknown; posts?: unknown; todos?: unknown } = {}) {
  ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
    const ok = (data: unknown) =>
      Promise.resolve({ ok: true, status: 200, json: async () => data })

    if (/\/users\/\d+\/posts/.test(url)) return ok(opts.posts ?? MOCK_POSTS)
    if (/\/users\/\d+\/todos/.test(url)) return ok(opts.todos ?? MOCK_TODOS)
    if (/\/users\/\d+$/.test(url)) return ok(opts.user ?? MOCK_USER)
    return Promise.reject(new Error(`Unexpected URL: ${url}`))
  })
}

function renderPage(id = '1', back = '') {
  return UserDetailPage({
    params: Promise.resolve({ id }),
    searchParams: Promise.resolve(back ? { back: encodeURIComponent(back) } : {}),
  })
}

beforeEach(() => {
  global.fetch = jest.fn()
  mockNotFound.mockClear()
})

afterEach(() => {
  jest.restoreAllMocks()
})

// ─── User identity ────────────────────────────────────────────────────────────

describe('user identity', () => {
  it('renders the user name and username', async () => {
    mockFetch()
    render(await renderPage())
    expect(screen.getByRole('heading', { name: 'Alice Smith' })).toBeInTheDocument()
    expect(screen.getByText('@alice')).toBeInTheDocument()
  })

  it('renders contact fields', async () => {
    mockFetch()
    render(await renderPage())
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('555-0100')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /alice\.com/i })).toBeInTheDocument()
  })

  it('renders address fields', async () => {
    mockFetch()
    render(await renderPage())
    expect(screen.getByText(/Maple St/)).toBeInTheDocument()
    expect(screen.getByText('Springfield')).toBeInTheDocument()
    expect(screen.getByText('12345')).toBeInTheDocument()
  })

  it('renders company fields', async () => {
    mockFetch()
    render(await renderPage())
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText(/Making things better/)).toBeInTheDocument()
  })
})

// ─── Activity strip ───────────────────────────────────────────────────────────

describe('activity strip', () => {
  it('shows post count', async () => {
    mockFetch()
    render(await renderPage())
    // MOCK_POSTS has 4 items — getAllByText handles any duplicate nodes
    expect(screen.getAllByText('4')[0]).toBeInTheDocument()
  })

  it('shows completed todo count', async () => {
    mockFetch()
    render(await renderPage())
    // 1 completed todo in MOCK_TODOS
    expect(screen.getAllByText('1')[0]).toBeInTheDocument()
  })

  it('shows pending todo count', async () => {
    mockFetch()
    render(await renderPage())
    // 2 pending todos in MOCK_TODOS
    expect(screen.getAllByText('2')[0]).toBeInTheDocument()
  })
})

// ─── Posts section ────────────────────────────────────────────────────────────

describe('posts section', () => {
  it('renders the posts section heading', async () => {
    mockFetch()
    render(await renderPage())
    expect(screen.getByRole('region', { name: /posts/i })).toBeInTheDocument()
  })

  it('shows the initial 3 posts', async () => {
    mockFetch()
    render(await renderPage())
    expect(screen.getByText('First post')).toBeInTheDocument()
    expect(screen.getByText('Second post')).toBeInTheDocument()
    expect(screen.getByText('Third post')).toBeInTheDocument()
    expect(screen.queryByText('Fourth post')).not.toBeInTheDocument()
  })
})

// ─── Todos section ────────────────────────────────────────────────────────────

describe('todos section', () => {
  it('renders the todos section heading', async () => {
    mockFetch()
    render(await renderPage())
    expect(screen.getByRole('region', { name: /todos/i })).toBeInTheDocument()
  })

  it('shows pending todos', async () => {
    mockFetch()
    render(await renderPage())
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Exercise')).toBeInTheDocument()
  })

  it('does not show completed todos before expanding', async () => {
    mockFetch()
    render(await renderPage())
    expect(screen.queryByText('Read book')).not.toBeInTheDocument()
  })
})

// ─── Back link ────────────────────────────────────────────────────────────────

describe('back link', () => {
  it('uses /users as default when no back param is provided', async () => {
    mockFetch()
    render(await renderPage('1', ''))
    const link = screen.getByRole('link', { name: /back to list/i })
    expect(link).toHaveAttribute('href', '/users')
  })

  it('uses the decoded back param when provided', async () => {
    mockFetch()
    render(await renderPage('1', '/users?q=alice&filter=has_pending'))
    const link = screen.getByRole('link', { name: /back to list/i })
    expect(link).toHaveAttribute('href', '/users?q=alice&filter=has_pending')
  })

  it('falls back to /users when back param points outside /users', async () => {
    mockFetch()
    render(await renderPage('1', 'https://evil.com'))
    const link = screen.getByRole('link', { name: /back to list/i })
    expect(link).toHaveAttribute('href', '/users')
  })
})

// ─── Not found / invalid ID ───────────────────────────────────────────────────

describe('not found and invalid id', () => {
  it('calls notFound() when the user endpoint returns 404', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (/\/users\/\d+$/.test(url))
        return Promise.resolve({ ok: false, status: 404, json: async () => ({}) })
      return Promise.resolve({ ok: true, json: async () => [] })
    })
    await expect(renderPage('999')).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('calls notFound() when the response body has no id (non-numeric slug)', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (/\/users\/\d+$/.test(url))
        return Promise.resolve({ ok: true, status: 200, json: async () => ({}) })
      return Promise.resolve({ ok: true, json: async () => [] })
    })
    await expect(renderPage('abc')).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('throws a fetch error (not notFound) when the server errors with 500', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (/\/users\/\d+$/.test(url))
        return Promise.resolve({ ok: false, status: 500, json: async () => ({}) })
      return Promise.resolve({ ok: true, json: async () => [] })
    })
    await expect(renderPage('1')).rejects.toThrow('Failed to fetch user (500)')
    expect(mockNotFound).not.toHaveBeenCalled()
  })
})
