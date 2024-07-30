'use client';

import Link from 'next/link';

import { ExpensesList } from '@/components/expense/expenses-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, getInitials } from '@/lib/utils';
import { api } from '@/trpc/react';

interface UserCardProps {
  image?: string | null;
  name?: string | null;
  credit?: string;
  debt?: string;
}

function UserBalanceCard({ image, name, credit, debt }: UserCardProps) {
  return (
    <div className="flex items-center gap-4 p-4">
      <Avatar>
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="text-start">
        <div className="font-medium">{name ?? 'Brak Nazwy'}</div>
        <div className="flex justify-between">
          <div className="min-w-[80px] text-sm font-medium text-green-500">{`${credit} zł`}</div>
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
    <div className="divide-y rounded-md border">
      <UserBalanceCard
        image={currentUserBalance?.user.image}
        name={currentUserBalance?.user.name}
        credit={currentUserBalance?.creditsAmount}
        debt={currentUserBalance?.debtsAmount}
      />
      {otherUsersBalances.map((balance) => (
        <div key={balance.user.id}>
          <Drawer>
            <DrawerTrigger asChild>
              <button className="w-full outline-none">
                <UserBalanceCard
                  image={balance.user.image}
                  name={balance.user.name}
                  credit={balance.creditsAmount}
                  debt={balance.debtsAmount}
                />
              </button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[96%]">
              <div className="overflow-auto overscroll-none p-4">
                <Tabs defaultValue="credits">
                  <div className="flex gap-2">
                    <TabsList>
                      <TabsTrigger value="credits">Zapłaciłeś</TabsTrigger>
                      <TabsTrigger value="debts">Pożyczyłeś</TabsTrigger>
                    </TabsList>
                    <Link
                      href={`/wydatki/uzytkownik/${balance.user.id}/rozliczenie`}
                      className={cn(buttonVariants({ variant: 'default' }))}
                    >
                      Rozlicz
                    </Link>
                  </div>
                  <TabsContent value="credits">
                    <ExpensesList expenses={balance.credits} />
                  </TabsContent>
                  <TabsContent value="debts">
                    <ExpensesList expenses={balance.debts} />
                  </TabsContent>
                </Tabs>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      ))}
    </div>
  );
}
