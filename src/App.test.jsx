import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./components/ModelViewer', () => ({
  ModelViewer: ({ landmarkName }) => <div data-testid="model-viewer">{landmarkName} 三维模型</div>,
}))

describe('Red Army Street explorer', () => {
  it('shows exactly five modeled landmarks on the map', () => {
    render(<App />)

    expect(screen.getAllByRole('button', { name: /查看.+三维模型/ })).toHaveLength(5)
    expect(screen.getByRole('img', { name: /哈达铺红军街空间故事线地图/ })).toBeInTheDocument()
  })

  it('opens the matching landmark story and model', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '查看关帝庙三维模型' }))

    expect(screen.getByRole('dialog', { name: '关帝庙' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '关帝庙' })).toBeInTheDocument()
    expect(screen.getByTestId('model-viewer')).toHaveTextContent('关帝庙 三维模型')
    expect(screen.getByText(/关帝庙旧建筑/)).toHaveTextContent('到陕北去')
  })

  it('closes with Escape and restores focus to the originating hotspot', () => {
    render(<App />)
    const hotspot = screen.getByRole('button', { name: '查看张家大院三维模型' })

    fireEvent.click(hotspot)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(hotspot).toHaveFocus()
  })
})
