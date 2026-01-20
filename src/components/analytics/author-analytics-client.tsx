'use client';

import { useState } from 'react';
import { AuthorProductivityChart, AuthorKeywordsCard } from '@/components/authors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users } from 'lucide-react';
import type { AuthorWithStats } from '@/types/api';
import type { SiteFilter } from '@/components/dashboard/site-selector';

interface AuthorAnalyticsClientProps {
  readonly authors: AuthorWithStats[];
  readonly selectedAuthor?: string;
  readonly site: SiteFilter;
}

export function AuthorAnalyticsClient({ authors, selectedAuthor: initialAuthor, site }: AuthorAnalyticsClientProps) {
  // Validate that initialAuthor exists in the authors list, otherwise select first author
  const authorExists = initialAuthor && authors.some(a => a.author === initialAuthor);
  let defaultAuthor: string | undefined;
  if (authorExists) {
    defaultAuthor = initialAuthor;
  } else if (authors.length > 0) {
    defaultAuthor = authors[0].author;
  }
  const [selectedAuthor, setSelectedAuthor] = useState<string | undefined>(defaultAuthor);

  // When "all" sites is selected, show message to select a specific site
  if (site === 'all') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">Select a Site</h3>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            Please select either <strong>Shega</strong> or <strong>Addis Insight</strong> from the site filter above to view author productivity and keyword analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Author Dropdown Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Author
          </CardTitle>
          <CardDescription>
            Choose an author to view their productivity and keyword analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedAuthor || ''} onValueChange={setSelectedAuthor}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select an author..." />
            </SelectTrigger>
            <SelectContent>
              {authors.map((author) => (
                <SelectItem key={`${author.author}-${author.site}`} value={author.author}>
                  <div className="flex items-center gap-2">
                    <span>{author.author}</span>
                    <span className="text-xs text-muted-foreground">
                      ({author.article_count} articles)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Author Analytics - Stacked Layout */}
      {selectedAuthor ? (
        <div className="space-y-6">
          <AuthorProductivityChart author={selectedAuthor} site={site} />
          <AuthorKeywordsCard author={selectedAuthor} />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">Select an Author</h3>
            <p className="text-muted-foreground text-sm text-center max-w-md">
              Use the dropdown above to select an author and view their productivity graph and keyword analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
