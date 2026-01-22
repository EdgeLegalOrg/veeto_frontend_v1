import React, { useEffect, useState } from 'react';
import { findDisplayname, formatDateFunc } from '../../../utils/utilFunc';

const ViewPaymentDetails = (props) => {
  const [data, setData] = useState(props.data);
  const [paymentType, setPaymentType] = useState([]);
  const [paymentSubType, setPaymentSubType] = useState([]);

  useEffect(() => {
    fetchEnums();
  }, []);

  useEffect(() => {
    if (props.data) {
      setData(props.data);
    }
  }, [props.data]);

  const fetchEnums = () => {
    const enums = JSON.parse(window.localStorage.getItem('enumList'));

    if (enums) {
      const type = enums['PaymentType'] || [];
      const subType = enums['PaymentSubType'] || [];

      setPaymentType(type);
      setPaymentSubType(subType);
    }
  };

  return (
    <div>
      <div className='px-4 pt-3 pb-5'>
        <div className='deposit-header  d-flex align-items-center row mb-3'>
          <div className='deposit-label-info col-md-4'>
            <label className='deposit-label text-muted mb-1'>
              Payment Number
            </label>
            <p className='deposit-info fs-15'>
              {/*data.paymentNumber ? `# ${data.paymentNumber}` : ''*/}
			  {data.paymentNumStr ? `# ${data.paymentNumStr}` : ''}
            </p>
          </div>
          <div className='deposit-label-info col-md-4'>
            <label className='deposit-label text-muted mb-1'>
              Payment Date
            </label>
            <p className='deposit-info fs-15'>
              {formatDateFunc(data.paymentDate)}
            </p>
          </div>
          <div className='deposit-label-info col-md-4'>
            <label className='deposit-label text-muted mb-1 lh-1'>Amount</label>
            <p className='deposit-info fs-15'>{`$${data.amount || '0'}`}</p>
          </div>
        </div>
        <div className='d-flex align-items-center row mb-3'>
          <div className='deposit-label-info col-md-4'>
            <label className='deposit-label text-muted mb-1 lh-1'>
              Payment Type
            </label>
            <p className='deposit-info fs-15'>
              {findDisplayname(paymentType, data.paymentType)}
            </p>
          </div>
          <div className='deposit-label-info col-md-4'>
            <label className='deposit-label text-muted mb-1 lh-1'>
              Payment Sub-type
            </label>
            <p className='deposit-info fs-15'>
              {findDisplayname(paymentSubType, data.paymentSubType)}
            </p>
          </div>
          <div className='deposit-label-info col-md-4'>
            <label className='deposit-label text-muted mb-1 lh-1'>
              Account Name.
            </label>
            <p className='deposit-info fs-15'>{data.accountName}</p>
          </div>
        </div>
        <div className='d-flex align-items-center row mb-3'>
          <div className='deposit-label-info col-md-4'>
            <label className='deposit-label text-muted mb-1 lh-1'>
              Account No.
            </label>
            <p className='deposit-info fs-15'>{data.accountNumber}</p>
          </div>
          <div className='deposit-label-info col-md-4'>
            <label className='deposit-label text-muted mb-1 lh-1'>
              Cheque Number
            </label>
            <p className='deposit-info fs-15'>{data.chequeNumber}</p>
          </div>
          <div className='deposit-label-info col-md-4'>
            <label className='deposit-label text-muted mb-1 lh-1'>Status</label>
            <p className='deposit-info fs-15'>{data.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPaymentDetails;
