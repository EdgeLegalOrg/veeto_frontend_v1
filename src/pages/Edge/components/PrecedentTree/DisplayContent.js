import React, { useEffect, useState } from 'react';
// import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { FcFolder } from 'react-icons/fc';
import { findDisplayname } from '../../utils/utilFunc';
// import PrecedentFile from './PrecedentFile';
import PrecedentFolder from './PrecedentFolder';

const DisplayContent = (props) => {
  const [expand, setExpand] = useState(false);
  const { data, keyName, isFile } = props;

  const [enumList, setEnumList] = useState([]);

  const fetchEnum = () => {
    let all = [];

    let enums = JSON.parse(window.localStorage.getItem('enumList'));

    if (enums) {
      if (enums['MatterType'] && enums['MatterType']?.length > 0) {
        all = all.concat(enums['MatterType']);
      }
      if (enums['MatterSubType'] && enums['MatterSubType']?.length > 0) {
        all = all.concat(enums['MatterSubType']);
      }
      if (enums['DocumentType'] && enums['DocumentType']?.length > 0) {
        all = all.concat(enums['DocumentType']);
      }

      setEnumList(all);
    }
  };

  useEffect(() => {
    fetchEnum();
  }, []);

  useEffect(() => {
    if (props.selected && props.selected.folder) {
      if (
        props.selected.folder.parent === data.uid ||
        props.selected.folder.child === data.uid
      ) {
        setExpand(true);
      } else {
        setExpand(false);
      }
    }
  }, [props.selected]);

  const check = () => {
    if (props.selected && props.selected.folder) {
      if (
        props.selected.folder.parent === data.uid ||
        props.selected.folder.child === data.uid
      ) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  };

  const handleExpand = () => {
    let c = check();

    setExpand(c);

    if (props.onExpand) {
      props.onExpand(data);
    }
  };

  const clsWrpr = () => {
    let cls = ['flx tree-folder-content'];

    let c = check();

    if (expand && c) {
      cls.push('highlight');
    }

    return cls.join(' ');
  };

  const displayFolder = () => {
    return (
      <div className='tree-folder'>
        <div className={clsWrpr()} onClick={handleExpand}>
          <FcFolder size={20} />
          <p className='w-80p'>{findDisplayname(enumList, keyName)} </p>{' '}
        </div>
        <div className={expand ? 'display-content' : 'hide'}>
          <PrecedentFolder
            data={data}
            onExpand={props.onExpand}
            selected={props.selected}
          />
        </div>
      </div>
    );
  };

  const ui = () => {
    return displayFolder();
  };

  return <div>{ui()}</div>;
};

export default DisplayContent;
