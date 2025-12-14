import React, { useState, useEffect } from 'react';
import { findDisplayname, formatDateFunc } from '../../../utils/utilFunc';

const BusinessDetails = (props) => {
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
        <label className=''>Purchase Price</label>
        <p className='mf-cont-p'>{data?.purchasePrice}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Deposit</label>
        <p className='mf-cont-p'>{data?.deposit}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Balance</label>
        <p className='mf-cont-p'>{data?.balance}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>GST Component</label>
        <p className='mf-cont-p'>{data?.gstComponent}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Other Consideration</label>
        <p className='mf-cont-p'>{data?.otherConsideration}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Deposit Type</label>
        <p className='mf-cont-p'>{data?.depositType}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Deposit Bond Expiry</label>
        <p className='mf-cont-p'>
          {data?.depositBondExpiry
            ? formatDateFunc(data?.depositBondExpiry)
            : ''}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Length of Contract</label>
        <p className='mf-cont-p'>{data?.lengthOfContract}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Length Type</label>
        <p className='mf-cont-p'>
          {findDisplayname(lengthType, data?.lengthType)}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Other Date For Completion</label>
        <p className='mf-cont-p'>
          {data?.otherDateForCompletion
            ? formatDateFunc(data?.otherDateForCompletion)
            : ''}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Final Date of Notice to Complete</label>
        <p className='mf-cont-p'>
          {data?.finalDateOfNoticeToComplete
            ? formatDateFunc(data?.finalDateOfNoticeToComplete)
            : ''}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Enos Id</label>
        <p className='mf-cont-p'>{data?.enosId}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Auction Date</label>
        <p className='mf-cont-p'>
          {data?.auctionDate ? formatDateFunc(data?.auctionDate) : ''}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Conveyancing Type</label>
        <p className='mf-cont-p'>
          {findDisplayname(conveyanceType, data?.conveyancingType)}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Stamp Duty</label>
        <p className='mf-cont-p'>{data?.stampDuty}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Business Type</label>
        <p className='mf-cont-p'>{data?.businessType}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Business Known As</label>
        <p className='mf-cont-p'>{data?.businessKnownAs}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Registered Business Names</label>
        <p className='mf-cont-p'>{data?.registeredBusinessName}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Registration No</label>
        <p className='mf-cont-p'>{data?.registrationNo}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Good Will</label>
        <p className='mf-cont-p'>{data?.goodWill}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Plant Fittings</label>
        <p className='mf-cont-p'>{data?.plantFittings}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Fixtures</label>
        <p className='mf-cont-p'>{data?.fixtures}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Equipment</label>
        <p className='mf-cont-p'>{data?.equipment}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Area</label>
        <p className='mf-cont-p'>{data?.area}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Period</label>
        <p className='mf-cont-p'>{data?.period}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Key Persons</label>
        <p className='mf-cont-p'>{data?.keyPersons}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Stock In Trade</label>
        <p className='mf-cont-p'>{data?.stockInTrade}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Training Period Before</label>
        <p className='mf-cont-p'>{data?.trainingPeriodBefore}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Training Period After</label>
        <p className='mf-cont-p'>{data?.trainingPeriodAfter}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Telephone No</label>
        <p className='mf-cont-p'>{data?.telephoneNo}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Fax No</label>
        <p className='mf-cont-p'>{data?.faxNo}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Mobile No</label>
        <p className='mf-cont-p'>{data?.mobileNo}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Email Address</label>
        <p className='mf-cont-p'>{data?.emailAddress}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Domain Name</label>
        <p className='mf-cont-p'>{data?.emailAddress}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Warranty Amount</label>
        <p className='mf-cont-p'>{data?.warrantyAmount}</p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Warranty Period From</label>
        <p className='mf-cont-p'>
          {data?.warrantyPeriodFrom
            ? formatDateFunc(data?.warrantyPeriodFrom)
            : ''}
        </p>
      </div>
      <div className='mf-contentDiv'>
        <label className=''>Warranty Period To</label>
        <p className='mf-cont-p'>
          {data?.warrantyPeriodTo ? formatDateFunc(data?.warrantyPeriodTo) : ''}
        </p>
      </div>
    </div>
  );
};

export default BusinessDetails;
