'use client';

import { CircleDollarSign, Plus, Search, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment } from 'react';

import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Wydatki', href: '/', icon: CircleDollarSign },
  { name: 'Dodaj', href: '/wydatki/dodaj', icon: Plus },
  { name: 'Wyszukaj', href: '/wydatki/wyszukaj', icon: Search },
  { name: 'Ustawienia', href: '/ustawienia', icon: Settings },
];

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="grid h-20 grid-cols-4 justify-items-center gap-2 pb-4 pt-3">
      {navItems.map((item, index) => (
        <Fragment key={index}>
          <button
            onClick={() => router.push(item.href)}
            className={cn(
              'text-center text-xs font-medium',
              pathname === item.href ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <div className={'mx-auto flex h-8 w-16 items-center justify-center'}>
              <item.icon />
            </div>
            {item.name}
          </button>
        </Fragment>
      ))}
    </nav>
  );
}
