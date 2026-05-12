import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodosList from '../TodosList'
import type { Todo } from '../TodosList'

const PENDING: Todo[] = [
  { id: 1, title: 'Buy groceries', completed: false },
  { id: 2, title: 'Exercise', completed: false },
]

const DONE: Todo[] = [
  { id: 3, title: 'Read book', completed: true },
  { id: 4, title: 'Call dentist', completed: true },
]

const ALL = [...PENDING, ...DONE]

describe('TodosList', () => {
  it('shows empty state when there are no todos', () => {
    render(<TodosList todos={[]} />)
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument()
  })

  it('renders pending todos', () => {
    render(<TodosList todos={ALL} />)
    expect(screen.getByRole('list', { name: /pending todos/i })).toBeInTheDocument()
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Exercise')).toBeInTheDocument()
  })

  it('does not render completed todos before expanding', () => {
    render(<TodosList todos={ALL} />)
    expect(screen.queryByText('Read book')).not.toBeInTheDocument()
    expect(screen.queryByText('Call dentist')).not.toBeInTheDocument()
  })

  it('shows the completed count in the toggle button', () => {
    render(<TodosList todos={ALL} />)
    const toggle = screen.getByRole('button', { name: /completed/i })
    expect(toggle).toHaveTextContent('2')
  })

  it('reveals completed todos after clicking the toggle', async () => {
    render(<TodosList todos={ALL} />)
    await userEvent.click(screen.getByRole('button', { name: /completed/i }))
    expect(
      screen.getByRole('list', { name: /completed todos/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Read book')).toBeInTheDocument()
    expect(screen.getByText('Call dentist')).toBeInTheDocument()
  })

  it('hides completed todos again after a second toggle click', async () => {
    render(<TodosList todos={ALL} />)
    const btn = screen.getByRole('button', { name: /completed/i })
    await userEvent.click(btn)
    await userEvent.click(btn)
    expect(screen.queryByText('Read book')).not.toBeInTheDocument()
  })

  it('renders only pending section when all todos are pending', () => {
    render(<TodosList todos={PENDING} />)
    expect(screen.getByRole('list', { name: /pending todos/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /completed/i })).not.toBeInTheDocument()
  })

  it('renders only the completed toggle when all todos are done', () => {
    render(<TodosList todos={DONE} />)
    expect(screen.queryByRole('list', { name: /pending todos/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument()
  })
})
