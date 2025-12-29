/**
 * Sheet Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

describe('Sheet Component', () => {
  it('renders sheet trigger', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <p>Sheet Content</p>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Open Sheet')).toBeInTheDocument();
  });

  it('opens sheet on trigger click', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <p>Sheet Content</p>
        </SheetContent>
      </Sheet>
    );

    fireEvent.click(screen.getByText('Open Sheet'));
    expect(screen.getByText('Sheet Content')).toBeInTheDocument();
  });

  it('renders sheet content when open', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <p>Sheet Content</p>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Sheet Content')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <p>Content</p>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('renders sheet header', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Sheet Description')).toBeInTheDocument();
  });

  it('renders sheet footer', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetFooter>
            <button>Save</button>
            <button>Cancel</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders with side="right" by default', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent data-testid="sheet-content">
          <p>Content</p>
        </SheetContent>
      </Sheet>
    );

    const content = document.querySelector('[data-slot="sheet-content"]');
    expect(content).toBeInTheDocument();
  });

  it('renders with side="left"', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left">
          <p>Left Content</p>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Left Content')).toBeInTheDocument();
  });

  it('renders with side="top"', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="top">
          <p>Top Content</p>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Top Content')).toBeInTheDocument();
  });

  it('renders with side="bottom"', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="bottom">
          <p>Bottom Content</p>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Bottom Content')).toBeInTheDocument();
  });

  it('applies custom className to content', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent className="custom-sheet">
          <p>Content</p>
        </SheetContent>
      </Sheet>
    );

    expect(document.querySelector('.custom-sheet')).toBeInTheDocument();
  });

  it('applies custom className to header', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader className="custom-header">
            <SheetTitle>Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );

    expect(document.querySelector('.custom-header')).toBeInTheDocument();
  });

  it('applies custom className to footer', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetFooter className="custom-footer">
            <button>Button</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    expect(document.querySelector('.custom-footer')).toBeInTheDocument();
  });

  it('applies custom className to title', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="custom-title">Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );

    expect(document.querySelector('.custom-title')).toBeInTheDocument();
  });

  it('applies custom className to description', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetDescription className="custom-desc">Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );

    expect(document.querySelector('.custom-desc')).toBeInTheDocument();
  });

  it('renders SheetClose component', () => {
    render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetClose data-testid="custom-close">Close Sheet</SheetClose>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByTestId('custom-close')).toBeInTheDocument();
  });
});
