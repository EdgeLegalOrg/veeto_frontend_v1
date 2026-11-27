/** Shared browser rule: ordinary folders first; emails participate in the file group. */
export const documentTimestamp = (value) => {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const compareNames = (a, b) => String(a || "").localeCompare(String(b || ""), undefined, { numeric: true, sensitivity: "base" });

/** Selectors adapt storage folders, ordinary files and email-group rows without changing their data. */
export const documentComparator = (
  sort = "DATE",
  { isFolder = () => false, name = (item) => item.name, date = (item) => item.uploadDate, id = (item) => item.id } = {},
) => (a, b) => {
  const foldersFirst = Number(!!isFolder(b)) - Number(!!isFolder(a));
  if (foldersFirst) return foldersFirst;
  const dates = sort === "NAME" ? 0 : documentTimestamp(date(b)) - documentTimestamp(date(a));
  return dates || compareNames(name(a), name(b)) || compareNames(id(a), id(b));
};
