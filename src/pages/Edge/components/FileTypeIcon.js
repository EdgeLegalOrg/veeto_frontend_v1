import React from "react";
import { getFileIconDefinition } from "../utils/fileTypeIcons";
import "./FileTypeIcon.css";

/** Supplied document artwork sized to the surrounding icon font; retain missing-icon fallbacks. */
const FileTypeIcon = ({ type, name = "", direction, className = "", style, fallback, decorative = false }) => {
  const definition = getFileIconDefinition(type, name, direction);
  if (!definition.src && fallback) return fallback;
  const title = definition.label;
  if (!definition.src) return <i className={`${definition.fallback} ${className}`} style={style}
    role={decorative ? undefined : "img"} aria-label={decorative ? undefined : title}
    aria-hidden={decorative || undefined} title={decorative ? undefined : title} />;
  return <img src={definition.src} className={`veeto-file-type-icon ${className}`} style={style}
    alt={decorative ? "" : title} aria-hidden={decorative || undefined}
    title={decorative ? undefined : title} draggable={false} />;
};

export default FileTypeIcon;
