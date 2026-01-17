import { articleDrillDownAPI } from '@/lib/api';
import { ArticleCard } from './article-card';
import { ArticlesPagination } from './articles-pagination';
import type { Site } from '@/types/api';

interface ArticlesListProps {
  readonly page: number;
  readonly site?: Site;
  readonly search?: string;
  readonly category?: string;
  readonly author?: string;
  readonly keyword?: string;
  readonly topicLabel?: string;
  readonly sentiment?: 'positive' | 'negative' | 'neutral';
  readonly contentLength?: 'short' | 'medium' | 'long';
  readonly dateRange?: string;
  readonly sortBy?: 'recent' | 'oldest' | 'positive' | 'negative' | 'long' | 'short';
}

export async function ArticlesList({ 
  page, 
  site, 
  search, 
  category,
  author,
  keyword,
  topicLabel,
  sentiment,
  contentLength,
  dateRange,
  sortBy,
}: ArticlesListProps) {
  const perPage = 10;
  
  let data;
  try {
    data = await articleDrillDownAPI.getList({
      page,
      per_page: perPage,
      site,
      search,
      category,
      author,
      keyword,
      topic_label: topicLabel,
      sentiment,
      content_length: contentLength,
      date_range: dateRange,
      sort_by: sortBy,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          Unable to load articles. Please check if the API is running.
        </p>
      </div>
    );
  }

  if (data.articles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No articles found matching your criteria.
        </p>
      </div>
    );
  }

  const totalPages = data.pagination.total_pages;

  return (
    <div className="space-y-4">
      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, data.pagination.total)} of {data.pagination.total.toLocaleString()} articles
      </p>

      {/* Articles */}
      <div className="space-y-4">
        {data.articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <ArticlesPagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}
