import { render, screen } from '@testing-library/react'
import Loading from '../loading'

describe('Users loading skeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<Loading />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders shimmer elements', () => {
    const { container } = render(<Loading />)
    expect(container.querySelectorAll('.shimmer').length).toBeGreaterThan(0)
  })
})
