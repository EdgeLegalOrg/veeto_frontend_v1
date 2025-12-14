import React, { useState, useEffect } from 'react';
import { returnFileIcon } from '../../utils/Icons';

const PrecendentFileContainer = (props) => {
  const [files, setFiles] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    if (props.data) {
      setFiles(props.data.files);
      setFiltered(props.data.files);
    }
  }, [props.data]);

  const handleSearch = (e) => {
    let val = e.target.value;

    let newFiltered = files.filter(
      (f) =>
        f.contentName &&
        f.contentName.toLowerCase().includes(val?.toLowerCase())
    );

    setFiltered(newFiltered);
  };

  const showResults = () => {
    if (files && files?.length > 0) {
      return (
        <div className='file-container'>
          {filtered.map((f, i) => (
            <div className='flx tree-file' key={`${f.contentName}_${i}`}>
              <img
                src={returnFileIcon(f.contentType)}
                alt='file'
                className='tree-file-icon'
              />
              <p className='a-link three-dot'>{`${f.contentName}.${f.contentType}`}</p>
            </div>
          ))}
        </div>
      );
    } else {
      return <p className='no-file'>This Folder is empty</p>;
    }
  };

  return (
    <div className='pf-container'>
      <div className='pf-searchDiv'>
        <input
          type='text'
          placeholder='Search files'
          className='pt-search'
          onChange={handleSearch}
          disabled={!(files && files?.length > 0)}
        />
      </div>
      {showResults()}
    </div>
  );
};

export default PrecendentFileContainer;
