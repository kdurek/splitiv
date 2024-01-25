'use client';

import { useDebouncedState } from '@mantine/hooks';
import { useAtom, useSetAtom } from 'jotai';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/app/_components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_components/ui/collapsible';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select';
import { expenseFilterDebtorIdAtom, expenseFilterPayerIdAtom, expenseFilterSearchTextAtom } from '@/lib/atoms';
import type { GroupCurrent } from '@/trpc/shared';

export interface FeedFilters {
  searchText?: string;
  payerId?: string;
  debtorId?: string;
  isSettled?: 'fully' | 'partially';
}

interface FeedFiltersProps {
  group: GroupCurrent;
}

export function FeedFilters({ group }: FeedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [searchTextDebounced, setSearchTextDebounced] = useDebouncedState<string>('', 500);

  const setSearchText = useSetAtom(expenseFilterSearchTextAtom);
  const [payerId, setPayerId] = useAtom(expenseFilterPayerIdAtom);
  const [debtorId, setDebtorId] = useAtom(expenseFilterDebtorIdAtom);

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
            <Button type="button" variant="outline" size="icon" className="text-gray-500">
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="mt-4 space-y-4 rounded-md border p-4">
        <div>
          <Label>Płacący</Label>
          <div className="mt-2 flex items-center gap-2">
            <Select value={payerId} onValueChange={(value) => setPayerId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Brak" />
              </SelectTrigger>
              <SelectContent>
                {group.members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Button className="text-gray-500" variant="outline" size="icon" onClick={() => setPayerId('')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div>
          <Label>Pożyczający</Label>
          <div className="mt-2 flex items-center gap-2">
            <Select value={debtorId} onValueChange={(value) => setDebtorId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Brak" />
              </SelectTrigger>
              <SelectContent>
                {group.members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Button className="text-gray-500" variant="outline" size="icon" onClick={() => setDebtorId('')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
