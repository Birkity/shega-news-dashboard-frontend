'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ExternalLink } from 'lucide-react';

// Color palettes for word clouds
const COLOR_PALETTES = {
  headline: [
    'bg-blue-600 hover:bg-blue-700', 
    'bg-blue-500 hover:bg-blue-600', 
    'bg-blue-400 hover:bg-blue-500', 
    'bg-sky-600 hover:bg-sky-700', 
    'bg-sky-500 hover:bg-sky-600', 
    'bg-cyan-500 hover:bg-cyan-600'
  ],
  body: [
    'bg-violet-600 hover:bg-violet-700', 
    'bg-violet-500 hover:bg-violet-600', 
    'bg-purple-500 hover:bg-purple-600', 
    'bg-fuchsia-500 hover:bg-fuchsia-600', 
    'bg-pink-500 hover:bg-pink-600', 
    'bg-purple-400 hover:bg-purple-500'
  ],
  trending: [
    'bg-orange-600 hover:bg-orange-700', 
    'bg-orange-500 hover:bg-orange-600', 
    'bg-amber-500 hover:bg-amber-600', 
    'bg-yellow-500 hover:bg-yellow-600', 
    'bg-orange-400 hover:bg-orange-500', 
    'bg-amber-400 hover:bg-amber-500'
  ],
  shega: [
    'bg-blue-600 hover:bg-blue-700', 
    'bg-blue-500 hover:bg-blue-600', 
    'bg-blue-400 hover:bg-blue-500',
    'bg-indigo-500 hover:bg-indigo-600', 
    'bg-sky-500 hover:bg-sky-600', 
    'bg-cyan-500 hover:bg-cyan-600'
  ],
  addis: [
    'bg-green-600 hover:bg-green-700', 
    'bg-green-500 hover:bg-green-600', 
    'bg-emerald-500 hover:bg-emerald-600',
    'bg-teal-500 hover:bg-teal-600', 
    'bg-lime-500 hover:bg-lime-600', 
    'bg-green-400 hover:bg-green-500'
  ],
};

interface KeywordItem {
  keyword: string;
  count: number;
}

interface InteractiveWordCloudProps {
  readonly words: KeywordItem[];
  readonly palette?: keyof typeof COLOR_PALETTES;
  readonly emptyMessage?: string;
  readonly onKeywordClick?: (keyword: string) => void;
  readonly navigateToArticles?: boolean;
  readonly className?: string;
}

export function InteractiveWordCloud({ 
  words, 
  palette = 'headline',
  emptyMessage = 'No keywords available',
  onKeywordClick,
  navigateToArticles = true,
  className,
}: InteractiveWordCloudProps) {
  const router = useRouter();

  if (!words || words.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground text-center px-4">
        {emptyMessage}
      </div>
    );
  }

  const colors = COLOR_PALETTES[palette];
  const maxCount = Math.max(...words.map(w => w.count));
  const minCount = Math.min(...words.map(w => w.count));
  const range = maxCount - minCount || 1;

  const getStyle = (count: number, index: number) => {
    const normalized = (count - minCount) / range;
    const fontSize = 0.85 + normalized * 1.35;
    const seed = index * 137.508;
    const rotation = Math.sin(seed) * 5;
    const verticalOffset = Math.cos(seed * 2) * 6;
    
    return {
      fontSize: `${fontSize}rem`,
      transform: `rotate(${rotation}deg)`,
      marginTop: `${verticalOffset}px`,
    };
  };

  const getColor = (index: number) => colors[index % colors.length];

  const handleClick = (keyword: string) => {
    if (onKeywordClick) {
      onKeywordClick(keyword);
    } else if (navigateToArticles) {
      router.push(`/articles?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(
        'flex flex-wrap items-center justify-center gap-x-4 gap-y-3 p-6 min-h-[300px]',
        className
      )}>
        {words.map((word, index) => {
          const style = getStyle(word.count, index);
          const colorClass = getColor(index);
          
          return (
            <Tooltip key={word.keyword}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleClick(word.keyword)}
                  className={cn(
                    'inline-block rounded-full px-4 py-1.5 text-white font-semibold',
                    'transition-all duration-200 hover:scale-110 hover:shadow-lg',
                    'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    colorClass
                  )}
                  style={style}
                >
                  {word.keyword}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="flex items-center gap-2">
                <span className="font-medium">{word.keyword}</span>
                <Badge variant="secondary">{word.count.toLocaleString()}</Badge>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// Clickable keyword badge for lists
interface ClickableKeywordProps {
  readonly keyword: string;
  readonly count?: number;
  readonly className?: string;
  readonly variant?: 'default' | 'outline' | 'secondary';
}

export function ClickableKeyword({ 
  keyword, 
  count, 
  className,
  variant = 'secondary',
}: ClickableKeywordProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/articles?keyword=${encodeURIComponent(keyword)}`)}
      className="text-left"
    >
      <Badge 
        variant={variant}
        className={cn(
          'cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors',
          className
        )}
      >
        {keyword}
        {count !== undefined && (
          <span className="ml-1 opacity-70">({count.toLocaleString()})</span>
        )}
      </Badge>
    </button>
  );
}

