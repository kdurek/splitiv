'use client';

import { useDebouncedState } from '@mantine/hooks';
import { useAtom, useSetAtom } from 'jotai';
import { expenseFilterDebtorIdAtom, expenseFilterPayerIdAtom, expenseFilterSearchTextAtom } from 'lib/atoms';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { GetCurrentGroup } from 'utils/api';

import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export interface ExpenseFilters {
  searchText?: string;
  payerId?: string;
  debtorId?: string;
  isSettled?: boolean;
}

interface ExpenseListFiltersProps {
  group: GetCurrentGroup;
}

export function ExpenseListFilters({ group }: ExpenseListFiltersProps) {
  const [open, setOpen] = useState(false);
  const [searchTextDebounced, setSearchTextDebounced] = useDebouncedState<string>('', 500);

  const setSearchText = useSetAtom(expenseFilterSearchTextAtom);
  const [payerId, setPayerId] = useAtom(expenseFilterPayerIdAtom);
  const setDebtorId = useSetAtom(expenseFilterDebtorIdAtom);

  useEffect(() => {
    setSearchText(searchTextDebounced);
  }, [searchTextDebounced, setSearchText]);

  return (
    <Collapsible open={open} onOpenChange={(value) => setOpen(value)}>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Szukaj..."
          defaultValue={searchTextDebounced}
          onChange={(event) => setSearchTextDebounced(event.currentTarget.value)}
        />
        <div>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="outline" size="icon">
              {open ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="mt-4 space-y-4 rounded-md border p-4">
        <div>
          <Label>Płacący</Label>
          <Select value={payerId} onValueChange={(value) => setPayerId(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Brak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Brak</SelectItem>
              {group.members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Pożyczający</Label>
          <Select onValueChange={(value) => setDebtorId(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Brak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Brak</SelectItem>
              {group.members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
