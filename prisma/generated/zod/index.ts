import { z } from 'zod';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// DECIMAL
//------------------------------------------------------

export const DecimalJsLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.function(z.tuple([]), z.string()),
})

export const DECIMAL_STRING_REGEX = /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;

export const isValidDecimalInput =
  (v?: null | string | number | Prisma.DecimalJsLike): v is string | number | Prisma.DecimalJsLike => {
    if (v === undefined || v === null) return false;
    return (
      (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
      (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
      typeof v === 'number'
    )
  };

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const GroupScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','name','adminId']);

export const UserGroupScalarFieldEnumSchema = z.enum(['userId','groupId']);

export const ExpenseLogScalarFieldEnumSchema = z.enum(['id','amount','debtId','createdAt','updatedAt']);

export const ExpenseDebtScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','amount','settled','expenseId','debtorId']);

export const ExpenseScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','name','description','payerId','amount','groupId']);

export const UserScalarFieldEnumSchema = z.enum(['id','googleId','name','firstName','lastName','email','password','image','activeGroupId','createdAt','updatedAt']);

export const PushSubscriptionScalarFieldEnumSchema = z.enum(['endpoint','p256dh','auth','userId']);

export const SessionScalarFieldEnumSchema = z.enum(['id','userId','expiresAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// GROUP SCHEMA
/////////////////////////////////////////

export const GroupSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  name: z.string(),
  adminId: z.string(),
})

export type Group = z.infer<typeof GroupSchema>

// GROUP RELATION SCHEMA
//------------------------------------------------------

export type GroupRelations = {
  members: UserGroupWithRelations[];
  expenses: ExpenseWithRelations[];
};

export type GroupWithRelations = z.infer<typeof GroupSchema> & GroupRelations

export const GroupWithRelationsSchema: z.ZodType<GroupWithRelations> = GroupSchema.merge(z.object({
  members: z.lazy(() => UserGroupWithRelationsSchema).array(),
  expenses: z.lazy(() => ExpenseWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// USER GROUP SCHEMA
/////////////////////////////////////////

export const UserGroupSchema = z.object({
  userId: z.string(),
  groupId: z.string(),
})

export type UserGroup = z.infer<typeof UserGroupSchema>

// USER GROUP RELATION SCHEMA
//------------------------------------------------------

export type UserGroupRelations = {
  user: UserWithRelations;
  group: GroupWithRelations;
};

export type UserGroupWithRelations = z.infer<typeof UserGroupSchema> & UserGroupRelations

export const UserGroupWithRelationsSchema: z.ZodType<UserGroupWithRelations> = UserGroupSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
  group: z.lazy(() => GroupWithRelationsSchema),
}))

/////////////////////////////////////////
// EXPENSE LOG SCHEMA
/////////////////////////////////////////

export const ExpenseLogSchema = z.object({
  id: z.string().cuid(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'ExpenseLog']"}),
  debtId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ExpenseLog = z.infer<typeof ExpenseLogSchema>

// EXPENSE LOG RELATION SCHEMA
//------------------------------------------------------

export type ExpenseLogRelations = {
  debt: ExpenseDebtWithRelations;
};

export type ExpenseLogWithRelations = z.infer<typeof ExpenseLogSchema> & ExpenseLogRelations

export const ExpenseLogWithRelationsSchema: z.ZodType<ExpenseLogWithRelations> = ExpenseLogSchema.merge(z.object({
  debt: z.lazy(() => ExpenseDebtWithRelationsSchema),
}))

/////////////////////////////////////////
// EXPENSE DEBT SCHEMA
/////////////////////////////////////////

export const ExpenseDebtSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'ExpenseDebt']"}),
  settled: z.instanceof(Prisma.Decimal, { message: "Field 'settled' must be a Decimal. Location: ['Models', 'ExpenseDebt']"}),
  expenseId: z.string(),
  debtorId: z.string(),
})

export type ExpenseDebt = z.infer<typeof ExpenseDebtSchema>

// EXPENSE DEBT RELATION SCHEMA
//------------------------------------------------------

export type ExpenseDebtRelations = {
  expense: ExpenseWithRelations;
  debtor: UserWithRelations;
  logs: ExpenseLogWithRelations[];
};

export type ExpenseDebtWithRelations = z.infer<typeof ExpenseDebtSchema> & ExpenseDebtRelations

export const ExpenseDebtWithRelationsSchema: z.ZodType<ExpenseDebtWithRelations> = ExpenseDebtSchema.merge(z.object({
  expense: z.lazy(() => ExpenseWithRelationsSchema),
  debtor: z.lazy(() => UserWithRelationsSchema),
  logs: z.lazy(() => ExpenseLogWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// EXPENSE SCHEMA
/////////////////////////////////////////

export const ExpenseSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  name: z.string(),
  description: z.string().nullable(),
  payerId: z.string(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'Expense']"}),
  groupId: z.string(),
})

export type Expense = z.infer<typeof ExpenseSchema>

// EXPENSE RELATION SCHEMA
//------------------------------------------------------

export type ExpenseRelations = {
  payer: UserWithRelations;
  debts: ExpenseDebtWithRelations[];
  group: GroupWithRelations;
};

export type ExpenseWithRelations = z.infer<typeof ExpenseSchema> & ExpenseRelations

export const ExpenseWithRelationsSchema: z.ZodType<ExpenseWithRelations> = ExpenseSchema.merge(z.object({
  payer: z.lazy(() => UserWithRelationsSchema),
  debts: z.lazy(() => ExpenseDebtWithRelationsSchema).array(),
  group: z.lazy(() => GroupWithRelationsSchema),
}))

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string().cuid(),
  googleId: z.string().nullable(),
  name: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().nullable(),
  password: z.string().nullable(),
  image: z.string().nullable(),
  activeGroupId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

// USER RELATION SCHEMA
//------------------------------------------------------

export type UserRelations = {
  sessions: SessionWithRelations[];
  groups: UserGroupWithRelations[];
  expenses: ExpenseWithRelations[];
  debts: ExpenseDebtWithRelations[];
  pushSubscriptions: PushSubscriptionWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(z.object({
  sessions: z.lazy(() => SessionWithRelationsSchema).array(),
  groups: z.lazy(() => UserGroupWithRelationsSchema).array(),
  expenses: z.lazy(() => ExpenseWithRelationsSchema).array(),
  debts: z.lazy(() => ExpenseDebtWithRelationsSchema).array(),
  pushSubscriptions: z.lazy(() => PushSubscriptionWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// PUSH SUBSCRIPTION SCHEMA
/////////////////////////////////////////

export const PushSubscriptionSchema = z.object({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
  userId: z.string(),
})

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>

// PUSH SUBSCRIPTION RELATION SCHEMA
//------------------------------------------------------

export type PushSubscriptionRelations = {
  user: UserWithRelations;
};

export type PushSubscriptionWithRelations = z.infer<typeof PushSubscriptionSchema> & PushSubscriptionRelations

export const PushSubscriptionWithRelationsSchema: z.ZodType<PushSubscriptionWithRelations> = PushSubscriptionSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
}))

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  expiresAt: z.coerce.date(),
})

export type Session = z.infer<typeof SessionSchema>

// SESSION RELATION SCHEMA
//------------------------------------------------------

export type SessionRelations = {
  user: UserWithRelations;
};

export type SessionWithRelations = z.infer<typeof SessionSchema> & SessionRelations

export const SessionWithRelationsSchema: z.ZodType<SessionWithRelations> = SessionSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
}))

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// GROUP
//------------------------------------------------------

export const GroupIncludeSchema: z.ZodType<Prisma.GroupInclude> = z.object({
  members: z.union([z.boolean(),z.lazy(() => UserGroupFindManyArgsSchema)]).optional(),
  expenses: z.union([z.boolean(),z.lazy(() => ExpenseFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => GroupCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const GroupArgsSchema: z.ZodType<Prisma.GroupDefaultArgs> = z.object({
  select: z.lazy(() => GroupSelectSchema).optional(),
  include: z.lazy(() => GroupIncludeSchema).optional(),
}).strict();

export const GroupCountOutputTypeArgsSchema: z.ZodType<Prisma.GroupCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => GroupCountOutputTypeSelectSchema).nullish(),
}).strict();

export const GroupCountOutputTypeSelectSchema: z.ZodType<Prisma.GroupCountOutputTypeSelect> = z.object({
  members: z.boolean().optional(),
  expenses: z.boolean().optional(),
}).strict();

export const GroupSelectSchema: z.ZodType<Prisma.GroupSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  name: z.boolean().optional(),
  adminId: z.boolean().optional(),
  members: z.union([z.boolean(),z.lazy(() => UserGroupFindManyArgsSchema)]).optional(),
  expenses: z.union([z.boolean(),z.lazy(() => ExpenseFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => GroupCountOutputTypeArgsSchema)]).optional(),
}).strict()

// USER GROUP
//------------------------------------------------------

export const UserGroupIncludeSchema: z.ZodType<Prisma.UserGroupInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  group: z.union([z.boolean(),z.lazy(() => GroupArgsSchema)]).optional(),
}).strict()

export const UserGroupArgsSchema: z.ZodType<Prisma.UserGroupDefaultArgs> = z.object({
  select: z.lazy(() => UserGroupSelectSchema).optional(),
  include: z.lazy(() => UserGroupIncludeSchema).optional(),
}).strict();

export const UserGroupSelectSchema: z.ZodType<Prisma.UserGroupSelect> = z.object({
  userId: z.boolean().optional(),
  groupId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  group: z.union([z.boolean(),z.lazy(() => GroupArgsSchema)]).optional(),
}).strict()

// EXPENSE LOG
//------------------------------------------------------

export const ExpenseLogIncludeSchema: z.ZodType<Prisma.ExpenseLogInclude> = z.object({
  debt: z.union([z.boolean(),z.lazy(() => ExpenseDebtArgsSchema)]).optional(),
}).strict()

export const ExpenseLogArgsSchema: z.ZodType<Prisma.ExpenseLogDefaultArgs> = z.object({
  select: z.lazy(() => ExpenseLogSelectSchema).optional(),
  include: z.lazy(() => ExpenseLogIncludeSchema).optional(),
}).strict();

export const ExpenseLogSelectSchema: z.ZodType<Prisma.ExpenseLogSelect> = z.object({
  id: z.boolean().optional(),
  amount: z.boolean().optional(),
  debtId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  debt: z.union([z.boolean(),z.lazy(() => ExpenseDebtArgsSchema)]).optional(),
}).strict()

// EXPENSE DEBT
//------------------------------------------------------

export const ExpenseDebtIncludeSchema: z.ZodType<Prisma.ExpenseDebtInclude> = z.object({
  expense: z.union([z.boolean(),z.lazy(() => ExpenseArgsSchema)]).optional(),
  debtor: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  logs: z.union([z.boolean(),z.lazy(() => ExpenseLogFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ExpenseDebtCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ExpenseDebtArgsSchema: z.ZodType<Prisma.ExpenseDebtDefaultArgs> = z.object({
  select: z.lazy(() => ExpenseDebtSelectSchema).optional(),
  include: z.lazy(() => ExpenseDebtIncludeSchema).optional(),
}).strict();

export const ExpenseDebtCountOutputTypeArgsSchema: z.ZodType<Prisma.ExpenseDebtCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ExpenseDebtCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ExpenseDebtCountOutputTypeSelectSchema: z.ZodType<Prisma.ExpenseDebtCountOutputTypeSelect> = z.object({
  logs: z.boolean().optional(),
}).strict();

export const ExpenseDebtSelectSchema: z.ZodType<Prisma.ExpenseDebtSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  amount: z.boolean().optional(),
  settled: z.boolean().optional(),
  expenseId: z.boolean().optional(),
  debtorId: z.boolean().optional(),
  expense: z.union([z.boolean(),z.lazy(() => ExpenseArgsSchema)]).optional(),
  debtor: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  logs: z.union([z.boolean(),z.lazy(() => ExpenseLogFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ExpenseDebtCountOutputTypeArgsSchema)]).optional(),
}).strict()

// EXPENSE
//------------------------------------------------------

export const ExpenseIncludeSchema: z.ZodType<Prisma.ExpenseInclude> = z.object({
  payer: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  debts: z.union([z.boolean(),z.lazy(() => ExpenseDebtFindManyArgsSchema)]).optional(),
  group: z.union([z.boolean(),z.lazy(() => GroupArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ExpenseCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ExpenseArgsSchema: z.ZodType<Prisma.ExpenseDefaultArgs> = z.object({
  select: z.lazy(() => ExpenseSelectSchema).optional(),
  include: z.lazy(() => ExpenseIncludeSchema).optional(),
}).strict();

export const ExpenseCountOutputTypeArgsSchema: z.ZodType<Prisma.ExpenseCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ExpenseCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ExpenseCountOutputTypeSelectSchema: z.ZodType<Prisma.ExpenseCountOutputTypeSelect> = z.object({
  debts: z.boolean().optional(),
}).strict();

export const ExpenseSelectSchema: z.ZodType<Prisma.ExpenseSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  name: z.boolean().optional(),
  description: z.boolean().optional(),
  payerId: z.boolean().optional(),
  amount: z.boolean().optional(),
  groupId: z.boolean().optional(),
  payer: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  debts: z.union([z.boolean(),z.lazy(() => ExpenseDebtFindManyArgsSchema)]).optional(),
  group: z.union([z.boolean(),z.lazy(() => GroupArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ExpenseCountOutputTypeArgsSchema)]).optional(),
}).strict()

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  groups: z.union([z.boolean(),z.lazy(() => UserGroupFindManyArgsSchema)]).optional(),
  expenses: z.union([z.boolean(),z.lazy(() => ExpenseFindManyArgsSchema)]).optional(),
  debts: z.union([z.boolean(),z.lazy(() => ExpenseDebtFindManyArgsSchema)]).optional(),
  pushSubscriptions: z.union([z.boolean(),z.lazy(() => PushSubscriptionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  sessions: z.boolean().optional(),
  groups: z.boolean().optional(),
  expenses: z.boolean().optional(),
  debts: z.boolean().optional(),
  pushSubscriptions: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  googleId: z.boolean().optional(),
  name: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  email: z.boolean().optional(),
  password: z.boolean().optional(),
  image: z.boolean().optional(),
  activeGroupId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  groups: z.union([z.boolean(),z.lazy(() => UserGroupFindManyArgsSchema)]).optional(),
  expenses: z.union([z.boolean(),z.lazy(() => ExpenseFindManyArgsSchema)]).optional(),
  debts: z.union([z.boolean(),z.lazy(() => ExpenseDebtFindManyArgsSchema)]).optional(),
  pushSubscriptions: z.union([z.boolean(),z.lazy(() => PushSubscriptionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PUSH SUBSCRIPTION
//------------------------------------------------------

export const PushSubscriptionIncludeSchema: z.ZodType<Prisma.PushSubscriptionInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const PushSubscriptionArgsSchema: z.ZodType<Prisma.PushSubscriptionDefaultArgs> = z.object({
  select: z.lazy(() => PushSubscriptionSelectSchema).optional(),
  include: z.lazy(() => PushSubscriptionIncludeSchema).optional(),
}).strict();

export const PushSubscriptionSelectSchema: z.ZodType<Prisma.PushSubscriptionSelect> = z.object({
  endpoint: z.boolean().optional(),
  p256dh: z.boolean().optional(),
  auth: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// SESSION
//------------------------------------------------------

export const SessionIncludeSchema: z.ZodType<Prisma.SessionInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const SessionArgsSchema: z.ZodType<Prisma.SessionDefaultArgs> = z.object({
  select: z.lazy(() => SessionSelectSchema).optional(),
  include: z.lazy(() => SessionIncludeSchema).optional(),
}).strict();

export const SessionSelectSchema: z.ZodType<Prisma.SessionSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const GroupWhereInputSchema: z.ZodType<Prisma.GroupWhereInput> = z.object({
  AND: z.union([ z.lazy(() => GroupWhereInputSchema),z.lazy(() => GroupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => GroupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => GroupWhereInputSchema),z.lazy(() => GroupWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  adminId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  members: z.lazy(() => UserGroupListRelationFilterSchema).optional(),
  expenses: z.lazy(() => ExpenseListRelationFilterSchema).optional()
}).strict();

export const GroupOrderByWithRelationInputSchema: z.ZodType<Prisma.GroupOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  adminId: z.lazy(() => SortOrderSchema).optional(),
  members: z.lazy(() => UserGroupOrderByRelationAggregateInputSchema).optional(),
  expenses: z.lazy(() => ExpenseOrderByRelationAggregateInputSchema).optional()
}).strict();

export const GroupWhereUniqueInputSchema: z.ZodType<Prisma.GroupWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => GroupWhereInputSchema),z.lazy(() => GroupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => GroupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => GroupWhereInputSchema),z.lazy(() => GroupWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  adminId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  members: z.lazy(() => UserGroupListRelationFilterSchema).optional(),
  expenses: z.lazy(() => ExpenseListRelationFilterSchema).optional()
}).strict());

export const GroupOrderByWithAggregationInputSchema: z.ZodType<Prisma.GroupOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  adminId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => GroupCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => GroupMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => GroupMinOrderByAggregateInputSchema).optional()
}).strict();

export const GroupScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.GroupScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => GroupScalarWhereWithAggregatesInputSchema),z.lazy(() => GroupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => GroupScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => GroupScalarWhereWithAggregatesInputSchema),z.lazy(() => GroupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  adminId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UserGroupWhereInputSchema: z.ZodType<Prisma.UserGroupWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserGroupWhereInputSchema),z.lazy(() => UserGroupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGroupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGroupWhereInputSchema),z.lazy(() => UserGroupWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  groupId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  group: z.union([ z.lazy(() => GroupRelationFilterSchema),z.lazy(() => GroupWhereInputSchema) ]).optional(),
}).strict();

export const UserGroupOrderByWithRelationInputSchema: z.ZodType<Prisma.UserGroupOrderByWithRelationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  groupId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  group: z.lazy(() => GroupOrderByWithRelationInputSchema).optional()
}).strict();

export const UserGroupWhereUniqueInputSchema: z.ZodType<Prisma.UserGroupWhereUniqueInput> = z.object({
  userId_groupId: z.lazy(() => UserGroupUserIdGroupIdCompoundUniqueInputSchema)
})
.and(z.object({
  userId_groupId: z.lazy(() => UserGroupUserIdGroupIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => UserGroupWhereInputSchema),z.lazy(() => UserGroupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGroupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGroupWhereInputSchema),z.lazy(() => UserGroupWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  groupId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  group: z.union([ z.lazy(() => GroupRelationFilterSchema),z.lazy(() => GroupWhereInputSchema) ]).optional(),
}).strict());

export const UserGroupOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserGroupOrderByWithAggregationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  groupId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserGroupCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserGroupMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserGroupMinOrderByAggregateInputSchema).optional()
}).strict();

export const UserGroupScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserGroupScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserGroupScalarWhereWithAggregatesInputSchema),z.lazy(() => UserGroupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGroupScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGroupScalarWhereWithAggregatesInputSchema),z.lazy(() => UserGroupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  groupId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const ExpenseLogWhereInputSchema: z.ZodType<Prisma.ExpenseLogWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ExpenseLogWhereInputSchema),z.lazy(() => ExpenseLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseLogWhereInputSchema),z.lazy(() => ExpenseLogWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  debtId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  debt: z.union([ z.lazy(() => ExpenseDebtRelationFilterSchema),z.lazy(() => ExpenseDebtWhereInputSchema) ]).optional(),
}).strict();

export const ExpenseLogOrderByWithRelationInputSchema: z.ZodType<Prisma.ExpenseLogOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  debtId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  debt: z.lazy(() => ExpenseDebtOrderByWithRelationInputSchema).optional()
}).strict();

