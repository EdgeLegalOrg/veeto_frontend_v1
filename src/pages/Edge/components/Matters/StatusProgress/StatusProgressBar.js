import React, { useEffect, useState } from 'react';

const StatusProgressBar = (props) => {
  const [matterDetails, setMatterDetails] = useState({});
  const [statusList, setStatusList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  let selected = 'COMPLETE';
  let data = [
    {
      display: 'Instructed',
      value: 'INSTRUCTED',
    },
    {
      display: 'In Progress',
      value: 'IN_PROGRESS',
    },
    {
      display: 'Not Proceeding',
      value: 'NOT_PROCEEDING',
    },
    {
      display: 'Complete',
      value: 'COMPLETE',
    },
  ];

  useEffect(() => {
    if (props.data) {
      setMatterDetails(props.data);
      getSelectedIndex(props.data);
    }
  }, [props.data, props.statusList]);

  const getSelectedIndex = (arg) => {
    let status = arg?.status ? arg?.status : '';
    let st = props.statusList;
    if (status && st && st.length > 0) {
      let index = -1;
      for (let a in st) {
        if (st[a] && st[a].value === status) {
          index = a;
          break;
        }
      }

      if (index > -1) {
        setSelectedIndex(parseInt(index));
      }
      setTimeout(() => {
        setStatusList(st);
      }, 10);
    }
  };

  const getStyles = (arg, i) => {
    let len = props?.statusList?.length;
    let rval = {};

    rval.width = `${100 / len}%`;

    if (selectedIndex > -1 && i <= selectedIndex) {
      if (selectedIndex === len - 1) {
        rval.background = '#d1f1b8';
      } else {
        rval.background = '#e1f6cf';
      }
      rval.color = '#353f43';
    }

    if (matterDetails.status && arg.value === matterDetails.status) {
      rval.fontWeight = '600';
      if (i !== len - 1) {
        rval.borderRight = '5px solid #0d9540';
      }
    }

    return rval;
  };

  return (
    <div className='full'>
      <div className='pg-container'>
        <div className='pg-label'>
          <p className='mb-0'>Matter Status</p>
        </div>
        <div className='pg-bars'>
          {statusList.map((d, i) => (
            <div key={d.value + i} className='pg-tab' style={getStyles(d, i)}>
              <p className='mb-0 text-dark'>{d.display}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusProgressBar;
