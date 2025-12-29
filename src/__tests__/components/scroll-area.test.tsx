/**
 * ScrollArea Component Tests
 * Tests for the ScrollArea component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

describe('ScrollArea Component', () => {
  it('renders scroll area with children', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div>Scrollable content</div>
      </ScrollArea>
    );

    expect(screen.getByText('Scrollable content')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <ScrollArea className="custom-class" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    expect(screen.getByTestId('scroll-area')).toHaveClass('custom-class');
  });

  it('renders vertical scrollbar by default', () => {
    render(
      <ScrollArea>
        <div style={{ height: '1000px' }}>Tall content</div>
      </ScrollArea>
    );

    expect(screen.getByText('Tall content')).toBeInTheDocument();
  });

  it('renders with explicit ScrollBar', () => {
    render(
      <ScrollArea>
        <div>Content</div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders horizontal scrollbar', () => {
    render(
      <ScrollArea>
        <div style={{ width: '2000px' }}>Wide content</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );

    expect(screen.getByText('Wide content')).toBeInTheDocument();
  });

  it('applies custom className to ScrollBar', () => {
    render(
      <ScrollArea>
        <div>Content</div>
        <ScrollBar className="custom-scrollbar" data-testid="scrollbar" />
      </ScrollArea>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles long list of items', () => {
    const items = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);
    
    render(
      <ScrollArea style={{ height: '200px' }}>
        {items.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </ScrollArea>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 50')).toBeInTheDocument();
  });

  it('works with different content types', () => {
    render(
      <ScrollArea>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
        <p>Paragraph content</p>
      </ScrollArea>
    );

    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph content')).toBeInTheDocument();
  });
});
