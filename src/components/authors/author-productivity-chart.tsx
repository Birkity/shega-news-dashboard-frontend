'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, LineChart } from 'recharts';
import { TrendingUp, Calendar, FileText, Activity } from 'lucide-react';
import { authorsAPI } from '@/lib/api';
import type { AuthorProductivity } from '@/types/api';
import type { SiteFilter } from '@/components/dashboard/site-selector';

interface AuthorProductivityChartProps {
  readonly author: string;
  readonly site: SiteFilter;
}

type Granularity = 'month';

interface TooltipEntry {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
}

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: TooltipEntry[];
  readonly label?: string;
  readonly granularity: Granularity;
}

function ProductivityTooltip({ active, payload, label, granularity }: CustomTooltipProps) {
  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (granularity === 'month') {
      const year = date.getFullYear().toString().slice(-2);
      return `${monthNames[date.getMonth()]} ${year}`;
    }
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  };

  if (active && payload && payload.length > 0 && label) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="font-medium">{formatTooltipDate(label)}</p>
        <div className="mt-2 space-y-1 text-sm">
          {payload.map((entry) => (
            <div key={String(entry.dataKey)} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function AuthorProductivityChart({ author, site }: AuthorProductivityChartProps) {
  const [data, setData] = useState<AuthorProductivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<number>(365); // Default to 1 year (max supported)
  const [granularity] = useState<Granularity>('month'); // Fixed to monthly

  useEffect(() => {
    async function fetchProductivity() {
      setLoading(true);
      setError(null);
      try {
        const result = await authorsAPI.getProductivity(author, { days, granularity });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch productivity data');
      } finally {
        setLoading(false);
      }
    }

    fetchProductivity();
  }, [author, days, granularity]);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (granularity === 'month') {
      const year = date.getFullYear().toString().slice(-2);
      return `${monthNames[date.getMonth()]} ${year}`;
    }
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  }, [granularity]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Author Productivity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Author Productivity
          </CardTitle>
          <CardDescription>Publishing activity over time for {author}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No productivity data available for this author
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.timeline.map(item => ({
    ...item,
    date: formatDate(item.date),
    rawDate: item.date,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Productivity: {author}
            </CardTitle>
            <CardDescription>Publishing activity over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={days.toString()} onValueChange={(v) => setDays(Number.parseInt(v))}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">3 months</SelectItem>
                <SelectItem value="180">6 months</SelectItem>
                <SelectItem value="270">9 months</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total Articles</p>
              <p className="text-lg font-bold">{data.summary.total_articles}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Active Periods</p>
              <p className="text-lg font-bold">{data.summary.active_periods}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Avg per Period</p>
              <p className="text-lg font-bold">{data.summary.avg_per_period.toFixed(1)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Max in Period</p>
              <p className="text-lg font-bold">{data.summary.max_in_period}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ProductivityTooltip granularity={granularity} />} />
              <Legend />
              {site === 'shega' && (
                <Line 
                  type="monotone"
                  dataKey="shega" 
                  name="Shega" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              )}
              {site === 'addis_insight' && (
                <Line 
                  type="monotone"
                  dataKey="addis_insight" 
                  name="Addis Insight" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
