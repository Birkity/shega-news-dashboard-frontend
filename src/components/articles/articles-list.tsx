import { articlesAPI } from '@/lib/api';
import { ArticleCard } from './article-card';
import { ArticlesPagination } from './articles-pagination';
import type { Site } from '@/types/api';

interface ArticlesListProps {
  page: number;
  site?: Site;
  search?: string;
  category?: string;
}

export async function ArticlesList({ page, site, search, category }: ArticlesListProps) {
  const perPage = 10;
  
  let data;
  try {
    data = await articlesAPI.getArticles({
      page,
      per_page: perPage,
      site,
      search,
      category,
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

  const totalPages = Math.ceil(data.total / perPage);

  return (
    <div className="space-y-4">
      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, data.total)} of {data.total.toLocaleString()} articles
      </p>

      {/* Articles */}
      <div className="space-y-4">
        {data.articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <ArticlesPagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}
