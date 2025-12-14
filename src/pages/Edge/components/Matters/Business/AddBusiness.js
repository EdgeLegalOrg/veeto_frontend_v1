import React, { useState, useEffect, Fragment } from "react";
import { useDispatch } from "react-redux";
import { Button, Input } from "reactstrap";
import LoadingPage from "../../../utils/LoadingPage";
import { addBusiness } from "../../../apis";
import { getRequiredFields, validate } from "../../../utils/Validation";
import { toast } from "react-toastify";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";

const initialState = {
  lengthOfContract: "",
  lengthType: "DAYS",
  otherDateForCompletion: "",
  finalDateOfNoticeToComplete: "",
  conveyancingType: "",
  auctionDate: "",
  registeredBusinessName: "",
  registrationNo: "",
  telephoneNo: "",
  faxNo: "",
  mobileNo: "",
  emailAddress: "",
  domainName: "",
  businessType: "",
  trainingPeriodBefore: "",
  trainingPeriodAfter: "",
  purchasePrice: "",
  deposit: "",
  balance: "",
  gstComponent: "",
  otherConsideration: "",
  stampDuty: "",
  depositType: "",
  depositBondExpiry: "",
  goodWill: "",
  equipment: "",
  warrantyAmount: "",
  warrantyPeriodFrom: "",
  warrantyPeriodTo: "",
  enosId: "",
  businessKnownAs: "",
  plantFittings: "",
  fixtures: "",
  area: "",
  period: "",
  keyPersons: "",
  stockInTrade: "",
};

