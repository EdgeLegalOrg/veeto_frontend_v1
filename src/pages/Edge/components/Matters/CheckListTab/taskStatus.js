// Shared task status vocabulary for the Workflow tab - the group cards read it
// for progress, the task table for badges and actions.

export const STATUS = {
  NEW: "NEW",
  PREPARED: "PREPARED",
  SENT: "SENT",
  RECEIVED: "RECEIVED",
  NOT_APPLICABLE: "NOT_APPLICABLE",
  COMPLETE: "COMPLETE",
};

// The order the statuses are offered in, matching the backend enum.
export const STATUS_ORDER = [
  STATUS.NEW,
  STATUS.PREPARED,
  STATUS.SENT,
  STATUS.RECEIVED,
  STATUS.NOT_APPLICABLE,
  STATUS.COMPLETE,
];

// Velzon uses subtle badges keyed off the row status. The three in-flight
// stages share the warning tint so the eye reads "under way" at a glance and
// only then reads which stage.
export const STATUS_META = {
  [STATUS.NEW]: { label: "New", badge: "bg-secondary-subtle text-secondary" },
  [STATUS.PREPARED]: {
    label: "Prepared",
    badge: "bg-warning-subtle text-warning",
  },
  [STATUS.SENT]: {
    label: "Sent",
    badge: "bg-warning-subtle text-warning",
  },
  [STATUS.RECEIVED]: {
    label: "Received",
    badge: "bg-info-subtle text-info",
  },
  [STATUS.NOT_APPLICABLE]: {
    label: "Not Applicable",
    badge: "bg-light text-muted",
  },
  [STATUS.COMPLETE]: {
    label: "Complete",
    badge: "bg-success-subtle text-success",
  },
};

export const statusOf = (task) => task?.status || STATUS.NEW;

export const statusMeta = (task) =>
  STATUS_META[statusOf(task)] || STATUS_META[STATUS.NEW];

// Every status other than where the row already sits, in workflow order. With
// six statuses a per-status list would be five near-identical arrays, so the
// menu is derived instead.
export const actionsFor = (task) => {
  const current = statusOf(task);

  return STATUS_ORDER.filter((status) => status !== current);
};

export const ACTION_LABEL = {
  [STATUS.NEW]: "Reset to New",
  [STATUS.PREPARED]: "Mark Prepared",
  [STATUS.SENT]: "Mark Sent",
  [STATUS.RECEIVED]: "Mark Received",
  [STATUS.NOT_APPLICABLE]: "Mark Not Applicable",
  [STATUS.COMPLETE]: "Complete",
};

export const ACTION_ICON = {
  [STATUS.NEW]: "ri-restart-line",
  [STATUS.PREPARED]: "ri-draft-line",
  [STATUS.SENT]: "ri-send-plane-line",
  [STATUS.RECEIVED]: "ri-inbox-archive-line",
  [STATUS.NOT_APPLICABLE]: "ri-forbid-line",
  [STATUS.COMPLETE]: "ri-check-double-line",
};

// Native date inputs need YYYY-MM-DD regardless of how dates are displayed.
export const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (isNaN(parsed.getTime())) {
    return "";
  }

  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getDate()}`.padStart(2, "0");

  return `${parsed.getFullYear()}-${month}-${day}`;
};

// Progress bar colour tracks how close the group is to done.
export const progressColour = (percent) => {
  if (percent >= 100) {
    return "bg-success";
  }

  if (percent >= 50) {
    return "bg-info";
  }

  return percent > 0 ? "bg-warning" : "bg-secondary";
};
