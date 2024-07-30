'use client';

import { CircleDollarSign, Home, Plus, Search, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Główna', href: '/', icon: Home },
  { name: 'Wydatki', href: '/wydatki', icon: CircleDollarSign },
  { name: 'Dodaj', href: '/wydatki/dodaj', icon: Plus },
  { name: 'Wyszukaj', href: '/wydatki/wyszukaj', icon: Search },
  { name: 'Ustawienia', href: '/ustawienia', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed bottom-0 z-40 flex w-full rounded-t-md bg-background shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
        {navItems.map((item, index) => (
          <Fragment key={index}>
            <Link
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center py-2.5 justify-center text-center text-xs',
                pathname === item.href ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <item.icon />
              {item.name}
            </Link>
          </Fragment>
        ))}
      </nav>
      <div className="pt-16" />
    </>
  );
}
