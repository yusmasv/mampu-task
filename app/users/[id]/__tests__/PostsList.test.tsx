import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostsList from '../PostsList'
import type { Post } from '../PostsList'

const makePosts = (n: number): Post[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    title: `Post title ${i + 1}`,
    body: `Post body ${i + 1}`,
  }))

describe('PostsList', () => {
  it('shows empty state when there are no posts', () => {
    render(<PostsList posts={[]} />)
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument()
  })

  it('renders all posts when count is at or below the initial limit', () => {
    render(<PostsList posts={makePosts(3)} />)
    expect(screen.getByText('Post title 1')).toBeInTheDocument()
    expect(screen.getByText('Post title 2')).toBeInTheDocument()
    expect(screen.getByText('Post title 3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /show all/i })).not.toBeInTheDocument()
  })

  it('hides posts beyond the initial limit', () => {
    render(<PostsList posts={makePosts(5)} />)
    expect(screen.getByText('Post title 1')).toBeInTheDocument()
    expect(screen.getByText('Post title 3')).toBeInTheDocument()
    expect(screen.queryByText('Post title 4')).not.toBeInTheDocument()
    expect(screen.queryByText('Post title 5')).not.toBeInTheDocument()
  })

  it('shows a "Show all N posts" button when posts exceed the initial limit', () => {
    render(<PostsList posts={makePosts(5)} />)
    expect(screen.getByRole('button', { name: /show all 5 posts/i })).toBeInTheDocument()
  })

  it('reveals all posts when the expand button is clicked', async () => {
    render(<PostsList posts={makePosts(5)} />)
    await userEvent.click(screen.getByRole('button', { name: /show all 5 posts/i }))
    expect(screen.getByText('Post title 4')).toBeInTheDocument()
    expect(screen.getByText('Post title 5')).toBeInTheDocument()
  })

  it('collapses back to the initial limit when "Show less" is clicked', async () => {
    render(<PostsList posts={makePosts(5)} />)
    await userEvent.click(screen.getByRole('button', { name: /show all/i }))
    await userEvent.click(screen.getByRole('button', { name: /show less/i }))
    expect(screen.queryByText('Post title 4')).not.toBeInTheDocument()
    expect(screen.queryByText('Post title 5')).not.toBeInTheDocument()
  })

  it('renders the post body text', () => {
    render(<PostsList posts={makePosts(1)} />)
    expect(screen.getByText('Post body 1')).toBeInTheDocument()
  })
})
