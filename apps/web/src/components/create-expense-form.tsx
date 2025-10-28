import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import Decimal from "decimal.js";
import { Fragment } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { NumberField, NumberFieldInput } from "@/components/ui/number-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { allocate } from "@/utils/allocate";
import { orpc } from "@/utils/orpc";

const SPLIT_METHODS = [
  { value: "ratio", label: "Udziały" },
  { value: "equal", label: "Równo" },
  { value: "custom", label: "Własne" },
];

const RATIO_SPLIT_VALUES = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
];

const formSchema = z
  .object({
    name: z
      .string()
      .min(3, { error: "Minimalna długość to 3 znaki" })
      .max(30, { error: "Maksymalna długość to 30 znaków" }),
    description: z
      .string()
      .max(500, { error: "Maksymalna długość to 500 znaków" }),
    amount: z
      .number({ error: "Musisz wpisać kwotę" })
      .positive({ error: "Kwota musi być większa niż zero" }),
    payerId: z.cuid({ error: "Musisz wybrać osobę płacącą" }),
    splitMethod: z.enum(["equal", "ratio", "custom"], {
      error: "Musisz wybrać sposób rozliczenia",
    }),
    debts: z.array(
      z.object({
        debtorId: z.cuid(),
        amount: z.number(),
        equalSplit: z.boolean(),
        ratioSplit: z.number(),
        customSplit: z.number(),
      })
    ),
  })
  .refine(
    (values) => {
      if (
        new Decimal(
          values.debts.find((debt) => debt.debtorId === values.payerId)
            ?.amount ?? 0
        ).equals(new Decimal(values.amount))
      ) {
        return false;
      }
      return true;
    },
    {
      error:
        "Kwota wydatku nie może być całkowicie przypisana do osoby płacącej",
      path: ["debts"],
    }
  )
  .refine(
    (values) => {
      if (values.splitMethod !== "custom") {
        return true;
      }
      const usedAmount = values.debts.reduce(
        (sum, curr) => sum.add(new Decimal(curr.amount)),
        new Decimal(0)
      );
      return new Decimal(values.amount).equals(usedAmount);
    },
    {
      error: "Kwota wydatku nie jest równo rozdzielona pomiędzy uczestników",
      path: ["debts"],
    }
  );

function allocateDebts(
  debts: z.infer<typeof formSchema>["debts"],
  amount: number,
  splitMethod: string
) {
  if (splitMethod === "custom") {
    return debts.map((debt) => ({
      ...debt,
      amount: debt.customSplit,
    }));
  }

  const getRatio = (
    debt: z.infer<typeof formSchema>["debts"][number]
  ): number => {
    if (splitMethod === "equal") {
      return debt.equalSplit ? 1 : 0;
    }
    if (splitMethod === "ratio") {
      return debt.ratioSplit;
    }
    return 0;
  };

  const debtsWithRatios = debts.map((debt) => ({
    debtorId: debt.debtorId,
    ratio: getRatio(debt),
  }));

  const allocatedDebts = allocate(debtsWithRatios, amount);

  const allocatedAmounts = new Map(
    allocatedDebts.map((d) => [d.debtorId, d.amount])
  );

  return debts.map((debt) => ({
    ...debt,
    amount: allocatedAmounts.get(debt.debtorId) ?? 0,
  }));
}

