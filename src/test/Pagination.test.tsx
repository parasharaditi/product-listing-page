import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '@/components/plp/Pagination'

describe('Pagination', () => {
  it('renders nothing when there is one page or fewer', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={() => {}} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders every page when total <= 7 (no ellipsis)', () => {
    render(<Pagination page={2} totalPages={5} onPageChange={() => {}} />)
    for (const n of [1, 2, 3, 4, 5]) {
      expect(screen.getByRole('button', { name: `Go to page ${n}` })).toBeInTheDocument()
    }
    expect(screen.queryByText('…')).not.toBeInTheDocument()
  })

  it('inserts ellipsis when total > 7 and current page is in the middle', () => {
    render(<Pagination page={10} totalPages={20} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 20' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to page 10' })).toBeInTheDocument()
    expect(screen.getAllByText('…').length).toBe(2)
  })

  it('marks the current page with aria-current="page"', () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />)
    const current = screen.getByRole('button', { name: 'Go to page 3' })
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('disables Prev on the first page and Next on the last page', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={5} onPageChange={() => {}} />,
    )
    const prev = screen.getByRole('button', { name: 'Previous page' })
    expect(prev).toHaveAttribute('aria-disabled', 'true')
    expect(prev).toHaveAttribute('tabindex', '-1')

    rerender(<Pagination page={5} totalPages={5} onPageChange={() => {}} />)
    const next = screen.getByRole('button', { name: 'Next page' })
    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(next).toHaveAttribute('tabindex', '-1')
  })

  it('calls onPageChange with the right page when a number is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination page={2} totalPages={5} onPageChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Go to page 4' }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('calls onPageChange with page-1 / page+1 for Prev / Next', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination page={3} totalPages={5} onPageChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onChange).toHaveBeenNthCalledWith(1, 2)
    expect(onChange).toHaveBeenNthCalledWith(2, 4)
  })
})
