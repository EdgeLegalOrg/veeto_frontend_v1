import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import AddMarriageDefacto from "./AddMarriageDefacto";
import EditMarriageDefacto from "./EditMarriageDefacto";

const initialState = {
  actingOnBehalf: "",
  matterInOtherCourt: "",
  useClientAddress: "",
  hearingPlace: "",
  courtName: "",
  proceedingsDescription: "",
  proceedingsAct: "",
};

const MarriageDefactoDetail = (props) => {
  const { setExtraButtons } = props;
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [add, setAdd] = useState(false);

  useEffect(() => {
    if (props.data) {
      setData(props?.data?.marriageDefacto);
    }
  }, [props.data]);

  const handleEdit = () => {
    setEdit(true);
  };

  const handleAdd = () => {
    setAdd(true);
  };

  const displayBtn = () => {
    if (data) {
      return (
        <Button className="mx-4" onClick={handleEdit} color="success">
          Update
        </Button>
      );
    } else {
      return (
        <Button className="d-flex mx-4" onClick={handleAdd} color="success">
          <span className="plusdiv">+</span>Add
        </Button>
      );
    }
  };

  const displayContent = () => {
    if (data) {
      return (
        <>
          <div className="mf-contentDiv">
            <label className="mf-cont-lb">Acting On Behalf</label>
            <p className="mf-cont-p">{data?.actingOnBehalf}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="mf-cont-lb">Matter In Other Court</label>
            <p className="mf-cont-p">{data?.matterInOtherCourt}</p>
          </div>
          {/* <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Use Client Address</label>
            <p className='mf-cont-p'>{data?.useClientAddress}</p>
          </div> */}
          <div className="mf-contentDiv">
            <label className="mf-cont-lb">Place of hearing</label>
            <p className="mf-cont-p">{data?.hearingPlace}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="mf-cont-lb">Name of Court</label>
            <p className="mf-cont-p">{data?.courtName}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="mf-cont-lb">Proceedings Act</label>
            <p className="mf-cont-p">{data?.proceedingsAct}</p>
          </div>
          <div className="mf-contentDiv">
            <label className="mf-cont-lb">Describe proceeding</label>
            <p className="mf-cont-p">{data?.proceedingsDescription}</p>
          </div>
        </>
      );
    } else {
      return <></>;
    }
  };
  return (
    <div>
      {data ? (
        <EditMarriageDefacto
          close={() => setEdit(false)}
          matterId={props?.data?.id}
          refresh={props.refresh}
          data={data}
          setExtraButtons={setExtraButtons}
          isArchived={props.isArchived}
        />
      ) : (
        <AddMarriageDefacto
          close={() => setAdd(false)}
          matterId={props?.data?.id}
          refresh={props.refresh}
          setExtraButtons={setExtraButtons}
          isArchived={props.isArchived}
        />
      )}

      {/* <div className="mx-2">
        <div className="d-flex align-items-center py-2 mx-2">
          <h5 className="mb-0">Marriage Defacto</h5>
          {displayBtn()}
        </div>

        <div className="mf-detailSec">{displayContent()}</div>

        {edit && (
          <EditFamilyForm
            close={() => setEdit(false)}
            matterId={props?.data?.id}
            refresh={props.refresh}
            data={data}
          />
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
              Add Marriage Defacto Separation Details
            </ModalHeader>
            <ModalBody>
              <AddMarriageDefacto
                close={() => setAdd(false)}
                matterId={props?.data?.id}
                refresh={props.refresh}
              />
            </ModalBody>
          </Modal>
        )}
      </div> */}
    </div>
  );
};

export default MarriageDefactoDetail;
