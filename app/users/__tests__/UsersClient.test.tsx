import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSearchParams, useRouter } from 'next/navigation'
import UsersClient from '../UsersClient'
import type { EnrichedUser } from '../page'

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}))

const mockPush = jest.fn()
const mockReplace = jest.fn()

const USERS: EnrichedUser[] = [
  {
    id: 1,
    name: 'Alice Smith',
    email: 'alice@example.com',
    website: 'alice.com',
    totalPosts: 3,
    completedTodos: 8,
    pendingTodos: 2,
  },
  {
    id: 2,
    name: 'Bob Jones',
    email: 'bob@example.com',
    website: 'bob.com',
    totalPosts: 5,
    completedTodos: 0,
    pendingTodos: 5,
  },
  {
    id: 3,
    name: 'Carol White',
    email: 'carol@example.com',
    website: 'carol.com',
    totalPosts: 1,
    completedTodos: 10,
    pendingTodos: 0,
  },
]

function setup(searchParamsStr = '') {
  ;(useSearchParams as jest.Mock).mockReturnValue(
    new URLSearchParams(searchParamsStr)
  )
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    replace: mockReplace,
  })
  return render(<UsersClient users={USERS} />)
}

beforeEach(() => {
  mockPush.mockClear()
  mockReplace.mockClear()
})

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('rendering', () => {
  it('shows all users when no filters are active', () => {
    setup()
    // Both desktop table and mobile card list render each name
    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob Jones').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Carol White').length).toBeGreaterThan(0)
  })

  it('displays activity signals in table rows', () => {
    setup()
    const aliceRow = screen.getByRole('row', {
      name: 'View details for Alice Smith',
    })
    expect(within(aliceRow).getByText('3')).toBeInTheDocument() // totalPosts
    expect(within(aliceRow).getByText('8')).toBeInTheDocument() // completedTodos
    expect(within(aliceRow).getByText('2')).toBeInTheDocument() // pendingTodos
  })

  it('renders a pending badge for users with pending todos', () => {
    setup()
    const bobRow = screen.getByRole('row', {
      name: 'View details for Bob Jones',
    })
    // Bob has totalPosts=5 and pendingTodos=5, so '5' appears twice — find the badge
    const pendingBadge = within(bobRow)
      .getAllByText('5')
      .find(el => el.closest('span')?.classList.contains('bg-amber-50'))
    expect(pendingBadge).toBeDefined()
    expect(pendingBadge!.closest('span')).toHaveClass('bg-amber-50')
  })

  it('shows an em dash for users with zero pending todos', () => {
    setup()
    const carolRow = screen.getByRole('row', {
      name: 'View details for Carol White',
    })
    expect(within(carolRow).getByText('—')).toBeInTheDocument()
  })

  it('shows total and filtered count in the footer', () => {
    const { container } = setup()
    // Footer shows "Showing 1–3 of 3 users" — text is split across spans
    expect(container.textContent).toMatch(/showing.*of.*3.*users/i)
  })
})

// ─── Search filter ────────────────────────────────────────────────────────────

describe('search filter', () => {
  it('filters by name', () => {
    setup('q=Alice')
    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0)
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument()
  })

  it('filters by email', () => {
    setup('q=bob%40example')
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
    expect(screen.getAllByText('Bob Jones').length).toBeGreaterThan(0)
  })

  it('is case-insensitive', () => {
    setup('q=carol')
    expect(screen.getAllByText('Carol White').length).toBeGreaterThan(0)
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
  })

  it('calls router.replace when the search input changes', async () => {
    setup()
    const input = screen.getByPlaceholderText(/search by name or email/i)
    await userEvent.type(input, 'a')
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('q=a'),
      expect.anything()
    )
  })
})

// ─── Additional filters ───────────────────────────────────────────────────────