export const ExpenseLogWhereUniqueInputSchema: z.ZodType<Prisma.ExpenseLogWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => ExpenseLogWhereInputSchema),z.lazy(() => ExpenseLogWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseLogWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseLogWhereInputSchema),z.lazy(() => ExpenseLogWhereInputSchema).array() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  debtId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  debt: z.union([ z.lazy(() => ExpenseDebtRelationFilterSchema),z.lazy(() => ExpenseDebtWhereInputSchema) ]).optional(),
}).strict());

export const ExpenseLogOrderByWithAggregationInputSchema: z.ZodType<Prisma.ExpenseLogOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  debtId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ExpenseLogCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ExpenseLogAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ExpenseLogMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ExpenseLogMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ExpenseLogSumOrderByAggregateInputSchema).optional()
}).strict();

export const ExpenseLogScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ExpenseLogScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ExpenseLogScalarWhereWithAggregatesInputSchema),z.lazy(() => ExpenseLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseLogScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseLogScalarWhereWithAggregatesInputSchema),z.lazy(() => ExpenseLogScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  debtId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ExpenseDebtWhereInputSchema: z.ZodType<Prisma.ExpenseDebtWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ExpenseDebtWhereInputSchema),z.lazy(() => ExpenseDebtWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseDebtWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseDebtWhereInputSchema),z.lazy(() => ExpenseDebtWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  settled: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  expenseId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  debtorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expense: z.union([ z.lazy(() => ExpenseRelationFilterSchema),z.lazy(() => ExpenseWhereInputSchema) ]).optional(),
  debtor: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  logs: z.lazy(() => ExpenseLogListRelationFilterSchema).optional()
}).strict();

export const ExpenseDebtOrderByWithRelationInputSchema: z.ZodType<Prisma.ExpenseDebtOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  settled: z.lazy(() => SortOrderSchema).optional(),
  expenseId: z.lazy(() => SortOrderSchema).optional(),
  debtorId: z.lazy(() => SortOrderSchema).optional(),
  expense: z.lazy(() => ExpenseOrderByWithRelationInputSchema).optional(),
  debtor: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  logs: z.lazy(() => ExpenseLogOrderByRelationAggregateInputSchema).optional()
}).strict();

export const ExpenseDebtWhereUniqueInputSchema: z.ZodType<Prisma.ExpenseDebtWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => ExpenseDebtWhereInputSchema),z.lazy(() => ExpenseDebtWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseDebtWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseDebtWhereInputSchema),z.lazy(() => ExpenseDebtWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  settled: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  expenseId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  debtorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expense: z.union([ z.lazy(() => ExpenseRelationFilterSchema),z.lazy(() => ExpenseWhereInputSchema) ]).optional(),
  debtor: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  logs: z.lazy(() => ExpenseLogListRelationFilterSchema).optional()
}).strict());

export const ExpenseDebtOrderByWithAggregationInputSchema: z.ZodType<Prisma.ExpenseDebtOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  settled: z.lazy(() => SortOrderSchema).optional(),
  expenseId: z.lazy(() => SortOrderSchema).optional(),
  debtorId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ExpenseDebtCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ExpenseDebtAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ExpenseDebtMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ExpenseDebtMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ExpenseDebtSumOrderByAggregateInputSchema).optional()
}).strict();

export const ExpenseDebtScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ExpenseDebtScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ExpenseDebtScalarWhereWithAggregatesInputSchema),z.lazy(() => ExpenseDebtScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseDebtScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseDebtScalarWhereWithAggregatesInputSchema),z.lazy(() => ExpenseDebtScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  settled: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  expenseId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  debtorId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const ExpenseWhereInputSchema: z.ZodType<Prisma.ExpenseWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ExpenseWhereInputSchema),z.lazy(() => ExpenseWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseWhereInputSchema),z.lazy(() => ExpenseWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  payerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  groupId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  payer: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  debts: z.lazy(() => ExpenseDebtListRelationFilterSchema).optional(),
  group: z.union([ z.lazy(() => GroupRelationFilterSchema),z.lazy(() => GroupWhereInputSchema) ]).optional(),
}).strict();

export const ExpenseOrderByWithRelationInputSchema: z.ZodType<Prisma.ExpenseOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  payerId: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  groupId: z.lazy(() => SortOrderSchema).optional(),
  payer: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtOrderByRelationAggregateInputSchema).optional(),
  group: z.lazy(() => GroupOrderByWithRelationInputSchema).optional()
}).strict();

export const ExpenseWhereUniqueInputSchema: z.ZodType<Prisma.ExpenseWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => ExpenseWhereInputSchema),z.lazy(() => ExpenseWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseWhereInputSchema),z.lazy(() => ExpenseWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  payerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  groupId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  payer: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  debts: z.lazy(() => ExpenseDebtListRelationFilterSchema).optional(),
  group: z.union([ z.lazy(() => GroupRelationFilterSchema),z.lazy(() => GroupWhereInputSchema) ]).optional(),
}).strict());

export const ExpenseOrderByWithAggregationInputSchema: z.ZodType<Prisma.ExpenseOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  payerId: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  groupId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ExpenseCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ExpenseAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ExpenseMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ExpenseMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ExpenseSumOrderByAggregateInputSchema).optional()
}).strict();

export const ExpenseScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ExpenseScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ExpenseScalarWhereWithAggregatesInputSchema),z.lazy(() => ExpenseScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseScalarWhereWithAggregatesInputSchema),z.lazy(() => ExpenseScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  payerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  groupId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  googleId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  activeGroupId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  groups: z.lazy(() => UserGroupListRelationFilterSchema).optional(),
  expenses: z.lazy(() => ExpenseListRelationFilterSchema).optional(),
  debts: z.lazy(() => ExpenseDebtListRelationFilterSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionListRelationFilterSchema).optional()
}).strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  googleId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  firstName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  password: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  activeGroupId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  sessions: z.lazy(() => SessionOrderByRelationAggregateInputSchema).optional(),
  groups: z.lazy(() => UserGroupOrderByRelationAggregateInputSchema).optional(),
  expenses: z.lazy(() => ExpenseOrderByRelationAggregateInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtOrderByRelationAggregateInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionOrderByRelationAggregateInputSchema).optional()
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    googleId: z.string(),
    email: z.string()
  }),
  z.object({
    id: z.string().cuid(),
    googleId: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
    email: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    googleId: z.string(),
    email: z.string(),
  }),
  z.object({
    googleId: z.string(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  activeGroupId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
  groups: z.lazy(() => UserGroupListRelationFilterSchema).optional(),
  expenses: z.lazy(() => ExpenseListRelationFilterSchema).optional(),
  debts: z.lazy(() => ExpenseDebtListRelationFilterSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionListRelationFilterSchema).optional()
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  googleId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  firstName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  password: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  image: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  activeGroupId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional()
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  googleId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  firstName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  image: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  activeGroupId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const PushSubscriptionWhereInputSchema: z.ZodType<Prisma.PushSubscriptionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PushSubscriptionWhereInputSchema),z.lazy(() => PushSubscriptionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PushSubscriptionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PushSubscriptionWhereInputSchema),z.lazy(() => PushSubscriptionWhereInputSchema).array() ]).optional(),
  endpoint: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  p256dh: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  auth: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const PushSubscriptionOrderByWithRelationInputSchema: z.ZodType<Prisma.PushSubscriptionOrderByWithRelationInput> = z.object({
  endpoint: z.lazy(() => SortOrderSchema).optional(),
  p256dh: z.lazy(() => SortOrderSchema).optional(),
  auth: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const PushSubscriptionWhereUniqueInputSchema: z.ZodType<Prisma.PushSubscriptionWhereUniqueInput> = z.object({
  endpoint: z.string()
})
.and(z.object({
  endpoint: z.string().optional(),
  AND: z.union([ z.lazy(() => PushSubscriptionWhereInputSchema),z.lazy(() => PushSubscriptionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PushSubscriptionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PushSubscriptionWhereInputSchema),z.lazy(() => PushSubscriptionWhereInputSchema).array() ]).optional(),
  p256dh: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  auth: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const PushSubscriptionOrderByWithAggregationInputSchema: z.ZodType<Prisma.PushSubscriptionOrderByWithAggregationInput> = z.object({
  endpoint: z.lazy(() => SortOrderSchema).optional(),
  p256dh: z.lazy(() => SortOrderSchema).optional(),
  auth: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => PushSubscriptionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PushSubscriptionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PushSubscriptionMinOrderByAggregateInputSchema).optional()
}).strict();

export const PushSubscriptionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PushSubscriptionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => PushSubscriptionScalarWhereWithAggregatesInputSchema),z.lazy(() => PushSubscriptionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PushSubscriptionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PushSubscriptionScalarWhereWithAggregatesInputSchema),z.lazy(() => PushSubscriptionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  endpoint: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  p256dh: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  auth: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const SessionWhereInputSchema: z.ZodType<Prisma.SessionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const SessionOrderByWithRelationInputSchema: z.ZodType<Prisma.SessionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const SessionWhereUniqueInputSchema: z.ZodType<Prisma.SessionWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const SessionOrderByWithAggregationInputSchema: z.ZodType<Prisma.SessionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SessionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SessionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SessionMinOrderByAggregateInputSchema).optional()
}).strict();

export const SessionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SessionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const GroupCreateInputSchema: z.ZodType<Prisma.GroupCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  adminId: z.string(),
  members: z.lazy(() => UserGroupCreateNestedManyWithoutGroupInputSchema).optional(),
  expenses: z.lazy(() => ExpenseCreateNestedManyWithoutGroupInputSchema).optional()
}).strict();

export const GroupUncheckedCreateInputSchema: z.ZodType<Prisma.GroupUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  adminId: z.string(),
  members: z.lazy(() => UserGroupUncheckedCreateNestedManyWithoutGroupInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedCreateNestedManyWithoutGroupInputSchema).optional()
}).strict();

export const GroupUpdateInputSchema: z.ZodType<Prisma.GroupUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  adminId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  members: z.lazy(() => UserGroupUpdateManyWithoutGroupNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUpdateManyWithoutGroupNestedInputSchema).optional()
}).strict();

export const GroupUncheckedUpdateInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  adminId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  members: z.lazy(() => UserGroupUncheckedUpdateManyWithoutGroupNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedUpdateManyWithoutGroupNestedInputSchema).optional()
}).strict();

export const GroupCreateManyInputSchema: z.ZodType<Prisma.GroupCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  adminId: z.string()
}).strict();

export const GroupUpdateManyMutationInputSchema: z.ZodType<Prisma.GroupUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  adminId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const GroupUncheckedUpdateManyInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  adminId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGroupCreateInputSchema: z.ZodType<Prisma.UserGroupCreateInput> = z.object({
  user: z.lazy(() => UserCreateNestedOneWithoutGroupsInputSchema),
  group: z.lazy(() => GroupCreateNestedOneWithoutMembersInputSchema)
}).strict();

export const UserGroupUncheckedCreateInputSchema: z.ZodType<Prisma.UserGroupUncheckedCreateInput> = z.object({
  userId: z.string(),
  groupId: z.string()
}).strict();

export const UserGroupUpdateInputSchema: z.ZodType<Prisma.UserGroupUpdateInput> = z.object({
  user: z.lazy(() => UserUpdateOneRequiredWithoutGroupsNestedInputSchema).optional(),
  group: z.lazy(() => GroupUpdateOneRequiredWithoutMembersNestedInputSchema).optional()
}).strict();

export const UserGroupUncheckedUpdateInputSchema: z.ZodType<Prisma.UserGroupUncheckedUpdateInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  groupId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGroupCreateManyInputSchema: z.ZodType<Prisma.UserGroupCreateManyInput> = z.object({
  userId: z.string(),
  groupId: z.string()
}).strict();

export const UserGroupUpdateManyMutationInputSchema: z.ZodType<Prisma.UserGroupUpdateManyMutationInput> = z.object({
}).strict();

export const UserGroupUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserGroupUncheckedUpdateManyInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  groupId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseLogCreateInputSchema: z.ZodType<Prisma.ExpenseLogCreateInput> = z.object({
  id: z.string().cuid().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  debt: z.lazy(() => ExpenseDebtCreateNestedOneWithoutLogsInputSchema)
}).strict();

export const ExpenseLogUncheckedCreateInputSchema: z.ZodType<Prisma.ExpenseLogUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  debtId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ExpenseLogUpdateInputSchema: z.ZodType<Prisma.ExpenseLogUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  debt: z.lazy(() => ExpenseDebtUpdateOneRequiredWithoutLogsNestedInputSchema).optional()
}).strict();

export const ExpenseLogUncheckedUpdateInputSchema: z.ZodType<Prisma.ExpenseLogUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  debtId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseLogCreateManyInputSchema: z.ZodType<Prisma.ExpenseLogCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  debtId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ExpenseLogUpdateManyMutationInputSchema: z.ZodType<Prisma.ExpenseLogUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseLogUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ExpenseLogUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  debtId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseDebtCreateInputSchema: z.ZodType<Prisma.ExpenseDebtCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  expense: z.lazy(() => ExpenseCreateNestedOneWithoutDebtsInputSchema),
  debtor: z.lazy(() => UserCreateNestedOneWithoutDebtsInputSchema),
  logs: z.lazy(() => ExpenseLogCreateNestedManyWithoutDebtInputSchema).optional()
}).strict();

export const ExpenseDebtUncheckedCreateInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  expenseId: z.string(),
  debtorId: z.string(),
  logs: z.lazy(() => ExpenseLogUncheckedCreateNestedManyWithoutDebtInputSchema).optional()
}).strict();

export const ExpenseDebtUpdateInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  expense: z.lazy(() => ExpenseUpdateOneRequiredWithoutDebtsNestedInputSchema).optional(),
  debtor: z.lazy(() => UserUpdateOneRequiredWithoutDebtsNestedInputSchema).optional(),
  logs: z.lazy(() => ExpenseLogUpdateManyWithoutDebtNestedInputSchema).optional()
}).strict();

export const ExpenseDebtUncheckedUpdateInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  expenseId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  debtorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  logs: z.lazy(() => ExpenseLogUncheckedUpdateManyWithoutDebtNestedInputSchema).optional()
}).strict();

export const ExpenseDebtCreateManyInputSchema: z.ZodType<Prisma.ExpenseDebtCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  expenseId: z.string(),
  debtorId: z.string()
}).strict();

export const ExpenseDebtUpdateManyMutationInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseDebtUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  expenseId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  debtorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseCreateInputSchema: z.ZodType<Prisma.ExpenseCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  payer: z.lazy(() => UserCreateNestedOneWithoutExpensesInputSchema),
  debts: z.lazy(() => ExpenseDebtCreateNestedManyWithoutExpenseInputSchema).optional(),
  group: z.lazy(() => GroupCreateNestedOneWithoutExpensesInputSchema)
}).strict();

export const ExpenseUncheckedCreateInputSchema: z.ZodType<Prisma.ExpenseUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  payerId: z.string(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  groupId: z.string(),
  debts: z.lazy(() => ExpenseDebtUncheckedCreateNestedManyWithoutExpenseInputSchema).optional()
}).strict();

export const ExpenseUpdateInputSchema: z.ZodType<Prisma.ExpenseUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  payer: z.lazy(() => UserUpdateOneRequiredWithoutExpensesNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUpdateManyWithoutExpenseNestedInputSchema).optional(),
  group: z.lazy(() => GroupUpdateOneRequiredWithoutExpensesNestedInputSchema).optional()
}).strict();

export const ExpenseUncheckedUpdateInputSchema: z.ZodType<Prisma.ExpenseUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  groupId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedUpdateManyWithoutExpenseNestedInputSchema).optional()
}).strict();

export const ExpenseCreateManyInputSchema: z.ZodType<Prisma.ExpenseCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  payerId: z.string(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  groupId: z.string()
}).strict();

