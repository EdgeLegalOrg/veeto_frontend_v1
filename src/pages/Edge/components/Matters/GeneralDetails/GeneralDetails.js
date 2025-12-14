import { useDispatch } from "react-redux";
import {
  SelectInputField,
  TextInputField,
} from "pages/Edge/components/InputField";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { editMatter } from "../../../apis";
import { datesToShow } from "../../../utils/Constant";
import LoadingPage from "../../../utils/LoadingPage";
import { getRequiredFields, validate } from "../../../utils/Validation";
import { updateFormStatusAction } from "slices/layouts/reducer";
import { checkHasPermission } from "pages/Edge/utils/utilFunc";
import { UPDATEMATTER } from "pages/Edge/utils/RightConstants";

const initialState = {
  type: "",
  subType: "",
  status: "",
  instructionDate: "",
  completionDate: "",
  notProceedingDate: "",
  settlementDate: "",
  adjustmentDate: "",
  exchangeDate: "",
  coolingOffDate: "",
  workObtained: null,
  feeEarnerId: "",
  responsiblePersonId: "",
  actingPersonId: "",
  assistingPersonId: "",
  referrerId: "",
  elnoWorkspaceNumber: "",
  disbursement: "",
  letterSubject: "",
  costs: "",
  clientReference: "",
  comments: "",
  flagArchived: false,
  // settlementMeridiem: '',
  // lastCorrespondenceDate: '',
  // archiveDate: '',
  // archiveNumber: '',
  // archivedBy: '',
  // settlementHour: '',
  // settlementMinute: '',
  // settlementVenueOrgId: '',
  // creditToId: '',
  // feeOwnerId: '',
  // category: '',
  // propertyList: [],
};

