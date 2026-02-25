import React, { useState, useEffect, Fragment } from "react";
import { useDispatch } from "react-redux";
import { Button } from "reactstrap";
import LoadingPage from "../../../utils/LoadingPage";
import { editEstate } from "../../../apis";
import { getRequiredFields, validate } from "../../../utils/Validation";
import { toast } from "react-toastify";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";

const initialState = {
  deceasedName: "",
  deceasedNameOnDeathCertificate: "",
  deceasedDateOfBirth: "",
  deceasedDateOfDeath: "",
  deceasedAgeAtDeath: "",
  dateOfWill: "",
  pagesInWill: "",
  dateOf1stCodicil: "",
  dateOf2ndCodicil: "",
  dateOf3rdCodicil: "",
  numberOfCodicils: "",
  witness1NameAndOccupation: "",
  witness2NameAndOccupation: "",
  deceasedExecutor: "",
  relationshipOfExecutor1ToDeceased: "",
  relationshipOfExecutor2ToDeceased: "",
  relationshipOfExecutor3ToDeceased: "",
  caseNumber: "",
  dateOfIntendedApplication: "",
  dateOfAdd: "",
  dateOfGrant: "",
  grossValueOfEstate: "",
  netValueOfEstate: "",
  estateName: "",
};

const EditEState = (props) => {
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

    let invalid = validate(d, "matter_estate");

    if (invalid) {
      setSubmitted(true);
      // toast.warning(`${invalid} field is required !`);
      setLoading(false);
    } else {
      try {
        const { data } = await editEstate(d);
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
      <div className="mt-3">
        {/* <CustomToastWindow
          closeForm={props.close}
          btn1={'Cancel'}
          btn2='Update'
          heading='Update Estate'
          handleFunc={handleSubmit}
          autoClose={false}
          bodyStyle={{ marginTop: '0px' }}
          gridSize={'70%'}
        > */}

        {/* <div className="row">
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
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Deceased Name in Will"
              name="deceasedName"
              placeholder="Deceased Name in Will"
              value={formData.deceasedName}
              onChange={handleChange}
              required={isRequired("deceasedName")}
              invalid={submitted && isRequired("deceasedName")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Deceased Name On Death Certificate"
              name="deceasedNameOnDeathCertificate"
              placeholder="Deceased Name On Death Certificate"
              value={formData.deceasedNameOnDeathCertificate}
              onChange={handleChange}
              required={isRequired("deceasedNameOnDeathCertificate")}
              invalid={
                submitted && isRequired("deceasedNameOnDeathCertificate")
              }
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Deceased Date Of Birth"
              name="deceasedDateOfBirth"
              placeholder="Deceased Date Of Birth"
              type="date"
              value={formData.deceasedDateOfBirth}
              onChange={handleChange}
              required={isRequired("deceasedDateOfBirth")}
              invalid={submitted && isRequired("deceasedDateOfBirth")}
              invalidMessage="This field is required"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Deceased Date Of Death"
              name="deceasedDateOfDeath"
              placeholder="Deceased Date Of Death"
              type="date"
              value={formData.deceasedDateOfDeath}
              onChange={handleChange}
              required={isRequired("deceasedDateOfDeath")}
              invalid={submitted && isRequired("deceasedDateOfDeath")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Deceased Age At Death"
              name="deceasedAgeAtDeath"
              placeholder="Deceased Age At Death"
              value={formData.deceasedAgeAtDeath}
              onChange={handleChange}
              required={isRequired("deceasedAgeAtDeath")}
              invalid={submitted && isRequired("deceasedAgeAtDeath")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Date Of Will"
              name="dateOfWill"
              placeholder="Date Of Will"
              type="date"
              value={formData.dateOfWill}
              onChange={handleChange}
              required={isRequired("dateOfWill")}
              invalid={submitted && isRequired("dateOfWill")}
              invalidMessage="This field is required"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Pages In Will"
              name="pagesInWill"
              placeholder="Pages In Will"
              value={formData.pagesInWill}
              onChange={handleChange}
              required={isRequired("pagesInWill")}
              invalid={submitted && isRequired("pagesInWill")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Date Of 1st Codicil"
              name="dateOf1stCodicil"
              placeholder="Date Of 1st Codicil"
              type="date"
              value={formData.dateOf1stCodicil}
              onChange={handleChange}
              required={isRequired("dateOf1stCodicil")}
              invalid={submitted && isRequired("dateOf1stCodicil")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Date Of 2nd Codicil"
              name="dateOf2ndCodicil"
              placeholder="Date Of 2nd Codicil"
              value={formData.dateOf2ndCodicil}
              onChange={handleChange}
              required={isRequired("dateOf2ndCodicil")}
              invalid={submitted && isRequired("dateOf2ndCodicil")}
              invalidMessage="This field is required"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Date Of 3rd Codicil"
              name="dateOf3rdCodicil"
              placeholder="Date Of 3rd Codicil"
              value={formData.dateOf3rdCodicil}
              onChange={handleChange}
              required={isRequired("dateOf3rdCodicil")}
              invalid={submitted && isRequired("dateOf3rdCodicil")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Number Of Codicil"
              name="numberOfCodicils"
              placeholder="Number Of Codicil"
              value={formData.numberOfCodicils}
              onChange={handleChange}
              required={isRequired("numberOfCodicils")}
              invalid={submitted && isRequired("numberOfCodicils")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Witness 1 Name and Occupation"
              name="witness1NameAndOccupation"
              placeholder="Witness 1 Name and Occupation"
              value={formData.witness1NameAndOccupation}
              onChange={handleChange}
              required={isRequired("witness1NameAndOccupation")}
              invalid={submitted && isRequired("witness1NameAndOccupation")}
              invalidMessage="This field is required"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Witness 2 Name and Occupation"
              name="witness2NameAndOccupation"
              placeholder="Witness 2 Name and Occupation"
              value={formData.witness2NameAndOccupation}
              onChange={handleChange}
              required={isRequired("witness2NameAndOccupation")}
              invalid={submitted && isRequired("witness2NameAndOccupation")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Deceased Executor"
              name="deceasedExecutor"
              placeholder="Deceased Executor"
              value={formData.deceasedExecutor}
              onChange={handleChange}
              required={isRequired("deceasedExecutor")}
              invalid={submitted && isRequired("deceasedExecutor")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Relationship of Executor 1 To Deceased"
              name="relationshipOfExecutor1ToDeceased"
              placeholder="Relationship of Executor 1 To Deceased"
              value={formData.relationshipOfExecutor1ToDeceased}
              onChange={handleChange}
              required={isRequired("relationshipOfExecutor1ToDeceased")}
              invalid={
                submitted && isRequired("relationshipOfExecutor1ToDeceased")
              }
              invalidMessage="This field is required"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Relationship of Executor 2 To Deceased"
              name="relationshipOfExecutor2ToDeceased"
              placeholder="Relationship of Executor 2 To Deceased"
              value={formData.relationshipOfExecutor2ToDeceased}
              onChange={handleChange}
              required={isRequired("relationshipOfExecutor2ToDeceased")}
              invalid={
                submitted && isRequired("relationshipOfExecutor2ToDeceased")
              }
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Relationship of Executor 3 To Deceased"
              name="relationshipOfExecutor3ToDeceased"
              placeholder="Relationship of Executor 3 To Deceased"
              value={formData.relationshipOfExecutor3ToDeceased}
              onChange={handleChange}
              required={isRequired("relationshipOfExecutor3ToDeceased")}
              invalid={
                submitted && isRequired("relationshipOfExecutor3ToDeceased")
              }
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Case Number"
              name="caseNumber"
              placeholder="Case Number"
              value={formData.caseNumber}
              onChange={handleChange}
              required={isRequired("caseNumber")}
              invalid={submitted && isRequired("caseNumber")}
              invalidMessage="This field is required"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Date Of Intended Application"
              name="dateOfIntendedApplication"
              placeholder="Date Of Intended Application"
              type="date"
              value={formData?.dateOfIntendedApplication}
              onChange={handleChange}
              required={isRequired("dateOfIntendedApplication")}
              invalid={submitted && isRequired("dateOfIntendedApplication")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Date Of Advertisement"
              name="dateOfAdd"
              placeholder="Date Of Advertisement"
              type="date"
              value={formData.dateOfAdd}
              onChange={handleChange}
              required={isRequired("dateOfAdd")}
              invalid={submitted && isRequired("dateOfAdd")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Date Of Grant"
              name="dateOfGrant"
              placeholder="Date Of Grant"
              type="date"
              value={formData.dateOfGrant}
              onChange={handleChange}
              required={isRequired("dateOfGrant")}
              invalid={submitted && isRequired("dateOfGrant")}
              invalidMessage="This field is required"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Gross Value Of Estate"
              name="grossValueOfEstate"
              placeholder="Gross Value Of Estate"
              value={formData.grossValueOfEstate}
              onChange={handleChange}
              required={isRequired("grossValueOfEstate")}
              invalid={submitted && isRequired("grossValueOfEstate")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Net Value Of Estate"
              name="netValueOfEstate"
              placeholder="Net Value Of Estate"
              value={formData.netValueOfEstate}
              onChange={handleChange}
              required={isRequired("netValueOfEstate")}
              invalid={submitted && isRequired("netValueOfEstate")}
              invalidMessage="This field is required"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInputField
              label="Estate Name"
              name="estateName"
              placeholder="Estate Name"
              value={formData.estateName}
              onChange={handleChange}
              required={isRequired("estateName")}
              invalid={submitted && isRequired("estateName")}
              invalidMessage="This field is required"
            />
          </div>
        </div>

        <div className="row mt-3"></div>

        {/* </CustomToastWindow> */}
      </div>
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default EditEState;