export const ExpenseUpdateManyMutationInputSchema: z.ZodType<Prisma.ExpenseUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ExpenseUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  groupId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  groups: z.lazy(() => UserGroupCreateNestedManyWithoutUserInputSchema).optional(),
  expenses: z.lazy(() => ExpenseCreateNestedManyWithoutPayerInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtCreateNestedManyWithoutDebtorInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  groups: z.lazy(() => UserGroupUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedCreateNestedManyWithoutPayerInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedCreateNestedManyWithoutDebtorInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  groups: z.lazy(() => UserGroupUpdateManyWithoutUserNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUpdateManyWithoutPayerNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUpdateManyWithoutDebtorNestedInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  groups: z.lazy(() => UserGroupUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedUpdateManyWithoutPayerNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedUpdateManyWithoutDebtorNestedInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PushSubscriptionCreateInputSchema: z.ZodType<Prisma.PushSubscriptionCreateInput> = z.object({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
  user: z.lazy(() => UserCreateNestedOneWithoutPushSubscriptionsInputSchema)
}).strict();

export const PushSubscriptionUncheckedCreateInputSchema: z.ZodType<Prisma.PushSubscriptionUncheckedCreateInput> = z.object({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
  userId: z.string()
}).strict();

export const PushSubscriptionUpdateInputSchema: z.ZodType<Prisma.PushSubscriptionUpdateInput> = z.object({
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  p256dh: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  auth: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutPushSubscriptionsNestedInputSchema).optional()
}).strict();

export const PushSubscriptionUncheckedUpdateInputSchema: z.ZodType<Prisma.PushSubscriptionUncheckedUpdateInput> = z.object({
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  p256dh: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  auth: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PushSubscriptionCreateManyInputSchema: z.ZodType<Prisma.PushSubscriptionCreateManyInput> = z.object({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
  userId: z.string()
}).strict();

export const PushSubscriptionUpdateManyMutationInputSchema: z.ZodType<Prisma.PushSubscriptionUpdateManyMutationInput> = z.object({
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  p256dh: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  auth: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PushSubscriptionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PushSubscriptionUncheckedUpdateManyInput> = z.object({
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  p256dh: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  auth: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateInputSchema: z.ZodType<Prisma.SessionCreateInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date(),
  user: z.lazy(() => UserCreateNestedOneWithoutSessionsInputSchema)
}).strict();

export const SessionUncheckedCreateInputSchema: z.ZodType<Prisma.SessionUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  expiresAt: z.coerce.date()
}).strict();

export const SessionUpdateInputSchema: z.ZodType<Prisma.SessionUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSessionsNestedInputSchema).optional()
}).strict();

export const SessionUncheckedUpdateInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateManyInputSchema: z.ZodType<Prisma.SessionCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  expiresAt: z.coerce.date()
}).strict();

export const SessionUpdateManyMutationInputSchema: z.ZodType<Prisma.SessionUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const UserGroupListRelationFilterSchema: z.ZodType<Prisma.UserGroupListRelationFilter> = z.object({
  every: z.lazy(() => UserGroupWhereInputSchema).optional(),
  some: z.lazy(() => UserGroupWhereInputSchema).optional(),
  none: z.lazy(() => UserGroupWhereInputSchema).optional()
}).strict();

export const ExpenseListRelationFilterSchema: z.ZodType<Prisma.ExpenseListRelationFilter> = z.object({
  every: z.lazy(() => ExpenseWhereInputSchema).optional(),
  some: z.lazy(() => ExpenseWhereInputSchema).optional(),
  none: z.lazy(() => ExpenseWhereInputSchema).optional()
}).strict();

export const UserGroupOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserGroupOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ExpenseOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const GroupCountOrderByAggregateInputSchema: z.ZodType<Prisma.GroupCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  adminId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const GroupMaxOrderByAggregateInputSchema: z.ZodType<Prisma.GroupMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  adminId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const GroupMinOrderByAggregateInputSchema: z.ZodType<Prisma.GroupMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  adminId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const UserRelationFilterSchema: z.ZodType<Prisma.UserRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const GroupRelationFilterSchema: z.ZodType<Prisma.GroupRelationFilter> = z.object({
  is: z.lazy(() => GroupWhereInputSchema).optional(),
  isNot: z.lazy(() => GroupWhereInputSchema).optional()
}).strict();

export const UserGroupUserIdGroupIdCompoundUniqueInputSchema: z.ZodType<Prisma.UserGroupUserIdGroupIdCompoundUniqueInput> = z.object({
  userId: z.string(),
  groupId: z.string()
}).strict();

export const UserGroupCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserGroupCountOrderByAggregateInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  groupId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGroupMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserGroupMaxOrderByAggregateInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  groupId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGroupMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserGroupMinOrderByAggregateInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  groupId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DecimalFilterSchema: z.ZodType<Prisma.DecimalFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
}).strict();

export const ExpenseDebtRelationFilterSchema: z.ZodType<Prisma.ExpenseDebtRelationFilter> = z.object({
  is: z.lazy(() => ExpenseDebtWhereInputSchema).optional(),
  isNot: z.lazy(() => ExpenseDebtWhereInputSchema).optional()
}).strict();

export const ExpenseLogCountOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseLogCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  debtId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseLogAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseLogAvgOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseLogMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseLogMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  debtId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseLogMinOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseLogMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  debtId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseLogSumOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseLogSumOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DecimalWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalWithAggregatesFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional()
}).strict();

export const ExpenseRelationFilterSchema: z.ZodType<Prisma.ExpenseRelationFilter> = z.object({
  is: z.lazy(() => ExpenseWhereInputSchema).optional(),
  isNot: z.lazy(() => ExpenseWhereInputSchema).optional()
}).strict();

export const ExpenseLogListRelationFilterSchema: z.ZodType<Prisma.ExpenseLogListRelationFilter> = z.object({
  every: z.lazy(() => ExpenseLogWhereInputSchema).optional(),
  some: z.lazy(() => ExpenseLogWhereInputSchema).optional(),
  none: z.lazy(() => ExpenseLogWhereInputSchema).optional()
}).strict();

export const ExpenseLogOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ExpenseLogOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseDebtCountOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseDebtCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  settled: z.lazy(() => SortOrderSchema).optional(),
  expenseId: z.lazy(() => SortOrderSchema).optional(),
  debtorId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseDebtAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseDebtAvgOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional(),
  settled: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseDebtMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseDebtMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  settled: z.lazy(() => SortOrderSchema).optional(),
  expenseId: z.lazy(() => SortOrderSchema).optional(),
  debtorId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseDebtMinOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseDebtMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  settled: z.lazy(() => SortOrderSchema).optional(),
  expenseId: z.lazy(() => SortOrderSchema).optional(),
  debtorId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseDebtSumOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseDebtSumOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional(),
  settled: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const ExpenseDebtListRelationFilterSchema: z.ZodType<Prisma.ExpenseDebtListRelationFilter> = z.object({
  every: z.lazy(() => ExpenseDebtWhereInputSchema).optional(),
  some: z.lazy(() => ExpenseDebtWhereInputSchema).optional(),
  none: z.lazy(() => ExpenseDebtWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const ExpenseDebtOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ExpenseDebtOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseCountOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  payerId: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  groupId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseAvgOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  payerId: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  groupId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseMinOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  payerId: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  groupId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExpenseSumOrderByAggregateInputSchema: z.ZodType<Prisma.ExpenseSumOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const SessionListRelationFilterSchema: z.ZodType<Prisma.SessionListRelationFilter> = z.object({
  every: z.lazy(() => SessionWhereInputSchema).optional(),
  some: z.lazy(() => SessionWhereInputSchema).optional(),
  none: z.lazy(() => SessionWhereInputSchema).optional()
}).strict();

export const PushSubscriptionListRelationFilterSchema: z.ZodType<Prisma.PushSubscriptionListRelationFilter> = z.object({
  every: z.lazy(() => PushSubscriptionWhereInputSchema).optional(),
  some: z.lazy(() => PushSubscriptionWhereInputSchema).optional(),
  none: z.lazy(() => PushSubscriptionWhereInputSchema).optional()
}).strict();

export const SessionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SessionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PushSubscriptionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PushSubscriptionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  googleId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  activeGroupId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  googleId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  activeGroupId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  googleId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  image: z.lazy(() => SortOrderSchema).optional(),
  activeGroupId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PushSubscriptionCountOrderByAggregateInputSchema: z.ZodType<Prisma.PushSubscriptionCountOrderByAggregateInput> = z.object({
  endpoint: z.lazy(() => SortOrderSchema).optional(),
  p256dh: z.lazy(() => SortOrderSchema).optional(),
  auth: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PushSubscriptionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PushSubscriptionMaxOrderByAggregateInput> = z.object({
  endpoint: z.lazy(() => SortOrderSchema).optional(),
  p256dh: z.lazy(() => SortOrderSchema).optional(),
  auth: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const PushSubscriptionMinOrderByAggregateInputSchema: z.ZodType<Prisma.PushSubscriptionMinOrderByAggregateInput> = z.object({
  endpoint: z.lazy(() => SortOrderSchema).optional(),
  p256dh: z.lazy(() => SortOrderSchema).optional(),
  auth: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.SessionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMinOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGroupCreateNestedManyWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupCreateNestedManyWithoutGroupInput> = z.object({
  create: z.union([ z.lazy(() => UserGroupCreateWithoutGroupInputSchema),z.lazy(() => UserGroupCreateWithoutGroupInputSchema).array(),z.lazy(() => UserGroupUncheckedCreateWithoutGroupInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGroupCreateOrConnectWithoutGroupInputSchema),z.lazy(() => UserGroupCreateOrConnectWithoutGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGroupCreateManyGroupInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExpenseCreateNestedManyWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseCreateNestedManyWithoutGroupInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseCreateWithoutGroupInputSchema),z.lazy(() => ExpenseCreateWithoutGroupInputSchema).array(),z.lazy(() => ExpenseUncheckedCreateWithoutGroupInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseCreateOrConnectWithoutGroupInputSchema),z.lazy(() => ExpenseCreateOrConnectWithoutGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseCreateManyGroupInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserGroupUncheckedCreateNestedManyWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupUncheckedCreateNestedManyWithoutGroupInput> = z.object({
  create: z.union([ z.lazy(() => UserGroupCreateWithoutGroupInputSchema),z.lazy(() => UserGroupCreateWithoutGroupInputSchema).array(),z.lazy(() => UserGroupUncheckedCreateWithoutGroupInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGroupCreateOrConnectWithoutGroupInputSchema),z.lazy(() => UserGroupCreateOrConnectWithoutGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGroupCreateManyGroupInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExpenseUncheckedCreateNestedManyWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseUncheckedCreateNestedManyWithoutGroupInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseCreateWithoutGroupInputSchema),z.lazy(() => ExpenseCreateWithoutGroupInputSchema).array(),z.lazy(() => ExpenseUncheckedCreateWithoutGroupInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseCreateOrConnectWithoutGroupInputSchema),z.lazy(() => ExpenseCreateOrConnectWithoutGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseCreateManyGroupInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const UserGroupUpdateManyWithoutGroupNestedInputSchema: z.ZodType<Prisma.UserGroupUpdateManyWithoutGroupNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGroupCreateWithoutGroupInputSchema),z.lazy(() => UserGroupCreateWithoutGroupInputSchema).array(),z.lazy(() => UserGroupUncheckedCreateWithoutGroupInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGroupCreateOrConnectWithoutGroupInputSchema),z.lazy(() => UserGroupCreateOrConnectWithoutGroupInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserGroupUpsertWithWhereUniqueWithoutGroupInputSchema),z.lazy(() => UserGroupUpsertWithWhereUniqueWithoutGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGroupCreateManyGroupInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserGroupUpdateWithWhereUniqueWithoutGroupInputSchema),z.lazy(() => UserGroupUpdateWithWhereUniqueWithoutGroupInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserGroupUpdateManyWithWhereWithoutGroupInputSchema),z.lazy(() => UserGroupUpdateManyWithWhereWithoutGroupInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserGroupScalarWhereInputSchema),z.lazy(() => UserGroupScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExpenseUpdateManyWithoutGroupNestedInputSchema: z.ZodType<Prisma.ExpenseUpdateManyWithoutGroupNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseCreateWithoutGroupInputSchema),z.lazy(() => ExpenseCreateWithoutGroupInputSchema).array(),z.lazy(() => ExpenseUncheckedCreateWithoutGroupInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseCreateOrConnectWithoutGroupInputSchema),z.lazy(() => ExpenseCreateOrConnectWithoutGroupInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExpenseUpsertWithWhereUniqueWithoutGroupInputSchema),z.lazy(() => ExpenseUpsertWithWhereUniqueWithoutGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseCreateManyGroupInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExpenseUpdateWithWhereUniqueWithoutGroupInputSchema),z.lazy(() => ExpenseUpdateWithWhereUniqueWithoutGroupInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExpenseUpdateManyWithWhereWithoutGroupInputSchema),z.lazy(() => ExpenseUpdateManyWithWhereWithoutGroupInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExpenseScalarWhereInputSchema),z.lazy(() => ExpenseScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserGroupUncheckedUpdateManyWithoutGroupNestedInputSchema: z.ZodType<Prisma.UserGroupUncheckedUpdateManyWithoutGroupNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGroupCreateWithoutGroupInputSchema),z.lazy(() => UserGroupCreateWithoutGroupInputSchema).array(),z.lazy(() => UserGroupUncheckedCreateWithoutGroupInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGroupCreateOrConnectWithoutGroupInputSchema),z.lazy(() => UserGroupCreateOrConnectWithoutGroupInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserGroupUpsertWithWhereUniqueWithoutGroupInputSchema),z.lazy(() => UserGroupUpsertWithWhereUniqueWithoutGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGroupCreateManyGroupInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserGroupUpdateWithWhereUniqueWithoutGroupInputSchema),z.lazy(() => UserGroupUpdateWithWhereUniqueWithoutGroupInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserGroupUpdateManyWithWhereWithoutGroupInputSchema),z.lazy(() => UserGroupUpdateManyWithWhereWithoutGroupInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserGroupScalarWhereInputSchema),z.lazy(() => UserGroupScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExpenseUncheckedUpdateManyWithoutGroupNestedInputSchema: z.ZodType<Prisma.ExpenseUncheckedUpdateManyWithoutGroupNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseCreateWithoutGroupInputSchema),z.lazy(() => ExpenseCreateWithoutGroupInputSchema).array(),z.lazy(() => ExpenseUncheckedCreateWithoutGroupInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutGroupInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseCreateOrConnectWithoutGroupInputSchema),z.lazy(() => ExpenseCreateOrConnectWithoutGroupInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExpenseUpsertWithWhereUniqueWithoutGroupInputSchema),z.lazy(() => ExpenseUpsertWithWhereUniqueWithoutGroupInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseCreateManyGroupInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExpenseUpdateWithWhereUniqueWithoutGroupInputSchema),z.lazy(() => ExpenseUpdateWithWhereUniqueWithoutGroupInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExpenseUpdateManyWithWhereWithoutGroupInputSchema),z.lazy(() => ExpenseUpdateManyWithWhereWithoutGroupInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExpenseScalarWhereInputSchema),z.lazy(() => ExpenseScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutGroupsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutGroupsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutGroupsInputSchema),z.lazy(() => UserUncheckedCreateWithoutGroupsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutGroupsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const GroupCreateNestedOneWithoutMembersInputSchema: z.ZodType<Prisma.GroupCreateNestedOneWithoutMembersInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutMembersInputSchema),z.lazy(() => GroupUncheckedCreateWithoutMembersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => GroupCreateOrConnectWithoutMembersInputSchema).optional(),
  connect: z.lazy(() => GroupWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutGroupsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutGroupsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutGroupsInputSchema),z.lazy(() => UserUncheckedCreateWithoutGroupsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutGroupsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutGroupsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutGroupsInputSchema),z.lazy(() => UserUpdateWithoutGroupsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutGroupsInputSchema) ]).optional(),
}).strict();

export const GroupUpdateOneRequiredWithoutMembersNestedInputSchema: z.ZodType<Prisma.GroupUpdateOneRequiredWithoutMembersNestedInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutMembersInputSchema),z.lazy(() => GroupUncheckedCreateWithoutMembersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => GroupCreateOrConnectWithoutMembersInputSchema).optional(),
  upsert: z.lazy(() => GroupUpsertWithoutMembersInputSchema).optional(),
  connect: z.lazy(() => GroupWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => GroupUpdateToOneWithWhereWithoutMembersInputSchema),z.lazy(() => GroupUpdateWithoutMembersInputSchema),z.lazy(() => GroupUncheckedUpdateWithoutMembersInputSchema) ]).optional(),
}).strict();

export const ExpenseDebtCreateNestedOneWithoutLogsInputSchema: z.ZodType<Prisma.ExpenseDebtCreateNestedOneWithoutLogsInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutLogsInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ExpenseDebtCreateOrConnectWithoutLogsInputSchema).optional(),
  connect: z.lazy(() => ExpenseDebtWhereUniqueInputSchema).optional()
}).strict();

export const DecimalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DecimalFieldUpdateOperationsInput> = z.object({
  set: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  increment: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  decrement: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  multiply: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  divide: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional()
}).strict();

export const ExpenseDebtUpdateOneRequiredWithoutLogsNestedInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateOneRequiredWithoutLogsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutLogsInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ExpenseDebtCreateOrConnectWithoutLogsInputSchema).optional(),
  upsert: z.lazy(() => ExpenseDebtUpsertWithoutLogsInputSchema).optional(),
  connect: z.lazy(() => ExpenseDebtWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ExpenseDebtUpdateToOneWithWhereWithoutLogsInputSchema),z.lazy(() => ExpenseDebtUpdateWithoutLogsInputSchema),z.lazy(() => ExpenseDebtUncheckedUpdateWithoutLogsInputSchema) ]).optional(),
}).strict();

export const ExpenseCreateNestedOneWithoutDebtsInputSchema: z.ZodType<Prisma.ExpenseCreateNestedOneWithoutDebtsInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseCreateWithoutDebtsInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutDebtsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ExpenseCreateOrConnectWithoutDebtsInputSchema).optional(),
  connect: z.lazy(() => ExpenseWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutDebtsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDebtsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDebtsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDebtsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDebtsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const ExpenseLogCreateNestedManyWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogCreateNestedManyWithoutDebtInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseLogCreateWithoutDebtInputSchema),z.lazy(() => ExpenseLogCreateWithoutDebtInputSchema).array(),z.lazy(() => ExpenseLogUncheckedCreateWithoutDebtInputSchema),z.lazy(() => ExpenseLogUncheckedCreateWithoutDebtInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseLogCreateOrConnectWithoutDebtInputSchema),z.lazy(() => ExpenseLogCreateOrConnectWithoutDebtInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseLogCreateManyDebtInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExpenseLogWhereUniqueInputSchema),z.lazy(() => ExpenseLogWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExpenseLogUncheckedCreateNestedManyWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogUncheckedCreateNestedManyWithoutDebtInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseLogCreateWithoutDebtInputSchema),z.lazy(() => ExpenseLogCreateWithoutDebtInputSchema).array(),z.lazy(() => ExpenseLogUncheckedCreateWithoutDebtInputSchema),z.lazy(() => ExpenseLogUncheckedCreateWithoutDebtInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseLogCreateOrConnectWithoutDebtInputSchema),z.lazy(() => ExpenseLogCreateOrConnectWithoutDebtInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseLogCreateManyDebtInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExpenseLogWhereUniqueInputSchema),z.lazy(() => ExpenseLogWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExpenseUpdateOneRequiredWithoutDebtsNestedInputSchema: z.ZodType<Prisma.ExpenseUpdateOneRequiredWithoutDebtsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseCreateWithoutDebtsInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutDebtsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ExpenseCreateOrConnectWithoutDebtsInputSchema).optional(),
  upsert: z.lazy(() => ExpenseUpsertWithoutDebtsInputSchema).optional(),
  connect: z.lazy(() => ExpenseWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ExpenseUpdateToOneWithWhereWithoutDebtsInputSchema),z.lazy(() => ExpenseUpdateWithoutDebtsInputSchema),z.lazy(() => ExpenseUncheckedUpdateWithoutDebtsInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutDebtsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutDebtsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDebtsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDebtsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDebtsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDebtsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDebtsInputSchema),z.lazy(() => UserUpdateWithoutDebtsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDebtsInputSchema) ]).optional(),
}).strict();

