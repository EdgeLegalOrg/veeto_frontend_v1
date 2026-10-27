import React, { useEffect, useRef, useState } from "react";
import { Spinner } from "reactstrap";
import { fetchAttachmentInlinePreview } from "../../../apis";

const FILE_LIMIT = 20 * 1024 * 1024;
const TIMEOUT = 45000;

/** Encodes a reduced JPEG for display; the original attachment is never modified or uploaded. */
const imagePreviewBlob = async ({ width, height, pixels }) => {
  const original = document.createElement("canvas");
  const preview = document.createElement("canvas");
  try {
    original.width = width;
    original.height = height;
    original.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(pixels), width, height), 0, 0);
    const scale = Math.min(1, 2560 / Math.max(width, height));
    preview.width = Math.max(1, Math.round(width * scale));
    preview.height = Math.max(1, Math.round(height * scale));
    const context = preview.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, preview.width, preview.height);
    context.drawImage(original, 0, 0, preview.width, preview.height);
    return await new Promise((resolve, reject) => preview.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Unable to display this image.")), "image/jpeg", 0.85,
    ));
  } finally {
    original.width = original.height = preview.width = preview.height = 0;
  }
};

/** Converts a zero-based column index to an Excel-style heading without loading the parser in the UI. */
const columnLabel = (index) => {
  let value = index + 1;
  let label = "";
  while (value) { value -= 1; label = String.fromCharCode(65 + value % 26) + label; value = Math.floor(value / 26); }
  return label;
};

