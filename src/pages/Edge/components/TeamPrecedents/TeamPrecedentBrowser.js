import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Table } from "reactstrap";
import fileDownload from "js-file-download";
import { toast } from "react-toastify";
import { formatDateTimeFunc } from "../../utils/utilFunc";
import AttachmentTypeIcon from "../Matters/Attachments/AttachmentTypeIcon";
import "../Matters/Attachments/AttachmentFolderBrowser.css";
import { downloadName, teamPrecedentsApi, teamPrecedentsConfiguration } from "./api";

const filename = (file) => file.type && !file.name?.toLowerCase().endsWith(`.${file.type.toLowerCase()}`) ? `${file.name}.${file.type}` : file.name;
const failure = async (error) => {
  let body = error.response?.data;
  if (body instanceof Blob) { try { body = JSON.parse(await body.text()); } catch { body = null; } }
  return body?.message || body?.error?.message || "Team Precedents operation failed. Refresh before retrying.";
};

/** Company library browser; matter selection also exposes independently authorised master management. */
const TeamPrecedentBrowser = ({ siteId, onChoose }) => {
  const [config, setConfig] = useState(null);
  const [listing, setListing] = useState({ folders: [], files: [] });
  const [folderId, setFolderId] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("FOLDER");
  const [sort, setSort] = useState("DATE");
  const [matterType, setMatterType] = useState("");
  const [subType, setSubType] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null);
  const [value, setValue] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [classification, setClassification] = useState({ matterType: "", matterSubType: "" });
  const sequence = useRef(0);
  const fileInput = useRef(null);
  const replaceInput = useRef(null);
  const replaceTarget = useRef(null);
  const api = config ? teamPrecedentsApi(config.companyId) : null;
  const apiRef = useRef(null); apiRef.current = api;
  const canManage = !!config?.canUpload;
  const canDelete = !!config?.canDelete;
  const locked = busy;
  const folders = listing.folders;
  const files = listing.files;
  const current = folders.find((folder) => folder.id === folderId);
  const uploadRoot = folders.find((folder) => folder.parentId == null && folder.name === "TEAM_PRECEDENTS" && folder.provider === config?.provider);
  const destination = folderId ?? uploadRoot?.id;
  const types = config?.matterTypes || [];
  const subTypes = types.find((type) => type.code === matterType)?.subTypes || [];

  const load = useCallback(async () => {
    const token = ++sequence.current;
    setBusy(true);
    try {
      const configuration = await teamPrecedentsConfiguration(siteId);
      if (token !== sequence.current) return;
      const setup = configuration.data, service = teamPrecedentsApi(setup.companyId);
      const response = await service.list();
      if (token !== sequence.current) return;
      setConfig(setup); setListing(response.data); setError("");
      let availableFolders = response.data.folders;
      if (setup.canUpload && setup.provider === "ONEDRIVE"
        && !response.data.folders.some((folder) => folder.parentId == null && folder.name === "TEAM_PRECEDENTS")) {
        const root = await service.root(setup.provider);
        if (token !== sequence.current) return;
        availableFolders = [...availableFolders.filter((folder) => folder.id !== root.data.id), root.data];
        setListing((previous) => ({ ...previous, folders: availableFolders }));
      }
      const rootId = availableFolders.find((folder) => folder.parentId == null && folder.name === "TEAM_PRECEDENTS")?.id ?? null;
      setFolderId((previous) => availableFolders.some((folder) => folder.id === previous) ? previous : rootId);
      if (rootId != null) setExpanded((previous) => new Set([...previous, rootId]));
      setSelected((previous) => new Set([...previous].filter((id) => response.data.files.some((file) => file.id === id))));
    } catch (err) { if (token === sequence.current) setError(await failure(err)); }
    finally { if (token === sequence.current) setBusy(false); }
  }, [siteId]);

  useEffect(() => {
    setConfig(null); setListing({ folders: [], files: [] }); setFolderId(null); setSelected(new Set()); setExpanded(new Set());
    setScope("FOLDER");
    load();
    return () => { sequence.current += 1; };
  }, [load]);

  const operation = async (run, message) => {
    if (locked) return;
    setBusy(true);
    try { await run(); toast.success(message); setDialog(null); }
    catch (err) { toast.error(await failure(err)); }
    finally { await load(); setBusy(false); }
  };
  const location = (id) => {
    const result = [], seen = new Set();
    while (id != null && !seen.has(id)) { seen.add(id); const folder = folders.find((item) => item.id === id); if (!folder) break; result.unshift(folder.name); id = folder.parentId; }
    return result.join(" / ");
  };
  const rootOf = (id) => { const seen = new Set(); while (id != null && !seen.has(id)) { seen.add(id); const folder = folders.find((item) => item.id === id); if (!folder?.parentId) return folder; id = folder.parentId; } return null; };
  const openFolder = (id) => {
    setFolderId(id); setScope("FOLDER"); setQuery("");
    const next = new Set(expanded), seen = new Set(); let cursor = id;
    while (cursor != null && !seen.has(cursor)) { seen.add(cursor); next.add(cursor); cursor = folders.find((folder) => folder.id === cursor)?.parentId; }
    setExpanded(next);
  };
  const toggleSelection = (id) => setSelected((previous) => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const openDialog = (type, item) => { setDialog({ type, item }); setValue(item?.name || ""); setClassification({ matterType: item?.matterType || "", matterSubType: item?.matterSubType || "" }); };
  const download = async (file, versionId) => { try { toast.info("Preparing download…"); const response = await apiRef.current.download(file.id, versionId); fileDownload(response.data, downloadName(response, filename(file))); } catch (err) { toast.error(await failure(err)); } };
  const queueFiles = (chosen, target) => {
    if (!canManage || locked) return;
    if (!target) { toast.info("Choose a destination folder first."); return; }
    const accepted = Array.from(chosen).filter((file) => file.size > 0);
    if (!accepted.length) return;
    setUploadFiles(accepted.map((file) => ({ file, name: file.name.replace(/\.[^.]+$/, "") })));
    setDialog({ type: "UPLOAD", target });
  };
  const drop = (event, target) => {
    event.preventDefault(); event.stopPropagation();
    if (!canManage || locked || !target) return;
    const raw = event.dataTransfer.getData("application/x-veeto-team-precedent");
    if (raw) {
      try { const file = JSON.parse(raw); if (file.companyId !== config.companyId) throw new Error(); operation(() => apiRef.current.move(file.id, target), "File moved."); }
      catch { toast.info("Files can only move within this company's library."); }
    } else {
      if (Array.from(event.dataTransfer.items || []).some((item) => item.webkitGetAsEntry?.()?.isDirectory)) { toast.info("Drop files only; directory uploads are not supported."); return; }
      queueFiles(event.dataTransfer.files, target);
    }
  };
  const tree = (parentId = null, visited = new Set()) => (
    <ul className={`matter-folder-branches ${parentId == null ? "matter-folder-roots" : ""}`}>
      {folders.filter((folder) => (folder.parentId ?? null) === parentId && !visited.has(folder.id)).map((folder) => {
        const hasChildren = folders.some((child) => child.parentId === folder.id), opened = expanded.has(folder.id);
        return <li className="matter-folder-branch" key={folder.id}>
          <div className="matter-folder-tree-row" onDragOver={(event) => { if (canManage) event.preventDefault(); }} onDrop={(event) => drop(event, folder.id)}>
            {hasChildren ? <button className="matter-folder-tree-toggle" aria-label={`${opened ? "Collapse" : "Expand"} ${folder.name}`} aria-expanded={opened}
              onClick={() => setExpanded((previous) => { const next = new Set(previous); next.has(folder.id) ? next.delete(folder.id) : next.add(folder.id); return next; })}>{opened ? "▾" : "▸"}</button>
              : <span className="matter-folder-tree-spacer" />}
            <button className="matter-folder-tree-node" aria-current={folderId === folder.id ? "true" : undefined} onClick={() => openFolder(folder.id)}>
              <AttachmentTypeIcon type="folder" /><span>{folder.name}</span>
            </button>
          </div>
          {hasChildren && opened && tree(folder.id, new Set([...visited, folder.id]))}
        </li>;
      })}
    </ul>
  );
  const needle = query.trim().toLowerCase();
  const visible = files.filter((file) => (scope === "LIBRARY" || file.folderId === folderId)
    && (!needle || `${file.name} ${file.uploadedBy || ""}`.toLowerCase().includes(needle))
    && (!matterType || file.matterType === matterType) && (!subType || file.matterSubType === subType))
    .sort((a, b) => sort === "NAME" ? a.name.localeCompare(b.name) : new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0));
  const childFolders = folders.filter((folder) => (folder.parentId ?? null) === folderId && (!needle || folder.name.toLowerCase().includes(needle)));
  const submit = () => {
    if (dialog.type === "CREATE") operation(() => apiRef.current.create(destination, value.trim()), "Folder created.");
    if (dialog.type === "RENAME_FOLDER") operation(() => apiRef.current.rename(dialog.item, value.trim()), "Folder renamed.");
    if (dialog.type === "RENAME_FILE") operation(() => apiRef.current.renameFile(dialog.item.id, value.trim()), "File renamed.");
    if (dialog.type === "MOVE") operation(() => apiRef.current.move(dialog.item.id, Number(value)), "File moved.");
    if (dialog.type === "DELETE_FOLDER") operation(() => apiRef.current.remove(dialog.item.id), "Folder deleted.");
    if (dialog.type === "DELETE_FILES") operation(async () => { await apiRef.current.deleteFiles([...selected]); setSelected(new Set()); }, "Selected masters deleted.");
    if (dialog.type === "CLASSIFY") operation(() => apiRef.current.classify(dialog.item, classification), "Classification saved.");
    if (dialog.type === "UPLOAD") operation(async () => {
      for (const entry of uploadFiles) { await apiRef.current.upload(dialog.target, entry.file, entry.name.trim()); setUploadFiles((previous) => previous.filter((item) => item !== entry)); }
    }, "Files uploaded.");
  };
  return <div className="matter-folder-browser">
    <div className="matter-folder-toolbar">
      <Button size="sm" outline color="primary" disabled={busy} onClick={load}>Refresh</Button>
      {canManage && <>
        <Button size="sm" color="primary" disabled={locked || !destination} onClick={() => openDialog("CREATE")}>New folder</Button>
        <Button size="sm" color="primary" disabled={locked || !destination} onClick={() => fileInput.current?.click()}>Upload</Button>
        <Button size="sm" outline color="primary" disabled={locked || !current?.parentId} onClick={() => openDialog("RENAME_FOLDER", current)}>Rename folder</Button>
      </>}
      {canDelete && <>
        <Button size="sm" outline color="danger" disabled={locked || !current?.parentId} onClick={() => openDialog("DELETE_FOLDER", current)}>Delete empty folder</Button>
        <Button size="sm" color="danger" disabled={locked || !selected.size} onClick={() => openDialog("DELETE_FILES")}>Delete ({selected.size})</Button>
      </>}
      {busy && <span role="status" className="small text-muted">Processing…</span>}
      <input ref={fileInput} type="file" multiple hidden onChange={(event) => { queueFiles(event.target.files, destination); event.target.value = ""; }} />
      <input ref={replaceInput} type="file" hidden onChange={(event) => { const file = event.target.files[0]; if (file) operation(() => apiRef.current.replace(replaceTarget.current, file), "New version saved."); event.target.value = ""; }} />
    </div>
    {error && <div role="alert" className="alert alert-danger m-2">{error}</div>}
    {config?.provider === "UNCONFIGURED" && <div className="alert alert-info m-2">An administrator must configure company storage under Admin → Company Info before library uploads are available.</div>}
    <div className="matter-folder-panels">
      <nav className="matter-folder-tree" aria-label="Team Precedents folders" tabIndex={0}>
        <button aria-current={folderId === (uploadRoot?.id ?? null) ? "true" : undefined} onClick={() => openFolder(uploadRoot?.id ?? null)}>Team Precedents</button>{tree()}
      </nav>
      <div className="matter-folder-contents" onDragOver={(event) => { if (canManage) event.preventDefault(); }} onDrop={(event) => drop(event, destination)}>
        <div className="small text-muted mb-2">{location(folderId) || "Team Precedents"}</div>
        <div className="d-flex flex-wrap gap-2 mb-2">
          <Input bsSize="sm" style={{ flex: "1 1 180px" }} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search filename or uploader…" aria-label="Search Team Precedents" />
          <Input bsSize="sm" type="select" style={{ width: 155 }} value={scope} onChange={(event) => setScope(event.target.value)}><option value="LIBRARY">Entire library</option><option value="FOLDER">Current folder</option></Input>
          <Input bsSize="sm" type="select" style={{ width: 145 }} value={sort} onChange={(event) => setSort(event.target.value)}><option value="DATE">Newest first</option><option value="NAME">Name</option></Input>
          <Input bsSize="sm" type="select" aria-label="Matter type filter" style={{ width: 190 }} value={matterType} onChange={(event) => { setMatterType(event.target.value); setSubType(""); }}>
            <option value="">All matter types</option>{types.map((type) => <option key={type.code} value={type.code}>{type.name}</option>)}
          </Input>
          <Input bsSize="sm" type="select" aria-label="Matter sub-type filter" style={{ width: 190 }} value={subType} disabled={!matterType} onChange={(event) => setSubType(event.target.value)}>
            <option value="">All sub-types</option>{subTypes.map((type) => <option key={type.code} value={type.code}>{type.name}</option>)}
          </Input>
        </div>
        <div className="table-responsive matter-folder-list" tabIndex={0} role="region" aria-label="Team Precedents contents">
          <Table hover className="matter-folder-table mb-0"><thead><tr><th style={{ width: 32 }}>{canDelete && <input type="checkbox" aria-label="Select visible masters" checked={!!visible.length && visible.every((file) => selected.has(file.id))} onChange={() => setSelected((previous) => { const next = new Set(previous), remove = visible.every((file) => next.has(file.id)); visible.forEach((file) => remove ? next.delete(file.id) : next.add(file.id)); return next; })} />}</th><th>Name</th><th>Uploaded</th><th>By</th><th>Actions</th></tr></thead><tbody>
            {childFolders.map((folder) => <tr key={`folder-${folder.id}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, folder.id)}><td /><td colSpan={4}><button className="matter-folder-name" onClick={() => openFolder(folder.id)}><AttachmentTypeIcon type="folder" />{folder.name}</button></td></tr>)}
            {visible.map((file) => <tr key={file.id} draggable={canManage && !!file.folderId && !locked} onDragStart={(event) => event.dataTransfer.setData("application/x-veeto-team-precedent", JSON.stringify({ id: file.id, companyId: config.companyId }))}>
              <td>{canDelete && <input type="checkbox" aria-label={`Select ${file.name}`} checked={selected.has(file.id)} onChange={() => toggleSelection(file.id)} />}</td>
              <td><button className="matter-folder-name" onClick={() => download(file)}><AttachmentTypeIcon type={file.type} name={file.name} />{file.name}</button>
                {scope === "LIBRARY" && <div className="small text-muted">{location(file.folderId) || "Library location unavailable"}</div>}
                {file.matterType && <div className="small text-muted">{types.find((type) => type.code === file.matterType)?.name || file.matterType}{file.matterSubType ? ` / ${types.flatMap((type) => type.subTypes || []).find((type) => type.code === file.matterSubType)?.name || file.matterSubType}` : ""}</div>}
              </td>
              <td>{file.uploadDate ? formatDateTimeFunc(file.uploadDate) : "—"}</td>
              <td><span className="matter-folder-avatar" title={file.uploadedBy || "Unknown uploader"}>{(file.uploadedBy || "?").split(/[\s@]+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span></td>
              <td><div className="matter-folder-actions">
                {onChoose && <Button size="sm" color="primary" onClick={() => onChoose(file, config)}>Select</Button>}
                <Button size="sm" outline color="primary" onClick={async () => { try { const response = await apiRef.current.history(file.id); setDialog({ type: "HISTORY", item: file, versions: response.data }); } catch (err) { toast.error(await failure(err)); } }}>Versions</Button>
                {canManage && <>
                  <Button size="sm" outline color="primary" disabled={locked} onClick={() => openDialog("RENAME_FILE", file)}>Rename</Button>
                  <Button size="sm" outline color="primary" disabled={locked || !file.folderId} onClick={() => { openDialog("MOVE", file); setValue(""); }}>Move</Button>
                  <Button size="sm" outline color="primary" disabled={locked} onClick={() => openDialog("CLASSIFY", file)}>Classify</Button>
                  <Button size="sm" outline color="primary" disabled={locked || !file.folderId} onClick={() => { replaceTarget.current = file; replaceInput.current?.click(); }}>Upload version</Button>
                </>}
              </div></td>
            </tr>)}
            {!visible.length && !childFolders.length && <tr><td colSpan={5} className="text-muted py-3">No items in this view.</td></tr>}
          </tbody></Table>
        </div>
      </div>
    </div>
    <Modal isOpen={!!dialog} centered scrollable backdrop="static" className="matter-folder-modal" size={dialog?.type === "UPLOAD" ? "lg" : "md"} toggle={() => { if (!busy) setDialog(null); }}>
      <ModalHeader toggle={busy ? undefined : () => setDialog(null)}>{({ CREATE: "Create folder", RENAME_FOLDER: "Rename folder", RENAME_FILE: "Rename file", MOVE: "Move file", DELETE_FOLDER: "Delete empty folder", DELETE_FILES: "Delete selected masters", CLASSIFY: "Matter classification", UPLOAD: "Upload files", HISTORY: "Document versions" })[dialog?.type]}</ModalHeader>
      <ModalBody>
        {["CREATE", "RENAME_FOLDER", "RENAME_FILE"].includes(dialog?.type) && <><label className="form-label">Name</label><Input value={value} maxLength={200} disabled={busy} onChange={(event) => setValue(event.target.value)} /></>}
        {dialog?.type === "MOVE" && <><label className="form-label">Destination folder</label><Input type="select" value={value} disabled={busy} onChange={(event) => setValue(event.target.value)}><option value="">Choose destination</option>{folders.filter((folder) => { const source = rootOf(dialog.item.folderId), target = rootOf(folder.id); return source && target && source.provider === target.provider && source.id === target.id && source.storageConfigId === target.storageConfigId && folder.id !== dialog.item.folderId; }).map((folder) => <option key={folder.id} value={folder.id}>{location(folder.id)}</option>)}</Input></>}
        {dialog?.type === "DELETE_FOLDER" && <p>Delete “{dialog.item.name}”? It must be empty, including items in storage.</p>}
        {dialog?.type === "DELETE_FILES" && <p>Delete {selected.size} selected master document(s) and their version history? Matter copies remain unchanged. This cannot be undone.</p>}
        {dialog?.type === "CLASSIFY" && <><label className="form-label">Matter type (optional)</label><Input type="select" value={classification.matterType} onChange={(event) => setClassification({ matterType: event.target.value, matterSubType: "" })}><option value="">Unclassified / general document</option>{types.map((type) => <option key={type.code} value={type.code}>{type.name}</option>)}</Input><label className="form-label mt-3">Sub-type (optional)</label><Input type="select" disabled={!classification.matterType} value={classification.matterSubType} onChange={(event) => setClassification((previous) => ({ ...previous, matterSubType: event.target.value }))}><option value="">All sub-types</option>{(types.find((type) => type.code === classification.matterType)?.subTypes || []).map((type) => <option key={type.code} value={type.code}>{type.name}</option>)}</Input></>}
        {dialog?.type === "UPLOAD" && <><div className="matter-folder-dialog-context mb-3">Destination: {location(dialog.target)}</div>{uploadFiles.map((entry, index) => <div className="mb-3" key={index}><label className="form-label">{entry.file.name}</label><Input value={entry.name} maxLength={200} disabled={busy} onChange={(event) => setUploadFiles((previous) => previous.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} /></div>)}</>}
        {dialog?.type === "HISTORY" && <><p>Current file: <button className="matter-folder-name" onClick={() => download(dialog.item)}>{filename(dialog.item)}</button></p>{dialog.versions.map((version) => <div className="d-flex justify-content-between gap-2 mb-2" key={version.id}><span>Version {version.version ?? version.id} · {version.uploadDate ? formatDateTimeFunc(version.uploadDate) : "—"} · {version.uploadedBy || "—"}</span><Button size="sm" outline color="primary" onClick={() => download(dialog.item, version.id)}>Download</Button></div>)}{!dialog.versions.length && <p>No saved version history.</p>}</>}
      </ModalBody>
      <ModalFooter><Button outline color="primary" disabled={busy} onClick={() => setDialog(null)}>{dialog?.type === "HISTORY" ? "Close" : "Cancel"}</Button>{dialog?.type !== "HISTORY" && <Button color={dialog?.type?.startsWith("DELETE") ? "danger" : "primary"} disabled={busy || (["CREATE", "RENAME_FOLDER", "RENAME_FILE", "MOVE"].includes(dialog?.type) && !value.trim()) || (dialog?.type === "UPLOAD" && uploadFiles.some((entry) => !entry.name.trim()))} onClick={submit}>{busy ? "Processing…" : dialog?.type?.startsWith("DELETE") ? "Delete" : "Save"}</Button>}</ModalFooter>
    </Modal>
  </div>;
};
export default TeamPrecedentBrowser;
