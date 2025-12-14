import React, { useState, useEffect, Fragment } from 'react';
import '../../../stylesheets/contacts.css';
import { AlertPopup } from '../../customComponents/CustomComponents';
import { formatDateFunc } from '../../../utils/utilFunc';
import {
  TextInputField,
  SearchableDropDown,
} from 'pages/Edge/components/InputField';

const DetailSection = (props) => {
  const { refresh, memberDetails, setMemberDetails, submitted } = props;
  const [boolVal, setBoolVal] = useState(false);
  const [fieldLength, setFieldLength] = useState({});
  const [requiredFields, setRequiredFields] = useState([]);

  const fetchFieldLength = () => {
    let allLengths = {};

    JSON.parse(
      window.localStorage.getItem('metaData')
    )?.staff_member?.fields?.map((f) => {
      allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
    });
    setFieldLength(allLengths);
  };

  const fetchRequired = () => {
    let arr = [];

    JSON.parse(
      window.localStorage.getItem('metaData')
    )?.staff_member?.fields?.map((f) => {
      if (f.mandatory) {
        arr.push(f.fieldName);
      }
    });
    setRequiredFields(arr);
  };

  useEffect(() => {
    if (!boolVal) {
      fetchRequired();
      fetchFieldLength();

      const userDetails = JSON.parse(
        window.localStorage.getItem('userDetails')
      );

      setMemberDetails({
        ...memberDetails,
        siteId: userDetails.siteId,
      });
      setBoolVal(true);
    }
  }, [boolVal]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    setMemberDetails({ ...memberDetails, [name]: e.target.value });
  };

  const handleChangeUpdate = (propName, val) => {
    setMemberDetails({ ...memberDetails, [propName]: val });
  };

  return (
    <Fragment>
      <div className='row'>
        <div className='col-md-4 mt-3'>
          <SearchableDropDown
            label='Salutation'
            labelId='salutation-sample'
            name='salutation'
            placeholder='Salutation'
            pla
            value={memberDetails.salutation ? memberDetails.salutation : ''}
            fieldVal={memberDetails.salutation ? memberDetails.salutation : ''}
            selected={memberDetails.salutation ? memberDetails.salutation : ''}
            update={true}
            handleUpdate={handleChangeUpdate}
            optionArray={
              requiredFields.indexOf('gender') >= 0
                ? [
                    'Mr',
                    'Ms',
                    'Mrs',
                    'Dr',
                    'Prof',
                    'Sir',
                    'Master',
                    'Lady',
                    'Reverand',
                  ]
                : [
                    'None',
                    'Mr',
                    'Ms',
                    'Mrs',
                    'Dr',
                    'Prof',
                    'Sir',
                    'Master',
                    'Lady',
                    'Reverand',
                  ]
            }
            setDetails={setMemberDetails}
            details={memberDetails}
            maxLength={fieldLength['salutation'.toLowerCase()]}
            invalid={
              submitted && requiredFields.indexOf('salutation') >= 0
                ? true
                : false
            }
            invalidMessage={'Salutation is required'}
          />
        </div>
        <div className='col-md-4 mt-3'>
          <TextInputField
            label='First Name'
            name='firstName'
            placeholder='First Name'
            value={memberDetails.firstName}
            onChange={handleFormChange}
            required={requiredFields.indexOf('firstName') >= 0}
            invalid={
              submitted && requiredFields.indexOf('firstName') >= 0
                ? true
                : false
            }
            invalidMessage={'First Name is required'}
            maxLength={fieldLength['firstName'.toLowerCase()]}
          />
        </div>
        <div className='col-md-4 mt-3'>
          <TextInputField
            label='Middle Name'
            name='middleName'
            placeholder='Middle Name'
            value={memberDetails.middleName}
            onChange={handleFormChange}
            required={requiredFields.indexOf('middleName') >= 0}
            invalid={
              submitted && requiredFields.indexOf('middleName') >= 0
                ? true
                : false
            }
            invalidMessage={'Middle Name is required'}
            maxLength={fieldLength['middleName'.toLowerCase()]}
          />
        </div>
        <div className='col-md-4 mt-3'>
          <TextInputField
            label='Last Name'
            name='lastName'
            placeholder='Last Name'
            value={memberDetails.lastName}
            onChange={handleFormChange}
            required={requiredFields.indexOf('lastName') >= 0}
            invalid={
              submitted && requiredFields.indexOf('lastName') >= 0
                ? true
                : false
            }
            invalidMessage={'Last Name is required'}
            maxLength={fieldLength['lastName'.toLowerCase()]}
          />
        </div>
        <div className='col-md-4 mt-3'>
          <TextInputField
            label='Home Phone'
            name='phoneNumber1'
            placeholder='Home Phone'
            value={memberDetails.phoneNumber1}
            onChange={handleFormChange}
            required={requiredFields.indexOf('phoneNumber1') >= 0}
            invalid={
              submitted && requiredFields.indexOf('phoneNumber1') >= 0
                ? true
                : false
            }
            invalidMessage={'Home Phone is required'}
            maxLength={fieldLength['phoneNumber1'.toLowerCase()]}
          />
        </div>
        <div className='col-md-4 mt-3'>
          <TextInputField
            label='Work Phone'
            name='phoneNumber2'
            placeholder='Work Phone'
            value={memberDetails.phoneNumber2}
            onChange={handleFormChange}
            required={requiredFields.indexOf('phoneNumber2') >= 0}
            invalid={
              submitted && requiredFields.indexOf('phoneNumber2') >= 0
                ? true
                : false
            }
            invalidMessage={'Work Phone is required'}
            maxLength={fieldLength['phoneNumber2'.toLowerCase()]}
          />
        </div>
        <div className='col-md-4 mt-3'>
          <TextInputField
            label='Mobile Number'
            name='mobilePhoneNumber'
            placeholder='Mobile Number'
            value={memberDetails.mobilePhoneNumber}
            onChange={handleFormChange}
            required={requiredFields.indexOf('mobilePhoneNumber') >= 0}
            invalid={
              submitted && requiredFields.indexOf('mobilePhoneNumber') >= 0
                ? true
                : false
            }
            invalidMessage={'Mobile Number is required'}
            maxLength={fieldLength['mobilePhoneNumber'.toLowerCase()]}
          />
        </div>
        <div className='col-md-4 mt-3'>
          <TextInputField
            label='Email 1'
            name='emailId1'
            placeholder='Email 1'
            value={memberDetails.emailId1}
            onChange={handleFormChange}
            required={requiredFields.indexOf('emailId1') >= 0}
            invalid={
              submitted && requiredFields.indexOf('emailId1') >= 0
                ? true
                : false
            }
            invalidMessage={'Email 1 is required'}
            maxLength={fieldLength['emailId1'.toLowerCase()]}
          />
        </div>
        <div className='col-md-4 mt-3'>
          <TextInputField
            label='Date of Birth'
            name='dateOfBirth'
            placeholder='Date of Birth'
            type='date'
            value={memberDetails.dateOfBirth}
            onChange={handleFormChange}
            required={requiredFields.indexOf('dateOfBirth') >= 0}
            invalid={
              submitted && requiredFields.indexOf('dateOfBirth') >= 0
                ? true
                : false
            }
            invalidMessage={'Date of Birth is required'}
            // maxLength={fieldLength['dateOfBirth'.toLowerCase()]}
          />
        </div>
      </div>
      {props.showAlert && (
        <Modal
          isOpen={props.showAlert}
          toggle={() => props.setShowAlert(false)}
          backdrop='static'
          scrollable={true}
          size='md'
          centered
        >
          <ModalHeader
            toggle={() => props.setShowAlert(false)}
            className='bg-light p-3'
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              closeForm={() => props.setShowAlert(false)}
              message={props.alertMsg}
              btn1={'Close'}
              btn2={'Refresh'}
              handleFunc={() => refresh(memberDetails.id)}
            />
          </ModalBody>
        </Modal>
      )}
    </Fragment>
  );
};

export default DetailSection;
