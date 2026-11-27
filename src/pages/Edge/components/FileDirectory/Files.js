import React, { useEffect, useState } from "react";
import { getFileIcon } from "./helperFunction";
import { documentComparator } from "../DocumentFolders/documentSort";

function Files(props) {
  const { files, selectedFile, setSelectedFile, multiple = false, selectedDocuments = [], onToggleDocument } = props;
  const [sortedFiles, setSortedFiles] = useState([]);

  useEffect(() => {
    if (files?.length) {
      const sorted = sortFiles([...files]) || [];
      setSortedFiles(sorted);
    } else {
      setSortedFiles([]);
    }
  }, [files]);

  const sortFiles = (arg) => {
    arg.sort(documentComparator("NAME", { name: (file) => file.contentName, id: (file) => `${file.kind || ""}-${file.id}` }));
    return arg;
  };

  const handleClick = (arg) => {
    if (multiple) {
      onToggleDocument(arg);
      return;
    }
    if (selectedFile && selectedFile.id === arg.id) {
      setSelectedFile(null);
    } else {
      setSelectedFile(arg);
    }
  };

  return (
    <div>
      {files?.length > 0 ? (
        sortedFiles?.map((item, idx) => (
          <div
            key={item.id ? `${item.id}_${idx}` : idx}
            className="file_directory_right-bar-files"
            onClick={() => handleClick(item)}
          >
            <input
              type="checkbox"
              className="cp"
              aria-label={`Select ${item.contentName}`}
              checked={multiple ? selectedDocuments.some((link) => link.documentId === item.id && link.kind === item.kind) : selectedFile?.id === item.id}
              onChange={() => {}}
            />
            <img src={getFileIcon(item?.contentType, item?.direction, item?.contentName)} alt="file" width="20" height="20" style={{ objectFit: "contain", flexShrink: 0 }} />
            <div className="file_directory_file-info">
              <span className="file_directory_file-name">
                {item.contentName}.{item?.contentType}
              </span>
              {item.breadcrumb && (
                <span className="file_directory_file-breadcrumb">
                  {item.breadcrumb}
                </span>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="file_directory_no-file-found">
          <p>No File found</p>
        </div>
      )}
    </div>
  );
}

export default Files;
