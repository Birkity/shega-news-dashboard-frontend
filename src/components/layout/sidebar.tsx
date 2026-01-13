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
  GitCompare,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Zap,
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
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Articles', href: '/articles', icon: Newspaper },
  { title: 'Authors', href: '/analytics/authors', icon: Users },
  { title: 'Keywords', href: '/analytics/keywords', icon: Tags },
  { title: 'Topics', href: '/analytics/topics', icon: TrendingUp, badge: 'Trends' },
  { title: 'Sentiment', href: '/analytics/sentiment', icon: MessageSquare },
  { title: 'Publishing', href: '/analytics/publishing', icon: Calendar },
  { title: 'Content Quality', href: '/analytics/nlp', icon: Brain },
  { title: 'Comparison', href: '/comparison', icon: GitCompare },
];

const systemItems: NavItem[] = [
  { title: 'System Status', href: '/system', icon: Settings },
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
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        'hover:bg-accent/80 hover:text-accent-foreground',
        isActive 
          ? 'bg-primary text-primary-foreground shadow-sm' 
          : 'text-muted-foreground hover:text-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary-foreground')} />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              isActive 
                ? 'bg-primary-foreground/20 text-primary-foreground' 
                : 'bg-primary/10 text-primary'
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
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.title}
          {item.badge && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {item.badge}
            </span>
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
            'flex h-16 items-center border-b px-4',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none">Shega Media Analytics</h1>
                  <p className="text-xs text-muted-foreground">News Dashboard</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Analytics
                </p>
              )}
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              {!isCollapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  System
                </p>
              )}
              {systemItems.map((item) => (
                <NavLink key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t p-3">
            <div className={cn(
              'flex items-center gap-2',
              isCollapsed ? 'flex-col' : 'justify-between'
            )}>
              {mounted && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="h-9 w-9"
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
                    className="h-9 w-9"
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
