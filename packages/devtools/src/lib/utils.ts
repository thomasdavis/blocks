/**
 * Format a duration in milliseconds to a human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format a timestamp to a relative time string
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "just now";
  }
  if (diffMins < 60) {
    return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString();
}

/**
 * Format a timestamp to a full date/time string
 */
export function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Get status color class based on pass/fail/warning state
 */
export function getStatusColor(
  hasErrors: boolean,
  hasWarnings: boolean
): "destructive" | "warning" | "success" {
  if (hasErrors) return "destructive";
  if (hasWarnings) return "warning";
  return "success";
}

/**
 * Get status icon based on pass/fail/warning state
 */
export function getStatusIcon(
  hasErrors: boolean,
  hasWarnings: boolean
): string {
  if (hasErrors) return "X";
  if (hasWarnings) return "AlertTriangle";
  return "Check";
}
