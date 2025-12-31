import { Activity, BarChart3, Calendar } from "lucide-react";
import { getRuns, getRunStats } from "@/lib/runs";
import { StatsCard } from "@/components/stats-card";
import { RunCard } from "@/components/run-card";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [runs, stats] = await Promise.all([getRuns(), getRunStats()]);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-[var(--ui-foreground-muted)]">
          View and analyze your validation run history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          label="Total Runs"
          value={stats.totalRuns}
          icon={<Activity className="h-6 w-6 text-blue-500" />}
        />
        <StatsCard
          label="Pass Rate"
          value={`${stats.passRate}%`}
          icon={<BarChart3 className="h-6 w-6 text-green-500" />}
        />
        <StatsCard
          label="Today"
          value={stats.runsToday}
          icon={<Calendar className="h-6 w-6 text-purple-500" />}
        />
      </div>

      {/* Recent Runs */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Runs</h2>
        {runs.length === 0 ? (
          <EmptyState
            title="No validation runs yet"
            description="Run 'blocks run --all' in your project to generate validation results. They will appear here automatically."
          />
        ) : (
          <div className="space-y-4">
            {runs.map((run) => (
              <RunCard key={run.id} run={run} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
