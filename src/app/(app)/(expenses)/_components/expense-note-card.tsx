import { format } from 'date-fns';

interface ExpenseNoteCardProps {
  content: string;
  createdByName?: string | null;
  createdAt: Date;
}

export function ExpenseNoteCard({ content, createdByName = 'System', createdAt }: ExpenseNoteCardProps) {
  return (
    <div className="space-y-2 py-4">
      <div>{content}</div>
      <div className="flex justify-between gap-4">
        <div className="text-start text-sm text-muted-foreground">{createdByName}</div>
        <div className="text-end text-sm text-muted-foreground">{format(createdAt, 'HH:mm dd.MM.yyyy')}</div>
      </div>
    </div>
  );
}
