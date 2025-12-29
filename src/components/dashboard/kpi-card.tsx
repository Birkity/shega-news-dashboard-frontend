'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, TrendingDown, Minus, LucideIcon, 
  Newspaper, Users, FileText, Gauge, BarChart3,
  type LucideProps 
} from 'lucide-react';

// Icon registry for use from Server Components
const iconRegistry: Record<string, React.ComponentType<LucideProps>> = {
  newspaper: Newspaper,
  users: Users,
  fileText: FileText,
  gauge: Gauge,
  barChart3: BarChart3,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon | string;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  iconColor = 'text-primary',
  trend,
  loading = false,
  className,
}: KPICardProps) {
  // Resolve icon from string or use directly if it's a component
  const Icon = typeof icon === 'string' ? iconRegistry[icon] : icon;

  const getTrendIcon = () => {
    if (trend === 'up' || (change !== undefined && change > 0)) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (trend === 'down' || (change !== undefined && change < 0)) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (trend === 'up' || (change !== undefined && change > 0)) {
      return 'text-green-500';
    }
    if (trend === 'down' || (change !== undefined && change < 0)) {
      return 'text-red-500';
    }
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-20 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className={cn('rounded-lg bg-primary/10 p-2', iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-2 text-sm">
          {(change !== undefined || trend) && (
            <span className={cn('flex items-center gap-1', getTrendColor())}>
              {getTrendIcon()}
              {change !== undefined && (
                <span className="font-medium">
                  {change > 0 ? '+' : ''}
                  {typeof change === 'number' ? change.toFixed(1) : change}%
                </span>
              )}
            </span>
          )}
          {(subtitle || changeLabel) && (
            <span className="text-muted-foreground">
              {changeLabel || subtitle}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ComparisonKPICardProps {
  title: string;
  shegaValue: string | number;
  addisValue: string | number;
  difference?: number;
  icon?: string;
  loading?: boolean;
  className?: string;
}

export function ComparisonKPICard({
  title,
  shegaValue,
  addisValue,
  difference,
  icon,
  loading = false,
  className,
}: ComparisonKPICardProps) {
  const Icon = icon ? iconRegistry[icon] : null;

  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-16 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Shega</p>
            <p className="text-xl font-bold">{shegaValue}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400">Addis Insight</p>
            <p className="text-xl font-bold">{addisValue}</p>
          </div>
        </div>
        {difference !== undefined && (
          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            {difference > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : difference < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            <span>
              {difference > 0 ? '+' : ''}
              {difference.toFixed(1)}% difference
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
