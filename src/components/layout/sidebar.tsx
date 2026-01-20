'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Tags,
  MessageSquare,
  TrendingUp,
  Brain,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Zap,
  Building2,
  FolderKanban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  description?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// Organized navigation groups for better UX
const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard, description: 'Key metrics at a glance' },
      { title: 'Articles', href: '/articles', icon: Newspaper, description: 'Browse all articles' },
    ],
  },
  {
    title: 'Content Analysis',
    items: [
      { title: 'Topics', href: '/analytics/topics', icon: TrendingUp, badge: 'Hot', description: 'Topic trends & coverage' },
      { title: 'Keywords', href: '/analytics/keywords', icon: Tags, description: 'Keyword analysis' },
      { title: 'Categories', href: '/analytics/categories', icon: FolderKanban, description: 'Category breakdown' },
      { title: 'Sentiment', href: '/analytics/sentiment', icon: MessageSquare, description: 'Sentiment analysis' },
    ],
  },
  {
    title: 'People & Entities',
    items: [
      { title: 'Authors', href: '/analytics/authors', icon: Users, description: 'Author productivity' },
      { title: 'Entities', href: '/analytics/entities', icon: Building2, description: 'People, orgs, locations' },
    ],
  },
  {
    title: 'Publishing',
    items: [
      { title: 'Activity', href: '/analytics/publishing', icon: Calendar, description: 'Publishing patterns' },
      { title: 'Content Quality', href: '/analytics/nlp', icon: Brain, description: 'Readability & NLP' },
    ],
  },
];

const systemItems: NavItem[] = [
  { title: 'System Status', href: '/system', icon: Settings, description: 'API & scraper status' },
];

interface SidebarProps {
  readonly isCollapsed: boolean;
  readonly onToggle: () => void;
}

interface NavLinkProps {
  readonly item: NavItem;
  readonly isCollapsed: boolean;
  readonly pathname: string;
}

function NavLink({ item, isCollapsed, pathname }: Readonly<NavLinkProps>) {
  const isActive = pathname === item.href || 
    (item.href !== '/' && pathname.startsWith(item.href));
  
  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        'hover:bg-accent/80 hover:text-accent-foreground',
        isActive 
          ? 'bg-primary text-primary-foreground shadow-sm' 
          : 'text-muted-foreground hover:text-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary-foreground')} />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              isActive 
                ? 'bg-primary-foreground/20 text-primary-foreground' 
                : 'bg-orange-500/10 text-orange-500'
            )}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.title}</span>
            {item.badge && (
              <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-500">
                {item.badge}
              </span>
            )}
          </div>
          {item.description && (
            <span className="text-xs text-muted-foreground">{item.description}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function Sidebar({ isCollapsed, onToggle }: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            'flex h-14 items-center border-b px-4',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}>
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold leading-none">Shega Analytics</h1>
                  <p className="text-xs text-muted-foreground">Media Dashboard</p>
                </div>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2">
            {navGroups.map((group, groupIndex) => (
              <div key={group.title} className={cn(groupIndex > 0 && 'mt-4')}>
                {!isCollapsed && (
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </p>
                )}
                {isCollapsed && groupIndex > 0 && <Separator className="my-2" />}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
                  ))}
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <div>
              {!isCollapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  System
                </p>
              )}
              <div className="space-y-0.5">
                {systemItems.map((item) => (
                  <NavLink key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t p-2">
            <div className={cn(
              'flex items-center gap-1',
              isCollapsed ? 'flex-col' : 'justify-between'
            )}>
              {mounted && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="h-8 w-8"
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={isCollapsed ? 'right' : 'top'}>
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="h-8 w-8"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={isCollapsed ? 'right' : 'top'}>
                  {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
