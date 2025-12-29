/**
 * Extended Card Component Tests
 * Additional tests for Card component to increase coverage
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';

describe('Card Extended Tests', () => {
  it('renders Card with all subcomponents', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders CardAction with custom className', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardAction className="custom-action" data-testid="action">
            <button>Edit</button>
          </CardAction>
        </CardHeader>
      </Card>
    );

    expect(screen.getByTestId('action')).toHaveClass('custom-action');
  });

  it('renders CardDescription with custom className', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription className="custom-description" data-testid="desc">
            Description text
          </CardDescription>
        </CardHeader>
      </Card>
    );

    expect(screen.getByTestId('desc')).toHaveClass('custom-description');
  });

  it('renders CardContent with custom className', () => {
    render(
      <Card>
        <CardContent className="custom-content" data-testid="content">
          Content text
        </CardContent>
      </Card>
    );

    expect(screen.getByTestId('content')).toHaveClass('custom-content');
  });

  it('renders CardFooter with custom className', () => {
    render(
      <Card>
        <CardFooter className="custom-footer" data-testid="footer">
          Footer content
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
  });

  it('renders CardHeader with custom className', () => {
    render(
      <Card>
        <CardHeader className="custom-header" data-testid="header">
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    );

    expect(screen.getByTestId('header')).toHaveClass('custom-header');
  });

  it('renders CardTitle with custom className', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle className="custom-title" data-testid="title">
            Custom Title
          </CardTitle>
        </CardHeader>
      </Card>
    );

    expect(screen.getByTestId('title')).toHaveClass('custom-title');
  });

  it('renders Card with complex nested content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complex Card</CardTitle>
          <CardDescription>With nested elements</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </div>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </CardContent>
        <CardFooter>
          <button>Save</button>
          <button>Cancel</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders multiple CardActions', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Multi Action</CardTitle>
          <CardAction>
            <button>Edit</button>
            <button>Delete</button>
          </CardAction>
        </CardHeader>
      </Card>
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders Card with only CardContent', () => {
    render(
      <Card>
        <CardContent data-testid="content-only">
          Just content, no header or footer
        </CardContent>
      </Card>
    );

    expect(screen.getByTestId('content-only')).toBeInTheDocument();
    expect(screen.getByText('Just content, no header or footer')).toBeInTheDocument();
  });

  it('renders empty Card', () => {
    render(<Card data-testid="empty-card" />);
    expect(screen.getByTestId('empty-card')).toBeInTheDocument();
  });

  it('passes data attributes correctly', () => {
    render(
      <Card data-custom="test-value" data-testid="card-with-data">
        <CardContent>Content</CardContent>
      </Card>
    );

    expect(screen.getByTestId('card-with-data')).toHaveAttribute('data-custom', 'test-value');
  });
});
