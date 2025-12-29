import { Suspense } from 'react';
import { keywordsAPI, topicsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tags, Hash, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function KeywordsContent() {
  let topKeywords, extractedKeywords, topicSentiment;
  
  try {
    [topKeywords, extractedKeywords, topicSentiment] = await Promise.all([
      keywordsAPI.getTop({ limit: 20 }),
      keywordsAPI.getExtracted({ limit: 20 }),
      topicsAPI.getSentimentDistribution({ limit: 15 }),
    ]);
  } catch (error) {
    console.error('Error fetching keywords data:', error);
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Unable to load keywords data. Please check if the API is running.</p>
      </div>
    );
  }

  const metaKeywordsData = topKeywords.slice(0, 15).map((kw) => ({
    keyword: kw.keyword.length > 20 ? `${kw.keyword.slice(0, 20)}...` : kw.keyword,
    count: kw.count,
  }));

  const extractedData = extractedKeywords.slice(0, 15).map((kw) => ({
    keyword: kw.keyword.length > 20 ? `${kw.keyword.slice(0, 20)}...` : kw.keyword,
    count: kw.count,
  }));

  const sentimentData = topicSentiment.map((topic) => ({
    keyword: topic.keyword.length > 15 ? `${topic.keyword.slice(0, 15)}...` : topic.keyword,
    positive: topic.positive,
    neutral: topic.neutral,
    negative: topic.negative,
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="meta" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="meta" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Meta Keywords
          </TabsTrigger>
          <TabsTrigger value="extracted" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            TF-IDF Extracted
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Keyword Sentiment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meta">
          <Card>
            <CardHeader>
              <CardTitle>Top Meta Keywords</CardTitle>
              <CardDescription>Most frequently used keywords from article metadata</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={metaKeywordsData}
                bars={[{ dataKey: 'count', color: '#2563eb', name: 'Frequency' }]}
                xAxisKey="keyword"
                height={500}
                layout="vertical"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extracted">
          <Card>
            <CardHeader>
              <CardTitle>TF-IDF Extracted Keywords</CardTitle>
              <CardDescription>Algorithmically extracted important terms from article content</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={extractedData}
                bars={[{ dataKey: 'count', color: '#8b5cf6', name: 'Frequency' }]}
                xAxisKey="keyword"
                height={500}
                layout="vertical"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Sentiment Distribution</CardTitle>
              <CardDescription>Sentiment breakdown for top keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={sentimentData}
                bars={[
                  { dataKey: 'positive', color: '#22c55e', name: 'Positive', stackId: 'stack' },
                  { dataKey: 'neutral', color: '#6b7280', name: 'Neutral', stackId: 'stack' },
                  { dataKey: 'negative', color: '#ef4444', name: 'Negative', stackId: 'stack' },
                ]}
                xAxisKey="keyword"
                height={500}
                layout="vertical"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Word Cloud Style Display */}
      <Card>
        <CardHeader>
          <CardTitle>All Keywords</CardTitle>
          <CardDescription>Interactive keyword cloud</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map((kw, i) => {
              const size = Math.max(0.7, Math.min(1.5, kw.count / topKeywords[0].count * 1.5));
              return (
                <Badge
                  key={kw.keyword}
                  variant="secondary"
                  className="cursor-pointer transition-all hover:scale-110"
                  style={{ fontSize: `${size}rem`, padding: `${size * 0.3}rem ${size * 0.6}rem` }}
                >
                  {kw.keyword}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function KeywordsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keywords Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Analysis of article keywords and key terms
        </p>
      </div>

      <Suspense fallback={<KeywordsSkeleton />}>
        <KeywordsContent />
      </Suspense>
    </div>
  );
}

function KeywordsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-96" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
