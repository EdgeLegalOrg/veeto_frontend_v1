import React, { useState, useEffect, Fragment } from "react";
import { useDispatch } from "react-redux";
import { Button } from "reactstrap";
import LoadingPage from "../../../utils/LoadingPage";
import { editFamilyLaw } from "../../../apis";
import { getRequiredFields, validate } from "../../../utils/Validation";
import { toast } from "react-toastify";
import { TextInputField } from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";

const initialState = {
  coHabitationDate: "",
  coHabitationMonth: "",
  coHabitationYear: "",
  marriageDate: "",
  marriagePlace: "",
  marriageState: "",
  marriageCountry: "",
  finalSeparationDate: "",
  finalSeparationMonth: "",
  finalSeparationYear: "",
  divorceDate: "",
  divorceCity: "",
  divorceCountry: "",
  certificateTitle: "",
};

const EditFamilyForm = (props) => {
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
    let req = getRequiredFields("matter_estate");

    if (req && req.requiredFields && req.requiredFields.length > 0) {
      setRequiredFields(req.requiredFields);
    }
  };

  useEffect(() => {
    fetchEnums();
  }, []);

  useEffect(() => {
    if (props.data) {
      setFormData(props.data);
    }
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
            disabled={props.isArchived}
            onClick={handleSubmit}
            className="mx-2"
          >
            Save
          </Button>
        </div>,
      );
    }
  }, [setExtraButtons, formData, submitted, props.isArchived]);

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

    let invalid = validate(d, "matter_family_law");

    if (invalid) {
      setSubmitted(true);
      // toast.warning(`${invalid} field is required !`);
      setLoading(false);
    } else {
      try {
        const { data } = await editFamilyLaw(d);
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
          btn1={'Cancel'}
          btn2='Update'
          heading='Edit Family Law Details'
          handleFunc={handleSubmit}
          autoClose={false}
          bodyStyle={{ marginTop: '0px' }}
        > */}
      <div>
        {/* <div className="mx-3">
          <h6 className="border-bottom pb-1">COHABITATION DATE</h6>
        </div> */}

        {/* <div className="row mt-2">
          <div className="d-flex align-items-center justify-content-end">
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
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Co-Habitation Date"
              name="coHabitationDate"
              placeholder="Co-Habitation Date"
              type="date"
              value={formData.coHabitationDate}
              onChange={handleChange}
              required={isRequired("coHabitationDate")}
              invalid={submitted && isRequired("coHabitationDate")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Co-Habitation Month"
              name="coHabitationMonth"
              placeholder="Co-Habitation Month"
              value={formData.coHabitationMonth}
              onChange={handleChange}
              required={isRequired("coHabitationMonth")}
              invalid={submitted && isRequired("coHabitationMonth")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Co-Habitation Year"
              name="coHabitationYear"
              placeholder="Co-Habitation Year"
              value={formData.coHabitationYear}
              onChange={handleChange}
              required={isRequired("coHabitationYear")}
              invalid={submitted && isRequired("coHabitationYear")}
              invalidMessage="This field is required"
            />
          </div>
        </div>
        <div className="mx-3">
          <h6 className="border-bottom pb-1">MARRIAGE</h6>
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Marriage Date"
              name="marriageDate"
              placeholder="Marriage Date"
              type="date"
              value={formData.marriageDate}
              onChange={handleChange}
              required={isRequired("marriageDate")}
              invalid={submitted && isRequired("marriageDate")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Marriage Place"
              name="marriagePlace"
              placeholder="Marriage Place"
              value={formData.marriagePlace}
              onChange={handleChange}
              required={isRequired("marriagePlace")}
              invalid={submitted && isRequired("marriagePlace")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Marriage State"
              name="marriageState"
              placeholder="Marriage State"
              value={formData.marriageState}
              onChange={handleChange}
              required={isRequired("marriageState")}
              invalid={submitted && isRequired("marriageState")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Marriage Country"
              name="marriageCountry"
              placeholder="Marriage Country"
              value={formData.marriageCountry}
              onChange={handleChange}
              required={isRequired("marriageCountry")}
              invalid={submitted && isRequired("marriageCountry")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3"></div>
          <div className="col-md-4 mb-3"></div>
        </div>
        <div className="mx-3">
          <h6 className="border-bottom pb-1">SEPARATION</h6>
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Final Separation Date"
              name="finalSeparationDate"
              placeholder="Final Separation Date"
              type="date"
              value={formData.finalSeparationDate}
              onChange={handleChange}
              required={isRequired("finalSeparationDate")}
              invalid={submitted && isRequired("finalSeparationDate")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Final Separation Month"
              name="finalSeparationMonth"
              placeholder="Final Separation Month"
              value={formData.finalSeparationMonth}
              onChange={handleChange}
              required={isRequired("finalSeparationMonth")}
              invalid={submitted && isRequired("finalSeparationMonth")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Final Separation Year"
              name="finalSeparationYear"
              placeholder="Final Separation Year"
              value={formData.finalSeparationYear}
              onChange={handleChange}
              required={isRequired("finalSeparationYear")}
              invalid={submitted && isRequired("finalSeparationYear")}
              invalidMessage="This field is required"
            />
          </div>
        </div>
        <div className="mx-3">
          <h6 className="border-bottom pb-1">DIVORCE</h6>
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Divorce Date"
              name="divorceDate"
              placeholder="Divorce Date"
              type="date"
              value={formData.divorceDate}
              onChange={handleChange}
              required={isRequired("divorceDate")}
              invalid={submitted && isRequired("divorceDate")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Divorce City"
              name="divorceCity"
              placeholder="Divorce City"
              value={formData.divorceCity}
              onChange={handleChange}
              required={isRequired("divorceCity")}
              invalid={submitted && isRequired("divorceCity")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Divorce Country"
              name="divorceCountry"
              placeholder="Divorce Country"
              value={formData.divorceCountry}
              onChange={handleChange}
              required={isRequired("divorceCountry")}
              invalid={submitted && isRequired("divorceCountry")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Certificate Title"
              name="certificateTitle"
              placeholder="Certificate Title"
              value={formData.certificateTitle}
              onChange={handleChange}
              required={isRequired("certificateTitle")}
              invalid={submitted && isRequired("certificateTitle")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3"></div>
          <div className="col-md-4 mb-3"></div>
        </div>
      </div>

      {/* </CustomToastWindow> */}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default EditFamilyForm;
