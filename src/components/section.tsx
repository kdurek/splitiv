import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  title?: string | null;
}

export function Section({ title, children }: SectionProps) {
  return (
    <>
      <h1 className="font-bold">{title}</h1>
      <div className="mt-4">{children}</div>
    </>
  );
}
