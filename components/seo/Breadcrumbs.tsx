import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`w-full max-w-7xl mx-auto px-4 md:px-8 py-3 text-xs text-slate-400 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5 list-none p-0 m-0">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-white transition-colors text-slate-400 font-medium"
          >
            <Home className="w-3.5 h-3.5 text-brand-400" />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors text-slate-400 font-medium truncate max-w-[150px] sm:max-w-[200px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-slate-200 font-semibold truncate max-w-[180px] sm:max-w-[280px]"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
