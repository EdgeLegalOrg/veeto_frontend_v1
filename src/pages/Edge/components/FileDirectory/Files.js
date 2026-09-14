import React, { useEffect, useState } from "react";
import { getFileIcon } from "./helperFunction";

function Files(props) {
  const { files, selectedFile, setSelectedFile } = props;
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
    arg.sort((a, b) => {
      return a?.contentName?.localeCompare(b?.contentName);
    });
    return arg;
  };

  const handleClick = (arg) => {
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
              checked={selectedFile?.id === item.id}
              onChange={() => {}}
            />
            <img src={getFileIcon(item?.contentType)} alt="file" />
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
