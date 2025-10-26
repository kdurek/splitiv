import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { CheckCircle2Icon, CircleIcon, Undo2Icon } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { PageLoader } from "@/components/page-loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { NumberField, NumberFieldInput } from "@/components/ui/number-field";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";
import type { Expense } from "../../../../../../../packages/db/prisma/generated/client";
import type {
  ExpenseDebtGetPayload,
  ExpenseLogGetPayload,
} from "../../../../../../../packages/db/prisma/generated/models";

export const Route = createFileRoute("/_app/expenses/$expenseId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { expenseId } = Route.useParams();
  const currentUserQuery = useQuery(orpc.auth.getCurrentUser.queryOptions());
  const expenseQuery = useQuery(
    orpc.expense.getById.queryOptions({
      input: {
        id: expenseId,
      },
    })
  );
  const logsQuery = useQuery(
    orpc.expense.log.getByExpenseId.queryOptions({
      input: {
        expenseId,
      },
    })
  );

  if (expenseQuery.isPending || logsQuery.isPending) {
    return <PageLoader />;
  }

  if (!expenseQuery.data) {
    return <div>Expense not found</div>;
  }

  const { data: expense } = expenseQuery;
  const { data: logs } = logsQuery;

  const isPayer = currentUserQuery.data?.id === expense.payerId;
  const isAdmin = currentUserQuery.data?.id === expense.group.adminId;

  return (
    <>
      <Card>
        <CardHeader className={cn(!expense.description && "gap-0")}>
          <CardTitle>{expense.name}</CardTitle>
          <CardDescription className="whitespace-pre-wrap">
            {expense.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <ItemGroup>
            <Item className="px-0 py-3">
              <ItemContent className="flex-row justify-between">
                <ItemTitle>Zapłacone przez</ItemTitle>
                <ItemDescription>{expense.payer.name}</ItemDescription>
              </ItemContent>
            </Item>
            <ItemSeparator />
            <Item className="px-0 py-3">
              <ItemContent className="flex-row justify-between">
                <ItemTitle>Kwota wydatku</ItemTitle>
                <ItemDescription>
                  {Number(expense.amount).toFixed(2)} zł
                </ItemDescription>
              </ItemContent>
            </Item>
            <ItemSeparator />
            <Item className="px-0 py-3">
              <ItemContent className="flex-row justify-between">
                <ItemTitle>Data dodania</ItemTitle>
                <ItemDescription>
                  {format(expense.createdAt, "dd.MM.yyyy")}
                </ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
          <ItemGroup>
            {expense.debts.map((debt, index) => (
              <Fragment key={debt.debtor.id}>
                <Item className="px-0 py-3">
                  <ItemContent>
                    <ItemTitle>{debt.debtor.name}</ItemTitle>
                    <ItemDescription>
                      {`${Number(debt.settled).toFixed(2)} zł / ${Number(debt.amount).toFixed(2)} zł`}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <SettleDebtForm debt={debt} />
                  </ItemActions>
                </Item>
                {index !== expense.debts.length - 1 && <ItemSeparator />}
              </Fragment>
            ))}
          </ItemGroup>
        </CardContent>
        {(isPayer || isAdmin) && (
          <CardFooter>
            <ExpenseDeleteModal expense={expense} />
          </CardFooter>
        )}
      </Card>
      {logs && logs.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Historia wydatku</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <ItemGroup>
              {logs.map((log, index) => (
                <Fragment key={log.id}>
                  <Item className="px-0 py-3">
                    <ItemContent>
                      <ItemTitle>{log.debt.debtor.name}</ItemTitle>
                      <ItemDescription>
                        {format(log.createdAt, "HH:mm dd.MM.yyyy")}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Label>{Number(log.amount).toFixed(2)} zł</Label>
                      <RevertDebtButton log={log} />
                    </ItemActions>
                  </Item>
                  {index !== logs.length - 1 && <ItemSeparator />}
                </Fragment>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function RevertDebtButton({
  log,
}: {
  log: ExpenseLogGetPayload<{ include: { debt: true } }>;
}) {
  const revertMutation = useMutation(
    orpc.expense.log.revert.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(
          orpc.expense.getById.queryOptions({
            input: {
              id: log.debt.expenseId,
            },
          })
        );
        queryClient.invalidateQueries(
          orpc.expense.log.getByExpenseId.queryOptions({
            input: {
              expenseId: log.debt.expenseId,
            },
          })
        );
        toast.success("Pomyślnie cofnięto spłatę długu");
      },
      onError(error) {
        toast.error("Nie udało się cofnąć spłaty długu", {
          description: error.message,
        });
      },
    })
  );

  return (
    <Button
      onClick={() => revertMutation.mutate({ id: log.id })}
      size="icon"
      variant="outline"
    >
      <Undo2Icon />
    </Button>
  );
}

function ExpenseDeleteModal({ expense }: { expense: Expense }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const deleteExpenseMutation = useMutation(
    orpc.expense.delete.mutationOptions({
      onSuccess() {
        toast.success("Pomyślnie usunięto wydatek");
        setOpen(false);
        navigate({
          to: "/expenses",
        });
      },
      onError(error) {
        toast.error("Nie udało się usunąć wydatku", {
          description: error.message,
        });
      },
    })
  );

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button className="w-full" variant="outline">
          Usuń
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Czy na pewno chcesz usunąć wydatek?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Ta akcja jest nieodwracalna. Wydatek zostanie usunięty na zawsze i
            nie będzie można go przywrócić.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={() => deleteExpenseMutation.mutate({ id: expense.id })}
          >
            Potwierdź
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getDebtStatusColor(settled: number, amount: number) {
  if (settled === 0) {
    return "text-blue-500 hover:text-blue-500";
  }

  if (settled === amount) {
    return "text-green-500 hover:text-green-500";
  }

  return "text-yellow-500 hover:text-yellow-500";
}

function getDebtStatusIcon(settled: number, amount: number) {
  if (settled === amount) {
    return <CheckCircle2Icon className="size-9" strokeWidth={1} />;
  }

  if (settled === 0) {
    return <CircleIcon className="size-9" strokeWidth={1} />;
  }

  return <CheckCircle2Icon className="size-9" strokeWidth={1} />;
}

const formSchema = z.object({
  amount: z.number().min(0, "Kwota musi być większa niż 0"),
});

function SettleDebtForm({
  debt,
}: {
  debt: ExpenseDebtGetPayload<{ include: { debtor: true } }>;
}) {
  const [open, setOpen] = useState(false);

  const settleDebtMutation = useMutation(
    orpc.expense.debt.settleByAmount.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(
          orpc.expense.getById.queryOptions({
            input: {
              id: debt.expenseId,
            },
          })
        );
        queryClient.invalidateQueries(
          orpc.expense.log.getByExpenseId.queryOptions({
            input: {
              expenseId: debt.expenseId,
            },
          })
        );
        toast.success("Pomyślnie oddano kwotę");
        setOpen(false);
        form.reset();
      },
      onError(error) {
        toast.error("Nie udało się oddać kwoty", {
          description: error.message,
        });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      amount: Number(debt.amount.minus(debt.settled)),
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      settleDebtMutation.mutate({
        debtId: debt.id,
        amount: value.amount,
      });
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "rounded-full",
            getDebtStatusColor(Number(debt.settled), Number(debt.amount))
          )}
          disabled={debt.amount.equals(debt.settled)}
          size="icon"
          variant="ghost"
        >
          {getDebtStatusIcon(Number(debt.settled), Number(debt.amount))}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rozlicz dług</DialogTitle>
          <DialogDescription>
            Rozlicz dług uczestnika {debt.debtor.name}
          </DialogDescription>
        </DialogHeader>
        <form
          id="settle-debt-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Kwota rozliczenia
                    </FieldLabel>
                    <NumberField
                      aria-invalid={isInvalid}
                      aria-label="Kwota rozliczenia"
                      formatOptions={{
                        style: "currency",
                        currency: "PLN",
                        currencySign: "accounting",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }}
                      id={field.name}
                      maxValue={Number(debt.amount.minus(debt.settled))}
                      minValue={0}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e)}
                      value={field.state.value}
                    >
                      <NumberFieldInput />
                    </NumberField>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="amount"
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Anuluj
            </Button>
          </DialogClose>
          <Button form="settle-debt-form" type="submit">
            Rozlicz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
