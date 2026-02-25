import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import LoadingPage from "../../../utils/LoadingPage";
import AddBusiness from "./AddBusiness";
import BusinessDetails from "./BusinessDetails";
import EditBusiness from "./EditBusiness";

const BusinessTab = (props) => {
  const { setExtraButtons } = props;
  const [data, setData] = useState(null);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.data) {
      setData(props.data?.business);
    }
  }, [props.data]);

  const checkData = () => {
    if (data) {
      return (
        <Button
          color='success'
          onClick={() => setEdit(true)}
          className='d-flex mx-4'
        >
          Save
        </Button>
      );
    } else {
      return (
        <Button
          color='success'
          onClick={() => setAdd(true)}
          className='d-flex mx-4'
        >
          <span className='plusdiv'>+</span>Add
        </Button>
      );
    }
  };

  const showDetails = () => {
    if (data) {
      return <BusinessDetails data={data} />;
    } else {
      return <></>;
    }
  };

  return (
    <div>
      <div className='mx-2'>{/* {checkData()} */}</div>
      {/* {showDetails()} */}
      {data ? (
        <EditBusiness
          data={data}
          refresh={props.refresh}
          close={() => setEdit(false)}
          matterId={props?.data?.id}
          matter={props?.data}
          setExtraButtons={setExtraButtons}
        />
      ) : (
        <AddBusiness
          refresh={props.refresh}
          close={() => setAdd(false)}
          matterId={props?.data?.id}
          matter={props?.data}
          setExtraButtons={setExtraButtons}
        />
      )}
      {add && (
        <Modal
          isOpen={add}
          toggle={() => setAdd(false)}
          backdrop='static'
          scrollable={true}
          size='xl'
          centered
        >
          <ModalHeader toggle={() => setAdd(false)} className='bg-light p-3'>
            Business Sale / Purchase
          </ModalHeader>
          <ModalBody>
            <AddBusiness
              refresh={props.refresh}
              close={() => setAdd(false)}
              matterId={props?.data?.id}
              matter={props?.data}
            />
          </ModalBody>
        </Modal>
      )}
      {edit && (
        <Modal
          isOpen={edit}
          toggle={() => setEdit(false)}
          backdrop='static'
          scrollable={true}
          size='lg'
          centered
        >
          <ModalHeader toggle={() => setEdit(false)} className='bg-light p-3'>
            Business Sale / Purchase
          </ModalHeader>
          <ModalBody>
            <EditBusiness
              data={data}
              refresh={props.refresh}
              close={() => setEdit(false)}
              matterId={props?.data?.id}
              matter={props?.data}
            />
          </ModalBody>
        </Modal>
      )}
      {loading && <LoadingPage />}
    </div>
  );
};

export default BusinessTab;
