import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Meta = { label: string; className: string; group: "active" | "finished" };

/**
 * Canonical status vocabulary + colors for every workflow in the site.
 * `group` decides whether an item shows under the Active or Finished tab.
 */
export const STATUS_META: Record<string, Meta> = {
  // accounts
  pending: { label: "Pending", className: "bg-gold-soft text-forest-deep border-gold-deep/40", group: "active" },
  approved: { label: "Approved", className: "bg-forest text-primary-foreground", group: "active" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive border-destructive/40", group: "finished" },
  suspended: { label: "Deactivated", className: "bg-muted text-muted-foreground border-border", group: "finished" },
  // queue
  in_queue: { label: "In Queue", className: "bg-secondary text-forest", group: "active" },
  processing: { label: "Processing", className: "bg-secondary text-forest", group: "active" },
  completed: { label: "Completed", className: "bg-forest text-primary-foreground", group: "finished" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border", group: "finished" },
  // reservations
  // court blocks / releases
  ready_for_release: { label: "Ready for Release", className: "bg-gold text-forest-deep", group: "active" },
  released: { label: "Released", className: "bg-forest text-primary-foreground", group: "finished" },
  // problems
  submitted: { label: "Submitted", className: "bg-gold-soft text-forest-deep border-gold-deep/40", group: "active" },
  under_review: { label: "Under Review", className: "bg-secondary text-forest", group: "active" },
  resolved: { label: "Resolved", className: "bg-forest text-primary-foreground", group: "finished" },
};

const FALLBACK: Meta = { label: "", className: "bg-muted text-muted-foreground", group: "active" };

export function statusMeta(status: string): Meta {
  return STATUS_META[status] ?? { ...FALLBACK, label: status.replace(/_/g, " ") };
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = statusMeta(status);
  return (
    <Badge variant="outline" className={cn(meta.className, className)}>
      {meta.label}
    </Badge>
  );
}

/** Active statuses are the ones still in progress for a workflow. */
export function isActiveStatus(status: string, activeSet: string[]): boolean {
  return activeSet.includes(status);
}

export const REQUEST_ACTIVE = ["pending", "in_queue", "processing"];
export const RESERVATION_ACTIVE = ["pending", "approved"];
export const RELEASE_ACTIVE = ["pending", "approved", "ready_for_release"];
export const PROBLEM_ACTIVE = ["submitted", "under_review", "in_progress"];
export const ACCOUNT_ACTIVE = ["pending", "approved"];
