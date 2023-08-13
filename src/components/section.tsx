import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div>
      <h1 className="font-bold">{title}</h1>
      <div className="mt-4">{children}</div>
    </div>
  );
}
