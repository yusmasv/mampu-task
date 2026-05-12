import { render, screen } from '@testing-library/react'
import NotFound from '../not-found'

describe('User not-found page', () => {
  it('renders a "User not found" message', () => {
    render(<NotFound />)
    expect(screen.getByRole('heading', { name: /user not found/i })).toBeInTheDocument()
  })

  it('renders a back link to the users list', () => {
    render(<NotFound />)
    expect(screen.getByRole('link', { name: /back to list/i })).toHaveAttribute(
      'href',
      '/users'
    )
  })

  it('renders a "Browse all users" CTA link', () => {
    render(<NotFound />)
    expect(
      screen.getByRole('link', { name: /browse all users/i })
    ).toHaveAttribute('href', '/users')
  })
})
