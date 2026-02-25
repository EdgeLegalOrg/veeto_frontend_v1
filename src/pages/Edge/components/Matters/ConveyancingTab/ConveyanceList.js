import React, { useState, useEffect } from 'react';
import LoadingPage from '../../../utils/LoadingPage';
import AddConveyancing from './AddConveyancing';
import EditConveyancing from './EditConveyancing';
import ConveyanceDetails from './ConveyanceDetails';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';

const ConveyanceList = (props) => {
  const { setExtraButtons } = props;
  const [data, setData] = useState(null);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.data) {
      setData(props?.data?.conveyance);
    }
  }, [props.data]);

  const checkData = () => {
    if (data) {
      return <Button onClick={() => setEdit(true)}>Update</Button>;
    } else {
      return (
        <Button className='d-flex' onClick={() => setAdd(true)}>
          <span className='plusdiv'>+</span>Add
        </Button>
      );
    }
  };

  const showDetails = () => {
    if (data) {
      return <ConveyanceDetails data={data} />;
    } else {
      return <></>;
    }
  };

  return (
    <div>
      <div className='mx-2'>{/* {checkData()} */}</div>

      {/* {showDetails()} */}

      {data ? (
        <EditConveyancing
          refresh={props.refresh}
          close={() => setEdit(false)}
          matterId={props?.data?.id}
          matter={props?.data}
          data={data}
          setExtraButtons={setExtraButtons}
        />
      ) : (
        <AddConveyancing
          refresh={props.refresh}
          close={() => setAdd(false)}
          matterId={props?.data?.id}
          matter={props?.data}
          setExtraButtons={setExtraButtons}
        />
      )}

      {/* {add && (
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
            Add Conveyancing Details
          </ModalHeader>
          <ModalBody>
            <AddConveyancing
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
          backdrop="static"
          scrollable={true}
          size="xl"
          centered
        >
          <ModalHeader
            toggle={() => setEdit(false)}
            className="bg-light p-3"
          >
            Edit Conveyancing Details
          </ModalHeader>
          <ModalBody>
            <EditConveyancing
              data={data}
              refresh={props.refresh}
              close={() => setEdit(false)}
              matterId={props?.data?.id}
              matter={props?.data}
            />
          </ModalBody>
        </Modal>
      )} */}

      {loading && <LoadingPage />}
    </div>
  );
};

export default ConveyanceList;
