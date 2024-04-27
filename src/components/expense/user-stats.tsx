'use client';

import Decimal from 'decimal.js';
import type { User } from 'lucia';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn, getInitials } from '@/lib/utils';
import type { GroupCurrent } from '@/trpc/react';

interface UserCardProps {
  image?: string | null;
  name?: string | null;
  credit?: number;
  debt?: number;
}

function UserCard({ image, name, credit, debt }: UserCardProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div>
        <div className="text-base font-medium">{name ?? 'Brak Nazwy'}</div>
        <div className="flex justify-between">
          <div className="min-w-[80px] text-sm font-medium text-green-500">{`${(credit || 0).toFixed(2)} zł`}</div>
          <div className="text-sm font-medium text-red-500">{`${(debt || 0).toFixed(2)} zł`}</div>
        </div>
      </div>
    </div>
  );
}

interface OtherUsersStatsProps {
  user: User;
  group: GroupCurrent;
}

function OtherUsersStats({ user, group }: OtherUsersStatsProps) {
  return (
    <div className="space-y-6">
      {group.members.map((member) => {
        const memberCredit = group.debts.find((debt) => debt.fromId === member.id && debt.toId === user.id)?.amount;
        const memberDebt = group.debts.find((debt) => debt.fromId === user.id && debt.toId === member.id)?.amount;

        if (!memberCredit && !memberDebt) {
          return null;
        }

        return (
          <div key={member.id}>
            <UserCard image={member.image} name={member.name} credit={Number(memberCredit)} debt={Number(memberDebt)} />
            <div className="mt-2 flex gap-2">
              <Link
                href={`/wydatki/uzytkownik/${member.id}/rozliczenie`}
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
              >
                Rozlicz
              </Link>
              <Link
                href={`/wydatki/uzytkownik/${member.id}`}
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
              >
                Szczegóły
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface UserStatsProps {
  user: User;
  group: GroupCurrent;
}

export function UserStats({ user, group }: UserStatsProps) {
  const userCredit = group.debts.reduce(
    (acc, debt) => (debt.toId === user.id ? Decimal.add(acc, debt.amount) : acc),
    new Decimal(0),
  );
  const userDebt = group.debts.reduce(
    (acc, debt) => (debt.fromId === user.id ? Decimal.add(acc, debt.amount) : acc),
    new Decimal(0),
  );

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex items-center gap-4 rounded-md bg-white p-4">
          <UserCard image={user.image} name={user.name} credit={Number(userCredit)} debt={Number(userDebt)} />
        </div>
      </DrawerTrigger>
      <DrawerContent className="max-h-[96%]">
        <div className="overflow-auto overscroll-none p-4">
          <OtherUsersStats user={user} group={group} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
