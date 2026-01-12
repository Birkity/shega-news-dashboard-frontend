import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, FileText, Hash, Target, Trophy, Scale } from 'lucide-react';
import type * as API from '@/types/api';
import Link from 'next/link';

interface CompetitiveInsightsCardProps {
  readonly insights: API.CompareInsights;
}

// Helper function for insight category icons
function getCategoryIcon(category?: string) {
  if (!category) return <Lightbulb className="h-4 w-4" />;
  
  switch (category.toLowerCase()) {
    case 'volume': 
    case 'articles': return <FileText className="h-4 w-4" />;
    case 'sentiment': return <TrendingUp className="h-4 w-4" />;
    case 'keywords': return <Hash className="h-4 w-4" />;
    case 'topics': return <Target className="h-4 w-4" />;
    default: return <Lightbulb className="h-4 w-4" />;
  }
}

// Helper function for winner badge
function getWinnerBadge(winner?: API.Site | 'tie') {
  if (!winner) return null;
  if (winner === 'tie') {
    return <Badge variant="outline" className="text-xs">Tie</Badge>;
  }
  if (winner === 'shega') {
    return <Badge variant="default" className="text-xs bg-blue-500">Shega</Badge>;
  }
  return <Badge variant="default" className="text-xs bg-green-500">Addis</Badge>;
}

export function CompetitiveInsightsCard({ insights }: CompetitiveInsightsCardProps) {
  if (!insights?.insights?.length) {
    return null;
  }

  const topInsights = insights.insights.slice(0, 4);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Competitive Insights
            </CardTitle>
            <CardDescription>
              AI-generated insights from Shega vs Addis Insight analysis
            </CardDescription>
          </div>
          {insights.summary && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                <Trophy className="h-3 w-3 mr-1" />
                Shega: {insights.summary.shega_wins}
              </Badge>
              <Badge variant="outline" className="text-green-600">
                <Trophy className="h-3 w-3 mr-1" />
                Addis: {insights.summary.addis_wins}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topInsights.map((insight, index) => (
            <div 
              key={`dashboard-insight-${insight.category}-${index}`}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {getCategoryIcon(insight.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{insight.category}</span>
                  {getWinnerBadge(insight.winner)}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {insight.insight}
                </p>
                {insight.metric && (
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <Scale className="h-3 w-3 text-muted-foreground" />
                    <span className="text-blue-600">Shega: {insight.shega_value}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="text-green-600">Addis: {insight.addis_value}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {insights.insights.length > 4 && (
          <div className="mt-4 text-center">
            <Link 
              href="/comparison" 
              className="text-sm text-primary hover:underline"
            >
              View all {insights.insights.length} insights →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