export const ExpenseLogUpdateManyWithoutDebtNestedInputSchema: z.ZodType<Prisma.ExpenseLogUpdateManyWithoutDebtNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseLogCreateWithoutDebtInputSchema),z.lazy(() => ExpenseLogCreateWithoutDebtInputSchema).array(),z.lazy(() => ExpenseLogUncheckedCreateWithoutDebtInputSchema),z.lazy(() => ExpenseLogUncheckedCreateWithoutDebtInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseLogCreateOrConnectWithoutDebtInputSchema),z.lazy(() => ExpenseLogCreateOrConnectWithoutDebtInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExpenseLogUpsertWithWhereUniqueWithoutDebtInputSchema),z.lazy(() => ExpenseLogUpsertWithWhereUniqueWithoutDebtInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseLogCreateManyDebtInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExpenseLogWhereUniqueInputSchema),z.lazy(() => ExpenseLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExpenseLogWhereUniqueInputSchema),z.lazy(() => ExpenseLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExpenseLogWhereUniqueInputSchema),z.lazy(() => ExpenseLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExpenseLogWhereUniqueInputSchema),z.lazy(() => ExpenseLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExpenseLogUpdateWithWhereUniqueWithoutDebtInputSchema),z.lazy(() => ExpenseLogUpdateWithWhereUniqueWithoutDebtInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExpenseLogUpdateManyWithWhereWithoutDebtInputSchema),z.lazy(() => ExpenseLogUpdateManyWithWhereWithoutDebtInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExpenseLogScalarWhereInputSchema),z.lazy(() => ExpenseLogScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExpenseLogUncheckedUpdateManyWithoutDebtNestedInputSchema: z.ZodType<Prisma.ExpenseLogUncheckedUpdateManyWithoutDebtNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseLogCreateWithoutDebtInputSchema),z.lazy(() => ExpenseLogCreateWithoutDebtInputSchema).array(),z.lazy(() => ExpenseLogUncheckedCreateWithoutDebtInputSchema),z.lazy(() => ExpenseLogUncheckedCreateWithoutDebtInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseLogCreateOrConnectWithoutDebtInputSchema),z.lazy(() => ExpenseLogCreateOrConnectWithoutDebtInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExpenseLogUpsertWithWhereUniqueWithoutDebtInputSchema),z.lazy(() => ExpenseLogUpsertWithWhereUniqueWithoutDebtInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseLogCreateManyDebtInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExpenseLogWhereUniqueInputSchema),z.lazy(() => ExpenseLogWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExpenseLogWhereUniqueInputSchema),z.lazy(() => ExpenseLogWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExpenseLogWhereUniqueInputSchema),z.lazy(() => ExpenseLogWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExpenseLogWhereUniqueInputSchema),z.lazy(() => ExpenseLogWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExpenseLogUpdateWithWhereUniqueWithoutDebtInputSchema),z.lazy(() => ExpenseLogUpdateWithWhereUniqueWithoutDebtInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExpenseLogUpdateManyWithWhereWithoutDebtInputSchema),z.lazy(() => ExpenseLogUpdateManyWithWhereWithoutDebtInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExpenseLogScalarWhereInputSchema),z.lazy(() => ExpenseLogScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutExpensesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutExpensesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutExpensesInputSchema),z.lazy(() => UserUncheckedCreateWithoutExpensesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutExpensesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const ExpenseDebtCreateNestedManyWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtCreateNestedManyWithoutExpenseInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtCreateWithoutExpenseInputSchema).array(),z.lazy(() => ExpenseDebtUncheckedCreateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutExpenseInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseDebtCreateOrConnectWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtCreateOrConnectWithoutExpenseInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseDebtCreateManyExpenseInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const GroupCreateNestedOneWithoutExpensesInputSchema: z.ZodType<Prisma.GroupCreateNestedOneWithoutExpensesInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutExpensesInputSchema),z.lazy(() => GroupUncheckedCreateWithoutExpensesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => GroupCreateOrConnectWithoutExpensesInputSchema).optional(),
  connect: z.lazy(() => GroupWhereUniqueInputSchema).optional()
}).strict();

export const ExpenseDebtUncheckedCreateNestedManyWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedCreateNestedManyWithoutExpenseInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtCreateWithoutExpenseInputSchema).array(),z.lazy(() => ExpenseDebtUncheckedCreateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutExpenseInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseDebtCreateOrConnectWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtCreateOrConnectWithoutExpenseInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseDebtCreateManyExpenseInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const UserUpdateOneRequiredWithoutExpensesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutExpensesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutExpensesInputSchema),z.lazy(() => UserUncheckedCreateWithoutExpensesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutExpensesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutExpensesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutExpensesInputSchema),z.lazy(() => UserUpdateWithoutExpensesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutExpensesInputSchema) ]).optional(),
}).strict();

export const ExpenseDebtUpdateManyWithoutExpenseNestedInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateManyWithoutExpenseNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtCreateWithoutExpenseInputSchema).array(),z.lazy(() => ExpenseDebtUncheckedCreateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutExpenseInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseDebtCreateOrConnectWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtCreateOrConnectWithoutExpenseInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExpenseDebtUpsertWithWhereUniqueWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUpsertWithWhereUniqueWithoutExpenseInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseDebtCreateManyExpenseInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExpenseDebtUpdateWithWhereUniqueWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUpdateWithWhereUniqueWithoutExpenseInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExpenseDebtUpdateManyWithWhereWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUpdateManyWithWhereWithoutExpenseInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExpenseDebtScalarWhereInputSchema),z.lazy(() => ExpenseDebtScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const GroupUpdateOneRequiredWithoutExpensesNestedInputSchema: z.ZodType<Prisma.GroupUpdateOneRequiredWithoutExpensesNestedInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutExpensesInputSchema),z.lazy(() => GroupUncheckedCreateWithoutExpensesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => GroupCreateOrConnectWithoutExpensesInputSchema).optional(),
  upsert: z.lazy(() => GroupUpsertWithoutExpensesInputSchema).optional(),
  connect: z.lazy(() => GroupWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => GroupUpdateToOneWithWhereWithoutExpensesInputSchema),z.lazy(() => GroupUpdateWithoutExpensesInputSchema),z.lazy(() => GroupUncheckedUpdateWithoutExpensesInputSchema) ]).optional(),
}).strict();

export const ExpenseDebtUncheckedUpdateManyWithoutExpenseNestedInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedUpdateManyWithoutExpenseNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtCreateWithoutExpenseInputSchema).array(),z.lazy(() => ExpenseDebtUncheckedCreateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutExpenseInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseDebtCreateOrConnectWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtCreateOrConnectWithoutExpenseInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExpenseDebtUpsertWithWhereUniqueWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUpsertWithWhereUniqueWithoutExpenseInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseDebtCreateManyExpenseInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExpenseDebtUpdateWithWhereUniqueWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUpdateWithWhereUniqueWithoutExpenseInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExpenseDebtUpdateManyWithWhereWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUpdateManyWithWhereWithoutExpenseInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExpenseDebtScalarWhereInputSchema),z.lazy(() => ExpenseDebtScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserGroupCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserGroupCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserGroupCreateWithoutUserInputSchema),z.lazy(() => UserGroupCreateWithoutUserInputSchema).array(),z.lazy(() => UserGroupUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGroupCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserGroupCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGroupCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExpenseCreateNestedManyWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseCreateNestedManyWithoutPayerInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseCreateWithoutPayerInputSchema),z.lazy(() => ExpenseCreateWithoutPayerInputSchema).array(),z.lazy(() => ExpenseUncheckedCreateWithoutPayerInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutPayerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseCreateOrConnectWithoutPayerInputSchema),z.lazy(() => ExpenseCreateOrConnectWithoutPayerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseCreateManyPayerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExpenseDebtCreateNestedManyWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtCreateNestedManyWithoutDebtorInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtCreateWithoutDebtorInputSchema).array(),z.lazy(() => ExpenseDebtUncheckedCreateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutDebtorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseDebtCreateOrConnectWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtCreateOrConnectWithoutDebtorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseDebtCreateManyDebtorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const PushSubscriptionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PushSubscriptionCreateWithoutUserInputSchema),z.lazy(() => PushSubscriptionCreateWithoutUserInputSchema).array(),z.lazy(() => PushSubscriptionUncheckedCreateWithoutUserInputSchema),z.lazy(() => PushSubscriptionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PushSubscriptionCreateOrConnectWithoutUserInputSchema),z.lazy(() => PushSubscriptionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PushSubscriptionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PushSubscriptionWhereUniqueInputSchema),z.lazy(() => PushSubscriptionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserGroupUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserGroupUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserGroupCreateWithoutUserInputSchema),z.lazy(() => UserGroupCreateWithoutUserInputSchema).array(),z.lazy(() => UserGroupUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGroupCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserGroupCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGroupCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExpenseUncheckedCreateNestedManyWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseUncheckedCreateNestedManyWithoutPayerInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseCreateWithoutPayerInputSchema),z.lazy(() => ExpenseCreateWithoutPayerInputSchema).array(),z.lazy(() => ExpenseUncheckedCreateWithoutPayerInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutPayerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseCreateOrConnectWithoutPayerInputSchema),z.lazy(() => ExpenseCreateOrConnectWithoutPayerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseCreateManyPayerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExpenseDebtUncheckedCreateNestedManyWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedCreateNestedManyWithoutDebtorInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtCreateWithoutDebtorInputSchema).array(),z.lazy(() => ExpenseDebtUncheckedCreateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutDebtorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseDebtCreateOrConnectWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtCreateOrConnectWithoutDebtorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseDebtCreateManyDebtorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const PushSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PushSubscriptionCreateWithoutUserInputSchema),z.lazy(() => PushSubscriptionCreateWithoutUserInputSchema).array(),z.lazy(() => PushSubscriptionUncheckedCreateWithoutUserInputSchema),z.lazy(() => PushSubscriptionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PushSubscriptionCreateOrConnectWithoutUserInputSchema),z.lazy(() => PushSubscriptionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PushSubscriptionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PushSubscriptionWhereUniqueInputSchema),z.lazy(() => PushSubscriptionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserGroupUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserGroupUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGroupCreateWithoutUserInputSchema),z.lazy(() => UserGroupCreateWithoutUserInputSchema).array(),z.lazy(() => UserGroupUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGroupCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserGroupCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserGroupUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserGroupUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGroupCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserGroupUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserGroupUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserGroupUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserGroupUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserGroupScalarWhereInputSchema),z.lazy(() => UserGroupScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExpenseUpdateManyWithoutPayerNestedInputSchema: z.ZodType<Prisma.ExpenseUpdateManyWithoutPayerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseCreateWithoutPayerInputSchema),z.lazy(() => ExpenseCreateWithoutPayerInputSchema).array(),z.lazy(() => ExpenseUncheckedCreateWithoutPayerInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutPayerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseCreateOrConnectWithoutPayerInputSchema),z.lazy(() => ExpenseCreateOrConnectWithoutPayerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExpenseUpsertWithWhereUniqueWithoutPayerInputSchema),z.lazy(() => ExpenseUpsertWithWhereUniqueWithoutPayerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseCreateManyPayerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExpenseUpdateWithWhereUniqueWithoutPayerInputSchema),z.lazy(() => ExpenseUpdateWithWhereUniqueWithoutPayerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExpenseUpdateManyWithWhereWithoutPayerInputSchema),z.lazy(() => ExpenseUpdateManyWithWhereWithoutPayerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExpenseScalarWhereInputSchema),z.lazy(() => ExpenseScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExpenseDebtUpdateManyWithoutDebtorNestedInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateManyWithoutDebtorNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtCreateWithoutDebtorInputSchema).array(),z.lazy(() => ExpenseDebtUncheckedCreateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutDebtorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseDebtCreateOrConnectWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtCreateOrConnectWithoutDebtorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExpenseDebtUpsertWithWhereUniqueWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUpsertWithWhereUniqueWithoutDebtorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseDebtCreateManyDebtorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExpenseDebtUpdateWithWhereUniqueWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUpdateWithWhereUniqueWithoutDebtorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExpenseDebtUpdateManyWithWhereWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUpdateManyWithWhereWithoutDebtorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExpenseDebtScalarWhereInputSchema),z.lazy(() => ExpenseDebtScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const PushSubscriptionUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PushSubscriptionUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PushSubscriptionCreateWithoutUserInputSchema),z.lazy(() => PushSubscriptionCreateWithoutUserInputSchema).array(),z.lazy(() => PushSubscriptionUncheckedCreateWithoutUserInputSchema),z.lazy(() => PushSubscriptionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PushSubscriptionCreateOrConnectWithoutUserInputSchema),z.lazy(() => PushSubscriptionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PushSubscriptionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PushSubscriptionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PushSubscriptionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PushSubscriptionWhereUniqueInputSchema),z.lazy(() => PushSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PushSubscriptionWhereUniqueInputSchema),z.lazy(() => PushSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PushSubscriptionWhereUniqueInputSchema),z.lazy(() => PushSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PushSubscriptionWhereUniqueInputSchema),z.lazy(() => PushSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PushSubscriptionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PushSubscriptionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PushSubscriptionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PushSubscriptionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PushSubscriptionScalarWhereInputSchema),z.lazy(() => PushSubscriptionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionCreateWithoutUserInputSchema).array(),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema),z.lazy(() => SessionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionWhereUniqueInputSchema),z.lazy(() => SessionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SessionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SessionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserGroupUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserGroupUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGroupCreateWithoutUserInputSchema),z.lazy(() => UserGroupCreateWithoutUserInputSchema).array(),z.lazy(() => UserGroupUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGroupCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserGroupCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserGroupUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserGroupUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGroupCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserGroupWhereUniqueInputSchema),z.lazy(() => UserGroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserGroupUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserGroupUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserGroupUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserGroupUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserGroupScalarWhereInputSchema),z.lazy(() => UserGroupScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExpenseUncheckedUpdateManyWithoutPayerNestedInputSchema: z.ZodType<Prisma.ExpenseUncheckedUpdateManyWithoutPayerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseCreateWithoutPayerInputSchema),z.lazy(() => ExpenseCreateWithoutPayerInputSchema).array(),z.lazy(() => ExpenseUncheckedCreateWithoutPayerInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutPayerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseCreateOrConnectWithoutPayerInputSchema),z.lazy(() => ExpenseCreateOrConnectWithoutPayerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExpenseUpsertWithWhereUniqueWithoutPayerInputSchema),z.lazy(() => ExpenseUpsertWithWhereUniqueWithoutPayerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseCreateManyPayerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExpenseWhereUniqueInputSchema),z.lazy(() => ExpenseWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExpenseUpdateWithWhereUniqueWithoutPayerInputSchema),z.lazy(() => ExpenseUpdateWithWhereUniqueWithoutPayerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExpenseUpdateManyWithWhereWithoutPayerInputSchema),z.lazy(() => ExpenseUpdateManyWithWhereWithoutPayerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExpenseScalarWhereInputSchema),z.lazy(() => ExpenseScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExpenseDebtUncheckedUpdateManyWithoutDebtorNestedInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedUpdateManyWithoutDebtorNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtCreateWithoutDebtorInputSchema).array(),z.lazy(() => ExpenseDebtUncheckedCreateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutDebtorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExpenseDebtCreateOrConnectWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtCreateOrConnectWithoutDebtorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExpenseDebtUpsertWithWhereUniqueWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUpsertWithWhereUniqueWithoutDebtorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExpenseDebtCreateManyDebtorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExpenseDebtWhereUniqueInputSchema),z.lazy(() => ExpenseDebtWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExpenseDebtUpdateWithWhereUniqueWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUpdateWithWhereUniqueWithoutDebtorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExpenseDebtUpdateManyWithWhereWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUpdateManyWithWhereWithoutDebtorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExpenseDebtScalarWhereInputSchema),z.lazy(() => ExpenseDebtScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const PushSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PushSubscriptionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PushSubscriptionCreateWithoutUserInputSchema),z.lazy(() => PushSubscriptionCreateWithoutUserInputSchema).array(),z.lazy(() => PushSubscriptionUncheckedCreateWithoutUserInputSchema),z.lazy(() => PushSubscriptionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PushSubscriptionCreateOrConnectWithoutUserInputSchema),z.lazy(() => PushSubscriptionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PushSubscriptionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PushSubscriptionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PushSubscriptionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PushSubscriptionWhereUniqueInputSchema),z.lazy(() => PushSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PushSubscriptionWhereUniqueInputSchema),z.lazy(() => PushSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PushSubscriptionWhereUniqueInputSchema),z.lazy(() => PushSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PushSubscriptionWhereUniqueInputSchema),z.lazy(() => PushSubscriptionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PushSubscriptionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PushSubscriptionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PushSubscriptionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PushSubscriptionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PushSubscriptionScalarWhereInputSchema),z.lazy(() => PushSubscriptionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutPushSubscriptionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPushSubscriptionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPushSubscriptionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPushSubscriptionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPushSubscriptionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutPushSubscriptionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutPushSubscriptionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPushSubscriptionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPushSubscriptionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPushSubscriptionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPushSubscriptionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPushSubscriptionsInputSchema),z.lazy(() => UserUpdateWithoutPushSubscriptionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPushSubscriptionsInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutSessionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutSessionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutSessionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSessionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutSessionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutSessionsInputSchema),z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedDecimalFilterSchema: z.ZodType<Prisma.NestedDecimalFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
}).strict();

