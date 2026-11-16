import React, { useRef } from "react";
import ReactDragListView from "react-drag-listview";
import "../../../stylesheets/CheckListTab.css";

/** Return a reordered copy while preserving each item's identity and metadata.
 * Invalid positions and no-op moves return the original array.
 */
export const reorderWorkflowItems = (items, from, to) => {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= items.length || to >= items.length || from === to)
    return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** Controlled task/document list: report a move to the parent without saving it.
 * Sortable rows must be direct siblings so DOM indices match the parent's array.
 * Dragging starts only from the handle, leaving row inputs and buttons usable.
 */
const WorkflowSortableList = ({ children, onMove, as: List = "div", className = "", disabled = false }) => {
  // The library reports drag end even for cancelled/outside drops. Commit only
  // when a drag starts in this list and a drop is accepted in the same list.
  const dragging = useRef(false);
  const dropped = useRef(false);
  return (
    <ReactDragListView
      nodeSelector=".workflow-sortable-row"
      handleSelector={disabled ? ".workflow-sort-disabled" : ".workflow-drag-handle:not(:disabled)"}
      lineClassName="workflow-sort-line"
      onDragEnd={(from, to) => {
        if (!disabled && dragging.current && dropped.current) onMove(from, to);
        dragging.current = false;
        dropped.current = false;
      }}
    >
      <List
        className={`workflow-sortable-list ${className}`}
        onDragStartCapture={(event) => {
          dragging.current = !disabled && event.target.closest(".workflow-sortable-row")?.parentElement === event.currentTarget;
          dropped.current = false;
        }}
        onDropCapture={(event) => {
          if (!disabled && dragging.current && event.target.closest(".workflow-sortable-list") === event.currentTarget) {
            event.preventDefault();
            dropped.current = true;
          }
        }}
      >
        {children}
      </List>
    </ReactDragListView>
  );
};

/** Three-line drag handle with Alt + Up/Down as the keyboard alternative. */
export const WorkflowDragHandle = ({ index, count, label, onMove, disabled = false }) => (
  <button
    type="button"
    className="workflow-drag-handle btn btn-light btn-sm"
    disabled={disabled || count < 2}
    aria-label={`Reorder ${label}, position ${index + 1} of ${count}. Use Alt and Up or Down to move.`}
    title="Drag to reorder. Keyboard: Alt + Up / Down."
    onKeyDown={(event) => {
      if (!event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      const to = index + (event.key === "ArrowUp" ? -1 : 1);
      if (!disabled && to >= 0 && to < count) onMove(index, to);
    }}
  >
    <i className="ri-menu-line" aria-hidden="true" />
  </button>
);

export default WorkflowSortableList;
