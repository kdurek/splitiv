import { PLN } from '@dinero.js/currencies';
import { Checkbox } from 'components/ui/checkbox';
import { CurrencyInput } from 'components/ui/currency-input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import Decimal from 'decimal.js';
import type { Dinero } from 'dinero.js';
import { allocate, toUnit } from 'dinero.js';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { dineroFromString } from 'server/utils/dineroFromString';

import type { ExpenseFormSchema } from './expense-form.schema';

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
    trigger('debts');

    if (Object.values(ratioSplit).every((v) => v === 0) || Object.keys(ratioSplit).length === 0) {
      getValues('debts').forEach((_, index) => {
        setValue(`debts.${index}.amount`, parseFloat('0').toFixed(2));
      });
      return;
    }

    const dineroAmount = dineroFromString({
      amount: getValues('amount'),
      currency: PLN,
      scale: 2,
    });

    const debtors = Object.entries(ratioSplit).map((debt) => {
      return { id: debt[0], ratio: debt[1] };
    });

    const debtorRatios = debtors.map((debt) => debt.ratio);
    const allocated = allocate(dineroAmount, debtorRatios);
    const allocatedRatio = allocated.map((a, index) => {
      return {
        id: debtors[index]?.id,
        amount: toUnit(a),
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
      setValue(`debts.${index}.amount`, debt.amount.toFixed(2));
    });
  }, [ratioSplit, getValues, setValue, trigger]);

  const divideEqually = useCallback(() => {
    trigger('debts');

    if (equalSplit.length === 0) {
      getValues('debts').forEach((_, index) => {
        setValue(`debts.${index}.amount`, parseFloat('0').toFixed(2));
      });
      return;
    }

    const dineroAmount = dineroFromString({
      amount: getValues('amount'),
      currency: PLN,
      scale: 2,
    });

    const usersToAllocate = getValues('debts').filter((user) => equalSplit.includes(user.id));

    const allocated = allocate(dineroAmount, new Array(usersToAllocate.length).fill(1));

    const allocatedUsers = usersToAllocate.map((user, index) => ({
      id: user.id,
      amount: equalSplit.includes(user.id) ? toUnit(allocated[index] as Dinero<number>) : 0,
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
      setValue(`debts.${index}.amount`, debt.amount.toFixed(2));
    });

    trigger('debts');
  }, [equalSplit, getValues, setValue, trigger]);

  useEffect(() => {
    divideEqually();
  }, [divideEqually, equalSplit]);

  useEffect(() => {
    divideByRatio();
  }, [divideByRatio, ratioSplit]);

  const amountWatch = watch('amount');

  useEffect(() => {
    if (!amountWatch) {
      return;
    }
    if (activeTab === 'equal') {
      divideEqually();
    }
    if (activeTab === 'ratio') {
      divideByRatio();
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
                      <CurrencyInput className="w-20" {...field} />
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
                  <FormLabel>{`${debt.amount} zł`}</FormLabel>
                  <Checkbox
                    className="h-6 w-6"
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
                  <FormLabel>{`${debt.amount} zł`}</FormLabel>
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
                      {[...Array(10).keys()].map((num) => (
                        <SelectItem key={String(num)} value={String(num)}>
                          {String(num)}
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
