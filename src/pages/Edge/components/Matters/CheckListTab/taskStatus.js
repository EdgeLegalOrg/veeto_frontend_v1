// Shared task status vocabulary for the Workflow tab - the group cards read it
// for progress, the task table for badges and actions.

export const STATUS = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETE: "COMPLETE",
  NOT_APPLICABLE: "NOT_APPLICABLE",
};

// Velzon uses subtle badges keyed off the row status.
export const STATUS_META = {
  [STATUS.NEW]: { label: "New", badge: "bg-secondary-subtle text-secondary" },
  [STATUS.IN_PROGRESS]: {
    label: "In Progress",
    badge: "bg-warning-subtle text-warning",
  },
  [STATUS.COMPLETE]: {
    label: "Complete",
    badge: "bg-success-subtle text-success",
  },
  [STATUS.NOT_APPLICABLE]: {
    label: "Not Applicable",
    badge: "bg-light text-muted",
  },
};

export const statusOf = (task) => task?.status || STATUS.NEW;

export const statusMeta = (task) =>
  STATUS_META[statusOf(task)] || STATUS_META[STATUS.NEW];

// Actions offered for a row, matched to where it currently sits.
export const actionsFor = (task) => {
  switch (statusOf(task)) {
    case STATUS.NEW:
      return [STATUS.IN_PROGRESS, STATUS.COMPLETE, STATUS.NOT_APPLICABLE];
    case STATUS.IN_PROGRESS:
      return [STATUS.COMPLETE, STATUS.NOT_APPLICABLE, STATUS.NEW];
    case STATUS.COMPLETE:
      return [STATUS.IN_PROGRESS, STATUS.NOT_APPLICABLE, STATUS.NEW];
    case STATUS.NOT_APPLICABLE:
      return [STATUS.IN_PROGRESS, STATUS.COMPLETE, STATUS.NEW];
    default:
      return [STATUS.IN_PROGRESS, STATUS.COMPLETE, STATUS.NOT_APPLICABLE];
  }
};

export const ACTION_LABEL = {
  [STATUS.IN_PROGRESS]: "Start",
  [STATUS.COMPLETE]: "Complete",
  [STATUS.NOT_APPLICABLE]: "Mark Not Applicable",
  [STATUS.NEW]: "Reset to New",
};

export const ACTION_ICON = {
  [STATUS.IN_PROGRESS]: "ri-play-circle-line",
  [STATUS.COMPLETE]: "ri-check-double-line",
  [STATUS.NOT_APPLICABLE]: "ri-forbid-line",
  [STATUS.NEW]: "ri-restart-line",
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
