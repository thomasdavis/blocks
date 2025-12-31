import { Card, CardContent } from "@blocksai/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--ui-background-muted)]">
              {icon}
            </div>
          )}
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-[var(--ui-foreground-muted)]">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
