import React from "react";

/** Compact type indicator shared by folder navigation and attachment rows. */
const AttachmentTypeIcon = ({ type, name = "", direction }) => {
  const extension = (type || name.split(".").pop() || "").toLowerCase().replace(/^\./, "");
  let icon = "ri-file-line",
    label = "File",
    color = "text-secondary";
  if (extension === "folder") {
    icon = "ri-folder-2-fill";
    label = "Folder";
    color = "text-warning";
  } else if (["email", "msg", "eml"].includes(extension)) {
    icon = direction === "SENT" ? "ri-mail-send-line" : "ri-mail-line";
    label = "Email";
    color = "text-primary";
  } else if (["doc", "docx", "docm", "dot", "dotx", "rtf", "odt"].includes(extension)) {
    icon = "ri-file-word-2-line";
    label = "Word document";
    color = "text-primary";
  } else if (["xls", "xlsx", "xlsm", "xlsb", "csv", "ods"].includes(extension)) {
    icon = "ri-file-excel-2-line";
    label = "Spreadsheet";
    color = "text-success";
  } else if (extension === "pdf") {
    icon = "ri-file-pdf-line";
    label = "PDF";
    color = "text-danger";
  } else if (["png", "jpg", "jpeg", "gif", "bmp", "tif", "tiff", "webp", "heic", "heif", "svg"].includes(extension)) {
    icon = "ri-image-line";
    label = "Image";
    color = "text-info";
  } else if (["ppt", "pptx", "odp"].includes(extension)) {
    icon = "ri-file-ppt-2-line";
    label = "Presentation";
    color = "text-warning";
  } else if (["zip", "rar", "7z", "gz"].includes(extension)) {
    icon = "ri-file-zip-line";
    label = "Archive";
  } else if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) {
    icon = "ri-video-line";
    label = "Video";
  } else if (["mp3", "wav", "m4a", "ogg"].includes(extension)) {
    icon = "ri-file-music-line";
    label = "Audio";
  }
  return <i className={`${icon} ${color} matter-attachment-type-icon`} role="img" aria-label={label} title={label} />;
};

export default AttachmentTypeIcon;
