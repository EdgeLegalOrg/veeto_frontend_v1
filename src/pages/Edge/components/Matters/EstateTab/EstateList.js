import React, { useState, useEffect } from 'react';
import LoadingPage from '../../../utils/LoadingPage';
import AddEstate from './AddEstate';
import EditEState from './EditEstate';

const EstateList = (props) => {
  const { setExtraButtons } = props;
  const [data, setData] = useState(null);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.data) {
      if (props.data.estate) {
        setData(props.data.estate);
      }
    }
  }, [props.data]);

  const checkData = () => {
    if (data) {
      return (
        <button className='custodyAddbtn' onClick={() => setEdit(true)}>
          Update
        </button>
      );
    } else {
      return (
        <button className='custodyAddbtn' onClick={() => setAdd(true)}>
          <span className='plusdiv'>+</span>Add
        </button>
      );
    }
  };

  return (
    <div>
      <div className='mx-2'>
        <div className='d-flex align-items-center justify-content-between py-2 mx-2'>
          <h5 className='mb-0'>Estate</h5>
        </div>
      </div>

      {loading && <LoadingPage />}

      {data ? (
        <EditEState
          refresh={props.refresh}
          close={() => setEdit(false)}
          matterId={props?.data?.id}
          data={data}
          setExtraButtons={setExtraButtons}
        />
      ) : (
        <AddEstate
          refresh={props.refresh}
          close={() => setAdd(false)}
          matterId={props?.data?.id}
          setExtraButtons={setExtraButtons}
        />
      )}

      {/* <div className="mc-header-btns">
        <p className="mc-heading">Estate</p>
        {checkData()}
      </div> */}
      {/* {data ? (
        <div className="mf-detailSec">
          <div className="mf-contentDiv">
            <label className="">Deceased Name</label>
            <p className="mf-cont-p">{data?.deceasedName}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Deceased Name On Death Certificate</label>
            <p className="mf-cont-p">{data?.deceasedNameOnDeathCertificate}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Deceased Date Of Birth</label>
            <p className="mf-cont-p">
              {data?.deceasedDateOfBirth
                ? moment(data?.deceasedDateOfBirth).format("YYYY-MM-DD")
                : ""}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Deceased Date Of Death</label>
            <p className="mf-cont-p">
              {data?.deceasedDateOfDeath
                ? moment(data?.deceasedDateOfDeath).format("YYYY-MM-DD")
                : ""}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Deceased Age At Death</label>
            <p className="mf-cont-p">{data?.deceasedAgeAtDeath}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Date Of Will</label>
            <p className="mf-cont-p">
              {data?.dateOfWill
                ? moment(data?.dateOfWill).format("YYYY-MM-DD")
                : ""}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Pages In Will</label>
            <p className="mf-cont-p">{data?.pagesInWill}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Date Of 1st Codicil</label>
            <p className="mf-cont-p">
              {data?.dateOf1stCodicil
                ? moment(data?.dateOf1stCodicil).format("YYYY-MM-DD")
                : ""}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Date Of 2nd Codicil</label>
            <p className="mf-cont-p">
              {data?.dateOf2ndCodicil
                ? moment(data?.dateOf2ndCodicil).format("YYYY-MM-DD")
                : ""}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Date Of 3rd Codicil</label>
            <p className="mf-cont-p">
              {data?.dateOf3rdCodicil
                ? moment(data?.dateOf3rdCodicil).format("YYYY-MM-DD")
                : ""}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Number Of Codicils</label>
            <p className="mf-cont-p">{data?.numberOfCodicils}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Witness 1 Name And Occupation</label>
            <p className="mf-cont-p">{data?.witness1NameAndOccupation}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Witness 2 Name And Occupation</label>
            <p className="mf-cont-p">{data?.witness2NameAndOccupation}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Deceased Executor</label>
            <p className="mf-cont-p">{data?.deceasedExecutor}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Relationship Of Executor 1 To Deceased</label>
            <p className="mf-cont-p">
              {data?.relationshipOfExecutor1ToDeceased}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Relationship Of Executor 2 To Deceased</label>
            <p className="mf-cont-p">
              {data?.relationshipOfExecutor2ToDeceased}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Relationship Of Executor 3 To Deceased</label>
            <p className="mf-cont-p">
              {data?.relationshipOfExecutor3ToDeceased}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Case Number</label>
            <p className="mf-cont-p">{data?.caseNumber}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Date Of Intended Application</label>
            <p className="mf-cont-p">
              {data?.dateOfIntendedApplication
                ? moment(data?.dateOfIntendedApplication).format("YYYY-MM-DD")
                : ""}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Date Of Advertisement</label>
            <p className="mf-cont-p">
              {data?.dateOfAdd
                ? moment(data?.dateOfAdd).format("YYYY-MM-DD")
                : ""}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Date Of Grant</label>
            <p className="mf-cont-p">
              {data?.dateOfGrant
                ? moment(data?.dateOfGrant).format("YYYY-MM-DD")
                : ""}
            </p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Gross Value Of Estate</label>
            <p className="mf-cont-p">{data?.grossValueOfEstate}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Net Value Of Estate</label>
            <p className="mf-cont-p">{data?.netValueOfEstate}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="">Estate Name</label>
            <p className="mf-cont-p">{data?.estateName}</p>
          </div>
        </div>
      ) : (
        <></>
      )}
      {add && (
        <AddEstate
          refresh={props.refresh}
          close={() => setAdd(false)}
          matterId={props?.data?.id}
        />
      )}
      {edit && (
        <EditEState
          refresh={props.refresh}
          close={() => setEdit(false)}
          matterId={props?.data?.id}
          data={data}
        />
      )} */}
    </div>
  );
};

export default EstateList;
