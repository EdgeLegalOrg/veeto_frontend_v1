import React, { useEffect, useState } from 'react';
import { getFileIcon } from './helperFunction';

function Files(props) {
  const { files, selectedFile, setSelectedFile } = props;
  const [sortedFiles, setSortedFiles] = useState([]);

  useEffect(() => {
    if (files?.length) {
      const sorted = sortFiles(files) || [];

      setSortedFiles(sorted);
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
            key={idx}
            className='file_directory_right-bar-files'
            onClick={() => handleClick(item)}
          >
            <input
              type='checkbox'
              className='cp'
              checked={selectedFile?.id === item.id}
            />
            <img src={getFileIcon(item?.contentType)} alt='word' />
            {item.contentName}.{item?.contentType}
          </div>
        ))
      ) : (
        <div className='file_directory_no-file-found'>
          <p>No File in this Folder</p>
        </div>
      )}
    </div>
  );
}

export default Files;
