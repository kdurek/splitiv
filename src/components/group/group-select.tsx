'use client';

import type { User } from 'lucia';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/trpc/react';

interface GroupSelectProps {
  user: User;
}

export function GroupSelect({ user }: GroupSelectProps) {
  const router = useRouter();
  const [groups] = api.group.list.useSuspenseQuery();
  const { mutate: changeActiveGroup } = api.group.changeCurrent.useMutation();

  const handleGroupSelect = (value: string) => {
    changeActiveGroup(
      { groupId: value },
      {
        onSuccess() {
          toast.success('Pomyślnie wybrano grupę');
          router.refresh();
        },
      },
    );
  };

  if (groups.length === 0) {
    return (
      <div className="text-center">
        Wygląda na to, że nie należysz do żadnej grupy <br />
        Poproś właściciela o zaproszenie
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Wybierz grupę aby przejść dalej</Label>
      <Select defaultValue={user.activeGroupId} onValueChange={handleGroupSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Wybierz grupę" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
