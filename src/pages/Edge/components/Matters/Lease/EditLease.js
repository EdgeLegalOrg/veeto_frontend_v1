import React, { useState, useEffect, Fragment } from "react";
import { useDispatch } from "react-redux";
import LoadingPage from "../../../utils/LoadingPage";
import { editLease } from "../../../apis";
import { getRequiredFields, validate } from "../../../utils/Validation";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { TextInputField } from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";

const initialState = {
  rent: "",
  term: "",
  commencementDate: "",
  terminationDate: "",
  rentCommencementDate: "",
  opt: "",
  optionTerms: "",
  renewalClause: "",
  premiseAddress: "",
  buildingAddress: "",
  complexAddress: "",
  premiseArea: "",
  buildingArea: "",
  complexArea: "",
  bankGuarantee: "",
  permittedUse: "",
  stateLaw: "",
  outgoingPayable: "",
  outgoingEST: "",
  outgoingCommencement: "",
  tradingHours: "",
  carSpaces: "",
};

const EditLease = (props) => {
  const { setExtraButtons } = props;
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [requiredFields, setRequiredFields] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const isRequired = (field) => {
    return requiredFields.includes(field);
  };

  const fetchEnums = () => {
    let req = getRequiredFields("matter_lease");

    if (req && req.requiredFields && req.requiredFields.length > 0) {
      setRequiredFields(req.requiredFields);
    }
  };

  useEffect(() => {
    fetchEnums();
  }, []);

  useEffect(() => {
    setFormData(props.data);
  }, [props.data]);

  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(props.data);
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [formData, props.data]);

  useEffect(() => {
    if (setExtraButtons) {
      setExtraButtons(
        <div className="d-flex align-items-center">
          <Button
            type="submit"
            color="success"
            onClick={handleSubmit}
            className="mx-2"
          >
            Save
          </Button>
        </div>,
      );
    }
  }, [setExtraButtons, formData, submitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    let d = {
      ...formData,
      matterId: props.matterId,
    };

    setLoading(true);

    let invalid = validate(d, "matter_lease");

    if (invalid) {
      setSubmitted(true);
      // toast.warning(`${invalid} field is required !`);
      setLoading(false);
    } else {
      try {
        const { data } = await editLease(d);
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
          btn2="Update"
          heading="Edit Lease Details"
          handleFunc={handleSubmit}
          autoClose={false}
          bodyStyle={{ marginTop: "0px" }}
          gridSize={"70%"}
        > */}
      {/* <div className="row mt-4">
          <div className="d-flex align-items-center justify-content-end p-2 border-top">
            <Button
              type="submit"
              color="success"
              onClick={handleSubmit}
              className="mx-1"
            >
              Save
            </Button>
          </div>
        </div> */}

      <div className="row">
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Term"
            name="term"
            placeholder="Term"
            value={formData.term}
            onChange={handleChange}
            required={isRequired("term")}
            invalid={submitted && isRequired("term")}
            invalidMessage="Term is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Rent"
            name="rent"
            placeholder="Rent"
            value={formData.rent}
            onChange={handleChange}
            required={isRequired("rent")}
            invalid={submitted && isRequired("rent")}
            invalidMessage="Rent is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Commencement Date"
            name="commencementDate"
            placeholder="Commencement Date"
            type="date"
            value={formData.commencementDate}
            onChange={handleChange}
            required={isRequired("commencementDate")}
            invalid={submitted && isRequired("commencementDate")}
            invalidMessage="Commencement Date is required"
          />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Termination Date"
            name="terminationDate"
            placeholder="Termination Date"
            type="date"
            value={formData.terminationDate}
            onChange={handleChange}
            required={isRequired("terminationDate")}
            invalid={submitted && isRequired("terminationDate")}
            invalidMessage="Termination Date is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Rent Commencement Date"
            name="rentCommencementDate"
            placeholder="Rent Commencement Date"
            type="date"
            value={formData.rentCommencementDate}
            onChange={handleChange}
            required={isRequired("rentCommencementDate")}
            invalid={submitted && isRequired("rentCommencementDate")}
            invalidMessage="Rent Commencement Date is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Periods"
            name="opt"
            placeholder="Periods"
            value={formData.opt}
            onChange={handleChange}
            required={isRequired("opt")}
            invalid={submitted && isRequired("opt")}
            invalidMessage="Periods is required"
          />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Renewal Clause"
            name="renewalClause"
            placeholder="Renewal Clause"
            value={formData.renewalClause}
            onChange={handleChange}
            required={isRequired("renewalClause")}
            invalid={submitted && isRequired("renewalClause")}
            invalidMessage="Renewal Clause is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Car Spaces"
            name="carSpaces"
            placeholder="Car Spaces"
            value={formData.carSpaces}
            onChange={handleChange}
            required={isRequired("carSpaces")}
            invalid={submitted && isRequired("carSpaces")}
            invalidMessage="Car Spaces is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Option Terms"
            name="optionTerms"
            placeholder="Option Terms"
            value={formData.optionTerms}
            onChange={handleChange}
            required={isRequired("optionTerms")}
            invalid={submitted && isRequired("optionTerms")}
            invalidMessage="Option Terms is required"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Premise Address"
            name="premiseAddress"
            placeholder="Premise Address"
            value={formData.premiseAddress}
            onChange={handleChange}
            required={isRequired("premiseAddress")}
            invalid={submitted && isRequired("premiseAddress")}
            invalidMessage="Premise Address is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Building Address"
            name="buildingAddress"
            placeholder="Building Address"
            value={formData.buildingAddress}
            onChange={handleChange}
            required={isRequired("buildingAddress")}
            invalid={submitted && isRequired("buildingAddress")}
            invalidMessage="Building Address is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Complex Address"
            name="complexAddress"
            placeholder="Complex Address"
            value={formData.complexAddress}
            onChange={handleChange}
            required={isRequired("complexAddress")}
            invalid={submitted && isRequired("complexAddress")}
            invalidMessage="Complex Address is required"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Premise Area"
            name="premiseArea"
            placeholder="Premise Area"
            value={formData.premiseArea}
            onChange={handleChange}
            required={isRequired("premiseArea")}
            invalid={submitted && isRequired("premiseArea")}
            invalidMessage="Premise Area is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Building Area"
            name="buildingArea"
            placeholder="Building Area"
            value={formData.buildingArea}
            onChange={handleChange}
            required={isRequired("buildingArea")}
            invalid={submitted && isRequired("buildingArea")}
            invalidMessage="Building Area is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Complex Area"
            name="complexArea"
            placeholder="Complex Area"
            value={formData.complexArea}
            onChange={handleChange}
            required={isRequired("complexArea")}
            invalid={submitted && isRequired("complexArea")}
            invalidMessage="Complex Area is required"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Bank Guarantee"
            name="bankGuarantee"
            placeholder="Payable"
            value={formData.bankGuarantee}
            onChange={handleChange}
            required={isRequired("bankGuarantee")}
            invalid={submitted && isRequired("bankGuarantee")}
            invalidMessage="Bank Guarantee is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Permitted Use"
            name="permittedUse"
            placeholder="Permitted Use"
            value={formData.permittedUse}
            onChange={handleChange}
            required={isRequired("permittedUse")}
            invalid={submitted && isRequired("permittedUse")}
            invalidMessage="Permitted Use is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="State Law"
            name="stateLaw"
            placeholder="State Law"
            value={formData.stateLaw}
            onChange={handleChange}
            required={isRequired("stateLaw")}
            invalid={submitted && isRequired("stateLaw")}
            invalidMessage="State Law is required"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Outgoing Payable"
            name="outgoingPayable"
            placeholder="Outgoing Payable"
            value={formData.outgoingPayable}
            onChange={handleChange}
            required={isRequired("outgoingPayable")}
            invalid={submitted && isRequired("outgoingPayable")}
            invalidMessage="Outgoing Payable is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Outgoing EST"
            name="outgoingEST"
            placeholder="Outgoing EST"
            value={formData.outgoingEST}
            onChange={handleChange}
            required={isRequired("outgoingEST")}
            invalid={submitted && isRequired("outgoingEST")}
            invalidMessage="Outgoing EST is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Outgoing Commencement"
            name="outgoingCommencement"
            placeholder="Outgoing Commencement"
            value={formData.outgoingCommencement}
            onChange={handleChange}
            required={isRequired("outgoingCommencement")}
            invalid={submitted && isRequired("outgoingCommencement")}
            invalidMessage="Outgoing Commencement is required"
          />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Trading Hours"
            name="tradingHours"
            placeholder="Trading Hours"
            value={formData.tradingHours}
            onChange={handleChange}
            required={isRequired("tradingHours")}
            invalid={submitted && isRequired("tradingHours")}
            invalidMessage="Trading Hours is required"
          />
        </div>
        <div className="col-md-4 mt-3"></div>
        <div className="col-md-4 mt-3"></div>
      </div>

      {/* </CustomToastWindow> */}
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default EditLease;