// Clickable topic badge/button
interface ClickableTopicProps {
  readonly topic: string;
  readonly articleCount?: number;
  readonly percentage?: number;
  readonly className?: string;
  readonly showIcon?: boolean;
}

export function ClickableTopic({
  topic,
  articleCount,
  percentage,
  className,
  showIcon = true,
}: ClickableTopicProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/articles?topic_label=${encodeURIComponent(topic)}`)}
      className={cn(
        'group flex items-center justify-between w-full rounded-lg border p-3',
        'hover:bg-accent hover:border-primary/50 transition-all duration-200',
        'text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate group-hover:text-primary transition-colors">
          {topic}
        </p>
        {articleCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            {articleCount.toLocaleString()} articles
            {percentage !== undefined && ` · ${percentage.toFixed(1)}%`}
          </p>
        )}
      </div>
      {showIcon && (
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
      )}
    </button>
  );
}

// Clickable author component
interface ClickableAuthorProps {
  readonly author: string;
  readonly articleCount?: number;
  readonly site?: 'shega' | 'addis_insight';
  readonly className?: string;
  readonly variant?: 'card' | 'inline' | 'badge';
}

export function ClickableAuthor({
  author,
  articleCount,
  site,
  className,
  variant = 'card',
}: ClickableAuthorProps) {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams();
    params.set('author', author);
    if (site) params.set('site', site);
    router.push(`/articles?${params.toString()}`);
  };

  if (variant === 'badge') {
    return (
      <button onClick={handleClick} className="text-left">
        <Badge 
          variant="outline"
          className={cn(
            'cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors',
            className
          )}
        >
          {author}
          {articleCount !== undefined && (
            <span className="ml-1 opacity-70">({articleCount})</span>
          )}
        </Badge>
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'text-primary hover:underline cursor-pointer focus:outline-none',
          className
        )}
      >
        {author}
      </button>
    );
  }

  // Card variant (default)
  return (
    <button
      onClick={handleClick}
      className={cn(
        'group flex items-center justify-between w-full rounded-lg border p-3',
        'hover:bg-accent hover:border-primary/50 transition-all duration-200',
        'text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
          {author.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium group-hover:text-primary transition-colors">{author}</p>
          {site && (
            <Badge 
              variant={site === 'shega' ? 'default' : 'secondary'} 
              className="text-xs mt-1"
            >
              {site === 'shega' ? 'Shega' : 'Addis Insight'}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {articleCount !== undefined && (
          <span className="text-sm font-bold">{articleCount}</span>
        )}
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

// Quick navigation card for entities (person, organization, location)
interface ClickableEntityProps {
  readonly name: string;
  readonly type: 'person' | 'organization' | 'location';
  readonly totalCount?: number;
  readonly shegaCount?: number;
  readonly addisCount?: number;
  readonly className?: string;
}

export function ClickableEntity({
  name,
  type,
  totalCount,
  shegaCount,
  addisCount,
  className,
}: ClickableEntityProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/articles?search=${encodeURIComponent(name)}`)}
      className={cn(
        'group flex items-center justify-between w-full rounded-lg border p-3',
        'hover:bg-accent hover:border-primary/50 transition-all duration-200',
        'text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate group-hover:text-primary transition-colors">
          {name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {shegaCount !== undefined && (
            <Badge variant="outline" className="text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1" />
              {shegaCount}
            </Badge>
          )}
          {addisCount !== undefined && (
            <Badge variant="outline" className="text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />
              {addisCount}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {totalCount !== undefined && (
          <Badge variant="secondary">{totalCount.toLocaleString()}</Badge>
        )}
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}
