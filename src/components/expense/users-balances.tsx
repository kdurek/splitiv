'use client';

import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { api } from '@/trpc/react';

interface UserCardProps {
  image?: string | null;
  name?: string | null;
  credit?: string;
  debt?: string;
}

function UserBalanceCard({ image, name, credit = '0.00', debt = '0.00' }: UserCardProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      <Avatar>
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="text-start">
        <div className="font-medium">{name ?? 'Brak Nazwy'}</div>
        <div className="flex justify-between">
          <div className="min-w-[100px] text-sm font-medium text-green-500">{`${credit} zł`}</div>
          <div className="text-sm font-medium text-red-500">{`${debt} zł`}</div>
        </div>
      </div>
    </div>
  );
}

export function UsersBalances() {
  const [balances] = api.group.getBalances.useSuspenseQuery();
  const [currentUser] = api.user.current.useSuspenseQuery();

  const currentUserBalance = balances.find((balance) => balance.user.id === currentUser.id);
  const otherUsersBalances = balances.filter((balance) => balance.user.id !== currentUser.id);

  return (
    <div className="divide-y">
      <Link href={`/wydatki`} className="block w-full">
        <UserBalanceCard
          image={currentUser.image}
          name={currentUser.name}
          credit={currentUserBalance?.debtsAmount}
          debt={currentUserBalance?.creditsAmount}
        />
      </Link>
      {otherUsersBalances.map((balance) => (
        <Link key={balance.user.id} href={`/wydatki/uzytkownik/${balance.user.id}`} className="block w-full">
          <UserBalanceCard
            image={balance.user.image}
            name={balance.user.name}
            credit={balance.creditsAmount}
            debt={balance.debtsAmount}
          />
        </Link>
      ))}
    </div>
  );
}
