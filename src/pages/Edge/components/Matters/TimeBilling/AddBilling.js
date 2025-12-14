import React, { useState, useEffect, Fragment } from "react";
import { Button, Input } from "reactstrap";
import { findDisplayname, formatDateFunc } from "../../../utils/utilFunc";

import "../../../stylesheets/TimeBilling.css";
import TimerComponent from "../../customComponents/TimerComponent";
import LoadingPage from "../../../utils/LoadingPage";
import { addTimeBilling } from "../../../apis";
import { getRequiredFields, validate } from "../../../utils/Validation";
import { toast } from "react-toastify";
import {
  TextInputField,
  CustomDropDown,
} from "pages/Edge/components/InputField";

const initialData = {
  title: "",
  billedByStaffId: "",
  rate: "",
  billingDate: new Date(),
  units: "",
  taxDesc: "GST_INCLUDE",
  description: "",
  matterId: "",
  timeInSecs: "",
  subTotal: "",
  type: "",
  taxPercent: "",
  taxAmount: "",
  total: "",
  sequenceNum: "",
};

const AddBilling = (props) => {
  const [data, setData] = useState(initialData);
  const [serviceLine, setServiceLine] = useState([]);
  const [taxTypeList, setTaxTypeList] = useState([]);
  const [entryType, setEntryType] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [requiredFields, setRequiredFields] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const isRequired = (field) => {
    return requiredFields.includes(field);
  };

  useEffect(() => {
    setServiceLine(props.serviceLineList);
  }, [props.serviceLineList]);

  useEffect(() => {
    const userDetails = JSON.parse(window.localStorage.getItem("userDetails"));
    if (userDetails && !data.billedByStaffId) {
      setData({ ...data, billedByStaffId: userDetails.staffId });
    }
  }, [props.staffList]);

  useEffect(() => {
    fetchEnumList();
  }, []);

  useEffect(() => {
    const isChanged = JSON.stringify(data) !== JSON.stringify(initialData);
    props.setFormStatus((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [data, initialData]);

  const fetchEnumList = () => {
    let req = getRequiredFields("matter_time_billing");

    if (req && req.requiredFields && req.requiredFields.length > 0) {
      setRequiredFields(req.requiredFields);
    }

    let enums = JSON.parse(window.localStorage.getItem("enumList"));
    if (enums) {
      setTaxTypeList(enums.TaxType ? enums.TaxType : []);
    }
  };

  const convertToUnits = (seconds) => {
    let mins = seconds / 60;
    let unit = Math.ceil(mins / 6); // as 6 mins = 1 unit

    setData({ ...data, units: unit, timeInSecs: seconds });
  };

  const afterClear = () => {
    setData({ ...data, units: "", timeInSecs: "" });
  };

  const units = () => {
    if (data.units && entryType === "timer") {
      return (
        <p className="mb-0 mx-2 font-bold">
          {data.units > 1 ? `${data.units} units` : `${data.units} unit`}
        </p>
      );
    }
    return <></>;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const displayUnit = () => {
    if (entryType === "manual") {
      return (
        <div className="col-md-12">
          <TextInputField
            label="Units"
            name="units"
            placeholder="Units"
            value={data.units}
            type="number"
            onChange={handleChange}
            required={isRequired("units")}
            invalid={submitted && isRequired("units")}
            invalidMessage="Units is required"
          />
        </div>
      );
    } else {
      return (
        <div className="col-md-12">
          {units()}
          <TimerComponent
            afterStop={convertToUnits}
            afterStart={() => setData({ ...data, units: "", timeInSecs: "" })}
            afterClear={afterClear}
            data={data.units}
            hideAfterStop={true}
          />
        </div>
      );
    }
  };

  const handleSelect = (name, val) => {
    if (name === "serviceLine") {
      let raw = val.raw;
      let tempData = { ...data };
      tempData.title = raw.serviceLineTitle;
      tempData.rate = raw.amount;
      tempData.type = raw.type;
      tempData.description = raw.serviceLineDesc;
      tempData.taxDesc = raw.taxType;

      setData(tempData);
    } else {
      setData({ ...data, [name]: val.value });
    }
  };

  const handleSubmit = async () => {
    let d = { ...data };
    d.matterId = props?.data?.id;

    setLoading(true);
    let skipFields = [
      "timeInSecs",
      "subTotal",
      "taxPercent",
      "taxAmount",
      "total",
      "sequenceNum",
      "title",
      "type",
    ];
    let invalid = validate(d, "matter_time_billing", skipFields);
    if (invalid) {
      setSubmitted(true);
      // toast.warning(`${invalid} field is required !`);
      setLoading(false);
    } else {
      try {
        let res = await addTimeBilling(d);
        if (res?.data?.success) {
          props.refresh();
          props.close(true);
        } else {
          toast.warning("Something went wrong, please try later.");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
        toast.warning("Something went wrong, please try later.");
      }
    }
  };

  const handleRadioBtn = (arg, name) => {
    let { value } = arg;

    setData({ ...data, [name]: value });
  };

  const labelReq = (fieldName) => {
    if (isRequired(fieldName)) {
      return (
        <span
          style={{
            color: "#eb3d30",
            marginLeft: "2px",
            fontWeight: "500",
          }}
        >
          *
        </span>
      );
    } else {
      return <></>;
    }
  };

  const staffList = props?.staffList.filter((staff) => staff.active);

  return (
    <Fragment>
      <div className="row mt-3">
        <div className="col-md-6">
          <CustomDropDown
            label="Search Service Lines by Title"
            placeholder="Search Service Lines by Title"
            optionArray={serviceLine}
            onSelectFunc={(val) => handleSelect("serviceLine", val)}
            fieldVal={findDisplayname(serviceLine, data.invoiceId)}
            selected={data.invoiceId}
            maxLength={null}
            // required={isRequired('title')}
            // invalid={submitted && isRequired('title')}
            // invalidMessage='Service Line is required'
          />
        </div>
        <div className="col-md-6">
          <CustomDropDown
            label="Billed by"
            placeholder="Billed by"
            optionArray={staffList}
            onSelectFunc={(val) => handleSelect("billedByStaffId", val)}
            fieldVal={findDisplayname(staffList, data.billedByStaffId)}
            selected={data.billedByStaffId}
            maxLength={null}
            required={isRequired("billedByStaffId")}
            invalid={submitted && isRequired("billedByStaffId")}
            invalidMessage="Billed by is required"
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-6">
          <TextInputField
            label="$ Rate/hour"
            name="rate"
            placeholder="$ Rate/hour"
            value={data.rate}
            type="number"
            onChange={handleChange}
            required={isRequired("rate")}
            invalid={submitted && isRequired("rate")}
            invalidMessage="Rate is required"
          />
        </div>
        <div className="col-md-6">
          <TextInputField
            label="Date"
            name="billingDate"
            placeholder="Date"
            type="date"
            value={data.billingDate}
            onChange={handleChange}
            required={isRequired("billingDate")}
            invalid={submitted && isRequired("billingDate")}
            invalidMessage="Date is required"
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="d-flex">
          <Input
            type="radio"
            checked={entryType === "manual"}
            onChange={() => setEntryType("manual")}
          />
          <label className="mx-2">Manual Entry</label>
        </div>
        <div className="d-flex">
          <Input
            type="radio"
            checked={entryType === "timer"}
            onChange={() => setEntryType("timer")}
          />
          <label className="mx-2">Timer</label>
        </div>
      </div>

      <div className="row mt-3">{displayUnit()}</div>

      <div className="row mt-3">
        <label className="">Tax Desc {labelReq("taxDesc")}</label>
        {taxTypeList.map((type) =>
          type.value !== "NO_TAX" ? (
            <div
              className="col-md-12 my-1 d-flex pe-cursor"
              key={type.value}
              onClick={() => handleRadioBtn(type, "taxDesc")}
            >
              <Input
                type="radio"
                checked={data.taxDesc === type.value}
                onChange={() => {}}
                style={
                  submitted && !data?.taxDesc && labelReq("taxDesc")
                    ? { borderColor: "#f06548" }
                    : {}
                }
              />
              <p
                className="mb-0 mx-2"
                style={
                  submitted && !data?.taxDesc && labelReq("taxDesc")
                    ? { color: "#f06548" }
                    : {}
                }
              >
                {type.display}
              </p>
            </div>
          ) : (
            <></>
          )
        )}
      </div>

      <div className="row mt-3">
        <div className="col-md-12">
          <TextInputField
            type="textarea"
            label="Description"
            rows="4"
            cols="40"
            placeholder="Description"
            name="description"
            value={data.description}
            onChange={handleChange}
            required={isRequired("description")}
            invalid={submitted && isRequired("description")}
            invalidMessage="Description is required"
          />
        </div>
      </div>

      <div className="row mt-4">
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            type="button"
            color="light"
            onClick={props.close}
            className="mx-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="success"
            onClick={handleSubmit}
            className="mx-1"
          >
            Save
          </Button>
        </div>
      </div>
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default AddBilling;
