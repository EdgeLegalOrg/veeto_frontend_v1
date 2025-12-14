import React, { useState, useEffect } from "react";
import { Table, Button, Input } from "reactstrap";
import CustomSideDrawer from "../../customComponents/CustomSideDrawer";
import { findDisplayname } from "../../../utils/utilFunc";
import { v4 as uuidv4 } from "uuid";
import { TextInputField } from "pages/Edge/components/InputField";

const initialData = {
  serviceLineTitle: "",
  serviceLineDesc: "",
  billingFrequency: "ONE_TIME",
  amount: "",
  units: "",
  type: "FEES",
  taxType: "GST_EXCLUDE",
};

const NewServiceLine = (props) => {
  const [formData, setFormData] = useState(initialData);
  const [serviceType, setServiceType] = useState([]);
  const [taxType, setTaxType] = useState([]);
  const [billingFrequency, setBillingFrequency] = useState([]);
  const [error, setError] = useState({
    units: false,
    amount: false,
    serviceLineDesc: false,
  });

  useEffect(() => {
    fetchEnums();
  }, []);

  const reset = () => {
    setFormData(initialData);
    setError({
      units: false,
      amount: false,
      serviceLineDesc: false,
    });
  };

  const fetchEnums = () => {
    let enumList = JSON.parse(window.localStorage.getItem("enumList"));
    if (enumList) {
      if (enumList.BillingFrequency) {
        setBillingFrequency(enumList.BillingFrequency);
      }

      if (enumList.ServiceLineType) {
        setServiceType(enumList.ServiceLineType);
      }

      if (enumList.TaxType) {
        setTaxType(enumList.TaxType);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let obj = { ...formData };

    if (name === "units") {
      if (parseFloat(value) < 0) {
        return;
      } else {
        let prev = parseFloat(obj[name]);
        let newVal = parseFloat(value);
        obj = { ...obj, [name]: prev === 0 ? prev + newVal : newVal };
      }
    } else if (name === "amount") {
      if (formData.billingFrequency === "HOURLY" && parseFloat(value) < 0) {
        return;
      } else {
        let prev = parseFloat(obj[name]);
        let newVal = parseFloat(value);
        obj = { ...obj, [name]: prev === 0 ? prev + newVal : newVal };
      }
    } else {
      obj = { ...obj, [name]: value };
    }

    setFormData(obj);
  };

  const handleSelectOption = (name, val) => {
    setFormData({ ...formData, [name]: val.value });
  };

  const handleClose = () => {
    reset();
    if (props.close) {
      props.close();
    }
  };

  const validateItem = () => {
    const isError = {
      units: false,
      serviceLineDesc: false,
      amount: false,
    };

    let isValid = true;

    if (formData.billingFrequency === "HOURLY" && formData.units < 1) {
      isError.units = true;
      isValid = false;
    }

    if (!formData.serviceLineDesc?.trim()) {
      isError.serviceLineDesc = true;
      isValid = false;
    }

    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      (formData.billingFrequency === "HOURLY" &&
        parseFloat(formData.amount) < 1)
    ) {
      isError.amount = true;
      isValid = false;
    }

    setError(isError);

    return isValid;
  };

  const handleAdd = () => {
    const valid = validateItem();

    if (!valid) {
      return;
    }

    let arr = [...props.serviceList];

    if (props.onChange) {
      props.onChange("serviceLineList", [
        ...arr,
        { ...formData, uid: uuidv4() },
      ]);
      handleClose();
    }
  };

  const handleRadioBtn = (arg, name) => {
    let { value } = arg;

    let obj = { ...formData };

    if (name === "billingFrequency" && value !== formData.billingFrequency) {
      obj["units"] = "";
      obj["amount"] = "";
    }

    obj = { ...obj, [name]: value };
    setFormData(obj);
  };

  const body = () => {
    return (
      <div className="bt-container p-3 py-2">
        <div className="mr-tb10 mr-l10">
          <label className="invoice-radio-label">Type</label>
          {serviceType.map((type) => (
            <div
              className="invoice-radio-li"
              key={type.value}
              onClick={() => handleRadioBtn(type, "type")}
            >
              <Input
                type="radio"
                checked={formData.type === type.value}
                onChange={() => {}}
                className="form-check-input"
              />
              <p className="mb-0">{type.display}</p>
            </div>
          ))}
        </div>

        <div className="mr-tb10 mr-l10">
          <label className="invoice-radio-label">Tax Type</label>
          {taxType.map((type) => (
            <div
              className="invoice-radio-li"
              key={type.value}
              onClick={() => handleRadioBtn(type, "taxType")}
            >
              <Input
                type="radio"
                checked={formData.taxType === type.value}
                onChange={() => {}}
                className="form-check-input"
              />
              <p className="mb-0">{type.display}</p>
            </div>
          ))}
        </div>

        <div className="mr-tb10 mr-l10">
          <label className="invoice-radio-label">Billing Frequency</label>
          {billingFrequency.map((type) => (
            <div
              className="invoice-radio-li"
              key={type.value}
              onClick={() => handleRadioBtn(type, "billingFrequency")}
            >
              <Input
                type="radio"
                checked={formData.billingFrequency === type.value}
                onChange={() => {}}
                className="form-check-input"
              />
              <p className="mb-0">{type.display}</p>
            </div>
          ))}
        </div>

        {formData.billingFrequency === "HOURLY" && (
          <div className="mr-tb10">
            <TextInputField
              label="Units"
              name="units"
              placeholder="Units"
              value={formData.units}
              onChange={handleFormChange}
              type="number"
              required={true}
            />
            {error.units && (
              <span className="text-danger fs-6">
                * This field is required (min: 1)
              </span>
            )}
          </div>
        )}

        <div className="mr-t30 mr-b10 mt-3">
          <TextInputField
            label="Amount/Hourly Rate"
            name="amount"
            placeholder="$ Amount/Hourly Rate"
            value={formData.amount}
            onChange={handleFormChange}
            type="number"
            required={true}
          />
          {error.amount && (
            <span className="text-danger fs-6">
              * This field is required (min: 1)
            </span>
          )}
        </div>
        <div className="mr-tb10 mt-3">
          <TextInputField
            type="textarea"
            label="Service Line Description"
            name="serviceLineDesc"
            placeholder="Service Line Description"
            value={formData.serviceLineDesc}
            onChange={handleFormChange}
            required={true}
          />
          {error.serviceLineDesc && (
            <span className="text-danger fs-6">* This field is required</span>
          )}
        </div>
        <div className="full mr-tb16 mt-3">
          <Button color="primary" onClick={handleAdd}>
            ADD
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <CustomSideDrawer
        active={props.active}
        onClose={handleClose}
        heading={"Add New Item"}
        body={body}
        doneBtn={true}
      />
    </div>
  );
};

export default NewServiceLine;
