import { TextInputField } from "pages/Edge/components/InputField";
import { v1 as uuidv1 } from "uuid";
import { Fragment, useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import { AlertPopup } from "../../customComponents/CustomComponents";
import { getRequiredFields, validate } from "../../../utils/Validation";
import {
  API_BASE_URL,
  getAllBaseTemplates,
  getSiteInfo,
  updateSiteInfo,
} from "../../../apis";

import { toast } from "react-toastify";
import LoadingPage from "../../../utils/LoadingPage";
import { convertSubstring, findDisplayname } from "../../../utils/utilFunc";
import AddressList from "./AddressList";
import BankAccountList from "./BankAccountList";
import DisclaimerList from "./DisclaimerList";

const initialData = {
  siteName: "",
  siteCode: "",
  email1: "",
  phoneNumber1: "",
  phoneNumber2: "",
  faxNumber: "",
  website: "",
  disclaimer: "",
  defaultTemplateId: "",
  preferredBankAccountId: "",
  activeStatus: "",
  activatedDate: "",
  deactivatedDate: "",
  templateName: "",
  abn: "",
};

const SiteInfoPage = () => {
  document.title = "Site Details | EdgeLegal";
  const [siteInfo, setSiteInfo] = useState(initialData);
  const [bankList, setBankList] = useState([]);
  const [addressList, setAddressList] = useState([]);
  const [disclaimerList, setDisclaimerList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [logoImg, setLogoImg] = useState({});
  // const [warningData, setWarningData] = useState('');
  // const [filterInput, setFilterInput] = useState(initialFilter);
  // const [showWarning, setShowWarning] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [requiredFields, setRequiredFields] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [editLogo, setEditLogo] = useState(false);

  const fetchRequired = () => {
    let arr = [];
    JSON.parse(window.localStorage.getItem("metaData"))?.site_info?.fields?.map(
      (f) => {
        if (f.mandatory) {
          arr.push(f.fieldName);
        }
      }
    );
    setRequiredFields(arr);
  };

  const fetchSiteInfo = async () => {
    try {
      setLoading(true);
      const { data } = await getSiteInfo();
      if (data.success) {
        setSiteInfo({ ...siteInfo, ...data.data });
        setBankList(data?.data?.bankAccountList);
        setAddressList(data?.data?.siteAddressList);
        setDisclaimerList(data?.data?.disclaimerList);
      } else {
        toast.error("Something went wrong, please try later");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const parseList = (data) => {
    let arr = [];

    data.forEach((d) => {
      arr.push({ display: d.name, value: d.id });
    });

    setTemplateList(arr);
  };

  const findTemplateName = (id) => {
    if (id) {
      let data = templateList.find((d) => d.value === id);
      return data ? data.display : "";
    }
    return "";
  };

  const fetchTemplate = async () => {
    try {
      const { data } = await getAllBaseTemplates();
      if (data.success) {
        parseList(data.data.templateList);
      } else {
        toast.error("Something went wrong in fetching templates.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRequired();
    fetchTemplate();
    setTimeout(() => {
      fetchSiteInfo();
    }, 10);
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSiteInfo({ ...siteInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempData = {
      ...siteInfo,
    };
    const invalid = validate(tempData, "site_info");
    if (invalid) {
      return setSubmitted(true);
    }
    setLoading(true);
    try {
      let newData = { requestId: uuidv1(), data: siteInfo };

      delete newData.data["templateName"];

      let inputFormData = new FormData();

      inputFormData.append("siteInfoDetails", JSON.stringify(newData));
      inputFormData.append("siteLogo", logoImg.file);

      const { data } = await updateSiteInfo(inputFormData);
      if (!data.success) {
        setShowAlert(true);
        setAlertMsg(data?.error?.message);
      } else {
        fetchSiteInfo();
      }
    } catch (error) {
      toast.error("Something went wrong please check console.");
      console.error(error);
    } finally {
      setEditLogo(false);
      setLoading(false);
    }
  };

  const handleSelect = (val) => {
    setSiteInfo({
      ...siteInfo,
      defaultTemplateId: val.value,
      templateName: val.display,
    });
  };

  const handleUploadFile = (e) => {
    e.preventDefault();
    let file = e.target.files[0];
    setLogoImg({
      ...logoImg,
      file: file,
      filename: file.name,
    });
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Site Details" pageTitle="Admin" />
          <Card>
            <div className="bg-light d-flex align-items-center justify-content-between p-2">
              <h5 className="mb-0">Site Details</h5>
              <Button color="success" onClick={handleSubmit}>
                Save
              </Button>
            </div>
            <div className="companyInfo-container">
              <div className="companyInfo-section-1">
                {/* <div className="topStrip-style">
                  <p className="topStrip-heading">Site Details</p>
                  <button
                    className="custodyAddbtn"
                    onClick={handleSubmit}
                  >
                    Save
                  </button>
                </div> */}
                <div className="">
                  <div className="row">
                    <div className="col-md-3 mt-3">
                      <TextInputField
                        label="Site Name"
                        name="siteName"
                        placeholder="Site Name"
                        value={siteInfo.siteName}
                        onChange={handleFormChange}
                        required={requiredFields.indexOf("siteName") >= 0}
                        invalid={
                          submitted && requiredFields.indexOf("siteName") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid site name"
                        // maxLength={fieldLength['companyName'.toLowerCase()]}
                      />
                    </div>
                    {/* <CustomTextInput
                      name="title"
                      label="Title"
                      value={siteInfo.title}
                      onChange={handleFormChange}
                      // required={ submitted &&requiredFields.indexOf('title') >= 0 ? true : false}
                      // maxLength={fieldLength['title'.toLowerCase()]}
                    /> */}
                    <div className="col-md-3 mt-3">
                      <TextInputField
                        label="Site Code"
                        name="siteCode"
                        placeholder="Site Code"
                        value={siteInfo.siteCode}
                        onChange={handleFormChange}
                        required={requiredFields.indexOf("siteCode") >= 0}
                        invalid={
                          submitted && requiredFields.indexOf("siteCode") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid site code"
                        // maxLength={fieldLength['title'.toLowerCase(,)]}
                      />
                    </div>
                    <div className="col-md-3 mt-3">
                      <TextInputField
                        label="Phone"
                        name="phoneNumber1"
                        placeholder="Phone"
                        value={siteInfo.phoneNumber1}
                        onChange={handleFormChange}
                        required={requiredFields.indexOf("phoneNumber1") >= 0}
                        invalid={
                          submitted &&
                          requiredFields.indexOf("phoneNumber1") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid phone number"
                        // maxLength={fieldLength['phoneNumber1'.toLowerCase()]}
                      />
                    </div>

                    <div className="col-md-3 mt-3">
                      <TextInputField
                        label="Email"
                        name="email1"
                        placeholder="Email"
                        value={siteInfo.email1}
                        onChange={handleFormChange}
                        required={requiredFields.indexOf("email1") >= 0}
                        invalid={
                          submitted && requiredFields.indexOf("email1") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid email"
                        // maxLength={fieldLength['email1'.toLowerCase()]}
                      />
                    </div>
                    <div className="col-md-3 mt-3">
                      <TextInputField
                        label="Website"
                        name="website"
                        placeholder="Website"
                        value={siteInfo.website}
                        onChange={handleFormChange}
                        required={requiredFields.indexOf("website") >= 0}
                        invalid={
                          submitted && requiredFields.indexOf("website") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid website"
                        // maxLength={fieldLength['website'.toLowerCase()]}
                      />
                    </div>
                    <div className="col-md-3 mt-3">
                      <TextInputField
                        type="select"
                        label="Active Status"
                        name="activeStatus"
                        placeholder="Active Status"
                        value={siteInfo.activeStatus}
                        // selected={siteInfo.activeStatus}
                        optionArray={[
                          { label: "Active", value: true },
                          { label: "Deactive", value: false },
                        ]}
                        onChange={({ target }) =>
                          setSiteInfo((prev) => ({
                            ...prev,
                            activeStatus: target.value,
                          }))
                        }
                        required={requiredFields.indexOf("activeStatus") >= 0}
                        invalid={
                          submitted &&
                          requiredFields.indexOf("activeStatus") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid Active Status"
                        // details={siteInfo}
                        // fieldVal={siteInfo.activeStatus ? "Active" : "Deactive"}
                      />
                    </div>
                    <div className="col-md-3 mt-3">
                      <TextInputField
                        label="Date Active"
                        name="activatedDate"
                        placeholder="Date Active"
                        type="date"
                        value={convertSubstring(siteInfo.activatedDate)}
                        onChange={handleFormChange}
                        required={requiredFields.indexOf("activatedDate") >= 0}
                        invalid={
                          submitted &&
                          requiredFields.indexOf("activatedDate") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid Date Active"
                        // maxLength={fieldLength['address2'.toLowerCase()]}
                      />
                    </div>
                    <div className="col-md-3 mt-3">
                      <TextInputField
                        label="Date Deactived"
                        name="deactivatedDate"
                        placeholder="Date Deactived"
                        type="date"
                        value={convertSubstring(siteInfo.deactivatedDate)}
                        onChange={handleFormChange}
                        required={
                          requiredFields.indexOf("deactivatedDate") >= 0
                        }
                        invalid={
                          submitted &&
                          requiredFields.indexOf("deactivatedDate") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid Date Deactived"
                        // maxLength={fieldLength['address3'.toLowerCase()]}
                      />
                    </div>

                    <div className="col-md-3 mt-3">
                      <TextInputField
                        type="select"
                        name="defaultTemplateId"
                        label="Default Letter Head"
                        placeholder="Default Letter Head"
                        value={siteInfo.defaultTemplateId}
                        // selected={siteInfo.defaultTemplateId}
                        optionArray={templateList.map((d) => ({
                          label: d.display,
                          value: d.value,
                        }))}
                        onChange={({ target }) => {
                          setSiteInfo((prev) => ({
                            ...prev,
                            defaultTemplateId: target.value,
                          }));
                        }}
                        required={
                          requiredFields.indexOf("defaultTemplateId") >= 0
                        }
                        invalid={
                          submitted &&
                          requiredFields.indexOf("defaultTemplateId") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid Default Letter Head"
                        // details={siteInfo}
                        // onSelectFunc={(val) => handleSelect(val)}
                        // fieldVal={
                        //   siteInfo.templateName
                        //     ? siteInfo.templateName
                        //     : findTemplateName(siteInfo.defaultTemplateId)
                        // }
                        // maxLength={null}
                      />
                    </div>
                    <div className="col-md-3 mt-3">
                      <TextInputField
                        label="ABN"
                        name="abn"
                        placeholder="ABN"
                        value={siteInfo.abn}
                        onChange={handleFormChange}
                        required={requiredFields.indexOf("abn") >= 0}
                        invalid={
                          submitted && requiredFields.indexOf("abn") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid ABN"
                        // maxLength={fieldLength['website'.toLowerCase()]}
                      />
                    </div>
                    {siteInfo.logoPath && !editLogo ? (
                      <div className="col-md-3 mt-3">
                        <div className="d-flex justify-content-between">
                          <label>Site logo</label>{" "}
                          <span
                            className="text-primary pe-cursor"
                            onClick={() => setEditLogo(true)}
                          >
                            Edit
                          </span>
                        </div>
                        <div
                          className="w-100 p-1 "
                          style={{
                            border: "1px solid #ced4da",
                            borderRadius: "4px",
                          }}
                        >
                          <img
                            className="w-100"
                            src={`${API_BASE_URL}${siteInfo.logoPath}`}
                            alt="logo"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="col-md-3 mt-3 position-relative">
                        <TextInputField
                          label="Site Logo"
                          name="siteLogo"
                          placeholder="Site Logo"
                          type="file"
                          // value={logoImg.filename ? logoImg.filename : ''}
                          onChange={handleUploadFile}
                          accept="image/*"
                          required={requiredFields.indexOf("siteLogo") >= 0}
                          invalid={
                            submitted && requiredFields.indexOf("siteLogo") >= 0
                              ? true
                              : false
                          }
                          invalidMessage="Please enter site logo"
                          // maxLength={fieldLength['phoneNumber1'.toLowerCase()]}
                        />
                        {siteInfo.logoPath && editLogo && (
                          <span
                            className="position-absolute text-primary pe-cursor"
                            onClick={() => setEditLogo(false)}
                            style={{ top: 0, right: "14px" }}
                          >
                            Cancel
                          </span>
                        )}
                      </div>
                    )}

                    <div className="col-md-3 mt-3"></div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 mt-3">
                      <TextInputField
                        type="textarea"
                        label="Preferred Tax Disclaimer"
                        name="disclaimer"
                        placeholder="Preferred Tax Disclaimer"
                        cols={2}
                        value={
                          siteInfo?.preferredDisclaimer?.disclaimer
                            ? siteInfo?.preferredDisclaimer?.disclaimer
                            : ""
                        }
                        onChange={handleFormChange}
                        required={requiredFields.indexOf("disclaimer") >= 0}
                        invalid={
                          submitted && requiredFields.indexOf("disclaimer") >= 0
                            ? true
                            : false
                        }
                        invalidMessage="Please enter a valid Preferred Tax Disclaimer"
                        // maxLength={fieldLength['email1'.toLowerCase()]}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <AddressList
                  addressList={addressList}
                  siteInfo={siteInfo}
                  refresh={() => fetchSiteInfo()}
                />
              </div>
              <div className="">
                <BankAccountList
                  bankList={bankList}
                  siteInfo={siteInfo}
                  refresh={() => fetchSiteInfo()}
                />
              </div>
              <div className="">
                <DisclaimerList
                  disclaimerList={disclaimerList}
                  siteInfo={siteInfo}
                  refresh={() => fetchSiteInfo()}
                />
              </div>
            </div>

            {showAlert && (
              <Modal
                isOpen={showAlert}
                toggle={() => setShowAlert(false)}
                backdrop="static"
                scrollable={true}
                size="md"
                centered
              >
                <ModalHeader
                  toggle={() => setShowAlert(false)}
                  className="bg-light p-3"
                >
                  Confirm Your Action
                </ModalHeader>
                <ModalBody>
                  <AlertPopup
                    closeForm={() => setShowAlert(false)}
                    message={alertMsg}
                    btn1={"Close"}
                    btn2={"Refresh"}
                    handleFunc={fetchSiteInfo}
                  />
                </ModalBody>
              </Modal>
            )}

            {loading && <LoadingPage />}
          </Card>
        </Container>
      </div>
    </Fragment>
  );
};

export default SiteInfoPage;
