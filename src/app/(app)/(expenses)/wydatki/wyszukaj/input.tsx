'use client';

import { useAtomValue, useSetAtom } from 'jotai';

import { Input } from '@/components/ui/input';
import { currentValueSearchTextAtom, debouncedValueSearchTextAtom } from '@/lib/atoms';

export function ExpenseSearchInput() {
  const searchText = useAtomValue(currentValueSearchTextAtom);
  const setDebouncedValue = useSetAtom(debouncedValueSearchTextAtom);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDebouncedValue(e.target.value);
  }

  return <Input placeholder="Wyszukaj po tytule lub opisie..." value={searchText} onChange={handleSearchChange} />;
}
