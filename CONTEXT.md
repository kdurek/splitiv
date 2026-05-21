# Glossary

Domain terms used in code and UI. Disambiguates overloaded words.

## Group

Set of users sharing expenses. Polish UI: "grupa". Implemented on top of
Better Auth `organization` + `member` tables — that terminology is an
implementation detail, never surfaced in UI or feature naming. Code uses
`group` for domain identifiers (`src/groups/`, `groupId` route params).
`organization` / `activeOrganizationId` appear only at the Better Auth
session/API boundary.

## Member

A user's membership in a group. Carries role (owner / member) and links a
`user` to a `group` (via the Better Auth `member` table).

## Expense

A spending event paid by one member (the payer) and owed by one or more
members (the debtors). Has name, optional description, total amount, group
scope, payer, and a list of debts.

## Debt

A debtor's share of an expense. Has `amount` (original) and `settled`
(paid back so far). Outstanding balance = `amount - settled`.

## Payer

The member who paid an expense up front on behalf of the group.

## Debtor

A member who owes part of an expense to the payer.

## Settle

Action of recording payment from a debtor toward their outstanding debt(s).
Increases `settled` on the relevant `expenseDebt` rows. Debt is closed when
`settled == amount`.

## Log

Audit record of state-changing actions on an expense (created, settled, undo).
Stored in the `expenseLog` table.
