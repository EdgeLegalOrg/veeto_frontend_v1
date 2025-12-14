import React, { useState, useEffect, Fragment, useRef } from "react";
import { useDispatch } from "react-redux";
import LoadingPage from "../../../utils/LoadingPage";
import { addConveyance } from "../../../apis";
import { getRequiredFields, validate } from "../../../utils/Validation";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";

const initialState = {
  lengthOfContract: "",
  lengthType: "DAYS",
  otherDateForCompletion: "",
  finalDateOfNoticeToComplete: "",
  conveyancingType: "OTHER",
  auctionDate: "",
  purchasePrice: "",
  deposit: "",
  balance: "",
  gstComponent: "",
  otherConsideration: "",
  stampDuty: "",
  depositType: "",
  depositBondExpiry: "",
  enosId: "",
  // fixedCompletionDate: '',
  // trainingPeriodBefore: '',
  // trainingPeriodAfter: '',
  // telephoneNo: '',
  // faxNo: '',
  // mobileNo: '',
  // emailAddress: '',
  // domainName: '',
  // warrantyAmount: '',
  // warrantyPeriodFrom: '',
  // warrantyPeriodTo: '',
};

const AddConveyancing = (props) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);
  const [lengthType, setLengthType] = useState([]);
  const [conveyanceType, setConveyanceType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requiredFields, setRequiredFields] = useState([]);
  const [formChange, setFormChange] = useState(false);
  const initialLoad = useRef(true);
  const initialStateRef = useRef(initialState);

  const isRequired = (field) => {
    return requiredFields.includes(field);
  };

  const fetchEnums = () => {
    let req = getRequiredFields("matter_conveyance");

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

  // useEffect(() => {
  //   const isChanged = JSON.stringify(formData) !== JSON.stringify(initialState);
  //   dispatch(
  //     updateFormStatusAction({ key: 'isFormChanged', value: isChanged })
  //   );
  // }, [formData, initialState]);

  useEffect(() => {}, [formData]);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    } else {
      const someChange = Object.keys(formData).some(
        (key) => formData[key] != initialStateRef.current[key]
      );

      dispatch(
        updateFormStatusAction({ key: "isFormChanged", value: someChange })
      );

      setFormChange(someChange);
    }
  }, [formData]);

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
    if (!formChange) {
      toast.warning("Nothing to save here");
      return;
    }

    let d = {
      ...formData,
      matterId: props.matterId,
    };

    setLoading(true);

    let invalid = validate(d, "matter_conveyance");

    if (invalid) {
      setSubmitted(true);
      // toast.warning(`${invalid} field is required !`);
      setLoading(false);
    } else {
      try {
        const { data } = await addConveyance(d);
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
        setSubmitted(false);
      } catch (error) {
        toast.warning("Something went wrong, please try again later.");
        console.error(error);
        setLoading(false);
        setSubmitted(false);
      }
    }
  };
  return (
    <Fragment>
      <div>
        {/* <CustomToastWindow
          closeForm={props.close}
          btn1={'Cancel'}
          btn2='Add'
          heading='Add Conveyancing Details'
          handleFunc={handleSubmit}
          autoClose={false}
          bodyStyle={{ marginTop: '0px' }}
          gridSize={'70%'}
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
            <div className="col-md-6">
              <TextInputField
                label="Exchange Date"
                disabled
                name="exchangeDate"
                placeholder="Exchange Date"
                type="date"
                value={props?.matter?.exchangeDate}
              />
            </div>
            <div className="col-md-6">
              <TextInputField
                label="Cooling Off Date"
                disabled
                name="coolingOffDate"
                placeholder="Cooling Off Date"
                type="date"
                value={props?.matter?.coolingOffDate}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              <TextInputField
                label="Adjustment Date"
                disabled
                name="adjustmentDate"
                placeholder="Adjustment Date"
                type="date"
                value={props?.matter?.adjustmentDate}
              />
            </div>
            <div className="col-md-6">
              <TextInputField
                label="Settlement Date"
                disabled
                name="settlementDate"
                placeholder="Settlement Date"
                type="date"
                value={props?.matter?.settlementDate}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              <TextInputField
                label="Length Of Contract"
                type="number"
                name="lengthOfContract"
                placeholder="Length Of Contract"
                value={formData.lengthOfContract}
                onChange={handleChange}
                required={isRequired("lengthOfContract")}
                invalid={submitted && isRequired("lengthOfContract")}
                invalidMessage={"Length Of Contract is required"}
              />
            </div>
            <div className="col-md-6">
              <SelectInputField
                label="Length Type"
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
                invalidMessage={"Length Type is required"}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              <TextInputField
                label="Other Dt For Completion"
                name="otherDateForCompletion"
                placeholder="Other Dt For Completion"
                type="date"
                value={formData.otherDateForCompletion}
                onChange={handleChange}
                required={isRequired("otherDateForCompletion")}
                invalid={submitted && isRequired("otherDateForCompletion")}
                invalidMessage={"Other Dt For Completion is required"}
              />
            </div>
            <div className="col-md-6">
              <TextInputField
                label="Final Dt Of Notice To Complete"
                name="finalDateOfNoticeToComplete"
                placeholder="Final Dt Of Notice To Complete"
                type="date"
                value={formData.finalDateOfNoticeToComplete}
                onChange={handleChange}
                required={isRequired("finalDateOfNoticeToComplete")}
                invalid={submitted && isRequired("finalDateOfNoticeToComplete")}
                invalidMessage={"Final Dt Of Notice To Complete is required"}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              <SelectInputField
                label="Conveyancing Type"
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
                invalidMessage={"Conveyancing Type is required"}
              />
            </div>
            <div className="col-md-6">
              <TextInputField
                label="Auction Date"
                name="auctionDate"
                placeholder="Auction Date"
                type="date"
                value={formData.auctionDate}
                onChange={handleChange}
                required={isRequired("auctionDate")}
                invalid={submitted && isRequired("auctionDate")}
                invalidMessage={"Auction Date is required"}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              <TextInputField
                label="Purchase Price"
                name="purchasePrice"
                placeholder="Purchase Price"
                type="number"
                value={formData.purchasePrice}
                onChange={handleChange}
                required={isRequired("purchasePrice")}
                invalid={submitted && isRequired("purchasePrice")}
                invalidMessage={"Purchase Price is required"}
              />
            </div>
            <div className="col-md-6">
              <TextInputField
                label="Deposit"
                name="deposit"
                placeholder="Deposit"
                type="number"
                value={formData.deposit}
                onChange={handleChange}
                required={isRequired("deposit")}
                invalid={submitted && isRequired("deposit")}
                invalidMessage={"Deposit is required"}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              <TextInputField
                label="Balance"
                name="balance"
                placeholder="Balance"
                type="number"
                value={formData.balance}
                onChange={handleChange}
                required={isRequired("balance")}
                invalid={submitted && isRequired("balance")}
                invalidMessage={"Balance is required"}
              />
            </div>
            <div className="col-md-6">
              <TextInputField
                label="Gst Component"
                type="number"
                name="gstComponent"
                placeholder="Gst Component"
                value={formData.gstComponent}
                onChange={handleChange}
                required={isRequired("gstComponent")}
                invalid={submitted && isRequired("gstComponent")}
                invalidMessage={"Gst Component is required"}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              <TextInputField
                label="Other Consideration"
                type="number"
                name="otherConsideration"
                placeholder="Other Consideration"
                value={formData.otherConsideration}
                onChange={handleChange}
                required={isRequired("otherConsideration")}
                invalid={submitted && isRequired("otherConsideration")}
                invalidMessage={"Other Consideration is required"}
              />
            </div>
            <div className="col-md-6">
              <TextInputField
                label="Stamp Duty"
                type="number"
                name="stampDuty"
                placeholder="Stamp Duty"
                value={formData.stampDuty}
                onChange={handleChange}
                required={isRequired("stampDuty")}
                invalid={submitted && isRequired("stampDuty")}
                invalidMessage={"Stamp Duty is required"}
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <TextInputField
                label="Deposit Type"
                name="depositType"
                placeholder="Deposit Type"
                value={formData.depositType}
                onChange={handleChange}
                required={isRequired("depositType")}
                invalid={submitted && isRequired("depositType")}
                invalidMessage={"Deposit Type is required"}
              />
            </div>
            <div className="col-md-6">
              <TextInputField
                label="Deposit Bond Expiry"
                name="depositBondExpiry"
                placeholder="Deposit Bond Expiry"
                type="date"
                value={formData.depositBondExpiry}
                onChange={handleChange}
                required={isRequired("depositBondExpiry")}
                invalid={submitted && isRequired("depositBondExpiry")}
                invalidMessage={"Deposit Bond Expiry is required"}
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <TextInputField
                label="ENOS Id"
                name="enosId"
                placeholder="ENOS Id"
                value={formData.enosId}
                onChange={handleChange}
                required={isRequired("enosId")}
                invalid={submitted && isRequired("enosId")}
                invalidMessage={"ENOS Id is required"}
              />
            </div>
            <div className="col-md-6"></div>
          </div>
        </div>
        {/* </CustomToastWindow> */}
      </div>
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default AddConveyancing;
