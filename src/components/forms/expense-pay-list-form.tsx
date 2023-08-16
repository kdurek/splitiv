// const expensePayListSchema = z
//   .object({
//     debts: z
//       .array(
//         z.object({
//           id: z.string().cuid2(),
//           name: z.string(),
//           settled: z.number(),
//           amount: z.number(),
//           check: z.boolean(),
//         })
//       )
//       .optional(),
//   })
//   .refine((values) => values.debts?.filter((debt) => debt.check).length !== 0, {
//     message: "Musisz wybrać przynajmniej jeden dług",
//     path: ["debts"],
//   });

// type ExpensePayListSchema = z.infer<typeof expensePayListSchema>;

// interface ExpensePayListFormProps {
//   payerId: string;
//   debtorId: string;
//   onSubmit?: () => void;
// }

// export function ExpensePayListForm({
//   payerId,
//   debtorId,
//   onSubmit,
// }: ExpensePayListFormProps) {
//   const form = useForm<ExpensePayListSchema>({
//     validate: zodResolver(expensePayListSchema),
//   });

//   api.debt.getAll.useQuery(
//     {
//       payerId,
//       debtorId,
//       isSettled: false,
//     },
//     {
//       staleTime: Infinity,
//       onSuccess: (data) => {
//         const initialValues = {
//           debts: data.map((debt) => ({
//             id: debt.id,
//             name: debt.expense.name ?? "Brak nazwy",
//             settled: Number(debt.settled),
//             amount: Number(debt.amount),
//             check: false,
//           })),
//         };
//         form.setValues(initialValues);
//         form.resetDirty(initialValues);
//       },
//     }
//   );

//   const { mutate: settleExpenseDebts, isLoading: isLoadingSettleExpenseDebts } =
//     useSettleExpenseDebts();

//   const debtsSum = form.values.debts
//     ?.reduce(
//       (prev, curr) => prev + (curr.check ? curr.amount - curr.settled : 0),
//       0
//     )
//     .toFixed(2);

//   const handleSettleExpenseDebts = (values: ExpensePayListSchema) => {
//     const expenseDebts = values.debts
//       ?.filter((debt) => debt.check)
//       .map((debt) => {
//         return {
//           id: debt.id,
//           settled: debt.amount,
//         };
//       });

//     if (expenseDebts) {
//       settleExpenseDebts(
//         {
//           expenseDebts,
//         },
//         {
//           onSuccess() {
//             form.reset();
//             if (onSubmit) {
//               onSubmit();
//             }
//           },
//         }
//       );
//     }
//   };

//   return (
//     <Box component="form" onSubmit={form.onSubmit(handleSettleExpenseDebts)}>
//       <Stack>
//         {form.values.debts?.map((debtField, index) => (
//           <Paper key={debtField.id} withBorder p="md">
//             <Group>
//               <Text sx={{ flex: 1 }} weight={700}>
//                 {debtField.name}
//               </Text>
//               <Checkbox
//                 label={`${(
//                   Number(debtField.amount) - Number(debtField.settled)
//                 ).toFixed(2)} zł`}
//                 labelPosition="left"
//                 {...form.getInputProps(`debts.${index}.check`, {
//                   type: "checkbox",
//                 })}
//               />
//             </Group>
//           </Paper>
//         ))}
//         {form.errors.debts && (
//           <Text size="xs" color="red">
//             {form.errors.debts}
//           </Text>
//         )}
//         <Group position="apart">
//           <Text weight={700}>{`${debtsSum} zł`}</Text>
//           <Group>
//             <ActionIcon
//               color="blue"
//               size={36}
//               variant="filled"
//               onClick={() =>
//                 form.values.debts?.forEach((_, index) =>
//                   form.setFieldValue(`debts.${index}.check`, true)
//                 )
//               }
//             >
//               <IconSquareArrowUp />
//             </ActionIcon>
//             <Button loading={isLoadingSettleExpenseDebts}>
//               Oddaj
//             </Button>
//           </Group>
//         </Group>
//       </Stack>
//     </Box>
//   );
// }
