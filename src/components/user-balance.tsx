'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'components/ui/accordion';
import { cn, getInitials } from 'lib/utils';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { GetCurrentGroup, GetUsers } from 'utils/api';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { buttonVariants } from './ui/button';
import { Separator } from './ui/separator';

interface Debt {
  fromId: string;
  toId: string;
  amount: string;
}

interface UserDebtsProps {
  member: GetUsers[number];
  members: GetUsers;
  debts: Debt[];
}

function UserDebts({ member, members, debts }: UserDebtsProps) {
  const { data: session } = useSession();

  const userDebts = debts.filter((debt) => debt.fromId === member.id);
  const userGets = debts.filter((debt) => debt.toId === member.id);
  const getUserFirstName = (userId: string) => members.find((user) => user.id === userId)?.name?.split(' ')[0];

  const hasDebts = userDebts.some((debt) => debt.toId === session?.user.id);
  const hasGets = userGets.some((debt) => debt.fromId === session?.user.id);

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {userGets.length > 0 && (
        <div>
          {userGets.map((debt) => (
            <div key={debt.fromId + debt.toId} className="font-medium text-green-500">
              {`${debt.amount} zł od ${getUserFirstName(debt.fromId)}`}
            </div>
          ))}
        </div>
      )}

      {userGets.length > 0 && userDebts.length > 0 && <Separator />}

      {userDebts.length > 0 && (
        <div>
          {userDebts.map((debt) => (
            <div key={debt.fromId + debt.toId} className="font-medium text-red-500">
              {`${debt.amount} zł dla ${getUserFirstName(debt.toId)}`}
            </div>
          ))}
        </div>
      )}

      <Link href={`/wydatki/uzytkownik/${member.id}`} className={cn(buttonVariants({ variant: 'outline' }))}>
        Szczegóły
      </Link>

      {(hasDebts || hasGets) && (
        <Link
          href={`/wydatki/uzytkownik/${member.id}/rozliczenie`}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Rozliczenie
        </Link>
      )}
    </div>
  );
}

interface UserBalanceProps {
  group: GetCurrentGroup;
}

export function UserBalance({ group }: UserBalanceProps) {
  return (
    <Accordion type="single" collapsible className="w-full rounded-md border border-b-0">
      {group.members.map((member) => (
        <AccordionItem key={member.id} value={member.id}>
          <AccordionTrigger className="px-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={member.image ?? undefined} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="text-start">
                <div className="font-medium">{member.name}</div>
                <div className="text-sm font-medium text-muted-foreground">{member.balance} zł</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <UserDebts member={member} members={group.members} debts={group.debts} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
