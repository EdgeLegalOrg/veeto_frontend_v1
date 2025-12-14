import React, { useEffect, useState } from 'react';
import { findDisplayname, formatDateFunc } from '../../../utils/utilFunc';

const ConveyanceDetails = (props) => {
  const [data, setData] = useState({});
  const [lengthType, setLengthType] = useState([]);
  const [conveyanceType, setConveyanceType] = useState([]);

  const fetchEnums = () => {
    let enums = JSON.parse(window.localStorage.getItem('enumList'));

    if (enums) {
      if (enums['LengthType']) {
        setLengthType(enums['LengthType']);
      }

      if (enums['ConveyancingType']) {
        setConveyanceType(enums['ConveyancingType']);
      }
    }
  };

  useEffect(() => {
    fetchEnums();
  }, []);

  useEffect(() => {
    if (props.data) {
      setData(props.data);
    }
  }, [props.data]);

  return (
    <div className='mf-detailSec'>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Purchase Price</label>
        <p className='mf-cont-p'>{data?.purchasePrice}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Deposit</label>
        <p className='mf-cont-p'>{data?.deposit}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Balance</label>
        <p className='mf-cont-p'>{data?.balance}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>GST Component</label>
        <p className='mf-cont-p'>{data?.gstComponent}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Other Consideration</label>
        <p className='mf-cont-p'>{data?.otherConsideration}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Deposit Type</label>
        <p className='mf-cont-p'>{data?.depositType}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Deposit Bond Expiry</label>
        <p className='mf-cont-p'>
          {data?.depositBondExpiry
            ? formatDateFunc(data?.depositBondExpiry)
            : ''}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Length of Contract</label>
        <p className='mf-cont-p'>{data?.lengthOfContract}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Length Type</label>
        <p className='mf-cont-p'>
          {findDisplayname(lengthType, data?.lengthType)}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Other Date For Completion</label>
        <p className='mf-cont-p'>
          {data?.otherDateForCompletion
            ? formatDateFunc(data?.otherDateForCompletion)
            : ''}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Final Date of Notice to Complete</label>
        <p className='mf-cont-p'>
          {data?.finalDateOfNoticeToComplete
            ? formatDateFunc(data?.finalDateOfNoticeToComplete)
            : ''}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>ENOS Id</label>
        <p className='mf-cont-p'>{data?.enosId}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Auction Date</label>
        <p className='mf-cont-p'>
          {data?.auctionDate ? formatDateFunc(data?.auctionDate) : ''}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Conveyancing Type</label>
        <p className='mf-cont-p'>
          {findDisplayname(conveyanceType, data?.conveyancingType)}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className='mf-cont-lb'>Stamp Duty</label>
        <p className='mf-cont-p'>{data?.stampDuty}</p>
      </div>
    </div>
  );
};

export default ConveyanceDetails;