export function CreateExpenseForm() {
  const navigate = useNavigate();

  const currentUserQuery = useQuery(orpc.auth.getCurrentUser.queryOptions());
  const currentGroupQuery = useQuery(orpc.group.current.queryOptions());

  const createExpenseMutation = useMutation(
    orpc.expense.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Wydatek został dodany pomyślnie");
        navigate({
          to: "/expenses/$expenseId",
          params: { expenseId: data.id },
        });
      },
      onError: (error) => {
        toast.error("Wystąpił błąd podczas dodawania wydatku", {
          description: error.message,
        });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
      payerId: currentUserQuery.data?.id ?? "",
      splitMethod: "ratio",
      debts:
        currentGroupQuery.data?.members?.map((member) => ({
          debtorId: member.user.id,
          amount: 0,
          equalSplit: false,
          ratioSplit: 0,
          customSplit: 0,
        })) ?? [],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      createExpenseMutation.mutate({
        name: value.name,
        description: value.description,
        amount: value.amount,
        payerId: value.payerId,
        debts: value.debts
          .filter((debt) => debt.amount > 0)
          .map((debt) => ({
            debtorId: debt.debtorId,
            amount: debt.amount,
            settled: debt.debtorId === value.payerId ? debt.amount : 0,
          })),
      });
    },
  });

  const handleAllocateDebts = () => {
    const amount = form.getFieldValue("amount");
    const debts = form.getFieldValue("debts");
    const splitMethod = form.getFieldValue("splitMethod");
    const newDebts = allocateDebts(debts, amount, splitMethod);
    form.setFieldValue("debts", newDebts);
  };

  if (currentUserQuery.isPending || currentGroupQuery.isPending) {
    return <PageLoader />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj wydatek</CardTitle>
        <CardDescription>Dodaj nowy wydatek do swojej grupy.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="create-expense-form"
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
                    <FieldLabel htmlFor={field.name}>Nazwa wydatku</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="name"
            />

            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Opis (opcjonalnie)
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        aria-invalid={isInvalid}
                        className="min-h-24 resize-none"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={4}
                        value={field.state.value}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.state.value.length}/500 znaków
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="description"
            />

            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Kwota wydatku</FieldLabel>
                    <NumberField
                      aria-invalid={isInvalid}
                      aria-label="Kwota wydatku"
                      formatOptions={{
                        style: "currency",
                        currency: "PLN",
                        currencySign: "accounting",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }}
                      id={field.name}
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
              listeners={{
                onChange: handleAllocateDebts,
              }}
              name="amount"
            />

            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Osoba płacąca</FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.handleChange}
                      value={field.state.value}
                    >
                      <SelectTrigger aria-invalid={isInvalid} id={field.name}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {currentGroupQuery.data?.members?.map((member) => (
                          <SelectItem
                            key={member.user.id}
                            value={member.user.id}
                          >
                            {member.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="payerId"
            />

            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Sposób rozliczenia
                    </FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.handleChange}
                      value={field.state.value}
                    >
                      <SelectTrigger
                        aria-invalid={isInvalid}
                        className="w-full"
                        id={field.name}
                      >
                        <SelectValue placeholder="Wybierz sposób rozliczenia" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {SPLIT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              listeners={{
                onChange: handleAllocateDebts,
              }}
              name="splitMethod"
            />

            <form.Field mode="array" name="debts">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const splitMethod = form.getFieldValue("splitMethod");
                return (
                  <FieldSet>
                    <FieldLegend variant="label">Uczestnicy</FieldLegend>
                    <FieldGroup className="gap-4">
                      {field.state.value.map((debt, index) => (
                        <Fragment key={index}>
                          <div className="flex h-9 items-center justify-between gap-4">
                            <Label>
                              {
                                currentGroupQuery.data?.members?.find(
                                  (member) => member.user.id === debt.debtorId
                                )?.user.name
                              }
                            </Label>
                            <div>
                              {splitMethod === "equal" && (
                                <form.Field
                                  children={(subField) => (
                                    <Field
                                      data-invalid={isInvalid}
                                      orientation="horizontal"
                                    >
                                      <FieldLabel
                                        className="text-muted-foreground"
                                        htmlFor={subField.name}
                                      >
                                        {Intl.NumberFormat("pl-PL", {
                                          style: "currency",
                                          currency: "PLN",
                                          currencySign: "accounting",
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(debt.amount)}
                                      </FieldLabel>
                                      <Checkbox
                                        aria-invalid={isInvalid}
                                        checked={subField.state.value}
                                        className="size-6"
                                        id={subField.name}
                                        name={subField.name}
                                        onCheckedChange={(checked) =>
                                          subField.handleChange(
                                            checked === true
                                          )
                                        }
                                      />
                                    </Field>
                                  )}
                                  key={index}
                                  listeners={{
                                    onChange: handleAllocateDebts,
                                  }}
                                  name={`debts[${index}].equalSplit`}
                                />
                              )}

                              {splitMethod === "ratio" && (
                                <form.Field
                                  children={(subField) => (
                                    <Field
                                      data-invalid={isInvalid}
                                      orientation="horizontal"
                                    >
                                      <FieldLabel
                                        className="text-muted-foreground"
                                        htmlFor={subField.name}
                                      >
                                        {Intl.NumberFormat("pl-PL", {
                                          style: "currency",
                                          currency: "PLN",
                                          currencySign: "accounting",
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(debt.amount)}
                                      </FieldLabel>
                                      <Select
                                        name={subField.name}
                                        onValueChange={(value) =>
                                          subField.handleChange(Number(value))
                                        }
                                        value={subField.state.value.toString()}
                                      >
                                        <SelectTrigger
                                          aria-invalid={isInvalid}
                                          id={subField.name}
                                        >
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent position="item-aligned">
                                          {RATIO_SPLIT_VALUES.map((ratio) => (
                                            <SelectItem
                                              key={ratio.value}
                                              value={ratio.value.toString()}
                                            >
                                              {ratio.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </Field>
                                  )}
                                  key={index}
                                  listeners={{
                                    onChange: handleAllocateDebts,
                                  }}
                                  name={`debts[${index}].ratioSplit`}
                                />
                              )}

                              {splitMethod === "custom" && (
                                <form.Field
                                  children={(subField) => (
                                    <Field
                                      data-invalid={isInvalid}
                                      orientation="horizontal"
                                    >
                                      <NumberField
                                        aria-invalid={isInvalid}
                                        aria-label="Kwota wydatku"
                                        formatOptions={{
                                          style: "currency",
                                          currency: "PLN",
                                          currencySign: "accounting",
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }}
                                        id={subField.name}
                                        minValue={0}
                                        name={subField.name}
                                        onBlur={subField.handleBlur}
                                        onChange={(e) =>
                                          subField.handleChange(e)
                                        }
                                        value={subField.state.value}
                                      >
                                        <NumberFieldInput className="w-24" />
                                      </NumberField>
                                    </Field>
                                  )}
                                  key={index}
                                  listeners={{
                                    onChange: handleAllocateDebts,
                                  }}
                                  name={`debts[${index}].customSplit`}
                                />
                              )}
                            </div>
                          </div>
                          {index !== field.state.value.length - 1 && (
                            <Separator />
                          )}
                        </Fragment>
                      ))}
                    </FieldGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldSet>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button className="w-full" form="create-expense-form" type="submit">
          Dodaj
        </Button>
      </CardFooter>
    </Card>
  );
}
