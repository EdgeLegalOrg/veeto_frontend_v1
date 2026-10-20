import React, { useEffect, useRef, useState } from "react";
import { Spinner } from "reactstrap";
import { fetchAttachmentInlinePreview } from "../../../apis";

// Isolate document CSS and disable scripts, external assets, forms, and embedded frames.
const PREVIEW_FRAME = `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data: blob:;">
<style>html,body{margin:0;min-height:100%;background:#f1f5f9}
.docx-wrapper{padding:20px!important;background:#f1f5f9!important}
.docx-wrapper>section.docx{margin-bottom:20px!important}
</style></head><body><div id="docx-styles"></div><div id="docx-content"></div></body></html>`;

const DocxAttachmentPreview = ({ attachmentId, title, onDownload }) => {
  const frameRef = useRef(null);
  const [frameReady, setFrameReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!frameReady) return;
    let current = true;
    const controller = new AbortController();
    const document = frameRef.current.contentDocument;
    const content = document.getElementById("docx-content");
    const styles = document.getElementById("docx-styles");
    // Prevent document links from replacing the preview or opening another location.
    const preventNavigation = (event) => {
      if (event.target.closest?.("a")) event.preventDefault();
    };
    document.addEventListener("click", preventNavigation);
    const load = async () => {
      try {
        const [response, { renderAsync }] = await Promise.all([
          fetchAttachmentInlinePreview(attachmentId, { signal: controller.signal }),
          import("docx-preview"),
        ]);
        if (!current) return;
        await renderAsync(response.data, content, styles, {
          // Embedded images/fonts are released with the iframe instead of leaking object URLs.
          useBase64URL: true,
          renderAltChunks: false,
          ignoreLastRenderedPageBreak: false,
        });
        if (current) setIsLoading(false);
      } catch (err) {
        if (current) { setError(true); setIsLoading(false); }
      }
    };
    load();
    return () => {
      current = false;
      controller.abort();
      document.removeEventListener("click", preventNavigation);
      content.replaceChildren();
      styles.replaceChildren();
    };
  }, [attachmentId, frameReady]);

  if (error) return (
    <div className="binder-scroll-canvas">
      <div className="binder-fallback-card">
        <div className="binder-fallback-icon"><i className="ri-file-word-2-line" /></div>
        <h4 className="binder-fallback-title">Preview Unavailable</h4>
        <p className="binder-fallback-desc">This Word document could not be previewed. Download it to open in Word.</p>
        <button className="btn btn-sm btn-primary mx-auto" onClick={onDownload}>
          <i className="ri-download-2-line me-1" />Download Document
        </button>
      </div>
    </div>
  );

  return (
    <div className="binder-docx-preview" aria-busy={isLoading}>
      {isLoading && <div className="binder-docx-loading text-center" role="status">
        <Spinner color="primary" />
        <p className="mt-3 text-muted">Loading document preview...</p>
      </div>}
      <iframe ref={frameRef} title={title} className="binder-iframe"
        sandbox="allow-same-origin" srcDoc={PREVIEW_FRAME}
        style={{ visibility: isLoading ? "hidden" : "visible" }}
        onLoad={() => setFrameReady(true)} />
    </div>
  );
};

export default DocxAttachmentPreview;
