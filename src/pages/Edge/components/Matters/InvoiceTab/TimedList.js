import React, { useEffect, useState } from 'react';
import CustomSideDrawer from '../../customComponents/CustomSideDrawer';
import { formatDateFunc } from 'pages/Edge/utils/utilFunc';

const TimedList = (props) => {
  const [timedList, setTimedList] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (props.timedList && props.active) {
      sortList(props.timedList);
    }
  }, [props.timedList, props.active]);

  useEffect(() => {
    if (props.formData && props.formData.timeBillingList && props.active) {
      setSelected(props?.formData?.timeBillingList);
    }
  }, [props.formData, props.active]);

  const sortList = (arg) => {
    let newArray = arg.sort(
      (a, b) => new Date(a.billingDate) - new Date(b.billingDate)
    );

    setTimedList(newArray);
  };

  const isSelected = (arg) => {
    for (let a in selected) {
      if (selected[a] && selected[a].id === arg.id) {
        return true;
      }
    }

    return false;
  };

  const handleClose = () => {
    if (props.close) {
      props.close();
    }
  };

  const handleSelect = (val) => {
    const checked = isSelected(val);
    let arr = [];
    if (!checked) {
      arr = [...selected, val];
    } else {
      arr = selected.filter((c) => val.id != c.id);
    }

    setSelected(arr);

    setTimeout(() => {
      updateValue(arr);
    }, 10);
  };

  const updateValue = (arg) => {
    if (props.onChange) {
      props.onChange('timeBillingList', arg);
    }
  };

  const renderTimedList = (timed) => {
    let shouldShow = !isSelected(timed);
    if (shouldShow) {
      return (
        <div
          className='bt-container'
          key={timed.id}
          onClick={() => handleSelect(timed)}
        >
          {/* <input
            type='checkbox'
            style={{ marginTop: '4px' }}
            checked={isSelected(timed)}
          /> */}
          <div className='border-bottom p-2'>
            <label>Billing Date</label>
            <p className='mb-0'>{formatDateFunc(timed.billingDate)}</p>
          </div>
          <div className='border-bottom p-2'>
            <label>Units</label>
            <p className='mb-0'>{timed.units}</p>
          </div>
          <div className='border-bottom p-2'>
            <label>Description</label>
            <p className='mb-0'>{timed.description}</p>
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  };

  const body = () => {
    return (
      <div className='bt-container px-2'>
        <div className='bt-list-container'>
          {timedList.map((timed) => renderTimedList(timed))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <CustomSideDrawer
        active={props.active}
        onClose={handleClose}
        heading={'Time Billing'}
        body={body}
        doneBtn={true}
      />
    </div>
  );
};

export default TimedList;
