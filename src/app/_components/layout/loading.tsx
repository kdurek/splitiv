import { Loader2 } from 'lucide-react';

export default function FullScreenLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
    </div>
  );
}
