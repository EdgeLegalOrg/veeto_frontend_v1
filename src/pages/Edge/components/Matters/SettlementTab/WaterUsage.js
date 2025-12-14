import React, { useState } from 'react';
import { Button, Input } from 'reactstrap';
import {
  TextInputField,
  SelectInputField,
} from 'pages/Edge/components/InputField';
import { formatDateFunc } from 'pages/Edge/utils/utilFunc';

const initialState = {
  dateOfPreviousMeterReading: '',
  dateOfLastMeterReading: '',
  numberOfKilolitresUsed: '',
  costPerKilolitre: '',
  totalAmountPayable: '',
  flgAvgDailyConsumption: false,
  averageDailyConsumption: '',
};

const WaterUsage = (props) => {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const displayForm = () => {
    if (formData.flgAvgDailyConsumption) {
      return (
        <div>
          <div className='row mt-3'>
            <div className='col-md-6'>
              <TextInputField
                label='Description'
                name='description'
                placeholder='Description'
                value={formData.description}
                onChange={handleChange}
                // required={isRequired('rent')}
              />
            </div>
            <div className='col-md-6'>
              <TextInputField
                label='Average Daily Consumption'
                type='number'
                name='averageDailyConsumption'
                placeholder='Average Daily Consumption'
                value={formData.averageDailyConsumption}
                onChange={handleChange}
                // required={isRequired('rent')}
              />
            </div>
          </div>
          <div className='row mt-3'>
            <div className='col-md-6'>
              <TextInputField
                label='Cost Per Kilolitres'
                type='number'
                name='costPerKilolitre'
                placeholder='Cost Per Kilolitres'
                value={formData.costPerKilolitre}
                onChange={handleChange}
                // required={isRequired('rent')}
              />
            </div>
            <div className='col-md-6'>
              <TextInputField
                label='Date Of Last Meter Reading'
                name='dateOfLastMeterReading'
                placeholder='Date Of Last Meter Reading'
                type='date'
                value={formData.dateOfLastMeterReading}
                onChange={handleChange}
                // required={isRequired('dateOfLastMeterReading')}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div className='row mt-3'>
            <div className='col-md-6'>
              <TextInputField
                label='Description'
                name='description'
                placeholder='Description'
                value={formData.description}
                onChange={handleChange}
                // required={isRequired('rent')}
              />
            </div>
            <div className='col-md-6'>
              <TextInputField
                label='No. Of Kilolitres Used'
                type='number'
                name='numberOfKilolitresUsed'
                placeholder='No. Of Kilolitres Used'
                value={formData.numberOfKilolitresUsed}
                onChange={handleChange}
                // required={isRequired('rent')}
              />
            </div>
          </div>
          <div className='row mt-3'>
            <div className='col-md-6'>
              <TextInputField
                label='Cost Per Kilolitres'
                type='number'
                name='costPerKilolitre'
                placeholder='Cost Per Kilolitres'
                value={formData.costPerKilolitre}
                onChange={handleChange}
                // required={isRequired('rent')}
              />
            </div>
            <div className='col-md-6'>
              <TextInputField
                label='Total Amount Payable'
                type='number'
                name='totalAmountPayable'
                placeholder='Total Amount Payable'
                value={formData.totalAmountPayable}
                onChange={handleChange}
                // required={isRequired('rent')}
              />
            </div>
          </div>
          <div className='row mt-3'>
            <div className='col-md-6'>
              <TextInputField
                label='Date Of Last Meter Reading'
                name='dateOfLastMeterReading'
                placeholder='Date Of Last Meter Reading'
                type='date'
                value={formData.dateOfLastMeterReading}
                onChange={handleChange}
                // required={isRequired('dateOfLastMeterReading')}
              />
            </div>
            <div className='col-md-6'>
              <TextInputField
                label='Date Of Previous Meter Reading'
                name='dateOfPreviousMeterReading'
                placeholder='Date Of Previous Meter Reading'
                type='date'
                value={formData.dateOfPreviousMeterReading}
                onChange={handleChange}
                // required={isRequired('dateOfPreviousMeterReading')}
              />
            </div>
          </div>
        </div>
      );
    }
  };

  const usageSelected = (type) => {
    if (type === 'lastReading') {
      return !formData.flgAvgDailyConsumption;
    } else {
      return formData.flgAvgDailyConsumption;
    }
  };

  const handleChangeType = (arg) => {
    setFormData({ ...formData, flgAvgDailyConsumption: arg });
  };

  return (
    <>
      <div className='row border py-2 my-3'>
        <div className='col-md-6'>
          <div onClick={() => handleChangeType(false)}>
            <Input
              type='radio'
              checked={usageSelected('lastReading')}
              onClick={() => {}}
              onChange={() => {}}
            />
            <label className='m-0 mx-2'>Last Two Reading Dates</label>
          </div>
        </div>
        <div className='col-md-6'>
          <div onClick={() => handleChangeType(true)}>
            <Input
              type='radio'
              checked={usageSelected('avgComs')}
              onClick={() => {}}
              onChange={() => {}}
            />
            <label className='m-0 mx-2'>Average Daily Consumption</label>
          </div>
        </div>
      </div>
      {displayForm()}
    </>
  );
};

export default WaterUsage;
