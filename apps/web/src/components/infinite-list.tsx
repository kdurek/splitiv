import type { ReactNode } from "react";
import { Fragment, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

import { cn } from "@/lib/utils";
import { Spinner } from "./ui/spinner";

type InfinitePage<TItem> = {
  items: TItem[];
  nextCursor?: unknown;
};

type InfiniteQueryLike<TItem> = {
  data?: {
    pages: InfinitePage<TItem>[];
  };
  fetchNextPage: () => unknown;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isPending: boolean;
};

type InfiniteListProps<TItem> = {
  query: InfiniteQueryLike<TItem>;
  children: (item: TItem, index: number) => ReactNode;
  getKey: (item: TItem, index: number) => string | number;
  loading: ReactNode;
  loadingCount?: number;
  empty?: ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number | number[];
};

const InfiniteList = <TItem,>({
  query,
  children,
  getKey,
  loading,
  loadingCount = 4,
  empty,
  className,
  rootMargin = "200px",
  threshold = 0,
}: InfiniteListProps<TItem>) => {
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  const { ref, inView } = useInView({ rootMargin, threshold });

  useEffect(() => {
    if (!query.hasNextPage) {
      return;
    }
    if (query.isFetchingNextPage) {
      return;
    }
    if (!inView) {
      return;
    }
    query.fetchNextPage();
  }, [inView, query]);

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
    <div aria-busy={query.isFetchingNextPage} className={cn(className)}>
      {items.map((item, index) => (
        <Fragment key={getKey(item, index)}>{children(item, index)}</Fragment>
      ))}
      {query.hasNextPage ? (
        <div className={cn("flex items-center justify-center py-6")} ref={ref}>
          {query.isFetchingNextPage ? (
            <Spinner className={cn("size-5 text-muted-foreground")} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export { InfiniteList };
