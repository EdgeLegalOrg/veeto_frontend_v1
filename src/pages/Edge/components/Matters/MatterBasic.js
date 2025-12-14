import React, { useEffect, useState, Fragment } from 'react';
import LoadingPage from '../../utils/LoadingPage';
import StatusProgressBar from './StatusProgress/StatusProgressBar';
import MatterProgressbar from './MatterProgress';

const MatterBasic = (props) => {
  const [data, setData] = useState(props.data);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  /******** Enums ********** */
  const [types, setTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [workObtList, setWorkObtList] = useState([]);
  const [status, setStatus] = useState([]);

  const fetchEnums = () => {
    let enumsList = JSON.parse(window.localStorage.getItem('enumList'));

    let subType = [];
    let typeList = [];
    let wl = [];

    if (enumsList) {
      subType =
        enumsList['MatterSubType'] && enumsList['MatterSubType'].length > 0
          ? enumsList['MatterSubType']
          : [];
      setSubTypes(subType);

      typeList =
        enumsList['MatterType'] && enumsList['MatterType'].length > 0
          ? enumsList['MatterType']
          : [];
      setTypes(typeList);

      wl =
        enumsList['WorkObtained'] && enumsList['WorkObtained'].length > 0
          ? enumsList['WorkObtained']
          : [];
      setWorkObtList(wl);
    }
  };

  useEffect(() => {
    fetchEnums();
  }, []);

  useEffect(() => {
    setData(props.data ? props.data : {});
    getStatus(props.data);
  }, [props.data]);

  useEffect(() => {
    setStaffList(props.staffList);
  }, [props.staffList]);

  const getStatus = (arg) => {
    let obj = JSON.parse(window.localStorage.getItem('matterStatus'));

    if (obj && arg.subType && obj[arg.subType]) {
      let st = arg.subType ? obj[arg.subType] : '';

      if (st && st.length) {
        setStatus(st);
      } else {
        setStatus([]);
      }
    }
  };

  return (
    <Fragment>
      <div className='mb-container'>
        <div className='mb-detailContainer'>
          {/* <div className='mb-row'> */}
          {/* <div className='mb-detail'>
              <label>Type</label>
              <p>{findDisplayname(types, data?.type)}</p>
            </div>
            <div className='mb-detail'>
              <label>Sub Type</label>
              <p>{findDisplayname(subTypes, data?.subType)}</p>
            </div> */}
          {/* <div className='mb-detail'>
              <label>Exchange Date</label>
              <p>
                {data.exchangeDate
                  ? moment(data.exchangeDate).format('DD MMMM YYYY')
                  : ''}
              </p>
            </div> */}
          {/* </div> */}
          {/************************ */}
          {/* <div className='mb-row'>
            <div className='mb-detail'>
              <label>Instruction Date</label>
              <p>
                {data.instructionDate
                  ? moment(data.instructionDate).format('DD MMMM YYYY')
                  : ''}
              </p>
            </div>

            <div className='mb-detail'>
              <label>Completion Date</label>
              <p>
                {data.completionDate
                  ? moment(data.completionDate).format('DD MMMM YYYY')
                  : ''}
              </p>
            </div>
            <div className='mb-detail'>
              <label>Not Proceeding Date</label>
              <p>
                {data.notProceedingDate
                  ? moment(data.notProceedingDate).format('DD MMMM YYYY')
                  : ''}
              </p>
            </div>
          </div> */}
          {/************************ */}
          {/************************ */}
          {/* <div className='mb-row'>
            <div className='mb-detail'>
              <label>Settlement Date</label>
              <p>
                {data.settlementDate
                  ? moment(data.settlementDate).format('DD MMMM YYYY')
                  : ''}
              </p>
            </div>

            <div className='mb-detail'>
              <label>Adjustment Date</label>
              <p>
                {data.adjustmentDate
                  ? moment(data.adjustmentDate).format('DD MMMM YYYY')
                  : ''}
              </p>
            </div>
            <div className='mb-detail'>
              <label>Cooling Off Date</label>
              <p>
                {data.coolingOffDate
                  ? moment(data.coolingOffDate).format('DD MMMM YYYY')
                  : ''}
              </p>
            </div>
          </div> */}
          {/************************ */}
          {/* <div className='mb-row'>
            <div className='mb-detail'>
              <label>Status</label>
              <p>{findDisplayname(status, data.status)}</p>
            </div>

            <div className='mb-detail'>
              <label>Work Obtained</label>
              <p>{findDisplayname(workObtList, data.workObtained)}</p>
            </div>

            <div className='mb-detail'>
              <label>Fee Earner</label>
              <p>{findDisplayname(staffList, data?.feeEarnerId)}</p>
            </div>
          </div> */}
          {/************************ */}
          {/* <div className='mb-row'>
            <div className='mb-detail'>
              <label>Responsible Person</label>
              <p>{findDisplayname(staffList, data?.responsiblePersonId)}</p>
            </div>
            <div className='mb-detail'>
              <label>Acting Person</label>
              <p>{findDisplayname(staffList, data?.actingPersonId)}</p>
            </div>
            <div className='mb-detail'>
              <label>Assisting Person</label>
              <p>{findDisplayname(staffList, data?.assistingPersonId)}</p>
            </div>
          </div> */}
          {/************************ */}
          {/* <div className='mb-row'>
            <div className='mb-detail'>
              <label>Referrer</label>
              <p>{data.referrerId}</p>
            </div>
            <div className='mb-detail'>
              <label>Fee Owner</label>
              <p>{findDisplayname(staffList, data?.feeOwnerId)}</p>
            </div>
            <div className='mb-detail'>
              <label>Disbursement</label>
              <p>{data.disbursement}</p>
            </div>
          </div> */}
          {/* <div className='mb-row'>
            <div className='mb-detail'>
              <label>Costsvalue</label>
              <p>{data.costs}</p>
            </div>
            <div className='mb-detail'>
              <label>Our Reference</label>
              <p>{data.ourReference}</p>
            </div>
            <div className='mb-detail'>
              <label>Client Reference</label>
              <p>{data.clientReference}</p>
            </div>
          </div> */}
          {/* <div className='mb-row'>
            <div className='mb-detail'>
              <label>Re</label>
              <p>{data.letterSubject}</p>
            </div>
          </div> */}
          {/* <div className='mb-row'>
            <div className='mb-detail'>
              <label>Comments</label>
              <p>{data.comments}</p>
            </div>
          </div> */}
        </div>
        {/* <div className='mc-bottomSec'>
          <div className='mc-bottom-btns'>
            <button className='custodyAddbtn'>Update</button>
          </div>
        </div> */}
        <div className='mt-progress'>
          <StatusProgressBar data={props.data} statusList={status} />
        </div>
        <div className='mt-progress'>
          <MatterProgressbar data={props.data} />
        </div>
      </div>
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default MatterBasic;
