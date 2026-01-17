import { Suspense } from 'react';
import { ArticlesList } from '@/components/articles/articles-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { GlobalFilters } from '@/components/filters/global-filters';

export const dynamic = 'force-dynamic';

interface ArticlesPageProps {
  readonly searchParams: Promise<{
    page?: string;
    site?: string;
    search?: string;
    category?: string;
    author?: string;
    keyword?: string;
    topic_label?: string;
    sentiment?: string;
    content_length?: string;
    date_range?: string;
    sort_by?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
        <p className="text-muted-foreground mt-1">
          Browse and search all articles from Shega and Addis Insight
        </p>
      </div>

      {/* Enhanced Filters */}
      <GlobalFilters 
        showSearch={true}
        showSite={true}
        showDateRange={true}
        showSentiment={true}
        showContentLength={true}
        showSort={true}
      />

      {/* Articles List */}
      <Suspense fallback={<ArticlesListSkeleton />}>
        <ArticlesList
          page={params.page ? Number.parseInt(params.page, 10) : 1}
          site={params.site as 'shega' | 'addis_insight' | undefined}
          search={params.search}
          category={params.category}
          author={params.author}
          keyword={params.keyword}
          topicLabel={params.topic_label}
          sentiment={params.sentiment as 'positive' | 'negative' | 'neutral' | undefined}
          contentLength={params.content_length as 'short' | 'medium' | 'long' | undefined}
          dateRange={params.date_range}
          sortBy={params.sort_by as 'recent' | 'oldest' | 'positive' | 'negative' | 'long' | 'short' | undefined}
        />
      </Suspense>
    </div>
  );
}

function ArticlesListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={`skeleton-${i}`} className="p-4">
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
