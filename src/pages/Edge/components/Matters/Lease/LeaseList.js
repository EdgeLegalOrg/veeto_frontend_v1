import React, { useState, useEffect } from 'react';
import AddLease from './AddLease';
import EditLease from './EditLease';
import { Button } from 'reactstrap';

const LeaseList = (props) => {
  const { setExtraButtons } = props;
  const [data, setData] = useState(null);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (props.data) {
      if (props.data.leaseList && props.data.leaseList.length > 0) {
        setData(props.data.leaseList[0]);
      }
    }
  }, [props.data]);

  const checkData = () => {
    if (data) {
      return (
        <Button
          className='d-flex mx-4'
          color='success'
          onClick={() => setEdit(true)}
        >
          Update
        </Button>
      );
    } else {
      return (
        <Button
          className='d-flex mx-4'
          color='success'
          onClick={() => setAdd(true)}
        >
          <span className='plusdiv'>+</span>Add
        </Button>
      );
    }
  };

  return (
    <div>
      <div className='mx-2'>
        <div className='d-flex align-items-center justify-content-between py-2 mx-2'>
          <h5 className='mb-0'>Lease</h5>
        </div>
      </div>

      {data ? (
        <EditLease
          refresh={props.refresh}
          close={() => setEdit(false)}
          matterId={props?.data?.id}
          data={data}
          setExtraButtons={setExtraButtons}
          isArchived={props.isArchived}
        />
      ) : (
        <AddLease
          refresh={props.refresh}
          close={() => setAdd(false)}
          matterId={props?.data?.id}
          setExtraButtons={setExtraButtons}
          isArchived={props.isArchived}
        />
      )}

      {/* <div className="mx-2">
        <div className="d-flex align-items-center py-2 mx-2">
          <h5 className="mb-0">Lease</h5>
          {checkData()}
        </div>
        <div className="border border-top mt-2"></div>
        {data && (
          <div className="mf-detailSec">
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Term</label>
              <p className="mf-cont-p">{data?.term}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Rent</label>
              <p className="mf-cont-p">{data?.rent}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Commencement Date</label>
              <p className="mf-cont-p">
                {data?.commencementDate
                  ? moment(data?.commencementDate).format("YYYY-MM-DD")
                  : ""}
              </p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Termination Date</label>
              <p className="mf-cont-p">
                {data?.terminationDate
                  ? moment(data?.terminationDate).format("YYYY-MM-DD")
                  : ""}
              </p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Rent Commencement Date</label>
              <p className="mf-cont-p">
                {data?.rentCommencementDate
                  ? moment(data?.rentCommencementDate).format("YYYY-MM-DD")
                  : ""}
              </p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Periods</label>
              <p className="mf-cont-p">{data?.opt}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Renewal Clause</label>
              <p className="mf-cont-p">{data?.renewalClause}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Car Spaces</label>
              <p className="mf-cont-p">{data?.carSpaces}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Option Terms</label>
              <p className="mf-cont-p">{data?.optionTerms}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Premise Address</label>
              <p className="mf-cont-p">{data?.premiseAddress}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Building Address</label>
              <p className="mf-cont-p">{data?.buildingAddress}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Complex Address</label>
              <p className="mf-cont-p">{data?.complexAddress}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Premise Area</label>
              <p className="mf-cont-p">{data?.premiseArea}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Building Area</label>
              <p className="mf-cont-p">{data?.buildingArea}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Complex Area</label>
              <p className="mf-cont-p">{data?.complexArea}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Bank Guarantee</label>
              <p className="mf-cont-p">{data?.bankGuarantee}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Permitted Use</label>
              <p className="mf-cont-p">{data?.permittedUse}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">State Law</label>
              <p className="mf-cont-p">{data?.stateLaw}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Outgoing Payable</label>
              <p className="mf-cont-p">{data?.outgoingPayable}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Outgoing EST</label>
              <p className="mf-cont-p">{data?.outgoingEST}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Outgoing Commencement</label>
              <p className="mf-cont-p">{data?.outgoingCommencement}</p>
            </div>
            <div className="mf-contentDiv">
              <label className="mf-cont-lb">Trading Hours</label>
              <p className="mf-cont-p">{data?.tradingHours}</p>
            </div>
          </div>
        )}
        {add && (
          <Modal
            isOpen={add}
            toggle={() => setAdd(false)}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader
              toggle={() => setAdd(false)}
              className="bg-light p-3"
            >
              Add Lease Details
            </ModalHeader>
            <ModalBody>
              <AddLease
                refresh={props.refresh}
                close={() => setAdd(false)}
                matterId={props?.data?.id}
              />
            </ModalBody>
          </Modal>
        )}
        {edit && (
          <Modal
            isOpen={edit}
            toggle={() => setEdit(false)}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader
              toggle={() => setEdit(false)}
              className="bg-light p-3"
            >
              Edit Lease Details
            </ModalHeader>
            <ModalBody>
              <EditLease
                refresh={props.refresh}
                close={() => setEdit(false)}
                matterId={props?.data?.id}
                data={data}
              />
            </ModalBody>
          </Modal>
        )}
        {loading && <LoadingPage />}
      </div> */}
    </div>
  );
};

export default LeaseList;
