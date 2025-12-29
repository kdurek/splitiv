import type { ReactNode } from "react";
import { Fragment, useMemo } from "react";
import { cn } from "@/lib/utils";

interface QueryLike<TItem> {
  data?: TItem[];
  isPending: boolean;
}

interface ListProps<TItem> {
  query: QueryLike<TItem>;
  children: (item: TItem, index: number) => ReactNode;
  getKey: (item: TItem, index: number) => string | number;
  loading: ReactNode;
  loadingCount?: number;
  empty?: ReactNode;
  className?: string;
}

const List = <TItem,>({
  query,
  children,
  getKey,
  loading,
  loadingCount = 5,
  empty,
  className,
}: ListProps<TItem>) => {
  const items = useMemo(() => query.data ?? [], [query.data]);

  if (query.isPending) {
    return (
      <div aria-busy={query.isPending} className={cn(className)}>
        {Array.from({ length: loadingCount }).map((_, index) => (
          <Fragment key={index}>{loading}</Fragment>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <>{empty ?? null}</>;
  }

  return (
    <div className={cn(className)}>
      {items.map((item, index) => (
        <Fragment key={getKey(item, index)}>{children(item, index)}</Fragment>
      ))}
    </div>
  );
};

export { List };
