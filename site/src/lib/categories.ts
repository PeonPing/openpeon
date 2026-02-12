export interface CategoryInfo {
  label: string;
  description: string;
  tier: "core" | "extended";
}

export const CESP_CATEGORIES: Record<string, CategoryInfo> = {
  "session.start": {
    label: "Session Start",
    description: "Session or workspace opens",
    tier: "core",
  },
  "task.acknowledge": {
    label: "Task Acknowledge",
    description: "Tool accepted work, is processing",
    tier: "core",
  },
  "task.complete": {
    label: "Task Complete",
    description: "Work finished successfully",
    tier: "core",
  },
  "task.error": {
    label: "Task Error",
    description: "Something failed",
    tier: "core",
  },
  "input.required": {
    label: "Input Required",
    description: "Blocked, waiting for user input or approval",
    tier: "core",
  },
  "resource.limit": {
    label: "Resource Limit",
    description: "Rate, token, or quota limit hit",
    tier: "core",
  },
  "user.spam": {
    label: "User Spam",
    description: "User sending commands too fast",
    tier: "extended",
  },
  "session.end": {
    label: "Session End",
    description: "Session closes gracefully",
    tier: "extended",
  },
  "task.progress": {
    label: "Task Progress",
    description: "Long task still running",
    tier: "extended",
  },
};

export const CORE_CATEGORIES = Object.entries(CESP_CATEGORIES)
  .filter(([, v]) => v.tier === "core")
  .map(([k]) => k);

export const EXTENDED_CATEGORIES = Object.entries(CESP_CATEGORIES)
  .filter(([, v]) => v.tier === "extended")
  .map(([k]) => k);
