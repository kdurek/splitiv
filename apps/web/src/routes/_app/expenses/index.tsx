import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import z from "zod";
import { ExpenseList } from "@/components/expense-list";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

function renderValue(
  value: string[],
  groupMembers: { label: string; value: string }[]
) {
  if (value.length === 0) {
    return "Wybierz płatników...";
  }

  const firstPayer = groupMembers.find((member) => member.value === value[0]);
  const additionalPayers =
    value.length > 1 ? ` (+${value.length - 1} więcej)` : "";
  return firstPayer?.label + additionalPayers;
}

export const Route = createFileRoute("/_app/expenses/")({
  component: RouteComponent,
  validateSearch: z.object({
    query: z.string().optional(),
    status: z.enum(["active", "archive"]).optional(),
    payerIds: z.string().array().optional(),
    debtorIds: z.string().array().optional(),
  }),
});

function RouteComponent() {
  const search = Route.useSearch();
  const currentGroupQuery = useSuspenseQuery(orpc.group.current.queryOptions());
  const [query, setQuery] = useState(search.query ?? "");
  const [status, setStatus] = useState(search.status ?? "active");
  const [payerIds, setPayerIds] = useState(
    search.payerIds ? search.payerIds : []
  );
  const [debtorIds, setDebtorIds] = useState(
    search.debtorIds ? search.debtorIds : []
  );
  const debouncedQuery = useDebounce(query, 500);
  const navigate = useNavigate();

  const GROUP_MEMBERS = currentGroupQuery.data.members.map((member) => ({
    label: member.user.name,
    value: member.user.id,
  }));

  useEffect(() => {
    navigate({
      to: "/expenses",
      search: {
        query: debouncedQuery ? debouncedQuery : undefined,
        status: status !== "active" ? status : undefined,
        payerIds: payerIds.length > 0 ? payerIds : undefined,
        debtorIds: debtorIds.length > 0 ? debtorIds : undefined,
      },
    });
  }, [debouncedQuery, navigate, status, payerIds, debtorIds]);

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <div className="grid gap-2">
          <Label htmlFor="query">Tytuł / Opis</Label>
          <InputGroup>
            <InputGroupInput
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Wyszukaj..."
              value={query}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="mt-2 grid gap-2">
          <Label htmlFor="status">Status</Label>
          <ButtonGroup className="w-full" orientation="horizontal">
            <Button
              className={cn(
                "flex-1",
                status === "active" &&
                  "bg-accent text-accent-foreground dark:bg-input/50"
              )}
              onClick={() => status !== "active" && setStatus("active")}
              variant="outline"
            >
              Aktywne
            </Button>
            <Button
              className={cn(
                "flex-1",
                status === "archive" &&
                  "bg-accent text-accent-foreground dark:bg-input/50"
              )}
              onClick={() => status !== "archive" && setStatus("archive")}
              variant="outline"
            >
              Archiwum
            </Button>
          </ButtonGroup>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="grid gap-2">
            <Label htmlFor="payerId">Płatnik</Label>
            <Select
              id="payerId"
              items={GROUP_MEMBERS}
              multiple
              onValueChange={(value) => setPayerIds(value)}
              value={payerIds}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {renderValue(payerIds, GROUP_MEMBERS)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {GROUP_MEMBERS.map((member) => (
                    <SelectItem key={member.value} value={member.value}>
                      {member.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="debtorId">Dłużnik</Label>
            <Select
              id="debtorId"
              items={GROUP_MEMBERS}
              multiple
              onValueChange={(value) => setDebtorIds(value)}
              value={debtorIds}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {renderValue(debtorIds, GROUP_MEMBERS)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {GROUP_MEMBERS.map((member) => (
                    <SelectItem key={member.value} value={member.value}>
                      {member.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Suspense fallback={<PageLoader />}>
        <ExpenseList
          debtorIds={debtorIds}
          payerIds={payerIds}
          query={debouncedQuery}
          status={status}
        />
      </Suspense>
    </div>
  );
}
