import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/plp/ProductCard'
import type { Product } from '@/lib/api/types'

const base: Product = {
  uid: '1',
  name: 'Cozy Wool Sweater',
  url: 'https://shop.example/p/1',
  imageUrl: 'https://shop.example/img/1.jpg',
  price: 50,
  brand: 'Acme',
}

describe('ProductCard', () => {
  it('renders price without strikethrough when no msrp', () => {
    render(<ProductCard product={base} />)
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument()
  })

  it('shows strikethrough and discount badge when msrp > price', () => {
    render(<ProductCard product={{ ...base, msrp: 100 }} />)
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    const msrp = screen.getByText('$100.00')
    expect(msrp).toHaveClass('line-through')
    expect(screen.getByText('-50%')).toBeInTheDocument()
  })

  it('does not show strikethrough when msrp <= price', () => {
    render(<ProductCard product={{ ...base, msrp: 50 }} />)
    expect(screen.queryByText(/line-through/)).not.toBeInTheDocument()
  })

  it('renders fallback when image is missing', () => {
    render(<ProductCard product={{ ...base, imageUrl: undefined }} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