export const NestedDecimalWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDecimalWithAggregatesFilter> = z.object({
  equals: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Decimal).array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional()
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const UserGroupCreateWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupCreateWithoutGroupInput> = z.object({
  user: z.lazy(() => UserCreateNestedOneWithoutGroupsInputSchema)
}).strict();

export const UserGroupUncheckedCreateWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupUncheckedCreateWithoutGroupInput> = z.object({
  userId: z.string()
}).strict();

export const UserGroupCreateOrConnectWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupCreateOrConnectWithoutGroupInput> = z.object({
  where: z.lazy(() => UserGroupWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserGroupCreateWithoutGroupInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutGroupInputSchema) ]),
}).strict();

export const UserGroupCreateManyGroupInputEnvelopeSchema: z.ZodType<Prisma.UserGroupCreateManyGroupInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserGroupCreateManyGroupInputSchema),z.lazy(() => UserGroupCreateManyGroupInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ExpenseCreateWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseCreateWithoutGroupInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  payer: z.lazy(() => UserCreateNestedOneWithoutExpensesInputSchema),
  debts: z.lazy(() => ExpenseDebtCreateNestedManyWithoutExpenseInputSchema).optional()
}).strict();

export const ExpenseUncheckedCreateWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseUncheckedCreateWithoutGroupInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  payerId: z.string(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  debts: z.lazy(() => ExpenseDebtUncheckedCreateNestedManyWithoutExpenseInputSchema).optional()
}).strict();

export const ExpenseCreateOrConnectWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseCreateOrConnectWithoutGroupInput> = z.object({
  where: z.lazy(() => ExpenseWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ExpenseCreateWithoutGroupInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutGroupInputSchema) ]),
}).strict();

export const ExpenseCreateManyGroupInputEnvelopeSchema: z.ZodType<Prisma.ExpenseCreateManyGroupInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ExpenseCreateManyGroupInputSchema),z.lazy(() => ExpenseCreateManyGroupInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserGroupUpsertWithWhereUniqueWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupUpsertWithWhereUniqueWithoutGroupInput> = z.object({
  where: z.lazy(() => UserGroupWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserGroupUpdateWithoutGroupInputSchema),z.lazy(() => UserGroupUncheckedUpdateWithoutGroupInputSchema) ]),
  create: z.union([ z.lazy(() => UserGroupCreateWithoutGroupInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutGroupInputSchema) ]),
}).strict();

export const UserGroupUpdateWithWhereUniqueWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupUpdateWithWhereUniqueWithoutGroupInput> = z.object({
  where: z.lazy(() => UserGroupWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserGroupUpdateWithoutGroupInputSchema),z.lazy(() => UserGroupUncheckedUpdateWithoutGroupInputSchema) ]),
}).strict();

export const UserGroupUpdateManyWithWhereWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupUpdateManyWithWhereWithoutGroupInput> = z.object({
  where: z.lazy(() => UserGroupScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserGroupUpdateManyMutationInputSchema),z.lazy(() => UserGroupUncheckedUpdateManyWithoutGroupInputSchema) ]),
}).strict();

export const UserGroupScalarWhereInputSchema: z.ZodType<Prisma.UserGroupScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserGroupScalarWhereInputSchema),z.lazy(() => UserGroupScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGroupScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGroupScalarWhereInputSchema),z.lazy(() => UserGroupScalarWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  groupId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const ExpenseUpsertWithWhereUniqueWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseUpsertWithWhereUniqueWithoutGroupInput> = z.object({
  where: z.lazy(() => ExpenseWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ExpenseUpdateWithoutGroupInputSchema),z.lazy(() => ExpenseUncheckedUpdateWithoutGroupInputSchema) ]),
  create: z.union([ z.lazy(() => ExpenseCreateWithoutGroupInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutGroupInputSchema) ]),
}).strict();

export const ExpenseUpdateWithWhereUniqueWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseUpdateWithWhereUniqueWithoutGroupInput> = z.object({
  where: z.lazy(() => ExpenseWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ExpenseUpdateWithoutGroupInputSchema),z.lazy(() => ExpenseUncheckedUpdateWithoutGroupInputSchema) ]),
}).strict();

export const ExpenseUpdateManyWithWhereWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseUpdateManyWithWhereWithoutGroupInput> = z.object({
  where: z.lazy(() => ExpenseScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ExpenseUpdateManyMutationInputSchema),z.lazy(() => ExpenseUncheckedUpdateManyWithoutGroupInputSchema) ]),
}).strict();

export const ExpenseScalarWhereInputSchema: z.ZodType<Prisma.ExpenseScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ExpenseScalarWhereInputSchema),z.lazy(() => ExpenseScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseScalarWhereInputSchema),z.lazy(() => ExpenseScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  payerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  groupId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UserCreateWithoutGroupsInputSchema: z.ZodType<Prisma.UserCreateWithoutGroupsInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  expenses: z.lazy(() => ExpenseCreateNestedManyWithoutPayerInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtCreateNestedManyWithoutDebtorInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutGroupsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutGroupsInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedCreateNestedManyWithoutPayerInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedCreateNestedManyWithoutDebtorInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutGroupsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutGroupsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutGroupsInputSchema),z.lazy(() => UserUncheckedCreateWithoutGroupsInputSchema) ]),
}).strict();

export const GroupCreateWithoutMembersInputSchema: z.ZodType<Prisma.GroupCreateWithoutMembersInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  adminId: z.string(),
  expenses: z.lazy(() => ExpenseCreateNestedManyWithoutGroupInputSchema).optional()
}).strict();

export const GroupUncheckedCreateWithoutMembersInputSchema: z.ZodType<Prisma.GroupUncheckedCreateWithoutMembersInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  adminId: z.string(),
  expenses: z.lazy(() => ExpenseUncheckedCreateNestedManyWithoutGroupInputSchema).optional()
}).strict();

export const GroupCreateOrConnectWithoutMembersInputSchema: z.ZodType<Prisma.GroupCreateOrConnectWithoutMembersInput> = z.object({
  where: z.lazy(() => GroupWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => GroupCreateWithoutMembersInputSchema),z.lazy(() => GroupUncheckedCreateWithoutMembersInputSchema) ]),
}).strict();

export const UserUpsertWithoutGroupsInputSchema: z.ZodType<Prisma.UserUpsertWithoutGroupsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutGroupsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutGroupsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutGroupsInputSchema),z.lazy(() => UserUncheckedCreateWithoutGroupsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutGroupsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutGroupsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutGroupsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutGroupsInputSchema) ]),
}).strict();

export const UserUpdateWithoutGroupsInputSchema: z.ZodType<Prisma.UserUpdateWithoutGroupsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUpdateManyWithoutPayerNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUpdateManyWithoutDebtorNestedInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutGroupsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutGroupsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedUpdateManyWithoutPayerNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedUpdateManyWithoutDebtorNestedInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const GroupUpsertWithoutMembersInputSchema: z.ZodType<Prisma.GroupUpsertWithoutMembersInput> = z.object({
  update: z.union([ z.lazy(() => GroupUpdateWithoutMembersInputSchema),z.lazy(() => GroupUncheckedUpdateWithoutMembersInputSchema) ]),
  create: z.union([ z.lazy(() => GroupCreateWithoutMembersInputSchema),z.lazy(() => GroupUncheckedCreateWithoutMembersInputSchema) ]),
  where: z.lazy(() => GroupWhereInputSchema).optional()
}).strict();

export const GroupUpdateToOneWithWhereWithoutMembersInputSchema: z.ZodType<Prisma.GroupUpdateToOneWithWhereWithoutMembersInput> = z.object({
  where: z.lazy(() => GroupWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => GroupUpdateWithoutMembersInputSchema),z.lazy(() => GroupUncheckedUpdateWithoutMembersInputSchema) ]),
}).strict();

export const GroupUpdateWithoutMembersInputSchema: z.ZodType<Prisma.GroupUpdateWithoutMembersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  adminId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expenses: z.lazy(() => ExpenseUpdateManyWithoutGroupNestedInputSchema).optional()
}).strict();

export const GroupUncheckedUpdateWithoutMembersInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateWithoutMembersInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  adminId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expenses: z.lazy(() => ExpenseUncheckedUpdateManyWithoutGroupNestedInputSchema).optional()
}).strict();

export const ExpenseDebtCreateWithoutLogsInputSchema: z.ZodType<Prisma.ExpenseDebtCreateWithoutLogsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  expense: z.lazy(() => ExpenseCreateNestedOneWithoutDebtsInputSchema),
  debtor: z.lazy(() => UserCreateNestedOneWithoutDebtsInputSchema)
}).strict();

export const ExpenseDebtUncheckedCreateWithoutLogsInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedCreateWithoutLogsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  expenseId: z.string(),
  debtorId: z.string()
}).strict();

export const ExpenseDebtCreateOrConnectWithoutLogsInputSchema: z.ZodType<Prisma.ExpenseDebtCreateOrConnectWithoutLogsInput> = z.object({
  where: z.lazy(() => ExpenseDebtWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutLogsInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutLogsInputSchema) ]),
}).strict();

export const ExpenseDebtUpsertWithoutLogsInputSchema: z.ZodType<Prisma.ExpenseDebtUpsertWithoutLogsInput> = z.object({
  update: z.union([ z.lazy(() => ExpenseDebtUpdateWithoutLogsInputSchema),z.lazy(() => ExpenseDebtUncheckedUpdateWithoutLogsInputSchema) ]),
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutLogsInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutLogsInputSchema) ]),
  where: z.lazy(() => ExpenseDebtWhereInputSchema).optional()
}).strict();

export const ExpenseDebtUpdateToOneWithWhereWithoutLogsInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateToOneWithWhereWithoutLogsInput> = z.object({
  where: z.lazy(() => ExpenseDebtWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ExpenseDebtUpdateWithoutLogsInputSchema),z.lazy(() => ExpenseDebtUncheckedUpdateWithoutLogsInputSchema) ]),
}).strict();

export const ExpenseDebtUpdateWithoutLogsInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateWithoutLogsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  expense: z.lazy(() => ExpenseUpdateOneRequiredWithoutDebtsNestedInputSchema).optional(),
  debtor: z.lazy(() => UserUpdateOneRequiredWithoutDebtsNestedInputSchema).optional()
}).strict();

export const ExpenseDebtUncheckedUpdateWithoutLogsInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedUpdateWithoutLogsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  expenseId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  debtorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseCreateWithoutDebtsInputSchema: z.ZodType<Prisma.ExpenseCreateWithoutDebtsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  payer: z.lazy(() => UserCreateNestedOneWithoutExpensesInputSchema),
  group: z.lazy(() => GroupCreateNestedOneWithoutExpensesInputSchema)
}).strict();

export const ExpenseUncheckedCreateWithoutDebtsInputSchema: z.ZodType<Prisma.ExpenseUncheckedCreateWithoutDebtsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  payerId: z.string(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  groupId: z.string()
}).strict();

export const ExpenseCreateOrConnectWithoutDebtsInputSchema: z.ZodType<Prisma.ExpenseCreateOrConnectWithoutDebtsInput> = z.object({
  where: z.lazy(() => ExpenseWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ExpenseCreateWithoutDebtsInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutDebtsInputSchema) ]),
}).strict();

export const UserCreateWithoutDebtsInputSchema: z.ZodType<Prisma.UserCreateWithoutDebtsInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  groups: z.lazy(() => UserGroupCreateNestedManyWithoutUserInputSchema).optional(),
  expenses: z.lazy(() => ExpenseCreateNestedManyWithoutPayerInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutDebtsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutDebtsInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  groups: z.lazy(() => UserGroupUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedCreateNestedManyWithoutPayerInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutDebtsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDebtsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDebtsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDebtsInputSchema) ]),
}).strict();

export const ExpenseLogCreateWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogCreateWithoutDebtInput> = z.object({
  id: z.string().cuid().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ExpenseLogUncheckedCreateWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogUncheckedCreateWithoutDebtInput> = z.object({
  id: z.string().cuid().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ExpenseLogCreateOrConnectWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogCreateOrConnectWithoutDebtInput> = z.object({
  where: z.lazy(() => ExpenseLogWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ExpenseLogCreateWithoutDebtInputSchema),z.lazy(() => ExpenseLogUncheckedCreateWithoutDebtInputSchema) ]),
}).strict();

export const ExpenseLogCreateManyDebtInputEnvelopeSchema: z.ZodType<Prisma.ExpenseLogCreateManyDebtInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ExpenseLogCreateManyDebtInputSchema),z.lazy(() => ExpenseLogCreateManyDebtInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ExpenseUpsertWithoutDebtsInputSchema: z.ZodType<Prisma.ExpenseUpsertWithoutDebtsInput> = z.object({
  update: z.union([ z.lazy(() => ExpenseUpdateWithoutDebtsInputSchema),z.lazy(() => ExpenseUncheckedUpdateWithoutDebtsInputSchema) ]),
  create: z.union([ z.lazy(() => ExpenseCreateWithoutDebtsInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutDebtsInputSchema) ]),
  where: z.lazy(() => ExpenseWhereInputSchema).optional()
}).strict();

export const ExpenseUpdateToOneWithWhereWithoutDebtsInputSchema: z.ZodType<Prisma.ExpenseUpdateToOneWithWhereWithoutDebtsInput> = z.object({
  where: z.lazy(() => ExpenseWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ExpenseUpdateWithoutDebtsInputSchema),z.lazy(() => ExpenseUncheckedUpdateWithoutDebtsInputSchema) ]),
}).strict();

export const ExpenseUpdateWithoutDebtsInputSchema: z.ZodType<Prisma.ExpenseUpdateWithoutDebtsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  payer: z.lazy(() => UserUpdateOneRequiredWithoutExpensesNestedInputSchema).optional(),
  group: z.lazy(() => GroupUpdateOneRequiredWithoutExpensesNestedInputSchema).optional()
}).strict();

export const ExpenseUncheckedUpdateWithoutDebtsInputSchema: z.ZodType<Prisma.ExpenseUncheckedUpdateWithoutDebtsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  groupId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUpsertWithoutDebtsInputSchema: z.ZodType<Prisma.UserUpsertWithoutDebtsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutDebtsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDebtsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDebtsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDebtsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutDebtsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDebtsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutDebtsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDebtsInputSchema) ]),
}).strict();

export const UserUpdateWithoutDebtsInputSchema: z.ZodType<Prisma.UserUpdateWithoutDebtsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  groups: z.lazy(() => UserGroupUpdateManyWithoutUserNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUpdateManyWithoutPayerNestedInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutDebtsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutDebtsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  groups: z.lazy(() => UserGroupUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedUpdateManyWithoutPayerNestedInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const ExpenseLogUpsertWithWhereUniqueWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogUpsertWithWhereUniqueWithoutDebtInput> = z.object({
  where: z.lazy(() => ExpenseLogWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ExpenseLogUpdateWithoutDebtInputSchema),z.lazy(() => ExpenseLogUncheckedUpdateWithoutDebtInputSchema) ]),
  create: z.union([ z.lazy(() => ExpenseLogCreateWithoutDebtInputSchema),z.lazy(() => ExpenseLogUncheckedCreateWithoutDebtInputSchema) ]),
}).strict();

export const ExpenseLogUpdateWithWhereUniqueWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogUpdateWithWhereUniqueWithoutDebtInput> = z.object({
  where: z.lazy(() => ExpenseLogWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ExpenseLogUpdateWithoutDebtInputSchema),z.lazy(() => ExpenseLogUncheckedUpdateWithoutDebtInputSchema) ]),
}).strict();

export const ExpenseLogUpdateManyWithWhereWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogUpdateManyWithWhereWithoutDebtInput> = z.object({
  where: z.lazy(() => ExpenseLogScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ExpenseLogUpdateManyMutationInputSchema),z.lazy(() => ExpenseLogUncheckedUpdateManyWithoutDebtInputSchema) ]),
}).strict();

export const ExpenseLogScalarWhereInputSchema: z.ZodType<Prisma.ExpenseLogScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ExpenseLogScalarWhereInputSchema),z.lazy(() => ExpenseLogScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseLogScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseLogScalarWhereInputSchema),z.lazy(() => ExpenseLogScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  debtId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserCreateWithoutExpensesInputSchema: z.ZodType<Prisma.UserCreateWithoutExpensesInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  groups: z.lazy(() => UserGroupCreateNestedManyWithoutUserInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtCreateNestedManyWithoutDebtorInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutExpensesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutExpensesInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  groups: z.lazy(() => UserGroupUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedCreateNestedManyWithoutDebtorInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutExpensesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutExpensesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutExpensesInputSchema),z.lazy(() => UserUncheckedCreateWithoutExpensesInputSchema) ]),
}).strict();

export const ExpenseDebtCreateWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtCreateWithoutExpenseInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  debtor: z.lazy(() => UserCreateNestedOneWithoutDebtsInputSchema),
  logs: z.lazy(() => ExpenseLogCreateNestedManyWithoutDebtInputSchema).optional()
}).strict();

export const ExpenseDebtUncheckedCreateWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedCreateWithoutExpenseInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  debtorId: z.string(),
  logs: z.lazy(() => ExpenseLogUncheckedCreateNestedManyWithoutDebtInputSchema).optional()
}).strict();

export const ExpenseDebtCreateOrConnectWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtCreateOrConnectWithoutExpenseInput> = z.object({
  where: z.lazy(() => ExpenseDebtWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutExpenseInputSchema) ]),
}).strict();

export const ExpenseDebtCreateManyExpenseInputEnvelopeSchema: z.ZodType<Prisma.ExpenseDebtCreateManyExpenseInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ExpenseDebtCreateManyExpenseInputSchema),z.lazy(() => ExpenseDebtCreateManyExpenseInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const GroupCreateWithoutExpensesInputSchema: z.ZodType<Prisma.GroupCreateWithoutExpensesInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  adminId: z.string(),
  members: z.lazy(() => UserGroupCreateNestedManyWithoutGroupInputSchema).optional()
}).strict();

export const GroupUncheckedCreateWithoutExpensesInputSchema: z.ZodType<Prisma.GroupUncheckedCreateWithoutExpensesInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  adminId: z.string(),
  members: z.lazy(() => UserGroupUncheckedCreateNestedManyWithoutGroupInputSchema).optional()
}).strict();

export const GroupCreateOrConnectWithoutExpensesInputSchema: z.ZodType<Prisma.GroupCreateOrConnectWithoutExpensesInput> = z.object({
  where: z.lazy(() => GroupWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => GroupCreateWithoutExpensesInputSchema),z.lazy(() => GroupUncheckedCreateWithoutExpensesInputSchema) ]),
}).strict();

export const UserUpsertWithoutExpensesInputSchema: z.ZodType<Prisma.UserUpsertWithoutExpensesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutExpensesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutExpensesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutExpensesInputSchema),z.lazy(() => UserUncheckedCreateWithoutExpensesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutExpensesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutExpensesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutExpensesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutExpensesInputSchema) ]),
}).strict();

export const UserUpdateWithoutExpensesInputSchema: z.ZodType<Prisma.UserUpdateWithoutExpensesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  groups: z.lazy(() => UserGroupUpdateManyWithoutUserNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUpdateManyWithoutDebtorNestedInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutExpensesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutExpensesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  groups: z.lazy(() => UserGroupUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedUpdateManyWithoutDebtorNestedInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const ExpenseDebtUpsertWithWhereUniqueWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtUpsertWithWhereUniqueWithoutExpenseInput> = z.object({
  where: z.lazy(() => ExpenseDebtWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ExpenseDebtUpdateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUncheckedUpdateWithoutExpenseInputSchema) ]),
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutExpenseInputSchema) ]),
}).strict();

export const ExpenseDebtUpdateWithWhereUniqueWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateWithWhereUniqueWithoutExpenseInput> = z.object({
  where: z.lazy(() => ExpenseDebtWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ExpenseDebtUpdateWithoutExpenseInputSchema),z.lazy(() => ExpenseDebtUncheckedUpdateWithoutExpenseInputSchema) ]),
}).strict();

export const ExpenseDebtUpdateManyWithWhereWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateManyWithWhereWithoutExpenseInput> = z.object({
  where: z.lazy(() => ExpenseDebtScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ExpenseDebtUpdateManyMutationInputSchema),z.lazy(() => ExpenseDebtUncheckedUpdateManyWithoutExpenseInputSchema) ]),
}).strict();

export const ExpenseDebtScalarWhereInputSchema: z.ZodType<Prisma.ExpenseDebtScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ExpenseDebtScalarWhereInputSchema),z.lazy(() => ExpenseDebtScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExpenseDebtScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExpenseDebtScalarWhereInputSchema),z.lazy(() => ExpenseDebtScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  settled: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  expenseId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  debtorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const GroupUpsertWithoutExpensesInputSchema: z.ZodType<Prisma.GroupUpsertWithoutExpensesInput> = z.object({
  update: z.union([ z.lazy(() => GroupUpdateWithoutExpensesInputSchema),z.lazy(() => GroupUncheckedUpdateWithoutExpensesInputSchema) ]),
  create: z.union([ z.lazy(() => GroupCreateWithoutExpensesInputSchema),z.lazy(() => GroupUncheckedCreateWithoutExpensesInputSchema) ]),
  where: z.lazy(() => GroupWhereInputSchema).optional()
}).strict();

export const GroupUpdateToOneWithWhereWithoutExpensesInputSchema: z.ZodType<Prisma.GroupUpdateToOneWithWhereWithoutExpensesInput> = z.object({
  where: z.lazy(() => GroupWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => GroupUpdateWithoutExpensesInputSchema),z.lazy(() => GroupUncheckedUpdateWithoutExpensesInputSchema) ]),
}).strict();

export const GroupUpdateWithoutExpensesInputSchema: z.ZodType<Prisma.GroupUpdateWithoutExpensesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  adminId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  members: z.lazy(() => UserGroupUpdateManyWithoutGroupNestedInputSchema).optional()
}).strict();

export const GroupUncheckedUpdateWithoutExpensesInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateWithoutExpensesInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  adminId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  members: z.lazy(() => UserGroupUncheckedUpdateManyWithoutGroupNestedInputSchema).optional()
}).strict();

export const SessionCreateWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date()
}).strict();

export const SessionUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date()
}).strict();

export const SessionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.SessionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const SessionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.SessionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SessionCreateManyUserInputSchema),z.lazy(() => SessionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserGroupCreateWithoutUserInputSchema: z.ZodType<Prisma.UserGroupCreateWithoutUserInput> = z.object({
  group: z.lazy(() => GroupCreateNestedOneWithoutMembersInputSchema)
}).strict();

export const UserGroupUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserGroupUncheckedCreateWithoutUserInput> = z.object({
  groupId: z.string()
}).strict();

export const UserGroupCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserGroupCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserGroupWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserGroupCreateWithoutUserInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserGroupCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserGroupCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserGroupCreateManyUserInputSchema),z.lazy(() => UserGroupCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ExpenseCreateWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseCreateWithoutPayerInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  debts: z.lazy(() => ExpenseDebtCreateNestedManyWithoutExpenseInputSchema).optional(),
  group: z.lazy(() => GroupCreateNestedOneWithoutExpensesInputSchema)
}).strict();

export const ExpenseUncheckedCreateWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseUncheckedCreateWithoutPayerInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  groupId: z.string(),
  debts: z.lazy(() => ExpenseDebtUncheckedCreateNestedManyWithoutExpenseInputSchema).optional()
}).strict();

export const ExpenseCreateOrConnectWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseCreateOrConnectWithoutPayerInput> = z.object({
  where: z.lazy(() => ExpenseWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ExpenseCreateWithoutPayerInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutPayerInputSchema) ]),
}).strict();

export const ExpenseCreateManyPayerInputEnvelopeSchema: z.ZodType<Prisma.ExpenseCreateManyPayerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ExpenseCreateManyPayerInputSchema),z.lazy(() => ExpenseCreateManyPayerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ExpenseDebtCreateWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtCreateWithoutDebtorInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  expense: z.lazy(() => ExpenseCreateNestedOneWithoutDebtsInputSchema),
  logs: z.lazy(() => ExpenseLogCreateNestedManyWithoutDebtInputSchema).optional()
}).strict();

export const ExpenseDebtUncheckedCreateWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedCreateWithoutDebtorInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  expenseId: z.string(),
  logs: z.lazy(() => ExpenseLogUncheckedCreateNestedManyWithoutDebtInputSchema).optional()
}).strict();

export const ExpenseDebtCreateOrConnectWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtCreateOrConnectWithoutDebtorInput> = z.object({
  where: z.lazy(() => ExpenseDebtWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutDebtorInputSchema) ]),
}).strict();

export const ExpenseDebtCreateManyDebtorInputEnvelopeSchema: z.ZodType<Prisma.ExpenseDebtCreateManyDebtorInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ExpenseDebtCreateManyDebtorInputSchema),z.lazy(() => ExpenseDebtCreateManyDebtorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const PushSubscriptionCreateWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionCreateWithoutUserInput> = z.object({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string()
}).strict();

export const PushSubscriptionUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionUncheckedCreateWithoutUserInput> = z.object({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string()
}).strict();

export const PushSubscriptionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => PushSubscriptionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PushSubscriptionCreateWithoutUserInputSchema),z.lazy(() => PushSubscriptionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const PushSubscriptionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.PushSubscriptionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PushSubscriptionCreateManyUserInputSchema),z.lazy(() => PushSubscriptionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const SessionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => SessionCreateWithoutUserInputSchema),z.lazy(() => SessionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const SessionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SessionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateWithoutUserInputSchema),z.lazy(() => SessionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const SessionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => SessionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SessionUpdateManyMutationInputSchema),z.lazy(() => SessionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const SessionScalarWhereInputSchema: z.ZodType<Prisma.SessionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereInputSchema),z.lazy(() => SessionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserGroupUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserGroupUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserGroupWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserGroupUpdateWithoutUserInputSchema),z.lazy(() => UserGroupUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserGroupCreateWithoutUserInputSchema),z.lazy(() => UserGroupUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserGroupUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserGroupUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserGroupWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserGroupUpdateWithoutUserInputSchema),z.lazy(() => UserGroupUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserGroupUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserGroupUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserGroupScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserGroupUpdateManyMutationInputSchema),z.lazy(() => UserGroupUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const ExpenseUpsertWithWhereUniqueWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseUpsertWithWhereUniqueWithoutPayerInput> = z.object({
  where: z.lazy(() => ExpenseWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ExpenseUpdateWithoutPayerInputSchema),z.lazy(() => ExpenseUncheckedUpdateWithoutPayerInputSchema) ]),
  create: z.union([ z.lazy(() => ExpenseCreateWithoutPayerInputSchema),z.lazy(() => ExpenseUncheckedCreateWithoutPayerInputSchema) ]),
}).strict();

export const ExpenseUpdateWithWhereUniqueWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseUpdateWithWhereUniqueWithoutPayerInput> = z.object({
  where: z.lazy(() => ExpenseWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ExpenseUpdateWithoutPayerInputSchema),z.lazy(() => ExpenseUncheckedUpdateWithoutPayerInputSchema) ]),
}).strict();

export const ExpenseUpdateManyWithWhereWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseUpdateManyWithWhereWithoutPayerInput> = z.object({
  where: z.lazy(() => ExpenseScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ExpenseUpdateManyMutationInputSchema),z.lazy(() => ExpenseUncheckedUpdateManyWithoutPayerInputSchema) ]),
}).strict();

export const ExpenseDebtUpsertWithWhereUniqueWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtUpsertWithWhereUniqueWithoutDebtorInput> = z.object({
  where: z.lazy(() => ExpenseDebtWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ExpenseDebtUpdateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUncheckedUpdateWithoutDebtorInputSchema) ]),
  create: z.union([ z.lazy(() => ExpenseDebtCreateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUncheckedCreateWithoutDebtorInputSchema) ]),
}).strict();

export const ExpenseDebtUpdateWithWhereUniqueWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateWithWhereUniqueWithoutDebtorInput> = z.object({
  where: z.lazy(() => ExpenseDebtWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ExpenseDebtUpdateWithoutDebtorInputSchema),z.lazy(() => ExpenseDebtUncheckedUpdateWithoutDebtorInputSchema) ]),
}).strict();

export const ExpenseDebtUpdateManyWithWhereWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateManyWithWhereWithoutDebtorInput> = z.object({
  where: z.lazy(() => ExpenseDebtScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ExpenseDebtUpdateManyMutationInputSchema),z.lazy(() => ExpenseDebtUncheckedUpdateManyWithoutDebtorInputSchema) ]),
}).strict();

export const PushSubscriptionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PushSubscriptionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PushSubscriptionUpdateWithoutUserInputSchema),z.lazy(() => PushSubscriptionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => PushSubscriptionCreateWithoutUserInputSchema),z.lazy(() => PushSubscriptionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const PushSubscriptionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PushSubscriptionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PushSubscriptionUpdateWithoutUserInputSchema),z.lazy(() => PushSubscriptionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const PushSubscriptionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => PushSubscriptionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PushSubscriptionUpdateManyMutationInputSchema),z.lazy(() => PushSubscriptionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const PushSubscriptionScalarWhereInputSchema: z.ZodType<Prisma.PushSubscriptionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PushSubscriptionScalarWhereInputSchema),z.lazy(() => PushSubscriptionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PushSubscriptionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PushSubscriptionScalarWhereInputSchema),z.lazy(() => PushSubscriptionScalarWhereInputSchema).array() ]).optional(),
  endpoint: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  p256dh: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  auth: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UserCreateWithoutPushSubscriptionsInputSchema: z.ZodType<Prisma.UserCreateWithoutPushSubscriptionsInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  groups: z.lazy(() => UserGroupCreateNestedManyWithoutUserInputSchema).optional(),
  expenses: z.lazy(() => ExpenseCreateNestedManyWithoutPayerInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtCreateNestedManyWithoutDebtorInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutPushSubscriptionsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutPushSubscriptionsInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  groups: z.lazy(() => UserGroupUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedCreateNestedManyWithoutPayerInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedCreateNestedManyWithoutDebtorInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutPushSubscriptionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPushSubscriptionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutPushSubscriptionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPushSubscriptionsInputSchema) ]),
}).strict();

export const UserUpsertWithoutPushSubscriptionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutPushSubscriptionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutPushSubscriptionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPushSubscriptionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPushSubscriptionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPushSubscriptionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutPushSubscriptionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPushSubscriptionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPushSubscriptionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPushSubscriptionsInputSchema) ]),
}).strict();

export const UserUpdateWithoutPushSubscriptionsInputSchema: z.ZodType<Prisma.UserUpdateWithoutPushSubscriptionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  groups: z.lazy(() => UserGroupUpdateManyWithoutUserNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUpdateManyWithoutPayerNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUpdateManyWithoutDebtorNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutPushSubscriptionsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutPushSubscriptionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  groups: z.lazy(() => UserGroupUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedUpdateManyWithoutPayerNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedUpdateManyWithoutDebtorNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateWithoutSessionsInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  groups: z.lazy(() => UserGroupCreateNestedManyWithoutUserInputSchema).optional(),
  expenses: z.lazy(() => ExpenseCreateNestedManyWithoutPayerInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtCreateNestedManyWithoutDebtorInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutSessionsInput> = z.object({
  id: z.string().cuid().optional(),
  googleId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  activeGroupId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  groups: z.lazy(() => UserGroupUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedCreateNestedManyWithoutPayerInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedCreateNestedManyWithoutDebtorInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutSessionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
}).strict();

export const UserUpsertWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutSessionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutSessionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutSessionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutSessionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSessionsInputSchema) ]),
}).strict();

export const UserUpdateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUpdateWithoutSessionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  groups: z.lazy(() => UserGroupUpdateManyWithoutUserNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUpdateManyWithoutPayerNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUpdateManyWithoutDebtorNestedInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutSessionsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutSessionsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  googleId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  activeGroupId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  groups: z.lazy(() => UserGroupUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  expenses: z.lazy(() => ExpenseUncheckedUpdateManyWithoutPayerNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedUpdateManyWithoutDebtorNestedInputSchema).optional(),
  pushSubscriptions: z.lazy(() => PushSubscriptionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserGroupCreateManyGroupInputSchema: z.ZodType<Prisma.UserGroupCreateManyGroupInput> = z.object({
  userId: z.string()
}).strict();

export const ExpenseCreateManyGroupInputSchema: z.ZodType<Prisma.ExpenseCreateManyGroupInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  payerId: z.string(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
}).strict();

export const UserGroupUpdateWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupUpdateWithoutGroupInput> = z.object({
  user: z.lazy(() => UserUpdateOneRequiredWithoutGroupsNestedInputSchema).optional()
}).strict();

export const UserGroupUncheckedUpdateWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupUncheckedUpdateWithoutGroupInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGroupUncheckedUpdateManyWithoutGroupInputSchema: z.ZodType<Prisma.UserGroupUncheckedUpdateManyWithoutGroupInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseUpdateWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseUpdateWithoutGroupInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  payer: z.lazy(() => UserUpdateOneRequiredWithoutExpensesNestedInputSchema).optional(),
  debts: z.lazy(() => ExpenseDebtUpdateManyWithoutExpenseNestedInputSchema).optional()
}).strict();

export const ExpenseUncheckedUpdateWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseUncheckedUpdateWithoutGroupInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedUpdateManyWithoutExpenseNestedInputSchema).optional()
}).strict();

