'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type SiteFilter = 'all' | 'shega' | 'addis_insight';

interface SiteSelectorProps {
  readonly className?: string;
}

export function SiteSelector({ className }: SiteSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentSite = (searchParams.get('site') as SiteFilter) || 'all';

  const handleSiteChange = (site: SiteFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (site === 'all') {
      params.delete('site');
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
        <Button
          variant={currentSite === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleSiteChange('all')}
          className="h-8 px-3"
        >
          Both Sites
        </Button>
        <Button
          variant={currentSite === 'shega' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleSiteChange('shega')}
          className="h-8 px-3 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Shega</span>
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
