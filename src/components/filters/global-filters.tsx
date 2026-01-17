'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, X, Filter, Search, ChevronDown 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Date presets for quick selection
const DATE_PRESETS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 3 months', value: '3m' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'Last year', value: '1y' },
  { label: 'All time', value: 'all' },
];

const SORT_OPTIONS = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Positive', value: 'positive' },
  { label: 'Most Negative', value: 'negative' },
  { label: 'Longest', value: 'long' },
  { label: 'Shortest', value: 'short' },
];

const SENTIMENT_OPTIONS = [
  { label: 'All Sentiments', value: 'all' },
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' },
];

const CONTENT_LENGTH_OPTIONS = [
  { label: 'All Lengths', value: 'all' },
  { label: 'Short (< 300 words)', value: 'short' },
  { label: 'Medium (300-800 words)', value: 'medium' },
  { label: 'Long (> 800 words)', value: 'long' },
];

interface GlobalFiltersProps {
  readonly showSearch?: boolean;
  readonly showSite?: boolean;
  readonly showDateRange?: boolean;
  readonly showSentiment?: boolean;
  readonly showContentLength?: boolean;
  readonly showSort?: boolean;
  readonly showAdvanced?: boolean;
  readonly className?: string;
}

export function GlobalFilters({
  showSearch = true,
  showSite = true,
  showDateRange = true,
  showSentiment = false,
  showContentLength = false,
  showSort = false,
  showAdvanced = false,
  className,
}: GlobalFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);
  
  // Get current filter values
  const site = searchParams.get('site') || 'all';
  const dateRange = searchParams.get('date_range') || 'all';
  const sentiment = searchParams.get('sentiment') || 'all';
  const contentLength = searchParams.get('content_length') || 'all';
  const sortBy = searchParams.get('sort_by') || 'recent';

  const updateFilter = React.useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      
      // Reset to page 1 when filters change
      params.delete('page');
      
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', search);
  };

  const clearFilters = () => {
    setSearch('');
    router.push(pathname);
  };

  // Count active filters
  const activeFilterCount = [
    site === 'all' ? 0 : 1,
    dateRange === 'all' ? 0 : 1,
    sentiment === 'all' ? 0 : 1,
    contentLength === 'all' ? 0 : 1,
    searchParams.get('search') ? 1 : 0,
    searchParams.get('author') ? 1 : 0,
    searchParams.get('topic_label') ? 1 : 0,
    searchParams.get('keyword') ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const hasFilters = activeFilterCount > 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles, authors, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                  onClick={() => {
                    setSearch('');
                    updateFilter('search', '');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        )}

        {/* Site Filter */}
        {showSite && (
          <Select value={site} onValueChange={(value) => updateFilter('site', value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              <SelectItem value="shega">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Shega Media
                </span>
              </SelectItem>
              <SelectItem value="addis_insight">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Addis Insight
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Date Range Filter */}
        {showDateRange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {DATE_PRESETS.find(p => p.value === dateRange)?.label || 'All time'}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={dateRange === preset.value ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => updateFilter('date_range', preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Sort */}
        {showSort && (
          <Select value={sortBy} onValueChange={(value) => updateFilter('sort_by', value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sentiment Filter */}
        {showSentiment && (
          <Select value={sentiment} onValueChange={(value) => updateFilter('sentiment', value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              {SENTIMENT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Content Length Filter */}
        {showContentLength && (
          <Select value={contentLength} onValueChange={(value) => updateFilter('content_length', value)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Content Length" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_LENGTH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Advanced Filters Toggle */}
        {showAdvanced && (
          <Button
            variant={isAdvancedOpen ? 'secondary' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            <Filter className="h-4 w-4" />
            Advanced
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {site !== 'all' && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Site: {site === 'shega' ? 'Shega' : 'Addis Insight'}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateFilter('site', 'all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {dateRange !== 'all' && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {DATE_PRESETS.find(p => p.value === dateRange)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateFilter('date_range', 'all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {searchParams.get('author') && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Author: {searchParams.get('author')}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateFilter('author', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {searchParams.get('topic_label') && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Topic: {searchParams.get('topic_label')}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateFilter('topic_label', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {searchParams.get('keyword') && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Keyword: {searchParams.get('keyword')}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateFilter('keyword', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// Smaller site-only filter for use in analytics pages
export function SiteFilter({ className }: { readonly className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const site = searchParams.get('site') || 'all';

  const updateSite = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('site', value);
    } else {
      params.delete('site');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={site} onValueChange={updateSite}>
      <SelectTrigger className={cn('w-[160px]', className)}>
        <SelectValue placeholder="All Sites" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Sites</SelectItem>
        <SelectItem value="shega">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Shega Media
          </span>
        </SelectItem>
        <SelectItem value="addis_insight">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Addis Insight
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

// Date range quick selector for dashboards
export function DateRangeSelector({ className }: { readonly className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dateRange = searchParams.get('date_range') || 'all';

  const updateDateRange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('date_range', value);
    } else {
      params.delete('date_range');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={cn('flex gap-1 p-1 rounded-lg bg-muted', className)}>
      {DATE_PRESETS.slice(0, 4).map((preset) => (
        <Button
          key={preset.value}
          variant={dateRange === preset.value ? 'secondary' : 'ghost'}
          size="sm"
          className={cn(
            'h-8 text-xs',
            dateRange === preset.value && 'bg-background shadow-sm'
          )}
          onClick={() => updateDateRange(preset.value)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