export const ExpenseUncheckedUpdateManyWithoutGroupInputSchema: z.ZodType<Prisma.ExpenseUncheckedUpdateManyWithoutGroupInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseLogCreateManyDebtInputSchema: z.ZodType<Prisma.ExpenseLogCreateManyDebtInput> = z.object({
  id: z.string().cuid().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ExpenseLogUpdateWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogUpdateWithoutDebtInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseLogUncheckedUpdateWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogUncheckedUpdateWithoutDebtInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseLogUncheckedUpdateManyWithoutDebtInputSchema: z.ZodType<Prisma.ExpenseLogUncheckedUpdateManyWithoutDebtInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseDebtCreateManyExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtCreateManyExpenseInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  debtorId: z.string()
}).strict();

export const ExpenseDebtUpdateWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateWithoutExpenseInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  debtor: z.lazy(() => UserUpdateOneRequiredWithoutDebtsNestedInputSchema).optional(),
  logs: z.lazy(() => ExpenseLogUpdateManyWithoutDebtNestedInputSchema).optional()
}).strict();

export const ExpenseDebtUncheckedUpdateWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedUpdateWithoutExpenseInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  debtorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  logs: z.lazy(() => ExpenseLogUncheckedUpdateManyWithoutDebtNestedInputSchema).optional()
}).strict();

export const ExpenseDebtUncheckedUpdateManyWithoutExpenseInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedUpdateManyWithoutExpenseInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  debtorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateManyUserInputSchema: z.ZodType<Prisma.SessionCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  expiresAt: z.coerce.date()
}).strict();

export const UserGroupCreateManyUserInputSchema: z.ZodType<Prisma.UserGroupCreateManyUserInput> = z.object({
  groupId: z.string()
}).strict();

export const ExpenseCreateManyPayerInputSchema: z.ZodType<Prisma.ExpenseCreateManyPayerInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  groupId: z.string()
}).strict();

export const ExpenseDebtCreateManyDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtCreateManyDebtorInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  settled: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  expenseId: z.string()
}).strict();

export const PushSubscriptionCreateManyUserInputSchema: z.ZodType<Prisma.PushSubscriptionCreateManyUserInput> = z.object({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string()
}).strict();

export const SessionUpdateWithoutUserInputSchema: z.ZodType<Prisma.SessionUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGroupUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserGroupUpdateWithoutUserInput> = z.object({
  group: z.lazy(() => GroupUpdateOneRequiredWithoutMembersNestedInputSchema).optional()
}).strict();

export const UserGroupUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserGroupUncheckedUpdateWithoutUserInput> = z.object({
  groupId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGroupUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserGroupUncheckedUpdateManyWithoutUserInput> = z.object({
  groupId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseUpdateWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseUpdateWithoutPayerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  debts: z.lazy(() => ExpenseDebtUpdateManyWithoutExpenseNestedInputSchema).optional(),
  group: z.lazy(() => GroupUpdateOneRequiredWithoutExpensesNestedInputSchema).optional()
}).strict();

export const ExpenseUncheckedUpdateWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseUncheckedUpdateWithoutPayerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  groupId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  debts: z.lazy(() => ExpenseDebtUncheckedUpdateManyWithoutExpenseNestedInputSchema).optional()
}).strict();

export const ExpenseUncheckedUpdateManyWithoutPayerInputSchema: z.ZodType<Prisma.ExpenseUncheckedUpdateManyWithoutPayerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  groupId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExpenseDebtUpdateWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtUpdateWithoutDebtorInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  expense: z.lazy(() => ExpenseUpdateOneRequiredWithoutDebtsNestedInputSchema).optional(),
  logs: z.lazy(() => ExpenseLogUpdateManyWithoutDebtNestedInputSchema).optional()
}).strict();

export const ExpenseDebtUncheckedUpdateWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedUpdateWithoutDebtorInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  expenseId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  logs: z.lazy(() => ExpenseLogUncheckedUpdateManyWithoutDebtNestedInputSchema).optional()
}).strict();

