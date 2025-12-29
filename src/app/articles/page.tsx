import { Suspense } from 'react';
import { ArticlesList } from '@/components/articles/articles-list';
import { ArticlesFilters } from '@/components/articles/articles-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

interface ArticlesPageProps {
  searchParams: Promise<{
    page?: string;
    site?: string;
    search?: string;
    category?: string;
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

      {/* Filters */}
      <ArticlesFilters />

      {/* Articles List */}
      <Suspense fallback={<ArticlesListSkeleton />}>
        <ArticlesList
          page={params.page ? parseInt(params.page) : 1}
          site={params.site as 'shega' | 'addis_insight' | undefined}
          search={params.search}
          category={params.category}
        />
      </Suspense>
    </div>
  );
}

function ArticlesListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
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
