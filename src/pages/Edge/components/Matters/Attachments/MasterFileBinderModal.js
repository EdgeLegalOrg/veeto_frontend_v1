import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Modal, Spinner } from "reactstrap";
import fileDownload from "js-file-download";
import {
  fetchMatterBinderSequence,
  fetchAttachmentInlinePreview,
  fetchAttachmentEmailContent,
  downloadMatterAttach,
} from "../../../apis";
import { formatDateFunc } from "../../../utils/utilFunc";
import "./MasterFileBinderModal.css";

const getInitials = (name) => {
  if (!name) return "LD";
  const trimmed = name.trim();
  const parts = trimmed.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
};

const getDocumentDisplayTitle = (item) => {
  if (!item) return "Untitled Document";
  const isEmail = item.previewType === "EMAIL_MSG";
  const cleanSubject =
    item.emailSubject &&
    item.emailSubject.trim() !== "-" &&
    item.emailSubject.trim() !== ""
      ? item.emailSubject.trim()
      : null;
  if (isEmail && cleanSubject) return cleanSubject;
  if (item.name && item.name.trim() !== "-" && item.name.trim() !== "") return item.name;
  return isEmail ? "Email Message" : "Attachment Document";
};

const MasterFileBinderModal = ({
  isOpen,
  toggle,
  matterId,
  matterData,
  initialAttachmentId,
}) => {
  const [loadingSequence, setLoadingSequence] = useState(true);
  const [binderData, setBinderData] = useState(null);
  const [sortOrder, setSortOrder] = useState("ASC");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active document preview states
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [docBlobUrl, setDocBlobUrl] = useState(null);
  const [emailContent, setEmailContent] = useState(null);
  const [docError, setDocError] = useState(null);

  const blobUrlRef = useRef(null);

  // Revoke blob URL cleanly
  const revokeCurrentBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // Fetch sequence on mount or when sort order changes
  useEffect(() => {
    if (!isOpen || !matterId) return;

    let isSubscribed = true;
    setLoadingSequence(true);

    fetchMatterBinderSequence(matterId, sortOrder)
      .then((res) => {
        if (!isSubscribed) return;
        if (res?.data?.success && res?.data?.data) {
          const data = res.data.data;
          setBinderData(data);

          if (initialAttachmentId && data.items && data.items.length > 0) {
            const foundIdx = data.items.findIndex(
              (it) => it.attachmentId === initialAttachmentId
            );
            if (foundIdx !== -1) {
              setCurrentIndex(foundIdx);
            } else {
              setCurrentIndex(0);
            }
          } else {
            setCurrentIndex(0);
          }
        } else {
          setBinderData(null);
        }
        setLoadingSequence(false);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error("Error loading binder sequence:", err);
        setLoadingSequence(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, matterId, sortOrder, initialAttachmentId]);

  // Current active item
  const items = binderData?.items || [];
  const currentItem = items[currentIndex] || null;

  // Filtered TOC list
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter((it) => {
      const title = getDocumentDisplayTitle(it).toLowerCase();
      return (
        title.includes(query) ||
        it.sender?.toLowerCase().includes(query) ||
        it.uploadedBy?.toLowerCase().includes(query) ||
        it.previewType?.toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery]);

  // Load preview data when currentIndex or currentItem changes
  useEffect(() => {
    if (!currentItem) {
      revokeCurrentBlob();
      setDocBlobUrl(null);
      setEmailContent(null);
      return;
    }

    let isSubscribed = true;
    setLoadingDoc(true);
    setDocError(null);
    revokeCurrentBlob();
    setDocBlobUrl(null);
    setEmailContent(null);

    const previewType = currentItem.previewType;
    const attId = currentItem.attachmentId;

    if (previewType === "EMAIL_MSG") {
      fetchAttachmentEmailContent(attId)
        .then((res) => {
          if (!isSubscribed) return;
          if (res?.data?.success && res?.data?.data) {
            setEmailContent(res.data.data);
          } else {
            setDocError("Unable to parse email content.");
          }
          setLoadingDoc(false);
        })
        .catch((err) => {
          if (!isSubscribed) return;
          console.error("Error fetching email preview:", err);
          setDocError("Failed to load email message.");
          setLoadingDoc(false);
        });
    } else if (previewType === "PDF" || previewType === "IMAGE") {
      fetchAttachmentInlinePreview(attId)
        .then((res) => {
          if (!isSubscribed) return;
          const mime =
            previewType === "PDF"
              ? "application/pdf"
              : res.headers["content-type"] || "image/png";
          const blob = new Blob([res.data], { type: mime });
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setDocBlobUrl(url);
          setLoadingDoc(false);
        })
        .catch((err) => {
          if (!isSubscribed) return;
          console.error("Error streaming inline preview:", err);
          setDocError("Failed to load document preview.");
          setLoadingDoc(false);
        });
    } else {
      // OFFICE_DOC or OTHER
      setLoadingDoc(false);
    }

    return () => {
      isSubscribed = false;
      revokeCurrentBlob();
    };
  }, [currentItem, revokeCurrentBlob]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, items.length]);

  // Keyboard navigation: Left/Right arrow keys & Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handlePrev, handleNext, toggle]);

  // Download handler
  const handleDownload = (itemToDownload = currentItem) => {
    if (!itemToDownload) return;
    downloadMatterAttach(itemToDownload.attachmentId).then((res) => {
      let filename = itemToDownload.name;
      if (
        itemToDownload.fileExtension &&
        !filename.toLowerCase().endsWith("." + itemToDownload.fileExtension.toLowerCase())
      ) {
        filename = filename + "." + itemToDownload.fileExtension;
      }
      fileDownload(res.data, filename);
    });
  };

  // Toggle sort order between ASC and DESC
  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
  };

  // Format date helper
  const renderItemDate = (date) => {
    if (!date) return "";
    return formatDateFunc(date);
  };

  // Render badge helper
  const renderTypeBadge = (type) => {
    switch (type) {
      case "PDF":
        return <span className="binder-badge binder-badge-pdf">PDF</span>;
      case "EMAIL_MSG":
        return <span className="binder-badge binder-badge-msg">EMAIL</span>;
      case "IMAGE":
        return <span className="binder-badge binder-badge-image">IMAGE</span>;
      case "OFFICE_DOC":
        return <span className="binder-badge binder-badge-office">OFFICE</span>;
      default:
        return <span className="binder-badge binder-badge-other">FILE</span>;
    }
  };

  // Render active preview canvas
  const renderCanvasContent = () => {
    if (loadingDoc) {
      return (
        <div className="text-center py-5 m-auto">
          <Spinner color="primary" style={{ width: "2.5rem", height: "2.5rem" }} />
          <p className="mt-3 text-muted" style={{ fontSize: "13.5px" }}>
            Loading document preview...
          </p>
        </div>
      );
    }

    if (docError) {
      return (
        <div className="binder-scroll-canvas">
          <div className="binder-fallback-card">
            <div className="binder-fallback-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
              <i className="ri-error-warning-line"></i>
            </div>
            <h4 className="binder-fallback-title">Preview Unavailable</h4>
            <p className="binder-fallback-desc">{docError}</p>
            <button className="btn btn-sm btn-primary mx-auto d-flex align-items-center gap-2" onClick={() => handleDownload(currentItem)}>
              <i className="ri-download-2-line"></i> Download Document
            </button>
          </div>
        </div>
      );
    }

    if (!currentItem) {
      return (
        <div className="text-center py-5 m-auto">
          <p className="text-muted">No documents found in this matter.</p>
        </div>
      );
    }

    // 1. PDF
    if (currentItem.previewType === "PDF" && docBlobUrl) {
      return (
        <iframe
          src={`${docBlobUrl}#toolbar=1&view=FitH`}
          title={getDocumentDisplayTitle(currentItem)}
          className="binder-iframe"
        />
      );
    }

    // 2. Image
    if (currentItem.previewType === "IMAGE" && docBlobUrl) {
      return (
        <div className="binder-scroll-canvas">
          <img
            src={docBlobUrl}
            alt={getDocumentDisplayTitle(currentItem)}
            className="binder-image-view"
          />
        </div>
      );
    }

    // 3. Outlook Email (.msg)
    if (currentItem.previewType === "EMAIL_MSG") {
      const email = emailContent;
      return (
        <div className="binder-scroll-canvas">
          <div className="binder-email-card">
            <div className="binder-email-header">
              <h3 className="binder-email-subject">
                {email?.subject || getDocumentDisplayTitle(currentItem)}
              </h3>
              <div className="binder-email-meta-grid">
                <span className="binder-email-meta-label">From:</span>
                <div className="d-flex align-items-center gap-2">
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#e2e8f0",
                      color: "#334155",
                      fontSize: "10.5px",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getInitials(email?.sender || currentItem.sender || currentItem.uploadedBy)}
                  </span>
                  <span className="fw-semibold text-dark">
                    {email?.sender || currentItem.sender || currentItem.uploadedBy || "Unknown"}
                  </span>
                </div>

                <span className="binder-email-meta-label">Date:</span>
                <span>
                  {renderItemDate(email?.receivedDate || currentItem.receivedDate || currentItem.uploadDate)}
                </span>

                {currentItem.uploadedBy && (
                  <>
                    <span className="binder-email-meta-label">Filed By:</span>
                    <span>{currentItem.uploadedBy}</span>
                  </>
                )}
              </div>
            </div>

            <div className="binder-email-body">
              {email?.bodyText || (
                <span className="text-muted fst-italic">
                  (No body content available in message)
                </span>
              )}
            </div>

            {email?.attachments && email.attachments.length > 0 && (
              <div className="binder-email-attachments">
                <div className="binder-email-attachments-title">
                  Attached Files ({email.attachments.length}):
                </div>
                <div className="d-flex flex-wrap">
                  {email.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="binder-attachment-pill"
                      title="Unpacked and filed in sequence"
                    >
                      <i className="ri-attachment-line text-primary"></i>
                      <span>{att.filename}</span>
                      <span className="text-muted" style={{ fontSize: "11px" }}>
                        ({Math.round((att.size || 0) / 1024)} KB)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 4. Office Document / Other
    return (
      <div className="binder-scroll-canvas">
        <div className="binder-fallback-card">
          <div className="binder-fallback-icon">
            <i
              className={
                currentItem.previewType === "OFFICE_DOC"
                  ? "ri-file-word-2-line"
                  : "ri-file-line"
              }
            ></i>
          </div>
          <h4 className="binder-fallback-title">{getDocumentDisplayTitle(currentItem)}</h4>
          <p className="binder-fallback-desc">
            This is a {currentItem.fileExtension?.toUpperCase() || "binary"} file.
            Download the document to view or edit it in your desktop application.
          </p>
          <button className="btn btn-sm btn-primary mx-auto d-flex align-items-center gap-2" onClick={() => handleDownload(currentItem)}>
            <i className="ri-download-2-line"></i> Download ({currentItem.fileExtension?.toUpperCase()})
          </button>
        </div>
      </div>
    );
  };

  const matterNum = binderData?.matterNumber || matterData?.matterNumber || "";
  const matterRe = binderData?.letterSubject || matterData?.letterSubject || "";

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      backdrop="static"
      keyboard={false}
      size="xl"
      fullscreen={isFullscreen}
      className={`binder-modal-dialog ${isFullscreen ? "fullscreen" : ""}`}
      wrapClassName="binder-modal-wrap"
      contentClassName="binder-modal-content"
      centered
    >
      {/* Header - Standard application light theme */}
      <div className="binder-header">
        <div className="binder-header-left">
          <div className="binder-header-icon">
            <i className="ri-book-read-line"></i>
          </div>
          <div className="binder-title-group">
            <h2 className="binder-title">
              <span>Master File Binder</span>
              {matterNum && (
                <span className="binder-matter-tag">
                  #{matterNum}
                </span>
              )}
            </h2>
            <div className="binder-subtitle">
              {matterRe ? `Re: ${matterRe}` : "Matter Attachment Chronological Reader"}
              {items.length > 0 && ` • ${items.length} document${items.length === 1 ? "" : "s"}`}
            </div>
          </div>
        </div>

        <div className="binder-header-actions">
          {/* Chronological order toggle */}
          <button
            className="binder-btn-action"
            onClick={handleToggleSort}
            title="Toggle chronological sequence order"
          >
            <i className={sortOrder === "ASC" ? "ri-sort-asc" : "ri-sort-desc"}></i>
            <span>{sortOrder === "ASC" ? "Oldest First" : "Newest First"}</span>
          </button>

          {/* Toggle Sidebar */}
          <button
            className="binder-btn-action"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            title={isSidebarCollapsed ? "Show Table of Contents" : "Hide Table of Contents"}
          >
            <i className={isSidebarCollapsed ? "ri-menu-unfold-line" : "ri-menu-fold-line"}></i>
            <span>TOC</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            className="binder-btn-action"
            onClick={() => setIsFullscreen((prev) => !prev)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <i className={isFullscreen ? "ri-fullscreen-exit-line" : "ri-fullscreen-line"}></i>
          </button>

          {/* Close Modal */}
          <button className="binder-btn-close" onClick={toggle} title="Close Binder (Esc)">
            <i className="ri-close-line"></i>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="binder-body">
        {/* Left: Collapsible Table of Contents Sidebar */}
        <div className={`binder-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
          <div className="binder-sidebar-header">
            <div className="binder-sidebar-title">
              <span>Chronological Index</span>
              <span className="badge bg-primary rounded-pill">
                {items.length}
              </span>
            </div>
            <input
              type="text"
              placeholder="Filter binder documents..."
              className="binder-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loadingSequence ? (
            <div className="text-center py-5">
              <Spinner color="primary" size="sm" />
              <div className="mt-2 text-muted" style={{ fontSize: "12px" }}>
                Loading chronological binder...
              </div>
            </div>
          ) : (
            <ul className="binder-toc-list">
              {filteredItems.map((item) => {
                const globalIndex = items.findIndex((it) => it.attachmentId === item.attachmentId);
                const isActive = globalIndex === currentIndex;
                const displayTitle = getDocumentDisplayTitle(item);

                return (
                  <li
                    key={item.attachmentId}
                    className={`binder-toc-item ${isActive ? "active" : ""}`}
                    onClick={() => setCurrentIndex(globalIndex)}
                  >
                    <div className="binder-item-seq">
                      {item.sequenceIndex || globalIndex + 1}
                    </div>
                    <div className="binder-item-details">
                      <div className="binder-item-title" title={displayTitle}>
                        {displayTitle}
                      </div>
                      <div className="binder-item-meta">
                        {renderTypeBadge(item.previewType)}
                        <span>{renderItemDate(item.effectiveDate)}</span>
                        {item.sender && (
                          <span className="text-truncate" style={{ maxWidth: "120px" }}>
                            • {item.sender}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="text-center py-4 text-muted" style={{ fontSize: "13px" }}>
                  No matching documents found.
                </div>
              )}
            </ul>
          )}
        </div>

        {/* Right: Document Stage Viewport */}
        <div className="binder-stage">
          {/* Top Stage Bar */}
          {currentItem && (
            <div className="binder-stage-toolbar">
              <div className="binder-toolbar-left">
                <span className="badge bg-light text-dark border" style={{ fontSize: "11px", flexShrink: 0 }}>
                  Doc {currentIndex + 1} of {items.length}
                </span>
                {renderTypeBadge(currentItem.previewType)}
                <span className="binder-doc-title" title={getDocumentDisplayTitle(currentItem)}>
                  {getDocumentDisplayTitle(currentItem)}
                </span>
                <span className="text-muted" style={{ fontSize: "12px", flexShrink: 0 }}>
                  • {renderItemDate(currentItem.effectiveDate)}
                </span>
              </div>

              <div className="binder-toolbar-right">
                <button
                  className="binder-btn-action"
                  onClick={() => handleDownload(currentItem)}
                  title="Download this file"
                >
                  <i className="ri-download-2-line"></i>
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}

          {/* Central Document Display Canvas */}
          <div className="binder-canvas">
            {renderCanvasContent()}
          </div>

          {/* Bottom Floating Navigation Toolbar */}
          <div className="binder-footer-nav">
            <button
              className="binder-nav-btn"
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              title="Previous Document (Left Arrow)"
            >
              <i className="ri-arrow-left-s-line"></i>
              <span>Previous</span>
            </button>

            <div className="binder-nav-center">
              <span className="binder-counter-pill">
                {items.length > 0
                  ? `Document ${currentIndex + 1} of ${items.length}`
                  : "0 Documents"}
              </span>
              <span className="binder-keyboard-hint">
                Use ← and → to navigate • Esc to close
              </span>
            </div>

            <button
              className="binder-nav-btn"
              onClick={handleNext}
              disabled={currentIndex >= items.length - 1}
              title="Next Document (Right Arrow)"
            >
              <span>Next</span>
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MasterFileBinderModal;