export const ExpenseDebtUncheckedUpdateManyWithoutDebtorInputSchema: z.ZodType<Prisma.ExpenseDebtUncheckedUpdateManyWithoutDebtorInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  settled: z.union([ z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  expenseId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PushSubscriptionUpdateWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionUpdateWithoutUserInput> = z.object({
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  p256dh: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  auth: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PushSubscriptionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionUncheckedUpdateWithoutUserInput> = z.object({
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  p256dh: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  auth: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PushSubscriptionUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.PushSubscriptionUncheckedUpdateManyWithoutUserInput> = z.object({
  endpoint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  p256dh: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  auth: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const GroupFindFirstArgsSchema: z.ZodType<Prisma.GroupFindFirstArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereInputSchema.optional(),
  orderBy: z.union([ GroupOrderByWithRelationInputSchema.array(),GroupOrderByWithRelationInputSchema ]).optional(),
  cursor: GroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ GroupScalarFieldEnumSchema,GroupScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const GroupFindFirstOrThrowArgsSchema: z.ZodType<Prisma.GroupFindFirstOrThrowArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereInputSchema.optional(),
  orderBy: z.union([ GroupOrderByWithRelationInputSchema.array(),GroupOrderByWithRelationInputSchema ]).optional(),
  cursor: GroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ GroupScalarFieldEnumSchema,GroupScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const GroupFindManyArgsSchema: z.ZodType<Prisma.GroupFindManyArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereInputSchema.optional(),
  orderBy: z.union([ GroupOrderByWithRelationInputSchema.array(),GroupOrderByWithRelationInputSchema ]).optional(),
  cursor: GroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ GroupScalarFieldEnumSchema,GroupScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const GroupAggregateArgsSchema: z.ZodType<Prisma.GroupAggregateArgs> = z.object({
  where: GroupWhereInputSchema.optional(),
  orderBy: z.union([ GroupOrderByWithRelationInputSchema.array(),GroupOrderByWithRelationInputSchema ]).optional(),
  cursor: GroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const GroupGroupByArgsSchema: z.ZodType<Prisma.GroupGroupByArgs> = z.object({
  where: GroupWhereInputSchema.optional(),
  orderBy: z.union([ GroupOrderByWithAggregationInputSchema.array(),GroupOrderByWithAggregationInputSchema ]).optional(),
  by: GroupScalarFieldEnumSchema.array(),
  having: GroupScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const GroupFindUniqueArgsSchema: z.ZodType<Prisma.GroupFindUniqueArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereUniqueInputSchema,
}).strict() ;

export const GroupFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.GroupFindUniqueOrThrowArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereUniqueInputSchema,
}).strict() ;

export const UserGroupFindFirstArgsSchema: z.ZodType<Prisma.UserGroupFindFirstArgs> = z.object({
  select: UserGroupSelectSchema.optional(),
  include: UserGroupIncludeSchema.optional(),
  where: UserGroupWhereInputSchema.optional(),
  orderBy: z.union([ UserGroupOrderByWithRelationInputSchema.array(),UserGroupOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserGroupScalarFieldEnumSchema,UserGroupScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserGroupFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserGroupFindFirstOrThrowArgs> = z.object({
  select: UserGroupSelectSchema.optional(),
  include: UserGroupIncludeSchema.optional(),
  where: UserGroupWhereInputSchema.optional(),
  orderBy: z.union([ UserGroupOrderByWithRelationInputSchema.array(),UserGroupOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserGroupScalarFieldEnumSchema,UserGroupScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserGroupFindManyArgsSchema: z.ZodType<Prisma.UserGroupFindManyArgs> = z.object({
  select: UserGroupSelectSchema.optional(),
  include: UserGroupIncludeSchema.optional(),
  where: UserGroupWhereInputSchema.optional(),
  orderBy: z.union([ UserGroupOrderByWithRelationInputSchema.array(),UserGroupOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserGroupScalarFieldEnumSchema,UserGroupScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserGroupAggregateArgsSchema: z.ZodType<Prisma.UserGroupAggregateArgs> = z.object({
  where: UserGroupWhereInputSchema.optional(),
  orderBy: z.union([ UserGroupOrderByWithRelationInputSchema.array(),UserGroupOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGroupGroupByArgsSchema: z.ZodType<Prisma.UserGroupGroupByArgs> = z.object({
  where: UserGroupWhereInputSchema.optional(),
  orderBy: z.union([ UserGroupOrderByWithAggregationInputSchema.array(),UserGroupOrderByWithAggregationInputSchema ]).optional(),
  by: UserGroupScalarFieldEnumSchema.array(),
  having: UserGroupScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGroupFindUniqueArgsSchema: z.ZodType<Prisma.UserGroupFindUniqueArgs> = z.object({
  select: UserGroupSelectSchema.optional(),
  include: UserGroupIncludeSchema.optional(),
  where: UserGroupWhereUniqueInputSchema,
}).strict() ;

export const UserGroupFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserGroupFindUniqueOrThrowArgs> = z.object({
  select: UserGroupSelectSchema.optional(),
  include: UserGroupIncludeSchema.optional(),
  where: UserGroupWhereUniqueInputSchema,
}).strict() ;

export const ExpenseLogFindFirstArgsSchema: z.ZodType<Prisma.ExpenseLogFindFirstArgs> = z.object({
  select: ExpenseLogSelectSchema.optional(),
  include: ExpenseLogIncludeSchema.optional(),
  where: ExpenseLogWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseLogOrderByWithRelationInputSchema.array(),ExpenseLogOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExpenseLogScalarFieldEnumSchema,ExpenseLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExpenseLogFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ExpenseLogFindFirstOrThrowArgs> = z.object({
  select: ExpenseLogSelectSchema.optional(),
  include: ExpenseLogIncludeSchema.optional(),
  where: ExpenseLogWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseLogOrderByWithRelationInputSchema.array(),ExpenseLogOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExpenseLogScalarFieldEnumSchema,ExpenseLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExpenseLogFindManyArgsSchema: z.ZodType<Prisma.ExpenseLogFindManyArgs> = z.object({
  select: ExpenseLogSelectSchema.optional(),
  include: ExpenseLogIncludeSchema.optional(),
  where: ExpenseLogWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseLogOrderByWithRelationInputSchema.array(),ExpenseLogOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExpenseLogScalarFieldEnumSchema,ExpenseLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExpenseLogAggregateArgsSchema: z.ZodType<Prisma.ExpenseLogAggregateArgs> = z.object({
  where: ExpenseLogWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseLogOrderByWithRelationInputSchema.array(),ExpenseLogOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ExpenseLogGroupByArgsSchema: z.ZodType<Prisma.ExpenseLogGroupByArgs> = z.object({
  where: ExpenseLogWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseLogOrderByWithAggregationInputSchema.array(),ExpenseLogOrderByWithAggregationInputSchema ]).optional(),
  by: ExpenseLogScalarFieldEnumSchema.array(),
  having: ExpenseLogScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ExpenseLogFindUniqueArgsSchema: z.ZodType<Prisma.ExpenseLogFindUniqueArgs> = z.object({
  select: ExpenseLogSelectSchema.optional(),
  include: ExpenseLogIncludeSchema.optional(),
  where: ExpenseLogWhereUniqueInputSchema,
}).strict() ;

export const ExpenseLogFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ExpenseLogFindUniqueOrThrowArgs> = z.object({
  select: ExpenseLogSelectSchema.optional(),
  include: ExpenseLogIncludeSchema.optional(),
  where: ExpenseLogWhereUniqueInputSchema,
}).strict() ;

export const ExpenseDebtFindFirstArgsSchema: z.ZodType<Prisma.ExpenseDebtFindFirstArgs> = z.object({
  select: ExpenseDebtSelectSchema.optional(),
  include: ExpenseDebtIncludeSchema.optional(),
  where: ExpenseDebtWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseDebtOrderByWithRelationInputSchema.array(),ExpenseDebtOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseDebtWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExpenseDebtScalarFieldEnumSchema,ExpenseDebtScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExpenseDebtFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ExpenseDebtFindFirstOrThrowArgs> = z.object({
  select: ExpenseDebtSelectSchema.optional(),
  include: ExpenseDebtIncludeSchema.optional(),
  where: ExpenseDebtWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseDebtOrderByWithRelationInputSchema.array(),ExpenseDebtOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseDebtWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExpenseDebtScalarFieldEnumSchema,ExpenseDebtScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExpenseDebtFindManyArgsSchema: z.ZodType<Prisma.ExpenseDebtFindManyArgs> = z.object({
  select: ExpenseDebtSelectSchema.optional(),
  include: ExpenseDebtIncludeSchema.optional(),
  where: ExpenseDebtWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseDebtOrderByWithRelationInputSchema.array(),ExpenseDebtOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseDebtWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExpenseDebtScalarFieldEnumSchema,ExpenseDebtScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExpenseDebtAggregateArgsSchema: z.ZodType<Prisma.ExpenseDebtAggregateArgs> = z.object({
  where: ExpenseDebtWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseDebtOrderByWithRelationInputSchema.array(),ExpenseDebtOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseDebtWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ExpenseDebtGroupByArgsSchema: z.ZodType<Prisma.ExpenseDebtGroupByArgs> = z.object({
  where: ExpenseDebtWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseDebtOrderByWithAggregationInputSchema.array(),ExpenseDebtOrderByWithAggregationInputSchema ]).optional(),
  by: ExpenseDebtScalarFieldEnumSchema.array(),
  having: ExpenseDebtScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ExpenseDebtFindUniqueArgsSchema: z.ZodType<Prisma.ExpenseDebtFindUniqueArgs> = z.object({
  select: ExpenseDebtSelectSchema.optional(),
  include: ExpenseDebtIncludeSchema.optional(),
  where: ExpenseDebtWhereUniqueInputSchema,
}).strict() ;

export const ExpenseDebtFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ExpenseDebtFindUniqueOrThrowArgs> = z.object({
  select: ExpenseDebtSelectSchema.optional(),
  include: ExpenseDebtIncludeSchema.optional(),
  where: ExpenseDebtWhereUniqueInputSchema,
}).strict() ;

export const ExpenseFindFirstArgsSchema: z.ZodType<Prisma.ExpenseFindFirstArgs> = z.object({
  select: ExpenseSelectSchema.optional(),
  include: ExpenseIncludeSchema.optional(),
  where: ExpenseWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseOrderByWithRelationInputSchema.array(),ExpenseOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExpenseScalarFieldEnumSchema,ExpenseScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExpenseFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ExpenseFindFirstOrThrowArgs> = z.object({
  select: ExpenseSelectSchema.optional(),
  include: ExpenseIncludeSchema.optional(),
  where: ExpenseWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseOrderByWithRelationInputSchema.array(),ExpenseOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExpenseScalarFieldEnumSchema,ExpenseScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExpenseFindManyArgsSchema: z.ZodType<Prisma.ExpenseFindManyArgs> = z.object({
  select: ExpenseSelectSchema.optional(),
  include: ExpenseIncludeSchema.optional(),
  where: ExpenseWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseOrderByWithRelationInputSchema.array(),ExpenseOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExpenseScalarFieldEnumSchema,ExpenseScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExpenseAggregateArgsSchema: z.ZodType<Prisma.ExpenseAggregateArgs> = z.object({
  where: ExpenseWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseOrderByWithRelationInputSchema.array(),ExpenseOrderByWithRelationInputSchema ]).optional(),
  cursor: ExpenseWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ExpenseGroupByArgsSchema: z.ZodType<Prisma.ExpenseGroupByArgs> = z.object({
  where: ExpenseWhereInputSchema.optional(),
  orderBy: z.union([ ExpenseOrderByWithAggregationInputSchema.array(),ExpenseOrderByWithAggregationInputSchema ]).optional(),
  by: ExpenseScalarFieldEnumSchema.array(),
  having: ExpenseScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ExpenseFindUniqueArgsSchema: z.ZodType<Prisma.ExpenseFindUniqueArgs> = z.object({
  select: ExpenseSelectSchema.optional(),
  include: ExpenseIncludeSchema.optional(),
  where: ExpenseWhereUniqueInputSchema,
}).strict() ;

export const ExpenseFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ExpenseFindUniqueOrThrowArgs> = z.object({
  select: ExpenseSelectSchema.optional(),
  include: ExpenseIncludeSchema.optional(),
  where: ExpenseWhereUniqueInputSchema,
}).strict() ;

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const PushSubscriptionFindFirstArgsSchema: z.ZodType<Prisma.PushSubscriptionFindFirstArgs> = z.object({
  select: PushSubscriptionSelectSchema.optional(),
  include: PushSubscriptionIncludeSchema.optional(),
  where: PushSubscriptionWhereInputSchema.optional(),
  orderBy: z.union([ PushSubscriptionOrderByWithRelationInputSchema.array(),PushSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: PushSubscriptionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PushSubscriptionScalarFieldEnumSchema,PushSubscriptionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PushSubscriptionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PushSubscriptionFindFirstOrThrowArgs> = z.object({
  select: PushSubscriptionSelectSchema.optional(),
  include: PushSubscriptionIncludeSchema.optional(),
  where: PushSubscriptionWhereInputSchema.optional(),
  orderBy: z.union([ PushSubscriptionOrderByWithRelationInputSchema.array(),PushSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: PushSubscriptionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PushSubscriptionScalarFieldEnumSchema,PushSubscriptionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PushSubscriptionFindManyArgsSchema: z.ZodType<Prisma.PushSubscriptionFindManyArgs> = z.object({
  select: PushSubscriptionSelectSchema.optional(),
  include: PushSubscriptionIncludeSchema.optional(),
  where: PushSubscriptionWhereInputSchema.optional(),
  orderBy: z.union([ PushSubscriptionOrderByWithRelationInputSchema.array(),PushSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: PushSubscriptionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PushSubscriptionScalarFieldEnumSchema,PushSubscriptionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const PushSubscriptionAggregateArgsSchema: z.ZodType<Prisma.PushSubscriptionAggregateArgs> = z.object({
  where: PushSubscriptionWhereInputSchema.optional(),
  orderBy: z.union([ PushSubscriptionOrderByWithRelationInputSchema.array(),PushSubscriptionOrderByWithRelationInputSchema ]).optional(),
  cursor: PushSubscriptionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const PushSubscriptionGroupByArgsSchema: z.ZodType<Prisma.PushSubscriptionGroupByArgs> = z.object({
  where: PushSubscriptionWhereInputSchema.optional(),
  orderBy: z.union([ PushSubscriptionOrderByWithAggregationInputSchema.array(),PushSubscriptionOrderByWithAggregationInputSchema ]).optional(),
  by: PushSubscriptionScalarFieldEnumSchema.array(),
  having: PushSubscriptionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const PushSubscriptionFindUniqueArgsSchema: z.ZodType<Prisma.PushSubscriptionFindUniqueArgs> = z.object({
  select: PushSubscriptionSelectSchema.optional(),
  include: PushSubscriptionIncludeSchema.optional(),
  where: PushSubscriptionWhereUniqueInputSchema,
}).strict() ;

export const PushSubscriptionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PushSubscriptionFindUniqueOrThrowArgs> = z.object({
  select: PushSubscriptionSelectSchema.optional(),
  include: PushSubscriptionIncludeSchema.optional(),
  where: PushSubscriptionWhereUniqueInputSchema,
}).strict() ;

export const SessionFindFirstArgsSchema: z.ZodType<Prisma.SessionFindFirstArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SessionFindFirstOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionFindManyArgsSchema: z.ZodType<Prisma.SessionFindManyArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionAggregateArgsSchema: z.ZodType<Prisma.SessionAggregateArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SessionGroupByArgsSchema: z.ZodType<Prisma.SessionGroupByArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithAggregationInputSchema.array(),SessionOrderByWithAggregationInputSchema ]).optional(),
  by: SessionScalarFieldEnumSchema.array(),
  having: SessionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SessionFindUniqueArgsSchema: z.ZodType<Prisma.SessionFindUniqueArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.SessionFindUniqueOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const GroupCreateArgsSchema: z.ZodType<Prisma.GroupCreateArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  data: z.union([ GroupCreateInputSchema,GroupUncheckedCreateInputSchema ]),
}).strict() ;

export const GroupUpsertArgsSchema: z.ZodType<Prisma.GroupUpsertArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereUniqueInputSchema,
  create: z.union([ GroupCreateInputSchema,GroupUncheckedCreateInputSchema ]),
  update: z.union([ GroupUpdateInputSchema,GroupUncheckedUpdateInputSchema ]),
}).strict() ;

export const GroupCreateManyArgsSchema: z.ZodType<Prisma.GroupCreateManyArgs> = z.object({
  data: z.union([ GroupCreateManyInputSchema,GroupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const GroupCreateManyAndReturnArgsSchema: z.ZodType<Prisma.GroupCreateManyAndReturnArgs> = z.object({
  data: z.union([ GroupCreateManyInputSchema,GroupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const GroupDeleteArgsSchema: z.ZodType<Prisma.GroupDeleteArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereUniqueInputSchema,
}).strict() ;

export const GroupUpdateArgsSchema: z.ZodType<Prisma.GroupUpdateArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  data: z.union([ GroupUpdateInputSchema,GroupUncheckedUpdateInputSchema ]),
  where: GroupWhereUniqueInputSchema,
}).strict() ;

export const GroupUpdateManyArgsSchema: z.ZodType<Prisma.GroupUpdateManyArgs> = z.object({
  data: z.union([ GroupUpdateManyMutationInputSchema,GroupUncheckedUpdateManyInputSchema ]),
  where: GroupWhereInputSchema.optional(),
}).strict() ;

export const GroupDeleteManyArgsSchema: z.ZodType<Prisma.GroupDeleteManyArgs> = z.object({
  where: GroupWhereInputSchema.optional(),
}).strict() ;

export const UserGroupCreateArgsSchema: z.ZodType<Prisma.UserGroupCreateArgs> = z.object({
  select: UserGroupSelectSchema.optional(),
  include: UserGroupIncludeSchema.optional(),
  data: z.union([ UserGroupCreateInputSchema,UserGroupUncheckedCreateInputSchema ]),
}).strict() ;

export const UserGroupUpsertArgsSchema: z.ZodType<Prisma.UserGroupUpsertArgs> = z.object({
  select: UserGroupSelectSchema.optional(),
  include: UserGroupIncludeSchema.optional(),
  where: UserGroupWhereUniqueInputSchema,
  create: z.union([ UserGroupCreateInputSchema,UserGroupUncheckedCreateInputSchema ]),
  update: z.union([ UserGroupUpdateInputSchema,UserGroupUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserGroupCreateManyArgsSchema: z.ZodType<Prisma.UserGroupCreateManyArgs> = z.object({
  data: z.union([ UserGroupCreateManyInputSchema,UserGroupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserGroupCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserGroupCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserGroupCreateManyInputSchema,UserGroupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserGroupDeleteArgsSchema: z.ZodType<Prisma.UserGroupDeleteArgs> = z.object({
  select: UserGroupSelectSchema.optional(),
  include: UserGroupIncludeSchema.optional(),
  where: UserGroupWhereUniqueInputSchema,
}).strict() ;

export const UserGroupUpdateArgsSchema: z.ZodType<Prisma.UserGroupUpdateArgs> = z.object({
  select: UserGroupSelectSchema.optional(),
  include: UserGroupIncludeSchema.optional(),
  data: z.union([ UserGroupUpdateInputSchema,UserGroupUncheckedUpdateInputSchema ]),
  where: UserGroupWhereUniqueInputSchema,
}).strict() ;

export const UserGroupUpdateManyArgsSchema: z.ZodType<Prisma.UserGroupUpdateManyArgs> = z.object({
  data: z.union([ UserGroupUpdateManyMutationInputSchema,UserGroupUncheckedUpdateManyInputSchema ]),
  where: UserGroupWhereInputSchema.optional(),
}).strict() ;

export const UserGroupDeleteManyArgsSchema: z.ZodType<Prisma.UserGroupDeleteManyArgs> = z.object({
  where: UserGroupWhereInputSchema.optional(),
}).strict() ;

export const ExpenseLogCreateArgsSchema: z.ZodType<Prisma.ExpenseLogCreateArgs> = z.object({
  select: ExpenseLogSelectSchema.optional(),
  include: ExpenseLogIncludeSchema.optional(),
  data: z.union([ ExpenseLogCreateInputSchema,ExpenseLogUncheckedCreateInputSchema ]),
}).strict() ;

export const ExpenseLogUpsertArgsSchema: z.ZodType<Prisma.ExpenseLogUpsertArgs> = z.object({
  select: ExpenseLogSelectSchema.optional(),
  include: ExpenseLogIncludeSchema.optional(),
  where: ExpenseLogWhereUniqueInputSchema,
  create: z.union([ ExpenseLogCreateInputSchema,ExpenseLogUncheckedCreateInputSchema ]),
  update: z.union([ ExpenseLogUpdateInputSchema,ExpenseLogUncheckedUpdateInputSchema ]),
}).strict() ;

export const ExpenseLogCreateManyArgsSchema: z.ZodType<Prisma.ExpenseLogCreateManyArgs> = z.object({
  data: z.union([ ExpenseLogCreateManyInputSchema,ExpenseLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ExpenseLogCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ExpenseLogCreateManyAndReturnArgs> = z.object({
  data: z.union([ ExpenseLogCreateManyInputSchema,ExpenseLogCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ExpenseLogDeleteArgsSchema: z.ZodType<Prisma.ExpenseLogDeleteArgs> = z.object({
  select: ExpenseLogSelectSchema.optional(),
  include: ExpenseLogIncludeSchema.optional(),
  where: ExpenseLogWhereUniqueInputSchema,
}).strict() ;

export const ExpenseLogUpdateArgsSchema: z.ZodType<Prisma.ExpenseLogUpdateArgs> = z.object({
  select: ExpenseLogSelectSchema.optional(),
  include: ExpenseLogIncludeSchema.optional(),
  data: z.union([ ExpenseLogUpdateInputSchema,ExpenseLogUncheckedUpdateInputSchema ]),
  where: ExpenseLogWhereUniqueInputSchema,
}).strict() ;

export const ExpenseLogUpdateManyArgsSchema: z.ZodType<Prisma.ExpenseLogUpdateManyArgs> = z.object({
  data: z.union([ ExpenseLogUpdateManyMutationInputSchema,ExpenseLogUncheckedUpdateManyInputSchema ]),
  where: ExpenseLogWhereInputSchema.optional(),
}).strict() ;

export const ExpenseLogDeleteManyArgsSchema: z.ZodType<Prisma.ExpenseLogDeleteManyArgs> = z.object({
  where: ExpenseLogWhereInputSchema.optional(),
}).strict() ;

export const ExpenseDebtCreateArgsSchema: z.ZodType<Prisma.ExpenseDebtCreateArgs> = z.object({
  select: ExpenseDebtSelectSchema.optional(),
  include: ExpenseDebtIncludeSchema.optional(),
  data: z.union([ ExpenseDebtCreateInputSchema,ExpenseDebtUncheckedCreateInputSchema ]),
}).strict() ;

export const ExpenseDebtUpsertArgsSchema: z.ZodType<Prisma.ExpenseDebtUpsertArgs> = z.object({
  select: ExpenseDebtSelectSchema.optional(),
  include: ExpenseDebtIncludeSchema.optional(),
  where: ExpenseDebtWhereUniqueInputSchema,
  create: z.union([ ExpenseDebtCreateInputSchema,ExpenseDebtUncheckedCreateInputSchema ]),
  update: z.union([ ExpenseDebtUpdateInputSchema,ExpenseDebtUncheckedUpdateInputSchema ]),
}).strict() ;

export const ExpenseDebtCreateManyArgsSchema: z.ZodType<Prisma.ExpenseDebtCreateManyArgs> = z.object({
  data: z.union([ ExpenseDebtCreateManyInputSchema,ExpenseDebtCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ExpenseDebtCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ExpenseDebtCreateManyAndReturnArgs> = z.object({
  data: z.union([ ExpenseDebtCreateManyInputSchema,ExpenseDebtCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ExpenseDebtDeleteArgsSchema: z.ZodType<Prisma.ExpenseDebtDeleteArgs> = z.object({
  select: ExpenseDebtSelectSchema.optional(),
  include: ExpenseDebtIncludeSchema.optional(),
  where: ExpenseDebtWhereUniqueInputSchema,
}).strict() ;

export const ExpenseDebtUpdateArgsSchema: z.ZodType<Prisma.ExpenseDebtUpdateArgs> = z.object({
  select: ExpenseDebtSelectSchema.optional(),
  include: ExpenseDebtIncludeSchema.optional(),
  data: z.union([ ExpenseDebtUpdateInputSchema,ExpenseDebtUncheckedUpdateInputSchema ]),
  where: ExpenseDebtWhereUniqueInputSchema,
}).strict() ;

export const ExpenseDebtUpdateManyArgsSchema: z.ZodType<Prisma.ExpenseDebtUpdateManyArgs> = z.object({
  data: z.union([ ExpenseDebtUpdateManyMutationInputSchema,ExpenseDebtUncheckedUpdateManyInputSchema ]),
  where: ExpenseDebtWhereInputSchema.optional(),
}).strict() ;

export const ExpenseDebtDeleteManyArgsSchema: z.ZodType<Prisma.ExpenseDebtDeleteManyArgs> = z.object({
  where: ExpenseDebtWhereInputSchema.optional(),
}).strict() ;

export const ExpenseCreateArgsSchema: z.ZodType<Prisma.ExpenseCreateArgs> = z.object({
  select: ExpenseSelectSchema.optional(),
  include: ExpenseIncludeSchema.optional(),
  data: z.union([ ExpenseCreateInputSchema,ExpenseUncheckedCreateInputSchema ]),
}).strict() ;

export const ExpenseUpsertArgsSchema: z.ZodType<Prisma.ExpenseUpsertArgs> = z.object({
  select: ExpenseSelectSchema.optional(),
  include: ExpenseIncludeSchema.optional(),
  where: ExpenseWhereUniqueInputSchema,
  create: z.union([ ExpenseCreateInputSchema,ExpenseUncheckedCreateInputSchema ]),
  update: z.union([ ExpenseUpdateInputSchema,ExpenseUncheckedUpdateInputSchema ]),
}).strict() ;

export const ExpenseCreateManyArgsSchema: z.ZodType<Prisma.ExpenseCreateManyArgs> = z.object({
  data: z.union([ ExpenseCreateManyInputSchema,ExpenseCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ExpenseCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ExpenseCreateManyAndReturnArgs> = z.object({
  data: z.union([ ExpenseCreateManyInputSchema,ExpenseCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ExpenseDeleteArgsSchema: z.ZodType<Prisma.ExpenseDeleteArgs> = z.object({
  select: ExpenseSelectSchema.optional(),
  include: ExpenseIncludeSchema.optional(),
  where: ExpenseWhereUniqueInputSchema,
}).strict() ;

export const ExpenseUpdateArgsSchema: z.ZodType<Prisma.ExpenseUpdateArgs> = z.object({
  select: ExpenseSelectSchema.optional(),
  include: ExpenseIncludeSchema.optional(),
  data: z.union([ ExpenseUpdateInputSchema,ExpenseUncheckedUpdateInputSchema ]),
  where: ExpenseWhereUniqueInputSchema,
}).strict() ;

export const ExpenseUpdateManyArgsSchema: z.ZodType<Prisma.ExpenseUpdateManyArgs> = z.object({
  data: z.union([ ExpenseUpdateManyMutationInputSchema,ExpenseUncheckedUpdateManyInputSchema ]),
  where: ExpenseWhereInputSchema.optional(),
}).strict() ;

export const ExpenseDeleteManyArgsSchema: z.ZodType<Prisma.ExpenseDeleteManyArgs> = z.object({
  where: ExpenseWhereInputSchema.optional(),
}).strict() ;

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
}).strict() ;

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const PushSubscriptionCreateArgsSchema: z.ZodType<Prisma.PushSubscriptionCreateArgs> = z.object({
  select: PushSubscriptionSelectSchema.optional(),
  include: PushSubscriptionIncludeSchema.optional(),
  data: z.union([ PushSubscriptionCreateInputSchema,PushSubscriptionUncheckedCreateInputSchema ]),
}).strict() ;

export const PushSubscriptionUpsertArgsSchema: z.ZodType<Prisma.PushSubscriptionUpsertArgs> = z.object({
  select: PushSubscriptionSelectSchema.optional(),
  include: PushSubscriptionIncludeSchema.optional(),
  where: PushSubscriptionWhereUniqueInputSchema,
  create: z.union([ PushSubscriptionCreateInputSchema,PushSubscriptionUncheckedCreateInputSchema ]),
  update: z.union([ PushSubscriptionUpdateInputSchema,PushSubscriptionUncheckedUpdateInputSchema ]),
}).strict() ;

export const PushSubscriptionCreateManyArgsSchema: z.ZodType<Prisma.PushSubscriptionCreateManyArgs> = z.object({
  data: z.union([ PushSubscriptionCreateManyInputSchema,PushSubscriptionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const PushSubscriptionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PushSubscriptionCreateManyAndReturnArgs> = z.object({
  data: z.union([ PushSubscriptionCreateManyInputSchema,PushSubscriptionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const PushSubscriptionDeleteArgsSchema: z.ZodType<Prisma.PushSubscriptionDeleteArgs> = z.object({
  select: PushSubscriptionSelectSchema.optional(),
  include: PushSubscriptionIncludeSchema.optional(),
  where: PushSubscriptionWhereUniqueInputSchema,
}).strict() ;

export const PushSubscriptionUpdateArgsSchema: z.ZodType<Prisma.PushSubscriptionUpdateArgs> = z.object({
  select: PushSubscriptionSelectSchema.optional(),
  include: PushSubscriptionIncludeSchema.optional(),
  data: z.union([ PushSubscriptionUpdateInputSchema,PushSubscriptionUncheckedUpdateInputSchema ]),
  where: PushSubscriptionWhereUniqueInputSchema,
}).strict() ;

export const PushSubscriptionUpdateManyArgsSchema: z.ZodType<Prisma.PushSubscriptionUpdateManyArgs> = z.object({
  data: z.union([ PushSubscriptionUpdateManyMutationInputSchema,PushSubscriptionUncheckedUpdateManyInputSchema ]),
  where: PushSubscriptionWhereInputSchema.optional(),
}).strict() ;

export const PushSubscriptionDeleteManyArgsSchema: z.ZodType<Prisma.PushSubscriptionDeleteManyArgs> = z.object({
  where: PushSubscriptionWhereInputSchema.optional(),
}).strict() ;

export const SessionCreateArgsSchema: z.ZodType<Prisma.SessionCreateArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  data: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
}).strict() ;

export const SessionUpsertArgsSchema: z.ZodType<Prisma.SessionUpsertArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
  create: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
  update: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
}).strict() ;

export const SessionCreateManyArgsSchema: z.ZodType<Prisma.SessionCreateManyArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SessionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionCreateManyAndReturnArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SessionDeleteArgsSchema: z.ZodType<Prisma.SessionDeleteArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionUpdateArgsSchema: z.ZodType<Prisma.SessionUpdateArgs> = z.object({
  select: SessionSelectSchema.optional(),
  include: SessionIncludeSchema.optional(),
  data: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionUpdateManyArgsSchema: z.ZodType<Prisma.SessionUpdateManyArgs> = z.object({
  data: z.union([ SessionUpdateManyMutationInputSchema,SessionUncheckedUpdateManyInputSchema ]),
  where: SessionWhereInputSchema.optional(),
}).strict() ;

export const SessionDeleteManyArgsSchema: z.ZodType<Prisma.SessionDeleteManyArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
}).strict() ;