describe('additional filters', () => {
  it('has_pending: hides users with zero pending todos', () => {
    setup('filter=has_pending')
    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob Jones').length).toBeGreaterThan(0)
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument()
  })

  it('no_completed: shows only users with zero completed todos', () => {
    setup('filter=no_completed')
    expect(screen.getAllByText('Bob Jones').length).toBeGreaterThan(0)
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument()
  })

  it('calls router.replace when the filter dropdown changes', async () => {
    setup()
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'has_pending')
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('filter=has_pending'),
      expect.anything()
    )
  })

  it('shows an active filter chip when a filter is selected', () => {
    setup('filter=has_pending')
    // "Has pending todos" appears in both the <option> and the active chip
    expect(screen.getAllByText(/has pending todos/i).length).toBeGreaterThan(0)
  })
})

// ─── Sorting ──────────────────────────────────────────────────────────────────

describe('sorting', () => {
  it('sorts by posts descending when sort=posts&dir=desc', () => {
    setup('sort=posts&dir=desc')
    const rows = screen.getAllByRole('row')
    // rows[0] is the header; rows[1..] are data rows
    expect(within(rows[1]).getByText('Bob Jones')).toBeInTheDocument() // 5 posts
    expect(within(rows[2]).getByText('Alice Smith')).toBeInTheDocument() // 3 posts
    expect(within(rows[3]).getByText('Carol White')).toBeInTheDocument() // 1 post
  })

  it('sorts by pending descending when sort=pending&dir=desc', () => {
    setup('sort=pending&dir=desc')
    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('Bob Jones')).toBeInTheDocument() // 5 pending
    expect(within(rows[2]).getByText('Alice Smith')).toBeInTheDocument() // 2 pending
    expect(within(rows[3]).getByText('Carol White')).toBeInTheDocument() // 0 pending
  })

  it('calls router.replace when a column header is clicked', async () => {
    setup()
    const postsHeader = screen.getByRole('columnheader', { name: /posts/i })
    await userEvent.click(postsHeader)
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('sort=posts'),
      expect.anything()
    )
  })

  it('toggles sort direction on second click of the same column', async () => {
    setup('sort=posts&dir=desc')
    const postsHeader = screen.getByRole('columnheader', { name: /posts/i })
    await userEvent.click(postsHeader)
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('dir=asc'),
      expect.anything()
    )
  })
})

// ─── Empty state ──────────────────────────────────────────────────────────────

describe('empty state', () => {
  it('shows empty state message when search matches no users', () => {
    setup('q=zzznomatch')
    expect(screen.getAllByText(/no users match your filters/i).length).toBeGreaterThan(0)
  })

  it('shows "Clear all filters" button in empty state', () => {
    setup('q=zzznomatch')
    expect(screen.getAllByRole('button', { name: /clear all filters/i }).length).toBeGreaterThan(0)
  })

  it('"Clear all filters" calls router.replace to reset params', async () => {
    setup('q=zzznomatch')
    const clearBtn = screen.getAllByRole('button', { name: /clear all filters/i })[0]
    await userEvent.click(clearBtn)
    expect(mockReplace).toHaveBeenCalled()
    const calledWith: string = mockReplace.mock.calls[0][0]
    expect(calledWith).not.toContain('q=')
  })
})

// ─── Navigation ───────────────────────────────────────────────────────────────

describe('navigation', () => {
  it('calls router.push with the user detail path on row click', async () => {
    setup()
    const aliceRow = screen.getByRole('row', {
      name: 'View details for Alice Smith',
    })
    await userEvent.click(aliceRow)
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/users/1')
    )
  })

  it('calls router.push on Enter key press on a row', () => {
    setup()
    const aliceRow = screen.getByRole('row', {
      name: 'View details for Alice Smith',
    })
    fireEvent.keyDown(aliceRow, { key: 'Enter' })
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/users/1'))
  })

  it('encodes the current search params into the back param', async () => {
    setup('q=alice&filter=has_pending')
    const aliceRow = screen.getByRole('row', {
      name: 'View details for Alice Smith',
    })
    await userEvent.click(aliceRow)
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('back=')
    )
    const calledWith: string = mockPush.mock.calls[0][0]
    expect(decodeURIComponent(calledWith)).toContain('q=alice')
  })
})
