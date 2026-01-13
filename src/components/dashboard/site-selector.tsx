'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type SiteFilter = 'all' | 'shega' | 'addis_insight';

interface SiteSelectorProps {
  readonly className?: string;
  readonly showBothOption?: boolean; // Whether to show the "Both Sites" option
}

export function SiteSelector({ className, showBothOption = true }: SiteSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // If showBothOption is false, default to 'shega' instead of 'all'
  const defaultSite = showBothOption ? 'all' : 'shega';
  const currentSite = (searchParams.get('site') as SiteFilter) || defaultSite;

  const handleSiteChange = (site: SiteFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (site === 'all' && showBothOption) {
      params.delete('site');
    } else if (site === 'shega' && !showBothOption) {
      params.delete('site'); // Default for non-both mode
    } else {
      params.set('site', site);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground mr-2">View:</span>
      <div className="flex items-center rounded-lg border bg-muted p-1">
        {showBothOption && (
          <Button
            variant={currentSite === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSiteChange('all')}
            className="h-8 px-3"
          >
            Both Sites
          </Button>
        )}
        <Button
          variant={currentSite === 'shega' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleSiteChange('shega')}
          className="h-8 px-3 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Shega Media</span>
        </Button>
        <Button
          variant={currentSite === 'addis_insight' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleSiteChange('addis_insight')}
          className="h-8 px-3 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Addis Insight</span>
        </Button>
      </div>
    </div>
  );
}