/** Selected-file-only browser preview with cancellable workers and bounded session HEIC caching. */
const BrowserAttachmentPreview = ({ item, kind, title, onDownload, imageCache }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [multipleImages, setMultipleImages] = useState(false);
  const [sheet, setSheet] = useState(null);
  const workerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let active = true;
    let objectUrl;
    setLoading(true);
    setError("");
    setImageUrl(null);
    setMultipleImages(false);
    setSheet(null);
    const controller = new AbortController();
    // Date fields accompany the identity so replaced attachments don't reuse an older image.
    const cacheKey = `${item.attachmentId}:${item.checksum || item.uploadDate || item.effectiveDate || ""}`;
    const fail = (message) => {
      if (!active) return;
      active = false;
      clearTimeout(timerRef.current);
      workerRef.current?.terminate();
      workerRef.current = null;
      controller.abort();
      setError(message);
      setLoading(false);
    };
    const showImage = (blob, multiple) => {
      objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
      setMultipleImages(multiple);
      setLoading(false);
    };
    const load = async () => {
      try {
        const cached = kind === "heic" && imageCache.current.get(cacheKey);
        if (cached) { showImage(cached.blob, cached.multipleImages); return; }
        timerRef.current = setTimeout(() => fail("Preview preparation took too long. Download the original to view it."), TIMEOUT);
        const response = await fetchAttachmentInlinePreview(item.attachmentId, {
          signal: controller.signal,
          onDownloadProgress: ({ loaded }) => {
            if (loaded > FILE_LIMIT) fail("This file exceeds the 20 MB preview limit. Download the original to view it.");
          },
        });
        if (!active || controller.signal.aborted) return;
        if (!response.data.size || response.data.size > FILE_LIMIT) {
          throw new Error("This file is empty or exceeds the 20 MB preview limit. Download the original to view it.");
        }
        const buffer = await response.data.arrayBuffer();
        if (!active || controller.signal.aborted) return;
        const worker = new Worker(new URL("./workers/binderPreview.worker.js", import.meta.url));
        workerRef.current = worker;
        worker.onerror = () => fail("This file could not be previewed in your browser. Download the original to view it.");
        worker.onmessage = async ({ data }) => {
          if (!active) return;
          clearTimeout(timerRef.current);
          if (data.type === "error") { fail(data.message); return; }
          if (data.type === "sheet") { setSheet(data); setLoading(false); return; }
          try {
            worker.terminate();
            workerRef.current = null;
            const blob = await imagePreviewBlob(data);
            if (!active) return;
            imageCache.current.set(cacheKey, { blob, multipleImages: data.multipleImages });
            // Bound the retained JPEG previews to eight entries and 20 MB per open binder.
            while (imageCache.current.size > 8 || [...imageCache.current.values()].reduce((sum, entry) => sum + entry.blob.size, 0) > FILE_LIMIT) {
              imageCache.current.delete(imageCache.current.keys().next().value);
            }
            showImage(blob, data.multipleImages);
          } catch (err) { fail(err.message); }
        };
        worker.postMessage({ type: kind === "heic" ? "heic" : "workbook", buffer }, [buffer]);
      } catch (err) {
        if (!controller.signal.aborted) fail(err.message || "Unable to load this preview. Download the original to view it.");
      }
    };
    load();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timerRef.current);
      workerRef.current?.terminate();
      workerRef.current = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [item, kind, imageCache]);

  const selectSheet = (event) => {
    if (!workerRef.current) return;
    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      workerRef.current?.terminate();
      workerRef.current = null;
      setError("Worksheet preparation took too long. Download the original to view it.");
      setLoading(false);
    }, TIMEOUT);
    workerRef.current.postMessage({ type: "sheet", name: event.target.value });
  };

  if (error) return <div className="binder-scroll-canvas"><div className="binder-fallback-card">
    <div className="binder-fallback-icon"><i className="ri-file-warning-line" /></div>
    <h4 className="binder-fallback-title">Preview Unavailable</h4>
    <p className="binder-fallback-desc">{error}</p>
    <button className="btn btn-sm btn-primary mx-auto" onClick={onDownload}>Download Original</button>
  </div></div>;

  return <div className="binder-browser-preview" aria-busy={loading}>
    {sheet && <div className="binder-sheet-toolbar">
      <label htmlFor="binder-sheet-select">Worksheet</label>
      <select id="binder-sheet-select" value={sheet.sheetName} onChange={selectSheet} disabled={loading} className="form-select form-select-sm">
        {sheet.sheetNames.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>
      <span className="text-muted">Read only</span>
    </div>}
    {loading ? <div className="text-center p-5 m-auto" role="status"><Spinner color="primary" />
      <p className="mt-3 text-muted">{kind === "heic" ? "Preparing image preview..." : "Loading worksheet..."}</p>
    </div> : imageUrl ? <>
      {multipleImages && <p className="binder-sheet-notice">Showing the primary image. Download the original for all images.</p>}
      <div className="binder-scroll-canvas"><img src={imageUrl} alt={title} className="binder-image-view" onError={() => setError("The image preview could not be displayed. Download the original to view it.")} />
      </div></> : sheet && <>
      <p className="binder-sheet-notice">Values only. Charts and formatting are not reproduced; formula values may reflect the last saved calculation.
        {sheet.truncated && " Preview limited to 1,000 rows, 50 columns and bounded cell text. Download the original for the complete worksheet."}</p>
      <div className="binder-sheet-scroll" tabIndex={0} aria-label={`${sheet.sheetName} read-only worksheet`}>
        {sheet.rows.length ? <table className="binder-sheet-table"><caption className="visually-hidden">{title} — {sheet.sheetName}</caption>
          <thead><tr><th scope="col" aria-label="Row number" />{sheet.rows[0].map((_, col) => <th scope="col" key={col}>{columnLabel(sheet.startCol + col)}</th>)}</tr></thead>
          <tbody>{sheet.rows.map((row, index) => <tr key={index}><th scope="row">{sheet.startRow + index + 1}</th>
            {row.map((value, col) => <td key={col}>{value}</td>)}</tr>)}</tbody>
        </table> : <p className="p-4 text-muted">This worksheet has no cell values to display.</p>}
      </div>
    </>}
  </div>;
};

export default BrowserAttachmentPreview;
