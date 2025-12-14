import React, { useState, useEffect } from 'react';
import DisplayContent from './DisplayContent';

const PrecedentFolder = (props) => {
  const [data, setData] = useState({});

  useEffect(() => {
    if (props.data) {
      setData(props.data);
    }
  }, [props.data]);

  const ui = () => {
    let keys = Object.keys(data);
    return keys.map((k) => {
      if (data[k].isFolder) {
        return (
          <DisplayContent
            data={data[k]}
            keyName={k}
            selected={props.selected}
            onExpand={props.onExpand}
          />
        );
      } else {
        return <></>;
      }
    });
  };

  return <div>{ui()}</div>;
};

export default PrecedentFolder;
