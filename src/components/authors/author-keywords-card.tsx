'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { Tag, FileText, Hash, Heading } from 'lucide-react';
import { authorAnalyticsAPI } from '@/lib/api';
import type { AuthorKeywords } from '@/types/api';
import { cn } from '@/lib/utils';

interface AuthorKeywordsCardProps {
  readonly author: string;
}

interface TreemapDataItem {
  name: string;
  size: number;
  fill: string;
  [key: string]: string | number;
}

interface TreemapContentProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly name?: string;
  readonly size?: number;
  readonly fill?: string;
}

// Custom content renderer for treemap cells
function TreemapContent({ x = 0, y = 0, width = 0, height = 0, name = '', size = 0, fill = '#3b82f6' }: TreemapContentProps) {
  if (width < 30 || height < 20) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={3}
          ry={3}
          fill={fill}
          style={{
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
      </g>
    );
  }

  const fontSize = Math.min(12, Math.max(8, width / 8));
  const showSize = width > 50 && height > 35;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        ry={4}
        fill={fill}
        style={{
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - (showSize ? 6 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize={fontSize}
        fontWeight="600"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {name.length > 10 ? `${name.slice(0, 8)}...` : name}
      </text>
      {showSize && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize={fontSize - 2}
        >
          {size}
        </text>
      )}
    </g>
  );
}

interface TooltipPayloadItem {
  readonly payload?: {
    readonly name?: string;
    readonly size?: number;
  };
}

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: readonly TooltipPayloadItem[];
}

function KeywordTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="font-medium">{data?.name}</p>
        <p className="text-sm text-muted-foreground">{data?.size} articles</p>
      </div>
    );
  }
  return null;
}

// Color palette for treemap
const HEADLINE_COLORS = [
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
  '#60a5fa', '#93c5fd', '#bfdbfe', '#0ea5e9', '#0284c7',
];

const BODY_COLORS = [
  '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
  '#a78bfa', '#c4b5fd', '#ddd6fe', '#a855f7', '#9333ea',
];

export function AuthorKeywordsCard({ author }: AuthorKeywordsCardProps) {
  const [data, setData] = useState<AuthorKeywords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKeywords() {
      setLoading(true);
      setError(null);
      try {
        const result = await authorAnalyticsAPI.getKeywords(author, { limit: 20 });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch keywords');
      } finally {
        setLoading(false);
      }
    }

    fetchKeywords();
  }, [author]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Author Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || (!data.headline_keywords?.length && !data.body_keywords?.length)) {
    // Determine the site from the data
    const isAddisInsight = data?.stats?.sites?.includes('addis_insight');
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Keywords: {author}
          </CardTitle>
          <CardDescription>Topics and keywords this author writes about</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[350px] items-center justify-center text-center px-4">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">
              No keyword data available for this author
            </p>
            {isAddisInsight && (
              <p className="text-sm text-muted-foreground max-w-md">
                Addis Insight articles do not have keyword metadata in the database.
                Try viewing the <strong>Keywords Analytics</strong> page to see headline and body keywords extracted from all articles.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for treemap
  const headlineTreemapData: TreemapDataItem[] = data.headline_keywords.map((k, i) => ({
    name: k.keyword,
    size: k.count,
    fill: HEADLINE_COLORS[i % HEADLINE_COLORS.length],
  }));

  const bodyTreemapData: TreemapDataItem[] = data.body_keywords.map((k, i) => ({
    name: k.keyword,
    size: k.count,
    fill: BODY_COLORS[i % BODY_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Keywords: {author}
        </CardTitle>
        <CardDescription>Topics and keywords this author writes about</CardDescription>
        
        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Articles:</span>
            <span className="font-bold">{data.stats.total_articles}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Avg Keywords/Article:</span>
            <span className="font-bold">{data.stats.avg_keywords_per_article.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            {data.stats.sites.map(site => (
              <Badge 
                key={site} 
                variant="outline"
                className={cn(
                  site === 'shega' ? 'border-blue-500 text-blue-600' : 'border-red-500 text-red-600'
                )}
              >
                {site === 'addis_insight' ? 'Addis Insight' : 'Shega Media'}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="headline" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="headline" className="flex items-center gap-2">
              <Heading className="h-4 w-4" />
              Headline Keywords ({data.total_unique_headline_keywords})
            </TabsTrigger>
            {data.body_keywords && data.body_keywords.length > 0 && (
              <TabsTrigger value="body" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Body Keywords ({data.total_unique_body_keywords})
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="headline">
            <div className="h-[350px]">
              {headlineTreemapData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={headlineTreemapData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={<TreemapContent />}
                  >
                    <Tooltip content={<KeywordTooltip />} />
                  </Treemap>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No headline keywords available
                </div>
              )}
            </div>
          </TabsContent>
          
          {data.body_keywords && data.body_keywords.length > 0 && (
            <TabsContent value="body">
              <div className="h-[350px]">
                {bodyTreemapData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={bodyTreemapData}
                      dataKey="size"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                      content={<TreemapContent />}
                    >
                      <Tooltip content={<KeywordTooltip />} />
                    </Treemap>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No body keywords available
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
