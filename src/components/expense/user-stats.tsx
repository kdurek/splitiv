'use client';

import Link from 'next/link';
import { type Session } from 'next-auth';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn, getInitials } from '@/lib/utils';
import { api } from '@/trpc/react';

interface UserDebtsProps {
  session: Session;
}

function UserDebts({ session }: UserDebtsProps) {
  const [{ members, debts }] = api.group.current.useSuspenseQuery();

  return (
    <div className="space-y-6">
      {members.map((member) => {
        const memberDebt = debts.find((debt) => debt.fromId === member.id && debt.toId === session.user.id);
        const memberGet = debts.find((debt) => debt.fromId === session.user.id && debt.toId === member.id);

        if (!memberDebt && !memberGet) {
          return null;
        }

        return (
          <div key={member.id} className="font-medium">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={member.image ?? undefined} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-base font-medium">{member.name}</div>
                <div className="flex min-w-[144px] justify-between gap-4">
                  <div className="text-green-500">{`${memberDebt?.amount ?? 0} zł`}</div>
                  <div className="text-red-500">{`${memberGet?.amount ?? 0} zł`}</div>
                </div>
              </div>
            </div>
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
  session: Session;
}

export function UserStats({ session }: UserStatsProps) {
  const [group] = api.group.current.useSuspenseQuery();

  const userBalance = group.members.find((member) => member.id === session.user.id)?.balance;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex items-center gap-4 rounded-md bg-white p-4">
          <Avatar>
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
          </Avatar>
          <div className="text-start">
            <div className="font-medium">{session.user.name}</div>
            <div className="text-sm font-medium text-muted-foreground">{userBalance} zł</div>
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent className="max-h-[96%]">
        <div className="overflow-auto overscroll-none p-4">
          <UserDebts session={session} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
