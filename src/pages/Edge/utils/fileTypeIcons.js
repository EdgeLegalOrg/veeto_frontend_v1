import { normalizeEmailDirection } from "./emailDirection";
import audio from "../images/fileIcons/veeto/audio.png";
import received from "../images/fileIcons/veeto/email-received.png";
import sent from "../images/fileIcons/veeto/email-sent.png";
import excel from "../images/fileIcons/veeto/excel.png";
import pdf from "../images/fileIcons/veeto/pdf.png";
import image from "../images/fileIcons/veeto/image.png";
import powerpoint from "../images/fileIcons/veeto/powerpoint.png";
import file from "../images/fileIcons/veeto/file.png";
import video from "../images/fileIcons/veeto/video.png";
import word from "../images/fileIcons/veeto/word.png";
import archive from "../images/fileIcons/veeto/archive.png";

// One mapping for document rows, trees, previews and legacy image-based consumers.
// Icon recognition does not enable previews or change upload/filter behaviour.
const groups = [
  { types: ["doc", "docx", "docm", "dot", "dotx", "dotm", "rtf", "odt", "ott"], src: word, label: "Word document" },
  { types: ["xls", "xlsx", "xlsm", "xlsb", "xlt", "xltx", "xltm", "csv", "ods", "ots"], src: excel, label: "Spreadsheet" },
  { types: ["pdf"], src: pdf, label: "PDF" },
  { types: ["image", "png", "jpg", "jpeg", "gif", "bmp", "tif", "tiff", "webp", "heic", "heif", "svg", "avif", "ico"], src: image, label: "Image" },
  { types: ["ppt", "pptx", "pptm", "pps", "ppsx", "pot", "potx", "potm", "odp", "otp"], src: powerpoint, label: "Presentation" },
  { types: ["zip", "rar", "7z", "gz", "tar", "bz2"], src: archive, label: "Archive" },
  { types: ["audio", "mp3", "wav", "m4a", "ogg", "aac", "flac", "wma"], src: audio, label: "Audio" },
  { types: ["video", "mp4", "mov", "avi", "mkv", "webm", "wmv", "m4v", "mpeg", "mpg"], src: video, label: "Video" },
];
const byExtension = new Map(groups.flatMap((group) => group.types.map((type) => [type, group])));
const mimeTypes = {
  "application/pdf": "pdf", "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/zip": "zip", "application/x-zip-compressed": "zip",
  "application/vnd.ms-outlook": "msg", "message/rfc822": "eml", "text/csv": "csv",
};
const emailTypes = new Set(["email", "msg", "eml"]);

/** Prefer a recognised stored type; use the filename when legacy metadata is generic. */
export const normalizeFileIconType = (type, name = "") => {
  const raw = String(type || "").trim().toLowerCase().replace(/^\./, "");
  const mime = raw.split(";")[0].trim();
  if (Object.prototype.hasOwnProperty.call(mimeTypes, mime)) return mimeTypes[mime];
  if (/^(image|audio|video)\//.test(mime)) return mime.split("/")[0];
  if (byExtension.has(raw) || emailTypes.has(raw) || raw === "folder") return raw;
  return String(name).match(/\.([^.]+)$/)?.[1]?.toLowerCase() || raw;
};

/** Unknown email direction and ordinary folders retain existing neutral/folder artwork. */
export const getFileIconDefinition = (type, name = "", direction) => {
  const extension = normalizeFileIconType(type, name);
  if (extension === "folder") return { src: null, label: "Folder", fallback: "ri-folder-2-fill text-warning" };
  if (emailTypes.has(extension)) {
    const value = normalizeEmailDirection(direction);
    if (value === "SENT") return { src: sent, label: "Sent email" };
    if (value === "RECEIVED") return { src: received, label: "Received email" };
    return { src: null, label: "Email", fallback: "ri-mail-line text-primary" };
  }
  return byExtension.get(extension) || { src: file, label: "File" };
};

export const getProvidedFileIcon = (type, name = "", direction) => getFileIconDefinition(type, name, direction).src;