const AddBusiness = (props) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);
  const [lengthType, setLengthType] = useState([]);
  const [conveyanceType, setConveyanceType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requiredFields, setRequiredFields] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const isRequired = (field) => {
    return requiredFields.includes(field);
  };

  const fetchEnums = () => {
    let req = getRequiredFields("matter_business");

    if (req && req.requiredFields && req.requiredFields.length > 0) {
      setRequiredFields(req.requiredFields);
    }

    let enums = JSON.parse(window.localStorage.getItem("enumList"));

    if (enums) {
      if (enums["LengthType"]) {
        setLengthType(enums["LengthType"]);
      }

      if (enums["ConveyancingType"]) {
        setConveyanceType(enums["ConveyancingType"]);
      }
    }
  };

  useEffect(() => {
    fetchEnums();
  }, []);

  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialState);
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [formData, initialState]);

  const findDisplayname = (from, val = "") => {
    if (val) {
      let data = from.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectOption = (name, val) => {
    setFormData({ ...formData, [name]: val.value });
  };

  const handleSubmit = async () => {
    let d = {
      ...formData,
      matterId: props.matterId,
    };

    setLoading(true);

    let invalid = validate(d, "matter_business");

    if (invalid) {
      setSubmitted(true);
      // toast.warning(`${invalid} field is required !`);
      setLoading(false);
    } else {
      try {
        const { data } = await addBusiness(d);
        if (data.success) {
          if (props.refresh) {
            props.refresh();
            setTimeout(() => {
              props.close();
            }, 1);
          }
        } else {
          toast.warning("Something went wrong, please try again later.");
        }
        setLoading(false);
      } catch (error) {
        toast.warning("Something went wrong, please try again later.");
        console.error(error);
        setLoading(false);
      }
    }
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
          closeForm={props.close}
          btn1={"Cancel"}
          btn2="Add"
          heading="Business Sale / Purchase"
          handleFunc={handleSubmit}
          autoClose={false}
          bodyStyle={{ marginTop: "0px" }}
          gridSize={"70%"}
        > */}
      <div className="row mt-2">
        <div className="d-flex align-items-center justify-content-end">
          {/* <Button
              type="button"
              color="danger"
              onClick={props.close}
              className="mx-1"
              
            >
              Cancel
            </Button> */}
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

      <div className="mb-2">
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Exchange Date"
              disabled
              name="exchangeDate"
              placeholder="Exchange Date"
              type="date"
              value={props?.matter?.exchangeDate}
              required={isRequired("exchangeDate")}
              invalid={submitted && isRequired("exchangeDate")}
              invalidMessage="Exchange Date is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Cooling Off Date"
              disabled
              name="coolingOffDate"
              placeholder="Cooling Off Date"
              type="date"
              value={props?.matter?.coolingOffDate}
              required={isRequired("coolingOffDate")}
              invalid={submitted && isRequired("coolingOffDate")}
              invalidMessage="Cooling Off Date is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Adjustment Date"
              disabled
              name="adjustmentDate"
              placeholder="Adjustment Date"
              type="date"
              value={props?.matter?.adjustmentDate}
              required={isRequired("adjustmentDate")}
              invalid={submitted && isRequired("adjustmentDate")}
              invalidMessage="Adjustment Date is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Settlement Date"
              disabled
              name="settlementDate"
              placeholder="Settlement Date"
              type="date"
              value={props?.matter?.settlementDate}
              required={isRequired("settlementDate")}
              invalid={submitted && isRequired("settlementDate")}
              invalidMessage="Settlement Date is required"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Length Of Contract"
              type="number"
              name="lengthOfContract"
              placeholder="Length Of Contract"
              value={formData.lengthOfContract}
              onChange={handleChange}
              required={isRequired("lengthOfContract")}
              invalid={submitted && isRequired("lengthOfContract")}
              invalidMessage="Length Of Contract is required"
            />
          </div>
          <div className="col-md-3">
            <SelectInputField
              label="Length Type"
              // name='accountType'
              placeholder="Length Type"
              name="lengthType"
              optionArray={lengthType}
              value={formData.lengthType}
              selected={formData.lengthType}
              onSelectFunc={(val) => handleSelectOption("lengthType", val)}
              fieldVal={findDisplayname(lengthType, formData.lengthType)}
              maxLength={null}
              required={isRequired("lengthType")}
              invalid={submitted && isRequired("lengthType")}
              invalidMessage="Length Type is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Other Dt For Completion"
              name="otherDateForCompletion"
              placeholder="Other Dt For Completion"
              type="date"
              value={formData.otherDateForCompletion}
              onChange={handleChange}
              required={isRequired("otherDateForCompletion")}
              invalid={submitted && isRequired("otherDateForCompletion")}
              invalidMessage="Other Dt For Completion is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Final Dt Of Notice To Complete"
              name="finalDateOfNoticeToComplete"
              placeholder="Final Dt Of Notice To Complete"
              type="date"
              value={formData.finalDateOfNoticeToComplete}
              onChange={handleChange}
              required={isRequired("finalDateOfNoticeToComplete")}
              invalid={submitted && isRequired("finalDateOfNoticeToComplete")}
              invalidMessage="Final Dt Of Notice To Complete is required"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <SelectInputField
              label="Conveyancing Type"
              // name='accountType'
              placeholder="Conveyancing Type"
              name="conveyancingType"
              optionArray={conveyanceType}
              value={formData.conveyancingType}
              selected={formData.conveyancingType}
              onSelectFunc={(val) =>
                handleSelectOption("conveyancingType", val)
              }
              fieldVal={findDisplayname(
                conveyanceType,
                formData.conveyancingType
              )}
              maxLength={null}
              required={isRequired("conveyancingType")}
              invalid={submitted && isRequired("conveyancingType")}
              invalidMessage="Conveyancing Type is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Auction Date"
              name="auctionDate"
              placeholder="Auction Date"
              type="date"
              value={formData.auctionDate}
              onChange={handleChange}
              required={isRequired("auctionDate")}
              invalid={submitted && isRequired("auctionDate")}
              invalidMessage="Auction Date is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Registered Business Name"
              name="registeredBusinessName"
              placeholder="Registered Business Name"
              value={formData.registeredBusinessName}
              onChange={handleChange}
              required={isRequired("registeredBusinessName")}
              invalid={submitted && isRequired("registeredBusinessName")}
              invalidMessage="Registered Business Name is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Registered Business Number"
              name="registrationNo"
              placeholder="Registered Business Number"
              value={formData.registrationNo}
              onChange={handleChange}
              required={isRequired("registrationNo")}
              invalid={submitted && isRequired("registrationNo")}
              invalidMessage="Registered Business Number is required"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Telephone No"
              name="telephoneNo"
              placeholder="Telephone No"
              value={formData.telephoneNo}
              onChange={handleChange}
              required={isRequired("telephoneNo")}
              invalid={submitted && isRequired("telephoneNo")}
              invalidMessage="Telephone No is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Fax No"
              name="faxNo"
              placeholder="Fax No"
              value={formData.faxNo}
              onChange={handleChange}
              required={isRequired("faxNo")}
              invalid={submitted && isRequired("faxNo")}
              invalidMessage="Fax No is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Mobile No"
              name="mobileNo"
              placeholder="Mobile No"
              value={formData.mobileNo}
              onChange={handleChange}
              required={isRequired("mobileNo")}
              invalid={submitted && isRequired("mobileNo")}
              invalidMessage="Mobile No is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Email Address"
              name="emailAddress"
              placeholder="Email Address"
              value={formData.emailAddress}
              onChange={handleChange}
              required={isRequired("emailAddress")}
              invalid={submitted && isRequired("emailAddress")}
              invalidMessage="Email Address is required"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Domain Name"
              name="domainName"
              placeholder="Domain Name"
              value={formData.domainName}
              onChange={handleChange}
              required={isRequired("domainName")}
              invalid={submitted && isRequired("domainName")}
              invalidMessage="Domain Name is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Business Type"
              name="businessType"
              placeholder="Business Type"
              value={formData.businessType}
              onChange={handleChange}
              required={isRequired("businessType")}
              invalid={submitted && isRequired("businessType")}
              invalidMessage="Business Type is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Training Period Before"
              name="trainingPeriodBefore"
              placeholder="Training Period Before"
              type="number"
              value={formData.trainingPeriodBefore}
              onChange={handleChange}
              required={isRequired("trainingPeriodBefore")}
              invalid={submitted && isRequired("trainingPeriodBefore")}
              invalidMessage="Training Period Before is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Training Period After"
              name="trainingPeriodAfter"
              placeholder="Training Period After"
              type="number"
              value={formData.trainingPeriodAfter}
              onChange={handleChange}
              required={isRequired("trainingPeriodAfter")}
              invalid={submitted && isRequired("trainingPeriodAfter")}
              invalidMessage="Training Period After is required"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Purchase Price"
              name="purchasePrice"
              placeholder="Purchase Price"
              type="number"
              value={formData.purchasePrice}
              onChange={handleChange}
              required={isRequired("purchasePrice")}
              invalid={submitted && isRequired("purchasePrice")}
              invalidMessage="Purchase Price is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Deposit"
              name="deposit"
              placeholder="Deposit"
              type="number"
              value={formData.deposit}
              onChange={handleChange}
              required={isRequired("deposit")}
              invalid={submitted && isRequired("deposit")}
              invalidMessage="Deposit is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Balance"
              name="balance"
              placeholder="Balance"
              type="number"
              value={formData.balance}
              onChange={handleChange}
              required={isRequired("balance")}
              invalid={submitted && isRequired("balance")}
              invalidMessage="Balance is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Gst Component"
              type="number"
              name="gstComponent"
              placeholder="Gst Component"
              value={formData.gstComponent}
              onChange={handleChange}
              required={isRequired("gstComponent")}
              invalid={submitted && isRequired("gstComponent")}
              invalidMessage="Gst Component is required"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Other Consideration"
              type="number"
              name="otherConsideration"
              placeholder="Other Consideration"
              value={formData.otherConsideration}
              onChange={handleChange}
              required={isRequired("otherConsideration")}
              invalid={submitted && isRequired("otherConsideration")}
              invalidMessage="Other Consideration is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Stamp Duty"
              type="number"
              name="stampDuty"
              placeholder="Stamp Duty"
              value={formData.stampDuty}
              onChange={handleChange}
              required={isRequired("stampDuty")}
              invalid={submitted && isRequired("stampDuty")}
              invalidMessage="Stamp Duty is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Deposit Type"
              name="depositType"
              placeholder="Deposit Type"
              value={formData.depositType}
              onChange={handleChange}
              required={isRequired("depositType")}
              invalid={submitted && isRequired("depositType")}
              invalidMessage="Deposit Type is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Deposit Bond Expiry"
              name="depositBondExpiry"
              placeholder="Deposit Bond Expiry"
              type="date"
              value={formData.depositBondExpiry}
              onChange={handleChange}
              required={isRequired("depositBondExpiry")}
              invalid={submitted && isRequired("depositBondExpiry")}
              invalidMessage="Deposit Bond Expiry is required"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Goodwill"
              type="number"
              name="goodWill"
              placeholder="Goodwill"
              value={formData.goodWill}
              onChange={handleChange}
              required={isRequired("goodWill")}
              invalid={submitted && isRequired("goodWill")}
              invalidMessage="Goodwill is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Equipment"
              type="number"
              name="equipment"
              placeholder="Equipment"
              value={formData.equipment}
              onChange={handleChange}
              required={isRequired("equipment")}
              invalid={submitted && isRequired("equipment")}
              invalidMessage="Equipment is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Warranty Amount"
              type="number"
              name="warrantyAmount"
              placeholder="Warranty Amount"
              value={formData.warrantyAmount}
              onChange={handleChange}
              required={isRequired("warrantyAmount")}
              invalid={submitted && isRequired("warrantyAmount")}
              invalidMessage="Warranty Amount is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Warranty Period From"
              name="warrantyPeriodFrom"
              placeholder="Warranty Period From"
              type="date"
              value={formData.warrantyPeriodFrom}
              onChange={handleChange}
              required={isRequired("warrantyPeriodFrom")}
              invalid={submitted && isRequired("warrantyPeriodFrom")}
              invalidMessage="Warranty Period From is required"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Warranty Period To"
              name="warrantyPeriodTo"
              placeholder="Warranty Period To"
              type="date"
              value={formData.warrantyPeriodTo}
              onChange={handleChange}
              required={isRequired("warrantyPeriodTo")}
              invalid={submitted && isRequired("warrantyPeriodTo")}
              invalidMessage="Warranty Period To is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="ENOS Id"
              name="enosId"
              placeholder="ENOS Id"
              value={formData.enosId}
              onChange={handleChange}
              required={isRequired("enosId")}
              invalid={submitted && isRequired("enosId")}
              invalidMessage="ENOS Id is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Business known as"
              name="businessKnownAs"
              placeholder="Business known as"
              value={formData.businessKnownAs}
              onChange={handleChange}
              required={isRequired("businessKnownAs")}
              invalid={submitted && isRequired("businessKnownAs")}
              invalidMessage="Business known as is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Plant Fittings"
              name="plantFittings"
              placeholder="Plant Fittings"
              type="number"
              value={formData.plantFittings}
              onChange={handleChange}
              required={isRequired("plantFittings")}
              invalid={submitted && isRequired("plantFittings")}
              invalidMessage="Plant Fittings is required"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Fixtures"
              name="fixtures"
              placeholder="Fixtures"
              type="number"
              value={formData.fixtures}
              onChange={handleChange}
              required={isRequired("fixtures")}
              invalid={submitted && isRequired("fixtures")}
              invalidMessage="Fixtures is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Area"
              name="area"
              placeholder="Area"
              value={formData.area}
              onChange={handleChange}
              required={isRequired("area")}
              invalid={submitted && isRequired("area")}
              invalidMessage="Area is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Period"
              name="period"
              placeholder="Period"
              value={formData.period}
              onChange={handleChange}
              required={isRequired("period")}
              invalid={submitted && isRequired("period")}
              invalidMessage="Period is required"
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Key Persons"
              name="keyPersons"
              placeholder="Key Persons"
              value={formData.keyPersons}
              onChange={handleChange}
              required={isRequired("keyPersons")}
              invalid={submitted && isRequired("keyPersons")}
              invalidMessage="Key Persons is required"
            />
          </div>
          <div className="col-md-3"></div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Stocks in trade"
              name="stockInTrade"
              placeholder="Stocks in trade"
              value={formData.stockInTrade}
              onChange={handleChange}
              required={isRequired("stockInTrade")}
              invalid={submitted && isRequired("stockInTrade")}
              invalidMessage="Stocks in trade is required"
            />
          </div>
          <div className="col-md-3"></div>
          <div className="col-md-3"></div>
          <div className="col-md-3"></div>
        </div>

        {/* </CustomToastWindow> */}
      </div>
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default AddBusiness;
