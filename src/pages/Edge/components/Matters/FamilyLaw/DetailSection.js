import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import AddFamilyLaw from './AddFamilyLaw';
import EditFamilyForm from './UpdateFamilyLaw';
import { formatDateFunc } from 'pages/Edge/utils/utilFunc';

const initialState = {
  coHabitationDate: '',
  coHabitationMonth: '',
  coHabitationYear: '',
  marriageDate: '',
  marriagePlace: '',
  marriageState: '',
  marriageCountry: '',
  certificateTitle: '',
  finalSeparationDate: '',
  finalSeparationMonth: '',
  finalSeparationYear: '',
  divorceDate: '',
  divorceCity: '',
  divorceCountry: '',
};

const DetailSection = (props) => {
  const { setExtraButtons } = props;
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [add, setAdd] = useState(false);

  useEffect(() => {
    if (props.data) {
      setData(props?.data?.familyLaw);
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
        <Button color='success' onClick={handleEdit} className='mx-4'>
          Update
        </Button>
      );
    } else {
      return (
        <Button color='success' onClick={handleAdd} className='d-flex mx-4'>
          <span className='plusdiv'>+</span>Add
        </Button>
      );
    }
  };

  const displayContent = () => {
    if (data) {
      return (
        <>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Co-Habitation Date</label>
            <p className='mf-cont-p'>
              {data?.coHabitationDate
                ? formatDateFunc(data?.coHabitationDate)
                : ''}
            </p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Co-Habitation Month</label>
            <p className='mf-cont-p'>{data?.coHabitationMonth}</p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Co-Habitation Year</label>
            <p className='mf-cont-p'>{data?.coHabitationYear}</p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Marriage Date</label>
            <p className='mf-cont-p'>
              {data?.marriageDate ? formatDateFunc(data?.marriageDate) : ''}
            </p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Marriage Place</label>
            <p className='mf-cont-p'>{data?.marriagePlace}</p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Marriage State</label>
            <p className='mf-cont-p'>{data?.marriageState}</p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Marriage Country</label>
            <p className='mf-cont-p'>{data?.marriageCountry}</p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Certificate Title</label>
            <p className='mf-cont-p'>{data?.certificateTitle}</p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Final Separation Date</label>
            <p className='mf-cont-p'>
              {data?.finalSeparationDate
                ? formatDateFunc(data?.finalSeparationDate)
                : ''}
            </p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Final Separation Month</label>
            <p className='mf-cont-p'>{data?.finalSeparationMonth}</p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Final Separation Year</label>
            <p className='mf-cont-p'>{data?.finalSeparationYear}</p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Divorce Date</label>
            <p className='mf-cont-p'>
              {data?.divorceDate ? formatDateFunc(data?.divorceDate) : ''}
            </p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Divorce City</label>
            <p className='mf-cont-p'>{data?.divorceCity}</p>
          </div>
          <div className='mf-contentDiv'>
            <label className='mf-cont-lb'>Divorce Country</label>
            <p className='mf-cont-p'>{data?.divorceCountry}</p>
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
        <EditFamilyForm
          close={() => setEdit(false)}
          matterId={props?.data?.id}
          refresh={props.refresh}
          data={data}
          setExtraButtons={setExtraButtons}
        />
      ) : (
        <AddFamilyLaw
          close={() => setAdd(false)}
          matterId={props?.data?.id}
          refresh={props.refresh}
          setExtraButtons={setExtraButtons}
        />
      )}

      {/* <div className="mx-2">
        <div className="d-flex align-items-center py-2 mx-2">
          <h5 className="mb-0">Family Law</h5>
          {displayBtn()}
        </div>
        <div className="mf-detailSec">{displayContent()}</div>
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
              Edit Family Law Details
            </ModalHeader>
            <ModalBody>
              <EditFamilyForm
                close={() => setEdit(false)}
                matterId={props?.data?.id}
                refresh={props.refresh}
                data={data}
              />
            </ModalBody>
          </Modal>
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
              Add Family Law Details
            </ModalHeader>
            <ModalBody>
              <AddFamilyLaw
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

export default DetailSection;
