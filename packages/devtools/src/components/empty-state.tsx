import { FileQuestion } from "lucide-react";
import { Card, CardContent } from "@blocksai/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ui-background-muted)] mb-4">
            {icon || <FileQuestion className="h-8 w-8 text-[var(--ui-foreground-muted)]" />}
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-[var(--ui-foreground-muted)] max-w-md">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
