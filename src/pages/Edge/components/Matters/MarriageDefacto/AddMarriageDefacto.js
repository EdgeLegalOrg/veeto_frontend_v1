import React, { Fragment, useState, useEffect } from "react";
import { Button, Input } from "reactstrap";
import { useDispatch } from "react-redux";
import LoadingPage from "../../../utils/LoadingPage";
import { getRequiredFields } from "../../../utils/Validation";
import { CustomToastWindow } from "../../customComponents/CustomComponents";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";

const initialState = {
  actingOnBehalf: "",
  matterInOtherCourt: "",
  useClientAddress: "",
  hearingPlace: "",
  courtName: "",
  proceedingsDescription: "",
  proceedingsAct: "",
};

const AddMarriageDefacto = (props) => {
  const { setExtraButtons } = props;
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [requiredFields, setRequiredFields] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialState);
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [formData, initialState]);

  useEffect(() => {
    if (setExtraButtons) {
      setExtraButtons(
        <div className="d-flex align-items-center">
          <Button
            type="submit"
            color="success"
            disabled={props.isArchived}
            onClick={() => {}}
            className="mx-2"
          >
            Save
          </Button>
        </div>,
      );
    }
  }, [setExtraButtons, formData, submitted, props.isArchived]);

  const isRequired = (field) => {
    return requiredFields.includes(field);
  };

  const fetchEnums = () => {
    let req = getRequiredFields("matter_marriage_defacto");

    if (req && req.requiredFields && req.requiredFields.length > 0) {
      setRequiredFields(req.requiredFields);
    }
  };

  useEffect(() => {
    fetchEnums();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckbox = () => {
    setFormData({ ...formData, useClientAddress: !formData.useClientAddress });
  };

  return (
    <Fragment>
      {/* <div className="row mt-2">
        <div className="d-flex align-items-center justify-content-end">
          <Button
            type="submit"
            color="success"
            onClick={() => {}}
            className="mx-1"
          >
            Save
          </Button>
        </div>
      </div> */}

      <div className="row">
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Acting on behalf"
            name="actingOnBehalf"
            placeholder="Acting on behalf"
            value={formData.actingOnBehalf}
            onChange={handleChange}
            required={isRequired("actingOnBehalf")}
            invalid={submitted && isRequired("actingOnBehalf")}
            invalidMessage="This field is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="If matter also in other court"
            name="matterInOtherCourt"
            placeholder="If matter also in other court"
            value={formData.matterInOtherCourt}
            onChange={handleChange}
            required={isRequired("matterInOtherCourt")}
            invalid={submitted && isRequired("matterInOtherCourt")}
            invalidMessage="This field is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Place of hearing"
            name="hearingPlace"
            placeholder="Place of hearing"
            value={formData.hearingPlace}
            onChange={handleChange}
            required={isRequired("hearingPlace")}
            invalid={submitted && isRequired("hearingPlace")}
            invalidMessage="This field is required"
          />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mt-3">
          <TextInputField
            label="Name of Court"
            name="courtName"
            placeholder="Name of Court"
            value={formData.courtName}
            onChange={handleChange}
            required={isRequired("courtName")}
            invalid={submitted && isRequired("courtName")}
            invalidMessage="This field is required"
          />
        </div>
        <div className="col-md-4 mt-3">
          <label>Describe proceeding</label>
          <TextInputField
            name="proceedingsDescription"
            placeholder="Describe proceeding"
            value={formData.proceedingsDescription}
            onChange={handleChange}
            required={isRequired("proceedingsDescription")}
            invalid={submitted && isRequired("proceedingsDescription")}
            invalidMessage="This field is required"
          />
        </div>
        <div className="col-md-4 mt-3"></div>
      </div>
      <div className="row mt-3 mb-3">
        <div onClick={handleCheckbox}>
          <Input
            type="checkbox"
            name="useClientAddress"
            checked={formData.useClientAddress}
          />
          <label className="mx-2">Use the client's residential address</label>
        </div>
      </div>

      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default AddMarriageDefacto;
