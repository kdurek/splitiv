'use client';

interface ExpenseDescriptionCardProps {
  description: string | null;
}

export function ExpenseDescriptionCard({ description }: ExpenseDescriptionCardProps) {
  if (!description) {
    return null;
  }

  return <p className="whitespace-pre-wrap text-sm text-muted-foreground">{description}</p>;
}
