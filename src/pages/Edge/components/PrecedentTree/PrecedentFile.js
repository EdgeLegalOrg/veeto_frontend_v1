import React, { useState, useEffect } from 'react';
import { returnFileIcon } from '../../utils/Icons';

const PrecedentFile = (props) => {
  const [data, setData] = useState({});

  useEffect(() => {
    if (props.data) {
      setData(props.data);
    }
  }, [props.data]);

  return (
    <div className='flx tree-file'>
      <img
        src={returnFileIcon(data.contentType)}
        alt='file'
        className='tree-file-icon'
      />
      <p className='a-link three-dot'>{`${data.contentName}.${data.contentType}`}</p>
    </div>
  );
};

export default PrecedentFile;
