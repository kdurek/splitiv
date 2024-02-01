'use client';

import Link from 'next/link';
import { type Session } from 'next-auth';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/_components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar';
import { buttonVariants } from '@/app/_components/ui/button';
import { cn, getInitials } from '@/lib/utils';
import { api } from '@/trpc/react';

interface UserDebtsProps {
  session: Session;
}

function UserDebts({ session }: UserDebtsProps) {
  const [{ members, debts }] = api.group.current.useSuspenseQuery();

  return (
    <div className="flex flex-col gap-4">
      {members.map((member) => {
        const memberDebt = debts.find((debt) => debt.fromId === member.id && debt.toId === session.user.id);
        const memberGet = debts.find((debt) => debt.fromId === session.user.id && debt.toId === member.id);

        if (!memberDebt && !memberGet) {
          return null;
        }

        return (
          <div key={member.id} className="pt-4 font-medium">
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
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem key={session.user.id} value={session.user.id} className="data-[state=open]:pb-4">
        <AccordionTrigger className="p-0 pb-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
            </Avatar>
            <div className="text-start">
              <div className="font-medium">{session.user.name}</div>
              <div className="text-sm font-medium text-muted-foreground">{userBalance} zł</div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-0">
          <UserDebts session={session} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
