import Link from 'next/link';
import { Session } from 'next-auth';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { cn, getInitials } from '@/lib/utils';
import type { GetCurrentGroup } from '@/trpc/shared';

interface UserDebtsProps {
  user: Session['user'];
  group: GetCurrentGroup;
}

function UserDebts({ user, group: { members, debts } }: UserDebtsProps) {
  return (
    <div className="flex flex-col gap-4">
      {members.map((member) => {
        const memberDebt = debts.find((debt) => debt.fromId === member.id && debt.toId === user.id);
        const memberGet = debts.find((debt) => debt.fromId === user.id && debt.toId === member.id);

        if (!memberDebt && !memberGet) return null;

        return (
          <div key={member.id} className="border-t pt-4 font-medium">
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
  user: Session['user'];
  group: GetCurrentGroup;
}

export function UserStats({ user, group }: UserStatsProps) {
  const userBalance = group.members.find((member) => member.id === user.id)?.balance;

  return (
    <Accordion type="single" collapsible className="w-full rounded-md border border-b-0">
      <AccordionItem key={user.id} value={user.id}>
        <AccordionTrigger className="px-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="text-start">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm font-medium text-muted-foreground">{userBalance} zł</div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4">
          <UserDebts user={user} group={group} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}