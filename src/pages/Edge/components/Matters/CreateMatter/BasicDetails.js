import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import LoadingPage from "../../../utils/LoadingPage";
import { addMatter } from "../../../apis";
import { getRequiredFields, validate } from "../../../utils/Validation";
import { datesToShow } from "../../../utils/Constant";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";

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

const MatterBasicDetails = (props) => {
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

  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialState);
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [formData, initialState]);

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
  };

  const fetchStaff = async () => {
    if (props.fetchStaffList) {
      let res = await props.fetchStaffList();
      if (res === "fail") {
        toast.warning("Something went wrong, please try later.");
        window.location.reload();
      } else {
        setStaffList(res);
      }
    }

    setTimeout(() => {
      setLoading(false);
    }, 1);
  };

  useEffect(() => {
    fetchEnums();
    fetchStaff();
  }, []);

  useEffect(() => {
    setStaffList(props.staffList);
  }, [props.staffList]);

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
      obj = { ...obj, status: "INSTRUCTED" };
      setTimeout(() => {
        filterStatus(val);
      }, 10);
    }
    setFormData({ ...obj, [name]: val.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitted(true);
    const invalid = validate(formData, "matter");
    if (invalid) {
      // toast.warning(`${invalid} field is required !`);
      setLoading(false);
    } else {
      try {
        const { data } = await addMatter(formData);
        if (!data.success) {
          toast.warning("Internal server error");
        } else {
          if (props.fetchMatterList) {
            props.fetchMatterList();
            setTimeout(() => {
              props.close(true);
            }, 1);
          }
        }
        setLoading(false);
        setSubmitted(false);
      } catch (error) {
        toast.warning("Internal server error");
        console.error(error);
        setLoading(false);
        setSubmitted(false);
      }
    }
  };

  const datesOnlyForConveyance = () => {
    if (formData && datesToShow && datesToShow.includes(formData.type)) {
      return (
        <div className="row">
          <div className="col-md-4 mt-2">
            <TextInputField
              label="Exchange Date"
              name="exchangeDate"
              type="date"
              placeholder="Exchange Date"
              value={formData.exchangeDate}
              onChange={handleChange}
              required={isRequired("exchangeDate")}
              invalid={submitted && isRequired("exchangeDate")}
              invalidMessage="Exchange Date field is required"
            ></TextInputField>
          </div>
          <div className="col-md-4 mt-2">
            <TextInputField
              label="Cooling Off Date"
              name="coolingOffDate"
              type="date"
              placeholder="Cooling Off Date"
              value={formData.coolingOffDate}
              onChange={handleChange}
              required={isRequired("coolingOffDate")}
              invalid={submitted && isRequired("coolingOffDate")}
              invalidMessage="Cooling Off Date field is required"
            ></TextInputField>
          </div>
          <div className="col-md-4 mt-2"></div>
        </div>
      );
    } else {
      return <></>;
    }
  };

  const ui = () => {
    if (loading) {
      return (
        <div style={{ height: "50vh" }}>
          <LoadingPage />
        </div>
      );
    } else {
      return (
        <div>
          {/* <CustomToastWindow
            closeForm={props.close}
            btn1={"Cancel"}
            btn2="Add"
            heading="Add new matter"
            handleFunc={handleSubmit}
            autoClose={false}
            bodyStyle={{ marginTop: "0px" }}
          > */}
          <div className="row">
            <div className="col-md-4 mt-2">
              <SelectInputField
                name="type"
                label="Type"
                placeholder="Type"
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
                invalidMessage="Type field is required"
              />
            </div>
            <div className="col-md-4 mt-2">
              <SelectInputField
                name="subType"
                label="Sub-type"
                placeholder="Sub-type"
                disabled={subTypes.length <= 0 ? true : false}
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
                invalidMessage="Sub-type field is required"
              />
            </div>
            <div className="col-md-4 mt-2">
              <SelectInputField
                name="status"
                label="Status"
                placeholder="Status"
                disabled={status.length <= 0 ? true : false}
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
                invalidMessage="Status field is required"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mt-2">
              <TextInputField
                name="instructionDate"
                label="Instruction Date"
                type="date"
                placeholder="Instruction Date"
                value={formData.instructionDate}
                onChange={handleChange}
                required={isRequired("instructionDate")}
                invalid={submitted && isRequired("instructionDate")}
                invalidMessage="Instruction Date field is required"
              ></TextInputField>
            </div>
            <div className="col-md-4 mt-2">
              <TextInputField
                name="completionDate"
                label="Completion Date"
                type="date"
                placeholder="Completion Date"
                value={formData.completionDate}
                onChange={handleChange}
                required={isRequired("disbursement")}
                invalid={submitted && isRequired("disbursement")}
                invalidMessage="Disbursement field is required"
              ></TextInputField>
            </div>
            <div className="col-md-4 mt-2">
              <TextInputField
                name="notProceedingDate"
                label="Not Proceeding Date"
                type="date"
                placeholder="Not Proceeding Date"
                value={formData.notProceedingDate}
                onChange={handleChange}
                required={isRequired("disbursement")}
                invalid={submitted && isRequired("disbursement")}
                invalidMessage="Disbursement field is required"
              ></TextInputField>
            </div>
          </div>

          {datesOnlyForConveyance()}

          <div className="row">
            <div className="col-md-4 mt-2">
              <TextInputField
                name="adjustmentDate"
                label="Adjustment Date"
                type="date"
                placeholder="Adjustment Date"
                value={formData.adjustmentDate}
                onChange={handleChange}
                required={isRequired("disbursement")}
                invalid={submitted && isRequired("disbursement")}
                invalidMessage="Disbursement field is required"
              ></TextInputField>
            </div>
            <div className="col-md-4 mt-2">
              <TextInputField
                name="settlementDate"
                label="Settlement Date"
                type="date"
                placeholder="Settlement Date"
                value={formData.settlementDate}
                onChange={handleChange}
                required={isRequired("disbursement")}
                invalid={submitted && isRequired("disbursement")}
                invalidMessage="Disbursement field is required"
              ></TextInputField>
            </div>
            <div className="col-md-4 mt-2">
              <SelectInputField
                name="workObtained"
                label="Work Obtained"
                placeholder="Work Obtained"
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
                invalidMessage="Work Obtained field is required"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mt-2">
              <SelectInputField
                name="feeEarnerId"
                label="Fee Earner"
                placeholder="Fee Earner"
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
                invalidMessage="Fee Earner field is required"
              />
            </div>

            <div className="col-md-4 mt-2">
              <SelectInputField
                name="responsiblePersonId"
                label="Responsible Person"
                placeholder="Responsible Person"
                value={findDisplayName(staffList, formData.responsiblePersonId)}
                optionArray={staffList}
                setDetails={setFormData}
                details={formData}
                onSelectFunc={(val) => handleSelect("responsiblePersonId", val)}
                selected={formData.responsiblePersonId}
                fieldVal={findDisplayName(
                  staffList,
                  formData.responsiblePersonId
                )}
                maxLength={null}
                required={isRequired("responsiblePersonId")}
                invalid={submitted && isRequired("responsiblePersonId")}
                invalidMessage="Responsible Person field is required"
              />
            </div>

            <div className="col-md-4 mt-2">
              <SelectInputField
                name="actingPersonId"
                label="Acting Person"
                placeholder="Acting Person"
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
                invalidMessage="Acting Person field is required"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mt-2">
              <SelectInputField
                name="assistingPersonId"
                label="Assisting Person"
                placeholder="Assisting Person"
                value={findDisplayName(staffList, formData.assistingPersonId)}
                optionArray={staffList}
                setDetails={setFormData}
                details={formData}
                onSelectFunc={(val) => handleSelect("assistingPersonId", val)}
                selected={formData.assistingPersonId}
                fieldVal={findDisplayName(
                  staffList,
                  formData.assistingPersonId
                )}
                maxLength={null}
                required={isRequired("assistingPersonId")}
                invalid={submitted && isRequired("assistingPersonId")}
                invalidMessage="Assisting Person field is required"
              />
            </div>

            <div className="col-md-4 mt-2">
              <SelectInputField
                name="referrerId"
                label="Referrer"
                placeholder="Referrer"
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
                invalidMessage="Referrer field is required"
              />
            </div>

            <div className="col-md-4 mt-2">
              <TextInputField
                label="ELNO Workspace Number"
                name="elnoWorkspaceNumber"
                placeholder="ELNO Workspace Number"
                value={formData.elnoWorkspaceNumber}
                onChange={handleChange}
                required={isRequired("elnoWorkspaceNumber")}
                invalid={submitted && isRequired("elnoWorkspaceNumber")}
                invalidMessage="ELNO Workspace Number field is required"
              ></TextInputField>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mt-2">
              <TextInputField
                label="Disbursement"
                name="disbursement"
                type="number"
                placeholder="Disbursement"
                value={formData.disbursement}
                onChange={handleChange}
                required={isRequired("disbursement")}
                invalid={submitted && isRequired("disbursement")}
                invalidMessage="Disbursement field is required"
              ></TextInputField>
            </div>

            <div className="col-md-4 mt-2">
              <TextInputField
                label="Costs"
                name="costs"
                type="number"
                placeholder="Costs"
                value={formData.costs}
                onChange={handleChange}
                required={isRequired("costs")}
                invalid={submitted && isRequired("costs")}
                invalidMessage="Costs field is required"
              ></TextInputField>
            </div>

            <div className="col-md-4 mt-2">
              <TextInputField
                label="Otherside Ref"
                name="clientReference"
                placeholder="Otherside Ref"
                value={formData.clientReference}
                onChange={handleChange}
                required={isRequired("clientReference")}
                invalid={submitted && isRequired("clientReference")}
                invalidMessage="Otherside Ref field is required"
              ></TextInputField>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mt-2">
              <TextInputField
                type="textarea"
                cols={3}
                label="RE"
                name="letterSubject"
                placeholder="RE"
                value={formData.letterSubject}
                onChange={handleChange}
                required={isRequired("letterSubject")}
                invalid={submitted && isRequired("letterSubject")}
                invalidMessage="RE field is required"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mt-2">
              <TextInputField
                type="textarea"
                label="Comments"
                name="comments"
                placeholder="Comments"
                value={formData.comments}
                onChange={handleChange}
                required={isRequired("comments")}
                invalid={submitted && isRequired("comments")}
                invalidMessage="Comments field is required"
                rows={1}
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

          {/* </CustomToastWindow> */}
        </div>
      );
    }
  };

  return ui();
};

export default MatterBasicDetails;
