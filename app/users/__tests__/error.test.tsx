import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorPage from '../error'

const mockRetry = jest.fn()
const testError = new Error('Failed to fetch users (500)')

beforeEach(() => mockRetry.mockClear())

describe('Users error boundary', () => {
  it('renders the error message', () => {
    render(<ErrorPage error={testError} unstable_retry={mockRetry} />)
    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch users (500)')).toBeInTheDocument()
  })

  it('calls unstable_retry when the Try again button is clicked', async () => {
    render(<ErrorPage error={testError} unstable_retry={mockRetry} />)
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(mockRetry).toHaveBeenCalledTimes(1)
  })
})
