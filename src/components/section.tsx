import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  title?: string | null;
}

export function Section({ title, children }: SectionProps) {
  return (
    <>
      <h1 className="font-bold text-2xl">{title}</h1>
      <div className="mt-4">{children}</div>
    </>
  );
}
