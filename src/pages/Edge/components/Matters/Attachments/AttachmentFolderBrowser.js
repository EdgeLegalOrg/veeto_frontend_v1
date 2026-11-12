import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button, Input, Table, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { useSelector } from "react-redux";
import { selectStorageType } from "slices/storage/reducer";
import { toast } from "react-toastify";
import fileDownload from "js-file-download";
import { checkHasPermission, formatDateFunc, formatDateTimeFunc } from "../../../utils/utilFunc";
import { downloadMatterAttach } from "../../../apis";
import { documentFoldersApi } from "./documentFoldersApi";
import FileFolderTree from "../../DocumentFolders/FileFolderTree";
import FolderUploadPicker from "../../DocumentFolders/FolderUploadPicker";
import MasterFileBinderModal from "./MasterFileBinderModal";
import AttachmentTypeIcon from "./AttachmentTypeIcon";
import "./AttachmentFolderBrowser.css";

const contextType = "MATTER_ATTACHMENT";
const cleanFolderName = (name) => name.replace(/\s+-\s+[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "");
// Labels are derived only; storage names, folder IDs and rename versions stay intact.
const folderLabels = (folders, matterNumber) => {
  const labels = new Map();
  const siblings = new Map();
  folders.forEach((folder) => {
    const parent = folder.parentId ?? null;
    if (!siblings.has(parent)) siblings.set(parent, []);
    siblings.get(parent).push(folder);
  });
  siblings.forEach((group, parent) => {
    const nameOf = (folder) => (parent === null && matterNumber != null ? `Matter #${matterNumber}` : cleanFolderName(folder.name));
    const reserved = new Set(group.map((folder) => nameOf(folder).toLowerCase()));
    const used = new Set();
    group
      .sort((a, b) => a.id - b.id)
      .forEach((folder) => {
        const base = nameOf(folder);
        let label = base;
        let suffix = 2;
        // A real sibling named e.g. "Email (2)" keeps its own label.
        while (used.has(label.toLowerCase()) || (label !== base && reserved.has(label.toLowerCase()))) {
          label = `${base} (${suffix++})`;
        }
        used.add(label.toLowerCase());
        labels.set(folder.id, label);
      });
  });
  return labels;
};
const ancestorFolders = (folders, id) => {
  const parents = new Map(folders.map((folder) => [folder.id, folder.parentId]));
  const result = new Set();
  while (id != null && parents.has(id) && !result.has(id)) {
    result.add(id);
    id = parents.get(id);
  }
  return result;
};
const errorMessage = (error) =>
  error?.response?.data?.message || error?.response?.data?.error?.message || "Operation failed. Reload and review before retrying.";
const initials = (name) =>
  (name || "?")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
const fileName = (file) =>
  file.type && !file.name?.toLowerCase().endsWith(`.${file.type.toLowerCase()}`) ? `${file.name}.${file.type}` : file.name;
const EmailContext = ({ email }) =>
  email?.direction ? (
    <div className="matter-folder-email-context">
      <span className={`badge ${email.direction === "SENT" ? "bg-primary" : "bg-success"}`}>
        {email.direction === "SENT" ? "Sent" : "Received"}
      </span>
      <span>{email.direction === "SENT" ? `To: ${email.recipient || "—"}` : `From: ${email.sender || "—"}`}</span>
    </div>
  ) : null;
const UploadDate = ({ file }) => (
  <span title={file?.uploadDate ? formatDateTimeFunc(file.uploadDate) : ""}>
    {file?.uploadDate ? (
      <>
        {formatDateFunc(file.uploadDate, "DD/MM/YYYY")}
        <span className="d-block small text-muted">{formatDateTimeFunc(file.uploadDate, "hh:mm A")}</span>
      </>
    ) : (
      "—"
    )}
  </span>
);
const Uploader = ({ file }) =>
  file ? (
    <span
      className="matter-folder-avatar"
      title={file.uploadedBy || "Unknown uploader"}
      tabIndex={0}
      aria-label={file.uploadedBy || "Unknown uploader"}
    >
      {initials(file.uploadedBy)}
    </span>
  ) : (
    "—"
  );

/** Storage-backed folder tree and compact file table; moves never cross a matter/storage root. */
const AttachmentFolderBrowser = ({ data, refresh, setExtraButtons }) => {
  const matterId = data?.id;
  const configuredStorage = useSelector(selectStorageType);
  const storageLoading = useSelector((state) => state.Storage?.loading || false);
  const api = useMemo(() => documentFoldersApi(contextType, matterId), [matterId]);
  const [listing, setListing] = useState({ folders: [], files: [], warnings: [] });
  const [folderId, setFolderId] = useState(null);
  const [activeFileId, setActiveFileId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const revealedFolder = useRef(null);
  const [selected, setSelected] = useState(new Set());
  const [selectedEmailFolders, setSelectedEmailFolders] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("FOLDER");
  const [sort, setSort] = useState("DATE_DESC");
  const [dialog, setDialog] = useState(null);
  const [value, setValue] = useState("");
  const [uploads, setUploads] = useState([]);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [binder, setBinder] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const uploadKey = useRef(0);
  const sequence = useRef(0);
  const [registration, setRegistration] = useState({ running: false, paused: false, checked: 0, total: 0 });
  const [registrationWarnings, setRegistrationWarnings] = useState([]);
  const [registrationRetry, setRegistrationRetry] = useState(0);
  const registrationAbort = useRef(null);
  const registrationAttempted = useRef(new Set());
  const registrationPaused = useRef(false);
  const rootAttempt = useRef(null);
  const [rootSetup, setRootSetup] = useState({ running: false, error: "" });
  const mutationBusy = busy || refreshing || registration.running || rootSetup.running;
  const canEdit = checkHasPermission("UpdateMatter") && (!data?.flagArchived || checkHasPermission("EditArchivedMatter"));
  const canDelete = canEdit && checkHasPermission("DeleteMatterAttachment");
  const folders = listing.folders || [];
  const labels = useMemo(() => folderLabels(listing.folders || [], data?.matterNumber), [listing.folders, data?.matterNumber]);
  const folderLabel = (folder) => labels.get(folder.id) || folder.name;
  const files = listing.files || [];
  const knownFolderIds = useMemo(() => new Set(folders.map((folder) => folder.id)), [folders]);
  const hasUnassignedFiles = files.some((file) => file.folderId == null || !knownFolderIds.has(file.folderId));
  const filesById = new Map(files.map((file) => [file.id, file]));
  const emailSources = new Map(
    folders
      .filter((folder) => folder.emailUploadGroupId)
      .map((folder) => [
        folder.id,
        filesById.get(folder.emailAttachmentId)?.uploadGroupId === folder.emailUploadGroupId &&
        filesById.get(folder.emailAttachmentId)?.type?.toLowerCase() === "msg"
          ? filesById.get(folder.emailAttachmentId)
          : undefined,
      ]),
  );
  const current = folders.find((folder) => folder.id === folderId);
  const currentEmailFiles = current?.emailUploadGroupId ? files.filter((file) => file.uploadGroupId === current.emailUploadGroupId) : [];
  const pendingRegistration = files.filter((file) => file.folderId == null).length;
  const warnings = [...(listing.warnings || []), ...registrationWarnings];

  const load = useCallback(
    async (notify = false) => {
      const request = ++sequence.current;
      setRefreshing(true);
      try {
        const response = await api.list();
        if (request !== sequence.current) return;
        const result = response.data;
        if (!Array.isArray(result.folders) || !Array.isArray(result.files)) throw new Error("Invalid folder response");
        setListing({ ...result, ownerId: matterId });
        setActiveFileId((previous) => (result.files.some((file) => file.id === previous) ? previous : null));
        setLoadError("");
        setFolderId((previous) =>
          result.folders.some((folder) => folder.id === previous)
            ? previous
            : result.unregisteredCount > 0
              ? null
              : (result.folders.find((folder) => !folder.parentId)?.id ?? null),
        );
        setSelected((previous) => new Set([...previous].filter((id) => result.files.some((file) => file.id === id))));
        setSelectedEmailFolders((previous) => new Set([...previous].filter((id) => result.folders.some((folder) => folder.id === id))));
        if (notify) toast.success("Attachments refreshed.");
      } catch (error) {
        if (request === sequence.current) setLoadError(errorMessage(error));
      } finally {
        if (request === sequence.current) setRefreshing(false);
      }
    },
    [api, matterId],
  );
  useEffect(() => {
    setListing({ folders: [], files: [], warnings: [] });
    setFolderId(null);
    setActiveFileId(null);
    setSelected(new Set());
    setSelectedEmailFolders(new Set());
    setExpandedFolders(new Set());
    revealedFolder.current = null;
    registrationAttempted.current.clear();
    registrationPaused.current = false;
    setRegistration({ running: false, paused: false, checked: 0, total: 0 });
    setRegistrationWarnings([]);
    rootAttempt.current = null;
    setRootSetup({ running: false, error: "" });
    return () => {
      sequence.current += 1;
      registrationAbort.current?.abort();
      registrationAbort.current = null;
    };
  }, [load]);
  // Generated PDFs and other matter actions may refresh the parent without remounting this tab.
  useEffect(() => {
    load();
  }, [data?.attachmentList, load]);
  useEffect(() => {
    setExtraButtons?.(
      <Button color="primary" onClick={() => setBinder({ focus: null, ids: [...selected] })}>
        Master File Binder
      </Button>,
    );
    return () => setExtraButtons?.(null);
  }, [selected, setExtraButtons]);

  useEffect(() => {
    rootAttempt.current = null;
    setRootSetup({ running: false, error: "" });
    return () => {
      rootAttempt.current = null;
    };
  }, [api, configuredStorage]);

  // Listing stays fast. Existing folder locations are resolved separately in
  // small requests; previews, downloads and navigation remain available.
  useEffect(() => {
    if (listing.ownerId !== matterId || busy || rootSetup.running || dialog || registrationAbort.current || registrationPaused.current)
      return;
    const ids = (listing.files || [])
      .filter((file) => file.folderId == null && !registrationAttempted.current.has(file.id))
      .map((file) => file.id)
      .sort((a, b) => a - b);
    if (!ids.length) return;
    ids.forEach((id) => registrationAttempted.current.add(id));
    const controller = new AbortController();
    registrationAbort.current = controller;
    setRegistration({ running: true, paused: false, checked: 0, total: ids.length });
    const run = async () => {
      try {
        for (let offset = 0; offset < ids.length; offset += 5) {
          const response = await api.register(ids.slice(offset, offset + 5), controller.signal);
          if (controller.signal.aborted) return;
          const result = response.data;
          const updates = new Map((result.files || []).map((file) => [file.id, file]));
          setListing((previous) => ({
            ...previous,
            folders: result.folders || previous.folders,
            files: previous.files.map((file) => updates.get(file.id) || file),
          }));
          if (result.warnings?.length) setRegistrationWarnings((previous) => [...previous, ...result.warnings]);
          setRegistration((previous) => ({ ...previous, checked: Math.min(offset + 5, ids.length) }));
        }
        if (!controller.signal.aborted) await load();
      } catch (error) {
        if (!controller.signal.aborted) setRegistrationWarnings((previous) => [...previous, errorMessage(error)]);
      } finally {
        if (registrationAbort.current === controller) {
          registrationAbort.current = null;
          if (!controller.signal.aborted) setRegistration((previous) => ({ ...previous, running: false }));
        }
      }
    };
    run();
  }, [api, matterId, listing.ownerId, listing.files, busy, rootSetup.running, dialog, registrationRetry, registration.running, load]);

  // First map existing locations, then create/reuse only a missing configured root.
  // The read-only listing API remains database-only and viewers never create storage.
  useEffect(() => {
    if (listing.ownerId !== matterId || !canEdit || storageLoading || busy || dialog || registration.running || registrationAbort.current)
      return;
    if (!["SERVER", "ONEDRIVE"].includes(configuredStorage)) return;
    if (folders.some((folder) => folder.parentId == null && folder.provider === configuredStorage)) return;
    const key = `${matterId}:${configuredStorage}`;
    if (rootAttempt.current?.key === key) return;
    const attempt = { key };
    rootAttempt.current = attempt;
    setRootSetup({ running: true, error: "" });
    api
      .root(configuredStorage)
      .then((response) => {
        if (rootAttempt.current !== attempt) return;
        const root = response.data;
        if (root?.id == null) throw new Error("Invalid root response");
        setListing((previous) =>
          previous.ownerId === matterId
            ? { ...previous, folders: [...previous.folders.filter((folder) => folder.id !== root.id), root] }
            : previous,
        );
        setFolderId((previous) => previous ?? root.id);
        setRootSetup({ running: false, error: "" });
      })
      .catch((error) => {
        if (rootAttempt.current === attempt) setRootSetup({ running: false, error: errorMessage(error) });
      });
  }, [api, matterId, listing.ownerId, folders, canEdit, storageLoading, configuredStorage, busy, dialog, registration.running]);

  const pauseRegistration = () => {
    registrationPaused.current = true;
    registrationAbort.current?.abort();
    registrationAbort.current = null;
    setRegistration((previous) => ({ ...previous, running: false, paused: true }));
  };
  const retryRegistration = () => {
    registrationPaused.current = false;
    registrationAttempted.current.clear();
    setRegistrationWarnings([]);
    setRegistrationRetry((previous) => previous + 1);
  };

  const revealFolder = (id) => setExpandedFolders((previous) => new Set([...previous, ...ancestorFolders(folders, id)]));
  const openFolder = (id) => {
    if (busy) return;
    setFolderId(id);
    setActiveFileId(null);
    setScope("FOLDER");
    setQuery("");
    revealFolder(id);
  };
  useEffect(() => {
    if (folderId == null) {
      revealedFolder.current = null;
      return;
    }
    if (revealedFolder.current === folderId || !folders.some((folder) => folder.id === folderId)) return;
    revealedFolder.current = folderId;
    setExpandedFolders((previous) => new Set([...previous, ...ancestorFolders(folders, folderId)]));
  }, [folderId, folders]);
  const toggleFolder = (id) =>
    setExpandedFolders((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // File changes refresh the matter (including tab counts); its attachment-list
  // effect owns the single folder reload. Folder-only changes reload locally.
  const refreshAfterChange = async (refreshMatter = false) => {
    if (refreshMatter && refresh) {
      try {
        const updated = await refresh();
        if (updated?.id === matterId) return;
      } catch (error) {
        toast.warning("The files changed, but matter details could not refresh.");
      }
    }
    await load();
  };
  const perform = async (operation, message, refreshMatter = false) => {
    if (mutationBusy) return;
    setBusy(true);
    try {
      await operation();
      toast.success(message);
      setDialog(null);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      await refreshAfterChange(refreshMatter);
      setBusy(false);
    }
  };
  const descendants = (id) => {
    const result = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      folders.forEach((folder) => {
        if (result.has(folder.parentId) && !result.has(folder.id)) {
          result.add(folder.id);
          changed = true;
        }
      });
    }
    return result;
  };
  const folderFiles = (id) => {
    const ids = descendants(id);
    return files.filter((file) => ids.has(file.folderId)).map((file) => file.id);
  };
  const toggleIds = (ids) => {
    // Editing individual selection cancels folder-level email deletion intent.
    setSelectedEmailFolders((previous) => new Set([...previous].filter((id) => !folderFiles(id).some((fileId) => ids.includes(fileId)))));
    setSelected((previous) => {
      const next = new Set(previous),
        remove = ids.length > 0 && ids.every((id) => next.has(id));
      ids.forEach((id) => (remove ? next.delete(id) : next.add(id)));
      return next;
    });
  };
  const toggleFolderSelection = (folder, ids) => {
    const remove = selectedEmailFolders.has(folder.id) || (ids.length > 0 && ids.every((id) => selected.has(id)));
    setSelected((previous) => {
      const next = new Set(previous);
      ids.forEach((id) => (remove ? next.delete(id) : next.add(id)));
      return next;
    });
    setSelectedEmailFolders((previous) => {
      const next = new Set(previous);
      if (remove) descendants(folder.id).forEach((id) => next.delete(id));
      else if (folder.emailUploadGroupId) next.add(folder.id);
      return next;
    });
  };
  const requestDelete = () => {
    const groups = new Map();
    const protectedLocations = new Set();
    folders
      .filter((folder) => selectedEmailFolders.has(folder.id))
      .forEach((folder) => {
        groups.set(folder.emailUploadGroupId, folderLabel(folder));
        descendants(folder.id).forEach((id) => protectedLocations.add(id));
      });
    const originalIds = new Set([...emailSources.values()].filter(Boolean).map((file) => file.id));
    // Historical groups without a folder association must have one unambiguous MSG.
    const associated = new Set(folders.map((folder) => folder.emailUploadGroupId).filter(Boolean));
    const legacyMessages = new Map();
    files
      .filter((file) => file.uploadGroupId && !associated.has(file.uploadGroupId) && file.type?.toLowerCase() === "msg")
      .forEach((file) => legacyMessages.set(file.uploadGroupId, [...(legacyMessages.get(file.uploadGroupId) || []), file]));
    legacyMessages.forEach((messages) => {
      if (messages.length === 1) originalIds.add(messages[0].id);
    });
    files
      .filter(
        (file) =>
          selected.has(file.id) && originalIds.has(file.id) && (!protectedLocations.has(file.folderId) || groups.has(file.uploadGroupId)),
      )
      .forEach((file) => {
        groups.set(file.uploadGroupId, file.uploadGroupName || file.name);
      });
    if (
      files.some(
        (file) => selected.has(file.id) && file.uploadGroupId && !groups.has(file.uploadGroupId) && !protectedLocations.has(file.folderId),
      )
    ) {
      toast.info("Email contents cannot be deleted individually. Select the email folder or original email, then click Delete.");
      return;
    }
    // Selecting an email folder never deletes unrelated files placed inside it.
    const fileIds = files
      .filter((file) => selected.has(file.id) && !file.uploadGroupId && !protectedLocations.has(file.folderId))
      .map((file) => file.id);
    const emails = [...groups]
      .map(([id, name]) => ({ id, name, count: files.filter((file) => file.uploadGroupId === id).length }))
      .filter((email) => email.count > 0);
    if (!fileIds.length && !emails.length) return;
    setDialog({ type: "DELETE_FILES", item: { fileIds, emails } });
  };
  const location = (id) => {
    const names = [],
      seen = new Set();
    while (id && !seen.has(id)) {
      seen.add(id);
      const folder = folders.find((item) => item.id === id);
      if (!folder) break;
      names.unshift(folderLabel(folder));
      id = folder.parentId;
    }
    return names.join(" / ");
  };
  const rootOf = (id) => {
    const seen = new Set();
    while (id && !seen.has(id)) {
      seen.add(id);
      const folder = folders.find((item) => item.id === id);
      if (!folder?.parentId) return id;
      id = folder.parentId;
    }
    return null;
  };
  const queueUploads = (localFiles, target) => {
    if (!canEdit || mutationBusy) return;
    if (!target) {
      toast.info("Select or create a storage root before uploading.");
      return;
    }
    const accepted = Array.from(localFiles).filter((file) => file.size > 0);
    if (!accepted.length) {
      toast.info("Choose non-empty files. Folder uploads are not supported.");
      return;
    }
    const append = dialog?.type === "UPLOAD" && uploadTarget === target;
    const entries = accepted.map((file) => ({ id: ++uploadKey.current, file, name: file.name.replace(/\.[^.]+$/, ""), error: "" }));
    setUploads((previous) => [...(append ? previous : []), ...entries]);
    setUploadTarget(target);
    setDialog({ type: "UPLOAD" });
  };
  const drop = (event, destination) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    if (!canEdit || mutationBusy || !destination) return;
    const raw = event.dataTransfer.getData("application/x-veeto-attachment");
    if (raw) {
      try {
        const dragged = JSON.parse(raw);
        if (dragged.matterId !== matterId) {
          toast.warning("Files can only move within the same matter.");
          return;
        }
        perform(() => api.move(dragged.fileId, destination), "File moved.");
      } catch {
        toast.error("Unable to read dragged file.");
      }
    } else {
      if (Array.from(event.dataTransfer.items || []).some((item) => item.webkitGetAsEntry?.()?.isDirectory)) {
        toast.warning("Drop files only; directory uploads are not supported.");
        return;
      }
      queueUploads(event.dataTransfer.files, destination);
    }
  };
  const upload = async () => {
    if (mutationBusy || !uploads.length || uploads.some((item) => !item.name.trim())) return;
    setBusy(true);
    const failed = [];
    let count = 0;
    for (const entry of uploads) {
      try {
        setUploads((previous) =>
          previous.map((item) => (item.id === entry.id ? { ...item, status: "UPLOADING", progress: null, error: "" } : item)),
        );
        await api.upload(uploadTarget, entry.file, entry.name.trim(), {
          onUploadProgress: ({ loaded, total }) => {
            setUploads((previous) =>
              previous.map((item) =>
                item.id === entry.id ? { ...item, progress: total ? Math.min(100, Math.round((loaded * 100) / total)) : null } : item,
              ),
            );
          },
        });
        setUploads((previous) => previous.map((item) => (item.id === entry.id ? { ...item, status: "DONE", progress: 100 } : item)));
        count += 1;
      } catch (error) {
        const failure = { ...entry, status: "FAILED", error: errorMessage(error) };
        failed.push(failure);
        setUploads((previous) => previous.map((item) => (item.id === entry.id ? failure : item)));
      }
    }
    setUploads(failed);
    if (!failed.length) setDialog(null);
    if (count) toast.success(`${count} file(s) uploaded.`);
    if (failed.length) toast.error("Some uploads failed. Review the errors before retrying.");
    await refreshAfterChange(true);
    setBusy(false);
  };
  const download = async (file) => {
    toast.info("Preparing download…");
    try {
      const response = await downloadMatterAttach([file.id]);
      fileDownload(response.data, fileName(file));
    } catch (error) {
      toast.error("Download failed.");
    }
  };
  const openDialog = (type, item) => {
    setDialog({ type, item });
    setValue(type === "MOVE" ? "" : type === "RENAME" ? cleanFolderName(item.name) : item?.name || "");
  };
  const saveDialog = () => {
    if (dialog.type === "CREATE") perform(() => api.create(folderId, value.trim()), "Folder created.");
    if (dialog.type === "RENAME") perform(() => api.rename(dialog.item, value.trim()), "Folder renamed.");
    if (dialog.type === "RENAME_FILE") perform(() => api.renameFile(dialog.item.id, value.trim()), "File renamed.", true);
    if (dialog.type === "MOVE") perform(() => api.move(dialog.item.id, Number(value)), "File moved.");
    if (dialog.type === "DELETE_FOLDER") perform(() => api.remove(dialog.item.id), "Folder deleted.");
    if (dialog.type === "DELETE_FILES")
      perform(
        async () => {
          const removeDeleted = (response) => {
            const deleted = new Set(response.data.deletedIds || []);
            setSelected((previous) => new Set([...previous].filter((id) => !deleted.has(id))));
          };
          for (const email of dialog.item.emails) {
            removeDeleted(await api.deleteEmailGroup(email.id));
            // If a later request fails, retry only the items still awaiting deletion.
            setDialog((previous) =>
              previous?.type === "DELETE_FILES"
                ? { ...previous, item: { ...previous.item, emails: previous.item.emails.filter((item) => item.id !== email.id) } }
                : previous,
            );
          }
          if (dialog.item.fileIds.length) removeDeleted(await api.deleteFiles(dialog.item.fileIds));
          setSelectedEmailFolders(new Set());
        },
        "Selected items deleted.",
        true,
      );
  };
  const openFilePreview = (file, selectFolder = false) => {
    if (busy) return;
    const parentId = knownFolderIds.has(file.folderId) ? file.folderId : null;
    if (selectFolder) openFolder(parentId);
    else revealFolder(parentId);
    setActiveFileId(file.id);
    setBinder({ focus: file.id, ids: [...selected] });
  };
  const needle = query.trim().toLowerCase();
  const visibleFolders = folders
    .filter(
      (folder) =>
        (scope === "MATTER" && needle ? true : folder.parentId === folderId) &&
        (!needle || folderLabel(folder).toLowerCase().includes(needle)),
    )
    .sort((a, b) => folderLabel(a).localeCompare(folderLabel(b)));
  const visibleFiles = files
    .filter(
      (file) =>
        (scope === "MATTER" ? true : (knownFolderIds.has(file.folderId) ? file.folderId : null) === folderId) &&
        (!needle || `${file.name} ${file.uploadedBy || ""}`.toLowerCase().includes(needle)),
    )
    .sort((a, b) => (sort === "NAME" ? a.name.localeCompare(b.name) : new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0)));

  return (
    <div className="matter-folder-browser" aria-busy={busy || refreshing}>
      <div className="matter-folder-toolbar">
        <Button size="sm" outline color="primary" disabled={busy || refreshing} onClick={() => load(true)}>
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
        {canEdit && (
          <>
            <Button size="sm" color="primary" disabled={mutationBusy || !current} onClick={() => openDialog("CREATE")}>
              New folder
            </Button>
            <Button
              size="sm"
              color="primary"
              disabled={mutationBusy || !current}
              onClick={() => {
                setUploads([]);
                setUploadTarget(folderId);
                setDialog({ type: "UPLOAD" });
              }}
            >
              Upload
            </Button>
            <Button
              size="sm"
              outline
              color="primary"
              disabled={mutationBusy || !current?.parentId}
              onClick={() => openDialog("RENAME", current)}
            >
              Rename folder
            </Button>
          </>
        )}
        {canDelete && (
          <>
            <Button
              size="sm"
              outline
              color="danger"
              disabled={mutationBusy || !current?.parentId || currentEmailFiles.length > 0}
              onClick={() => openDialog("DELETE_FOLDER", current)}
            >
              Delete empty folder
            </Button>
            <Button
              size="sm"
              color="danger"
              disabled={mutationBusy || (!selected.size && !selectedEmailFolders.size)}
              onClick={requestDelete}
            >
              Delete
            </Button>
          </>
        )}
        {(busy || refreshing || rootSetup.running) && (
          <span role="status" className="text-muted">
            {rootSetup.running ? "Preparing matter folder…" : refreshing ? "Refreshing attachments…" : "Processing…"}
          </span>
        )}
      </div>
      {loadError && (
        <div role="alert" className="alert alert-danger m-2">
          {loadError}
        </div>
      )}
      {rootSetup.error && (
        <div role="alert" className="alert alert-danger m-2">
          Matter folder setup failed: {rootSetup.error}{" "}
          <Button
            size="sm"
            outline
            color="primary"
            disabled={mutationBusy}
            onClick={() => {
              rootAttempt.current = null;
              setRootSetup({ running: false, error: "" });
              load();
            }}
          >
            Retry folder setup
          </Button>
        </div>
      )}
      {(registration.running || pendingRegistration > 0) && (
        <div className="alert alert-info m-2 d-flex flex-wrap align-items-center gap-2" role="status">
          <span>
            {registration.running
              ? `Finding existing folders: ${registration.checked} of ${registration.total} files checked.`
              : `${pendingRegistration} file(s) awaiting folder setup${registration.paused ? " (paused)" : ""}.`}{" "}
            Previews and downloads remain available.
          </span>
          {registration.running ? (
            <Button size="sm" outline color="primary" onClick={pauseRegistration}>
              Pause folder setup
            </Button>
          ) : (
            <Button size="sm" outline color="primary" disabled={busy} onClick={retryRegistration}>
              {registration.paused ? "Resume folder setup" : "Retry folder setup"}
            </Button>
          )}
        </div>
      )}
      {!!warnings.length && (
        <details className="m-2 text-warning">
          <summary>Some existing files need storage review ({warnings.length})</summary>
          {warnings.map((warning, index) => (
            <div key={index}>{warning}</div>
          ))}
        </details>
      )}
      <div className="matter-folder-panels">
        <nav className="matter-folder-tree" aria-label="Matter folders" tabIndex={0}>
          <button
            type="button"
            aria-current={!folderId && activeFileId == null && !hasUnassignedFiles ? "true" : undefined}
            disabled={busy}
            onClick={() => openFolder(null)}
          >
            Matter attachments
          </button>
          <FileFolderTree
            key={`matter-${matterId}`}
            idPrefix={`matter-${matterId}`}
            folders={folders}
            files={files}
            expanded={expandedFolders}
            folderId={folderId}
            activeFileId={activeFileId}
            onToggle={toggleFolder}
            onFolderSelect={openFolder}
            onFilePreview={(file) => openFilePreview(file, true)}
            folderLabel={folderLabel}
            folderDirection={(folder) => emailSources.get(folder.id)?.direction}
            disabled={busy}
            canDrop={canEdit && !mutationBusy}
            onDrop={drop}
            canDragFile={(file) => canEdit && knownFolderIds.has(file.folderId) && !mutationBusy}
            onFileDragStart={(event, file) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("application/x-veeto-attachment", JSON.stringify({ fileId: file.id, matterId }));
            }}
          />
        </nav>
        <div
          className={`matter-folder-contents ${dragOver ? "drag-over" : ""}`}
          onDragOver={(event) => {
            if (canEdit && folderId) {
              event.preventDefault();
              setDragOver(true);
            }
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => drop(event, folderId)}
        >
          <div className="small text-muted mb-2">
            {location(folderId) || "Select a folder to upload or move files. Existing unregistered files are listed here."}
          </div>
          <div className="d-flex gap-2 mb-2">
            <Input
              bsSize="sm"
              placeholder="Search filename or uploader…"
              aria-label="Search attachments"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Input
              bsSize="sm"
              type="select"
              aria-label="Search scope"
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              style={{ maxWidth: 170 }}
            >
              <option value="FOLDER">Current folder</option>
              <option value="MATTER">Entire matter</option>
            </Input>
            <Input
              bsSize="sm"
              type="select"
              aria-label="Sort attachments"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              style={{ maxWidth: 150 }}
            >
              <option value="DATE_DESC">Newest first</option>
              <option value="NAME">Name</option>
            </Input>
          </div>
          <div className="table-responsive matter-folder-list" role="region" aria-label="Folder contents" tabIndex={0}>
            <Table className="matter-folder-table mb-0" hover>
              <thead>
                <tr>
                  <th style={{ width: 32 }}>
                    <input
                      type="checkbox"
                      aria-label="Select visible files"
                      disabled={!visibleFiles.length}
                      checked={!!visibleFiles.length && visibleFiles.every((file) => selected.has(file.id))}
                      onChange={() => toggleIds(visibleFiles.map((file) => file.id))}
                    />
                  </th>
                  <th>Name</th>
                  <th>Uploaded</th>
                  <th>By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleFolders.map((folder) => {
                  const ids = folderFiles(folder.id);
                  const email = emailSources.get(folder.id);
                  const folderAudit = folder.emailUploadGroupId && email ? email : { uploadDate: folder.createdDate, uploadedBy: folder.createdBy };
                  return (
                    <tr
                      key={`folder-${folder.id}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => drop(event, folder.id)}
                    >
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select all files in ${folderLabel(folder)}`}
                          disabled={
                            !ids.length && !files.some((file) => file.uploadGroupId && file.uploadGroupId === folder.emailUploadGroupId)
                          }
                          checked={selectedEmailFolders.has(folder.id) || (!!ids.length && ids.every((id) => selected.has(id)))}
                          onChange={() => toggleFolderSelection(folder, ids)}
                        />
                      </td>
                      <td>
                        <button className="matter-folder-name" onClick={() => openFolder(folder.id)}>
                          <AttachmentTypeIcon type={folder.emailUploadGroupId ? "email" : "folder"} direction={email?.direction} />
                          {folderLabel(folder)}
                        </button>
                        <EmailContext email={email} />
                        {scope === "MATTER" && needle && <div className="small text-muted">{location(folder.parentId)}</div>}
                      </td>
                      <td><UploadDate file={folderAudit} /></td>
                      <td>{folderAudit.uploadedBy?.trim() ? <Uploader file={folderAudit} /> : "—"}</td>
                      <td>
                        <div className="matter-folder-actions">
                          {email && (
                            <Button size="sm" outline color="primary" onClick={() => download(email)}>
                              Download email
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleFiles.map((file) => (
                  <tr
                    key={file.id}
                    className={activeFileId === file.id ? "document-folder-active-file" : undefined}
                    draggable={canEdit && !!file.folderId && !mutationBusy}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("application/x-veeto-attachment", JSON.stringify({ fileId: file.id, matterId }));
                    }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(file.id)}
                        aria-label={`Select ${file.name}`}
                        onChange={() => toggleIds([file.id])}
                      />
                    </td>
                    <td>
                      <button className="matter-folder-name" onClick={() => download(file)}>
                        <AttachmentTypeIcon type={file.type} name={file.name} direction={file.direction} />
                        {file.name}
                      </button>
                      {["msg", "eml"].includes(file.type?.toLowerCase()) && <EmailContext email={file} />}
                      {scope === "MATTER" && (
                        <div className="small text-muted">{location(file.folderId) || "Location pending registration"}</div>
                      )}
                    </td>
                    <td>
                      <UploadDate file={file} />
                    </td>
                    <td>
                      <Uploader file={file} />
                    </td>
                    <td>
                      <div className="matter-folder-actions">
                        <Button size="sm" outline color="primary" onClick={() => openFilePreview(file)}>
                          Preview
                        </Button>
                        {canEdit && (
                          <>
                            <Button
                              size="sm"
                              outline
                              color="primary"
                              disabled={mutationBusy}
                              onClick={() => openDialog("RENAME_FILE", file)}
                            >
                              Rename
                            </Button>
                            <Button
                              size="sm"
                              outline
                              color="primary"
                              disabled={mutationBusy || !file.folderId}
                              onClick={() => openDialog("MOVE", file)}
                            >
                              Move
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!visibleFiles.length && !visibleFolders.length && (
                  <tr>
                    <td colSpan={5} className="text-muted py-3">
                      No items in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
      <Modal
        isOpen={!!dialog}
        toggle={() => {
          if (!busy) setDialog(null);
        }}
        backdrop="static"
        centered
        scrollable
        className="matter-folder-modal"
        size={dialog?.type === "UPLOAD" ? "lg" : "md"}
      >
        <ModalHeader toggle={busy ? undefined : () => setDialog(null)}>
          {
            {
              CREATE: "Create folder",
              RENAME: "Rename folder",
              RENAME_FILE: "Rename file",
              MOVE: "Move file",
              UPLOAD: "Upload files",
              DELETE_FOLDER: "Delete empty folder",
              DELETE_FILES: "Delete selected items",
            }[dialog?.type]
          }
        </ModalHeader>
        <ModalBody>
          {["CREATE", "RENAME", "RENAME_FILE"].includes(dialog?.type) && (
            <>
              <label htmlFor="matter-folder-name" className="form-label">
                {dialog.type === "RENAME_FILE" ? "File name" : "Folder name"}
              </label>
              <Input
                id="matter-folder-name"
                autoFocus
                maxLength={200}
                value={value}
                disabled={busy}
                onChange={(event) => setValue(event.target.value)}
              />
            </>
          )}
          {dialog?.type === "MOVE" && (
            <>
              <div className="matter-folder-dialog-context mb-3">
                <span className="matter-folder-dialog-caption">File</span>
                <span>{dialog.item.name}</span>
              </div>
              <label htmlFor="matter-folder-destination" className="form-label">
                Destination folder
              </label>
              <Input
                id="matter-folder-destination"
                type="select"
                value={value}
                disabled={busy}
                onChange={(event) => setValue(event.target.value)}
              >
                <option value="">Choose destination</option>
                {folders
                  .filter((folder) => rootOf(folder.id) === rootOf(dialog.item.folderId) && folder.id !== dialog.item.folderId)
                  .map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {location(folder.id)}
                    </option>
                  ))}
              </Input>
            </>
          )}
          {dialog?.type === "DELETE_FOLDER" && (
            <p className="mb-0">Delete “{folderLabel(dialog.item)}”? It must contain no files or subfolders, including items in storage.</p>
          )}
          {dialog?.type === "DELETE_FILES" && (
            <div>
              {dialog.item.fileIds.length > 0 && <p>Delete {dialog.item.fileIds.length} selected file(s)?</p>}
              {dialog.item.emails.length > 0 && (
                <>
                  <p>
                    The following emails will be deleted in full, including their original MSG and all extracted attachments, even those
                    moved elsewhere:
                  </p>
                  <ul>
                    {dialog.item.emails.map((email) => (
                      <li key={email.id}>
                        {email.name} ({email.count} files)
                      </li>
                    ))}
                  </ul>
                  <p>Unrelated files inside email folders will remain. Email folders are removed only if empty.</p>
                </>
              )}
              <p className="mb-0">This cannot be undone.</p>
            </div>
          )}
          {dialog?.type === "UPLOAD" && (
            <>
              <div className="matter-folder-dialog-context">
                <span className="matter-folder-dialog-caption">Destination</span>
                <span>{location(uploadTarget)}</span>
              </div>
              <div className="matter-folder-dialog-help">
                Each email creates its own folder containing the original email and supported extracted attachments.
              </div>
              <FolderUploadPicker
                entries={uploads}
                onFiles={(files) => queueUploads(files, uploadTarget)}
                onChange={setUploads}
                disabled={mutationBusy}
                idPrefix="matter"
              />
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button outline color="primary" disabled={busy} onClick={() => setDialog(null)}>
            Cancel
          </Button>
          <Button
            color={dialog?.type?.startsWith("DELETE") ? "danger" : "primary"}
            disabled={
              busy ||
              (["CREATE", "RENAME", "RENAME_FILE", "MOVE"].includes(dialog?.type) && !value.trim()) ||
              (dialog?.type === "UPLOAD" && (mutationBusy || !uploads.length || uploads.some((entry) => !entry.name.trim())))
            }
            onClick={dialog?.type === "UPLOAD" ? upload : saveDialog}
          >
            {busy ? "Processing…" : dialog?.type?.startsWith("DELETE") ? "Delete" : dialog?.type === "UPLOAD" ? "Upload" : "Save"}
          </Button>
        </ModalFooter>
      </Modal>
      {binder && (
        <MasterFileBinderModal
          isOpen
          toggle={() => setBinder(null)}
          matterId={matterId}
          matterData={data}
          initialAttachmentId={binder.focus}
          initialSelectedIds={binder.ids}
        />
      )}
    </div>
  );
};
export default AttachmentFolderBrowser;
