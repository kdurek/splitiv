import Decimal from 'decimal.js';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { type z } from 'zod';

import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type expenseFormSchema } from '@/lib/validations/expense';

function allocate(totalAmount: number | string, userCounts: number[]) {
  // Convert totalAmount to a Decimal object for precise calculations
  const total = new Decimal(totalAmount);

  // Convert userCounts to an array of Decimal objects
  const users = userCounts.map((count: number) => new Decimal(count));

  // Calculate the total number of users
  const totalUsers = users.reduce((acc: Decimal, count: Decimal) => acc.plus(count), new Decimal(0));

  // Calculate the even allocation for each user
  const evenAllocation = total.dividedBy(totalUsers);

  // Initialize an array to store the allocations
  const allocations: string[] = [];

  // Distribute the allocation as evenly as possible among the users
  for (const user of users) {
    allocations.push(evenAllocation.times(user).toFixed(2)); // Round to 2 decimal places
  }

  // Handle any remaining rounding error by adjusting the last allocation
  const sumOfAllocations = new Decimal(allocations.reduce((acc: number, val: string) => acc + parseFloat(val), 0));
  const roundingError = total.minus(sumOfAllocations).toFixed(2);

  allocations[users.length - 1] = new Decimal(allocations[users.length - 1] || 0).plus(roundingError).toFixed(2);

  return allocations.map(parseFloat); // Convert the Decimal objects back to numbers
}

export type ExpenseFormSchema = z.infer<typeof expenseFormSchema>;