const GeneralDetails = (props) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  /******** Enums ********** */
  const [types, setTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [workObtList, setWorkObtList] = useState([]);
  const [status, setStatus] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]);

  const canUpdateMatter = checkHasPermission(UPDATEMATTER);

  const isRequired = (field) => {
    return requiredFields.includes(field);
  };

  const fetchEnums = () => {
    let req = getRequiredFields("matter");

    if (req && req.requiredFields && req.requiredFields.length > 0) {
      setRequiredFields(req.requiredFields);
    }

    let enumsList = JSON.parse(window.localStorage.getItem("enumList"));
    let typeList = JSON.parse(window.localStorage.getItem("matterTypeList"));

    if (typeList && typeList.length > 0) {
      setTypes(typeList);
    }

    let list = [];

    if (enumsList) {
      list =
        enumsList["WorkObtained"] && enumsList["WorkObtained"].length > 0
          ? enumsList["WorkObtained"]
          : [];
      setWorkObtList(list);
    }

    setTimeout(() => {
      setLoading(false);
    }, 1);
  };

  useEffect(() => {
    fetchEnums();
    // fetchStaff();
  }, []);

  useEffect(() => {
    setFormData(props.data);
    getStatus(props.data);
  }, [props.data]);

  useEffect(() => {
    fetchSubType(props.data);
  }, [props.data, types]);

  useEffect(() => {
    setStaffList(props.staffList);
  }, [props.staffList]);

  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(props.data);
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [formData, props.data]);

  const getStatus = (arg) => {
    if (arg.subType) {
      filterStatus({ value: arg.subType });
    }
  };

  const fetchSubType = (arg) => {
    let sub = types.filter((t) => t.value === arg.type);
    if (sub && sub[0]?.subType) {
      setSubTypes(sub[0].subType);
    }
  };

  const findDisplayName = (list = [], val) => {
    if (val) {
      let data = list?.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const filterStatus = (val) => {
    let obj = JSON.parse(window.localStorage.getItem("matterStatus"));
    let st = obj[val.value];

    if (st && st.length) {
      setStatus(st);
    } else {
      setStatus([]);
    }
  };

  const handleSelect = (name, val) => {
    let obj = { ...formData };
    if (name === "type") {
      setSubTypes(val.subType);
      setStatus([]);
      obj = { ...obj, subType: "", status: null };
    }

    if (name === "subType") {
      obj = { ...obj, status: null };
      setTimeout(() => {
        filterStatus(val);
      }, 10);
    }

    setFormData({ ...obj, [name]: val.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    let invalid = validate(formData, "matter");
    if (invalid) {
      setSubmitted(true);
      // toast.warning(`${invalid} field is required !`);
      setLoading(false);
    } else {
      try {
        const { data } = await editMatter(formData);
        if (!data.success) {
          toast.warning("Something went wrong, please try again later.");
        } else {
          if (props.refresh) {
            props.refresh(true);
          }
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

  const datesOnlyForConveyance = () => {
    if (formData && datesToShow && datesToShow.includes(formData.type)) {
      return (
        <div className="row mt-3">
          <div className="col-md-4">
            <TextInputField
              name="exchangeDate"
              label="Exchange Date"
              type="date"
              value={formData.exchangeDate}
              onChange={handleChange}
              required={isRequired("exchangeDate")}
              invalid={submitted && isRequired("exchangeDate")}
              invalidMessage="Exchange Date is required"
              disabled={!canUpdateMatter}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              name="coolingOffDate"
              label="Cooling Off Date"
              type="date"
              value={formData.coolingOffDate}
              onChange={handleChange}
              required={isRequired("coolingOffDate")}
              invalid={submitted && isRequired("coolingOffDate")}
              invalidMessage="Cooling Off Date is required"
              disabled={!canUpdateMatter}
            />
          </div>
          <div className="col-md-4" />
        </div>
      );
    } else {
      return null;
    }
  };

  const saveButton = () => {
    if (canUpdateMatter) {
      return (
        <div className="row mt-4">
          <div className="d-flex align-items-center justify-content-end pt-2">
            <Button color="success" onClick={handleSubmit} className="mx-4">
              Save
            </Button>
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="mx-2">
      {saveButton()}
      <div className="row mt-3">
        <div className="col-md-4">
          <SelectInputField
            name="type"
            label="Type"
            optionStyles={{ maxHeight: "365px" }}
            value={findDisplayName(types, formData.type)}
            optionArray={types}
            setDetails={setFormData}
            details={formData}
            onSelectFunc={(val) => handleSelect("type", val)}
            selected={formData.type}
            fieldVal={findDisplayName(types, formData.type)}
            maxLength={null}
            required={isRequired("type")}
            invalid={submitted && isRequired("type")}
            invalidMessage="Type is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4">
          <SelectInputField
            name="subType"
            label="Sub-type"
            optionStyles={{ maxHeight: "365px" }}
            disabled={subTypes.length <= 0 || !canUpdateMatter ? true : false}
            value={findDisplayName(subTypes, formData.subType)}
            optionArray={subTypes}
            setDetails={setFormData}
            details={formData}
            onSelectFunc={(val) => handleSelect("subType", val)}
            selected={formData.subType}
            fieldVal={findDisplayName(subTypes, formData.subType)}
            maxLength={null}
            required={isRequired("subType")}
            invalid={submitted && isRequired("subType")}
            invalidMessage="Sub-type is required"
          />
        </div>
        <div className="col-md-4">
          <SelectInputField
            name="status"
            label="Status"
            optionStyles={{ maxHeight: "365px" }}
            disabled={status.length <= 0 || !canUpdateMatter ? true : false}
            value={findDisplayName(status, formData.status)}
            optionArray={status}
            setDetails={setFormData}
            details={formData}
            onSelectFunc={(val) => handleSelect("status", val)}
            selected={formData.status}
            fieldVal={findDisplayName(status, formData.status)}
            maxLength={null}
            required={isRequired("status")}
            invalid={submitted && isRequired("status")}
            invalidMessage="Status is required"
          />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="Instruction Date"
            name="instructionDate"
            placeholder="Instruction Date"
            type="date"
            value={formData.instructionDate}
            onChange={handleChange}
            required={isRequired("instructionDate")}
            invalid={submitted && isRequired("instructionDate")}
            invalidMessage="Instruction Date is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Completion Date"
            name="completionDate"
            placeholder="Completion Date"
            type="date"
            value={formData.completionDate}
            onChange={handleChange}
            required={isRequired("completionDate")}
            invalid={submitted && isRequired("completionDate")}
            invalidMessage="Completion Date is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Not Proceeding Date"
            name="notProceedingDate"
            placeholder="Not Proceeding Date"
            type="date"
            value={formData.notProceedingDate}
            onChange={handleChange}
            required={isRequired("notProceedingDate")}
            invalid={submitted && isRequired("notProceedingDate")}
            invalidMessage="Not Proceeding Date is required"
            disabled={!canUpdateMatter}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <SelectInputField
            name="workObtained"
            label="Work Obtained"
            value={findDisplayName(workObtList, formData.workObtained)}
            optionArray={workObtList}
            setDetails={setFormData}
            details={formData}
            onSelectFunc={(val) => handleSelect("workObtained", val)}
            selected={formData.workObtained}
            fieldVal={findDisplayName(workObtList, formData.workObtained)}
            maxLength={null}
            required={isRequired("workObtained")}
            invalid={submitted && isRequired("workObtained")}
            invalidMessage="Work Obtained is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4">
          <SelectInputField
            name="feeEarnerId"
            label="Fee Earner"
            value={findDisplayName(staffList, formData.feeEarnerId)}
            optionArray={staffList}
            setDetails={setFormData}
            details={formData}
            onSelectFunc={(val) => handleSelect("feeEarnerId", val)}
            selected={formData.feeEarnerId}
            fieldVal={findDisplayName(staffList, formData.feeEarnerId)}
            maxLength={null}
            required={isRequired("feeEarnerId")}
            invalid={submitted && isRequired("feeEarnerId")}
            invalidMessage="Fee Earner is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4">
          <SelectInputField
            name="responsiblePersonId"
            label="Responsible Person"
            value={findDisplayName(staffList, formData.responsiblePersonId)}
            optionArray={staffList}
            setDetails={setFormData}
            details={formData}
            onSelectFunc={(val) => handleSelect("responsiblePersonId", val)}
            selected={formData.responsiblePersonId}
            fieldVal={findDisplayName(staffList, formData.responsiblePersonId)}
            maxLength={null}
            required={isRequired("responsiblePersonId")}
            invalid={submitted && isRequired("responsiblePersonId")}
            invalidMessage="Responsible Person is required"
            disabled={!canUpdateMatter}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <SelectInputField
            name="actingPersonId"
            label="Acting Person"
            value={findDisplayName(staffList, formData.actingPersonId)}
            optionArray={staffList}
            setDetails={setFormData}
            details={formData}
            onSelectFunc={(val) => handleSelect("actingPersonId", val)}
            selected={formData.actingPersonId}
            fieldVal={findDisplayName(staffList, formData.actingPersonId)}
            maxLength={null}
            required={isRequired("actingPersonId")}
            invalid={submitted && isRequired("actingPersonId")}
            invalidMessage="Acting Person is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4">
          <SelectInputField
            name="assistingPersonId"
            label="Assisting Person"
            value={findDisplayName(staffList, formData.assistingPersonId)}
            optionArray={staffList}
            setDetails={setFormData}
            details={formData}
            onSelectFunc={(val) => handleSelect("assistingPersonId", val)}
            selected={formData.assistingPersonId}
            fieldVal={findDisplayName(staffList, formData.assistingPersonId)}
            maxLength={null}
            required={isRequired("assistingPersonId")}
            invalid={submitted && isRequired("assistingPersonId")}
            invalidMessage="Assisting Person is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4">
          <SelectInputField
            name="referrerId"
            label="Referrer"
            value={findDisplayName(staffList, formData.referrerId)}
            optionArray={staffList}
            setDetails={setFormData}
            details={formData}
            onSelectFunc={(val) => handleSelect("referrerId", val)}
            selected={formData.referrerId}
            fieldVal={findDisplayName(staffList, formData.referrerId)}
            maxLength={null}
            required={isRequired("referrerId")}
            invalid={submitted && isRequired("referrerId")}
            invalidMessage="Referrer is required"
            disabled={!canUpdateMatter}
          />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="ELNO Workspace Number"
            name="elnoWorkspaceNumber"
            placeholder="ELNO Workspace Number"
            value={formData.elnoWorkspaceNumber}
            onChange={handleChange}
            required={isRequired("elnoWorkspaceNumber")}
            invalid={submitted && isRequired("elnoWorkspaceNumber")}
            invalidMessage="ELNO Workspace Number is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Disbursement"
            type="number"
            name="disbursement"
            placeholder="Disbursement"
            value={formData.disbursement}
            onChange={handleChange}
            required={isRequired("disbursement")}
            invalid={submitted && isRequired("disbursement")}
            invalidMessage="Disbursement is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Costs"
            type="number"
            name="costs"
            placeholder="Costs"
            value={formData.costs}
            onChange={handleChange}
            required={isRequired("costs")}
            invalid={submitted && isRequired("costs")}
            invalidMessage="Costs is required"
            disabled={!canUpdateMatter}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="Otherside Ref"
            name="clientReference"
            placeholder="Otherside Ref"
            value={formData.clientReference}
            onChange={handleChange}
            required={isRequired("clientReference")}
            invalid={submitted && isRequired("clientReference")}
            invalidMessage="Otherside Ref is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-8"></div>
      </div>

      {datesOnlyForConveyance()}

      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="Adjustment Date"
            name="adjustmentDate"
            placeholder="Adjustment Date"
            type="date"
            value={formData.adjustmentDate}
            onChange={handleChange}
            required={isRequired("adjustmentDate")}
            invalid={submitted && isRequired("adjustmentDate")}
            invalidMessage="Adjustment Date is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Settlement Date"
            name="settlementDate"
            placeholder="Settlement Date"
            type="date"
            value={formData.settlementDate}
            onChange={handleChange}
            required={isRequired("settlementDate")}
            invalid={submitted && isRequired("settlementDate")}
            invalidMessage="Settlement Date is required"
            disabled={!canUpdateMatter}
          />
        </div>
        <div className="col-md-4"></div>
      </div>
      <div className="row mt-3">
        <div className="col-md-12">
          <TextInputField
            label="RE"
            type="textarea"
            cols={3}
            name="letterSubject"
            placeholder="RE"
            value={formData.letterSubject}
            onChange={handleChange}
            required={isRequired("letterSubject")}
            invalid={submitted && isRequired("letterSubject")}
            invalidMessage="RE is required"
            disabled={!canUpdateMatter}
          />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-12">
          <TextInputField
            label="Comments"
            type="textarea"
            cols={3}
            name="comments"
            placeholder="Comments"
            value={formData.comments}
            onChange={handleChange}
            required={isRequired("comments")}
            invalid={submitted && isRequired("comments")}
            invalidMessage="Comments is required"
            disabled={!canUpdateMatter}
          />
        </div>
      </div>
      <div className="row mt-3"></div>
      {loading && <LoadingPage />}
    </div>
  );
};

export default GeneralDetails;
