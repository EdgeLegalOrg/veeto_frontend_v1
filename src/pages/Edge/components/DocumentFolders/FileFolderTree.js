import React, { useEffect, useMemo, useState } from "react";
import AttachmentTypeIcon from "../Matters/Attachments/AttachmentTypeIcon";
import "./FileFolderTree.css";

/** Storage hierarchy from the loaded listing; collapsed branches do not mount file rows. */
const FileFolderTree = ({
  folders,
  files,
  expanded,
  folderId,
  activeFileId,
  onToggle,
  onFolderSelect,
  onFilePreview,
  folderLabel = (folder) => folder.name,
  folderDirection,
  disabled,
  canDrop,
  onDrop,
  canDragFile,
  onFileDragStart,
  idPrefix,
}) => {
  const [unassignedOpen, setUnassignedOpen] = useState(true);
  const index = useMemo(() => {
    const known = new Set(folders.map((folder) => folder.id));
    const children = new Map(),
      contents = new Map(),
      unassigned = [];
    folders.forEach((folder) => {
      const parent = folder.parentId ?? null;
      if (!children.has(parent)) children.set(parent, []);
      children.get(parent).push(folder);
    });
    files.forEach((file) => {
      if (file.folderId == null || !known.has(file.folderId)) {
        unassigned.push(file);
        return;
      }
      if (!contents.has(file.folderId)) contents.set(file.folderId, []);
      contents.get(file.folderId).push(file);
    });
    const byName = (a, b) => (a.name || "").localeCompare(b.name || "");
    contents.forEach((entries) => entries.sort(byName));
    unassigned.sort(byName);
    return { children, contents, unassigned };
  }, [folders, files]);

  useEffect(() => {
    if (activeFileId != null && index.unassigned.some((file) => file.id === activeFileId)) setUnassignedOpen(true);
  }, [activeFileId, index]);

  const fileRows = (entries) =>
    entries.map((file) => (
      <li key={`file-${file.id}`} className="matter-folder-branch">
        <div
          className="matter-folder-tree-row"
          draggable={!!canDragFile?.(file)}
          onDragStart={(event) => onFileDragStart?.(event, file)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <span className="matter-folder-tree-spacer" aria-hidden="true" />
          <button
            type="button"
            className="matter-folder-tree-node document-tree-file"
            disabled={disabled}
            title={file.name}
            aria-label={`Preview ${file.name}`}
            aria-current={activeFileId === file.id ? "true" : undefined}
            onClick={() => onFilePreview(file)}
          >
            <AttachmentTypeIcon type={file.type} name={file.name} direction={file.direction} />
            <span>{file.name}</span>
          </button>
        </div>
      </li>
    ));

  const branches = (parentId = null, visited = new Set()) => {
    const childFolders = (index.children.get(parentId) || []).filter((folder) => !visited.has(folder.id));
    const childFiles = parentId == null ? [] : index.contents.get(parentId) || [];
    if (!childFolders.length && !childFiles.length) return null;
    return (
      <ul
        id={parentId == null ? undefined : `${idPrefix}-folder-${parentId}-children`}
        className={`matter-folder-branches ${parentId == null ? "matter-folder-roots" : ""}`}
      >
        {childFolders.map((folder) => {
          const hasChildren = !!index.children.get(folder.id)?.length || !!index.contents.get(folder.id)?.length;
          const opened = expanded.has(folder.id);
          return (
            <li key={`folder-${folder.id}`} className="matter-folder-branch">
              <div
                className="matter-folder-tree-row"
                onDragOver={(event) => {
                  if (canDrop) event.preventDefault();
                }}
                onDrop={(event) => onDrop?.(event, folder.id)}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    className="matter-folder-tree-toggle"
                    disabled={disabled}
                    aria-label={`${opened ? "Collapse" : "Expand"} ${folderLabel(folder)}`}
                    aria-expanded={opened}
                    aria-controls={`${idPrefix}-folder-${folder.id}-children`}
                    onClick={() => onToggle(folder.id)}
                  >
                    <span aria-hidden="true">{opened ? "▾" : "▸"}</span>
                  </button>
                ) : (
                  <span className="matter-folder-tree-spacer" aria-hidden="true" />
                )}
                <button
                  type="button"
                  className="matter-folder-tree-node"
                  disabled={disabled}
                  title={folderLabel(folder)}
                  aria-current={folderId === folder.id && activeFileId == null ? "true" : undefined}
                  onClick={() => onFolderSelect(folder.id)}
                >
                  <AttachmentTypeIcon type={folder.emailUploadGroupId ? "email" : "folder"} direction={folderDirection?.(folder)} />
                  <span>{folderLabel(folder)}</span>
                </button>
              </div>
              {hasChildren && opened && branches(folder.id, new Set([...visited, folder.id]))}
            </li>
          );
        })}
        {fileRows(childFiles)}
      </ul>
    );
  };

  return (
    <>
      {branches()}
      {!!index.unassigned.length && (
        <ul className="matter-folder-branches matter-folder-roots document-tree-unassigned">
          <li className="matter-folder-branch">
            <div className="matter-folder-tree-row">
              <button
                type="button"
                className="matter-folder-tree-toggle"
                disabled={disabled}
                aria-expanded={unassignedOpen}
                aria-label={`${unassignedOpen ? "Collapse" : "Expand"} Unassigned files`}
                aria-controls={`${idPrefix}-unassigned-files`}
                onClick={() => setUnassignedOpen((previous) => !previous)}
              >
                <span aria-hidden="true">{unassignedOpen ? "▾" : "▸"}</span>
              </button>
              <button
                type="button"
                className="matter-folder-tree-node"
                disabled={disabled}
                aria-current={folderId == null && activeFileId == null ? "true" : undefined}
                onClick={() => {
                  setUnassignedOpen(true);
                  onFolderSelect(null);
                }}
              >
                <i className="ri-folder-warning-line text-warning" aria-hidden="true" />
                <span>Unassigned files ({index.unassigned.length})</span>
              </button>
            </div>
            {unassignedOpen && (
              <ul className="matter-folder-branches" id={`${idPrefix}-unassigned-files`}>
                {fileRows(index.unassigned)}
              </ul>
            )}
          </li>
        </ul>
      )}
    </>
  );
};
export default FileFolderTree;