export function ExpenseFormMethods() {
  const form = useFormContext<ExpenseFormSchema>();
  const { watch, getValues, setValue, trigger } = form;

  const defaultRatioSplit = form.getValues('debts').reduce((acc, cur) => ({ ...acc, [cur.id]: 0 }), {});

  const [activeTab, setActiveTab] = useState('unequal');
  const [equalSplit, setEqualSplit] = useState<string[]>([]);
  const [ratioSplit, setRatioSplit] = useState<Record<string, number>>(defaultRatioSplit);

  const usedAmount = form.watch('debts').reduce((prev, curr) => Decimal.add(prev, curr.amount || 0), new Decimal(0));

  const remainingAmount = Decimal.sub(form.watch('amount') || 0, usedAmount || 0);

  const divideByRatio = useCallback(() => {
    void trigger('debts');

    const formAmount = getValues('amount').toFixed(2);

    if (Object.values(ratioSplit).every((v) => v === 0) || Object.keys(ratioSplit).length === 0) {
      getValues('debts').forEach((_, index) => {
        setValue(`debts.${index}.amount`, 0);
      });
      return;
    }

    const debtors = Object.entries(ratioSplit).map((debt) => {
      return { id: debt[0], ratio: debt[1] };
    });

    const debtorRatios = debtors.map((debt) => debt.ratio);
    const allocated = allocate(formAmount, debtorRatios);
    const allocatedRatio = allocated.map((a, index) => {
      return {
        id: debtors[index]?.id,
        amount: a,
      };
    });

    const newDebts = getValues('debts').map((debtor) => {
      const amountToPay = allocatedRatio.find((user) => user.id === debtor.id)?.amount || 0;

      return {
        name: debtor.name,
        id: debtor.id,
        amount: amountToPay,
      };
    });

    newDebts.forEach((debt, index) => {
      setValue(`debts.${index}.amount`, debt.amount);
    });
  }, [ratioSplit, getValues, setValue, trigger]);

  const divideEqually = useCallback(async () => {
    void trigger('debts');

    const formAmount = getValues('amount').toFixed(2);

    if (equalSplit.length === 0) {
      getValues('debts').forEach((_, index) => {
        setValue(`debts.${index}.amount`, 0);
      });
      return;
    }

    const usersToAllocate = getValues('debts').filter((user) => equalSplit.includes(user.id));

    const allocated = allocate(formAmount, new Array(usersToAllocate.length).fill(1).map(Number));

    const allocatedUsers = usersToAllocate.map((user, index) => ({
      id: user.id,
      amount: equalSplit.includes(user.id) ? allocated[index] : 0,
    }));

    const newDebts = getValues('debts').map((debtor) => {
      const isInArray = usersToAllocate.find((user) => user.id === debtor.id);
      const amountToPay = allocatedUsers.find((user) => user.id === debtor.id)?.amount || 0;

      return {
        name: debtor.name,
        id: debtor.id,
        amount: isInArray ? amountToPay : 0,
      };
    });

    newDebts.forEach((debt, index) => {
      setValue(`debts.${index}.amount`, debt.amount);
    });

    void trigger('debts');
  }, [equalSplit, getValues, setValue, trigger]);

  useEffect(() => {
    if (activeTab === 'equal') {
      void divideEqually();
    }
  }, [activeTab, divideEqually, equalSplit]);

  useEffect(() => {
    if (activeTab === 'ratio') {
      void divideByRatio();
    }
  }, [activeTab, divideByRatio, ratioSplit]);

  const amountWatch = watch('amount') ?? 0;

  useEffect(() => {
    if (!amountWatch || activeTab === 'unequal') {
      return;
    }
    if (activeTab === 'equal') {
      void divideEqually();
    }
    if (activeTab === 'ratio') {
      void divideByRatio();
    }
  }, [activeTab, divideByRatio, divideEqually, amountWatch]);

  return (
    <>
      <Tabs onValueChange={(tab) => setActiveTab(tab)} defaultValue="unequal">
        <TabsList>
          <TabsTrigger value="unequal">Nierówno</TabsTrigger>
          <TabsTrigger value="equal" onClick={() => divideEqually()}>
            Równo
          </TabsTrigger>
          <TabsTrigger value="ratio" onClick={() => divideByRatio()}>
            Współczynnik
          </TabsTrigger>
        </TabsList>
        <TabsContent value="unequal">
          <div className="mt-4 flex flex-col gap-4">
            {form.watch('debts').map((debt, index) => (
              <FormField
                key={debt.id}
                control={form.control}
                name={`debts.${index}.amount`}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel>{debt.name}</FormLabel>
                    <FormControl>
                      <NumberInput className="w-20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="equal">
          <div className="mt-4 flex flex-col gap-4">
            {form.watch('debts').map((debt) => (
              <div key={debt.id} className="flex items-center justify-between">
                <FormLabel>{debt.name}</FormLabel>
                <div className="flex h-10 items-center gap-4">
                  <FormLabel>{`${debt.amount.toFixed(2)} zł`}</FormLabel>
                  <Checkbox
                    className="size-6"
                    checked={equalSplit.includes(debt.id)}
                    onCheckedChange={(checked) => {
                      return checked
                        ? setEqualSplit([...equalSplit, debt.id])
                        : setEqualSplit(equalSplit.filter((value) => value !== debt.id));
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ratio">
          <div className="mt-4 flex flex-col gap-4">
            {form.watch('debts').map((debt) => (
              <div key={debt.id} className="flex flex-nowrap items-center justify-between gap-4">
                <FormLabel>{debt.name}</FormLabel>
                <div className="flex items-center gap-4">
                  <FormLabel>{`${debt.amount.toFixed(2)} zł`}</FormLabel>
                  <Select
                    value={String(ratioSplit[debt.id])}
                    onValueChange={(value) =>
                      setRatioSplit((prevState) => ({
                        ...prevState,
                        [debt.id]: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10).keys()].map((value) => (
                        <SelectItem key={String(value)} value={String(value)}>
                          {String(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {remainingAmount.equals(0) && <div className="text-center font-bold text-teal-500">Przydzielono poprawnie</div>}
      {remainingAmount.lessThan(0) && (
        <div className="text-center font-bold text-red-500">
          {`Przydzieliłeś za dużo o ${remainingAmount.toFixed(2)} zł`}
        </div>
      )}
      {remainingAmount.greaterThan(0) && (
        <div className="text-center font-bold text-red-500">
          {`Musisz przydzielić jeszcze ${remainingAmount.toFixed(2)} zł`}
        </div>
      )}
    </>
  );
}
