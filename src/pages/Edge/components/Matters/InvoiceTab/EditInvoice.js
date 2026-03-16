import React, { useEffect, useState, Fragment } from "react";
import { Button } from "reactstrap";
import BillTo from "./BillTo";
import Address from "./Address";
import LoadingPage from "../../../utils/LoadingPage";
import {
  editOrPreviewInvoice,
  getInvoiceById,
  getInvoiceTemplate,
  getServiceLine,
  printMatterInvoice,
} from "../../../apis";
import ItemsList from "./ItemsList";
import ServiceLineSelected from "./ServiceLineSelected";
import NewServiceLine from "./NewServiceLine";
import TemplateList from "./TemplateList";
import TimedList from "./TimedList";
import SelectedTimedList from "./SelectedTimedList";
import CustomSideDrawer from "../../customComponents/CustomSideDrawer";
import { AiFillPrinter } from "react-icons/ai";
import { checkHasPermission, roundToDigit } from "../../../utils/utilFunc";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { TextInputField } from "pages/Edge/components/InputField";
import { UNDOFINALINVOICE } from "pages/Edge/utils/RightConstants";

const initialData = {
  invoiceNumber: "",
  invoiceDate: new Date(),
  totalAmount: "",
  amountApplied: "",
  companyId: "",
  status: null,
  address1: "",
  address2: "",
  address3: "",
  city: "",
  state: "",
  postCode: "",
  country: "",
  invoiceDueDate: "",
  lastModifiedBy: "",
  lastModifiedDate: "",
  lastExportedToAccountBy: "",
  lastExportedToAccountDate: "",
  accountInvoiceId: "",
  flagExportAllowed: "",
  flagFinal: "",
  createdBy: "",
  billToList: [],
  timeBillingList: [],
  serviceLineList: [],
};

const EditInvoice = (props) => {
  const [tab, setTab] = useState("");
  const [dueDate, setDueDate] = useState(false);
  const [contactList, setContactList] = useState([]);
  const [serviceLineList, setServiceLineList] = useState([]);
  const [timedList, setTimedList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.data) {
      getMatterData(props.data);
    }
  }, [props.data]);

  useEffect(() => {
    if (props.invoiceData) {
      setFormData(props.invoiceData);
    }
  }, [props.invoiceData]);

  const refreshInvoiceData = async () => {
    let id = formData.id;
    try {
      const { data } = await getInvoiceById(id);
      if (data.success) {
        setFormData(data.data);
      } else {
        toast.error("Something went wrong, please try again.");
        setTimeout(() => {
          window.location.reload();
        }, 10);
      }
    } catch (error) {
      toast.error("Something went wrong, please try again.");
      console.error("error", error);
    }
  };

  const getMatterData = (arg) => {
    if (arg && arg.matterContacts && arg.matterContacts.length > 0) {
      parseContactList(arg.matterContacts);
    }

    if (arg && arg.timeBillingList && arg.timeBillingList.length > 0) {
      setTimedList(arg.timeBillingList);
    }
  };

  const parseContactList = (arg) => {
    let arr = [];
    arg.forEach((a) => {
      if (a.contactType === "ORGANISATION") {
        if (a.contactDetails) {
          arr.push({
            display: `${a.contactDetails.companyName || ""}`,
            value: a.contactId,
            type: a.contactType,
            valueKey: `${a.contactType}-${a.contactId}`,
            fullAddress: a.fullAddress,
            address1: a.contactDetails.mailingAddress1,
            address2: a.contactDetails.mailingAddress2,
            address3: a.contactDetails.mailingAddress3,
            country: a.contactDetails.mailingCountry,
            state: a.contactDetails.mailingState,
            city: a.contactDetails.mailingCity,
            postCode: a.contactDetails.mailingPostCode,
          });
        }
      } else {
        if (a.contactDetails) {
          arr.push({
            display: `${a.contactDetails.firstName || ""} ${
              a.contactDetails.lastName || ""
            }`,
            value: a.contactId,
            type: a.contactType,
            valueKey: `${a.contactType}-${a.contactId}`,
            fullAddress: a.fullAddress,
            address1: a.contactDetails.mailingAddress1,
            address2: a.contactDetails.mailingAddress2,
            address3: a.contactDetails.mailingAddress3,
            country: a.contactDetails.mailingCountry,
            state: a.contactDetails.mailingState,
            city: a.contactDetails.mailingCity,
            postCode: a.contactDetails.mailingPostCode,
          });
        }
      }
    });

    setContactList(arr);
  };

  const fetchServiceLine = async (type) => {
    if (serviceLineList?.length <= 0) {
      setLoading(true);
      try {
        const { data } = await getServiceLine();
        if (data.success) {
          setServiceLineList(data?.data?.serviceLineList);
          setTab(type);
        } else {
          console.error("Something went wrong, please try later");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Something went wrong, please try later");
      }
    } else {
      setTab(type);
    }
  };

  const fetchTemplateList = async (type) => {
    if (templateList?.length <= 0) {
      setLoading(true);
      try {
        const { data } = await getInvoiceTemplate();
        if (data.success) {
          setTemplateList(data?.data?.templateList);
          setTab(type);
        } else {
          console.error("Something went wrong, please try later");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Something went wrong, please try later");
      }
    } else {
      setTab(type);
    }
  };

  const handleClick = (type) => {
    switch (type) {
      case "BILLTO":
      case "ADDRESSTO":
      case "NEWSERVICE":
      case "TIMED":
        setTab(type);
        break;
      case "ITEMS":
        fetchServiceLine(type);
        break;
      case "TEMPLATE":
        fetchTemplateList(type);
        break;
      default:
        break;
    }
  };

  const handleCloseTab = () => {
    setTab("");
  };

  const handleClose = () => {
    if (props.onClose) {
      props.onClose();
    }

    setTimeout(() => {
      setFormData(initialData);
    });
  };

  const scrollToBottom = () => {
    let ele = document.querySelector("#matter-section");
    if (ele) {
      let height = ele.offsetHeight;
      window.scrollTo(0, height + 100);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (name === "timeBillingList" || name === "serviceLineList") {
      let isScroll = formData[name].length < value.length;
      if (isScroll) {
        setTimeout(() => {
          scrollToBottom();
        }, 50);
      }
    }
  };

  const validateServiceItem = () => {
    let valid = true;

    if (formData.serviceLineList.length) {
      for (let item of formData.serviceLineList) {
        if (item.billingFrequency?.toLowerCase() === "hourly" && !item.units) {
          valid = false;
          break;
        }
      }
    }

    return valid;
  };

  const validateServiceItemDesc = () => {
    let valid = true;

    if (formData.serviceLineList.length) {
      for (let item of formData.serviceLineList) {
        if (!item.serviceLineDesc?.trim()) {
          valid = false;
          break;
        }
      }
    }

    return valid;
  };

  const handleUpdate = async (arg) => {
    let invoiceData = { ...formData };

    if (arg) {
      invoiceData = {
        ...arg,
        matterId: props?.data?.id,
      };
    } else {
      invoiceData = {
        ...invoiceData,
        matterId: props?.data?.id,
      };
    }

    if (
      !invoiceData?.billToList?.length ||
      !invoiceData.fullAddress ||
      !invoiceData.invoiceDate
    ) {
      return toast.error("* Please add the mandatory fields");
    }

    const isItemsHasDescription = validateServiceItemDesc();

    if (!isItemsHasDescription) {
      toast.error("Description for service item is required.", {
        autoClose: 5000,
      });
      return;
    }

    const isServiceItemValid = validateServiceItem();

    if (!isServiceItemValid) {
      toast.error(
        "Unit for hourly service is required and must be greater than zero",
        {
          autoClose: 7000,
        }
      );
      return;
    }

    try {
      setLoading(true);

      delete invoiceData.fullAddress;

      const { data } = await editOrPreviewInvoice(invoiceData, false);
      if (data.success) {
        props.refresh();
        setTimeout(() => {
          handleClose();
          refreshInvoiceData();
        }, 10);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, please try later.");
      setLoading(false);
    }
  };

  const handleDeleteBillTo = (index) => {
    let arr = [...formData.billToList];

    let newArr = [].concat(arr.slice(0, index), arr.slice(index + 1));

    setFormData({ ...formData, billToList: newArr });
  };

  const displayBillTo = () => {
    if (formData && formData.billToList && formData.billToList.length > 0) {
      return (
        <div className="flx">
          <label>Bill to</label>

          <div className="d-flex flex-wrap me-2">
            {/* <span>{returnName(formData.billToList)}</span> */}
            {formData?.billToList?.map((bill, i) => (
              <span className="mb-2 me-1" key={`${bill.billTo}_${i}`}>
                {`${bill.billTo} `}{" "}
                <Button
                  color="danger"
                  size="sm"
                  className="mx-1"
                  disabled={checkForDisable()}
                  onClick={() => handleDeleteBillTo(i)}
                >
                  <AiOutlineClose size={18} />
                </Button>
              </span>
            ))}
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  };

  const displayAddress = () => {
    if (formData && formData.fullAddress) {
      return (
        <div className="flx">
          <label>Address</label>
          <div className="">
            <p>{formData.fullAddress}</p>
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  };

  const getDueDate = () => {
    if (formData.flagFinal) {
      handleMarkFinal();
    } else {
      setDueDate(true);
    }
  };

  const handleMarkFinal = () => {
    if (!formData.invoiceDueDate) {
      toast.error("Due Date is required!");
    } else {
      let invoiceData = {
        ...formData,
        flagFinal: !formData.flagFinal,
      };
      setFormData(invoiceData);
      handleUpdate({ ...invoiceData, flagExportAllowed: true });

      setTimeout(() => {
        setDueDate(false);
      }, 10);
    }
  };

  const findDueAmount = () => {
    let ttl = formData.totalAmount ? formData.totalAmount : 0.0;
    let rec = formData.amountApplied ? formData.amountApplied : 0.0;
    let a = parseFloat(ttl) - parseFloat(rec);
    return a ? roundToDigit(a) : `0.0`;
  };

  const checkForDisable = () => {
    if (formData.flagFinal) {
      return true;
    } else {
      return false;
    }
  };

  const handleExportXero = () => {
    let reqData = {
      ...formData,
      flagExportAllowed: !formData.flagExportAllowed,
    };
    handleUpdate(reqData);
  };

  const printInvoice = async (id) => {
    try {
      const newTab = window.open("about:blank", "_blank"); // Open a blank page in new tab

      if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
        // Popup window was blocked or failed to open
        const allowPopup = window.confirm(
          "Popup window was blocked. Please allow popups to view the HTML content in a new tab. Click OK to proceed."
        );

        if (!allowPopup) {
          return; // Stop execution if the user cancels
        }
      }

      const { data } = await printMatterInvoice(id);
      const html = data;

      if (newTab) {
        // Write HTML content to the new tab if it's open and not blocked
        newTab.document.write(html);
      }
    } catch (error) {
      console.error("Error fetching HTML:", error);
    }
  };

  const showMarkFinalButton = () => {
    if (formData.flagFinal) {
      if (checkHasPermission(UNDOFINALINVOICE)) {
        return (
          <Button className="d-flex mx-1" onClick={getDueDate}>
            Un-Mark Final
          </Button>
        );
      } else {
        return null;
      }
    } else {
      return (
        <Button className="d-flex mx-1" onClick={getDueDate}>
          Mark Final
        </Button>
      );
    }
  };

  const editInvoiceUi = () => {
    return (
      <Fragment>
        <div className="mx-2">
          <div className="d-flex align-items-center justify-content-between">
            <h5>{`Invoice Number: #${formData.invoiceNumber}`}</h5>
            <div className="d-flex align-items-end">
              <div className="d-flex ms-auto">
                <Button
                  className="d-flex mx-1"
                  onClick={handleClose}
                  color="light"
                >
                  Cancel
                </Button>
                <Button
                  className="d-flex mx-1"
                  color="success"
                  onClick={(e) => handleUpdate()}
                  disabled={checkForDisable()}
                >
                  Save
                </Button>
                {showMarkFinalButton()}

                <Button
                  className="d-flex mx-1"
                  onClick={() => printInvoice(formData.id)}
                >
                  <AiFillPrinter size={18} />
                </Button>
              </div>
              {formData.flagFinal && (
                <div
                  className="d-flex align-items-center export-btn"
                  onClick={handleExportXero}
                >
                  <input type="checkbox" checked={formData.flagExportAllowed} />
                  <label className="mb-0">Export to Xero</label>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 d-flex align-items-center">
            <div className="me-5">
              <label>Total Amount</label>
              <p>{`$ ${roundToDigit(formData.totalAmount)}`}</p>
            </div>
            <div className="me-5">
              <label>Received</label>
              <p>{`$ ${roundToDigit(formData.amountApplied)}`}</p>
            </div>
            <div className="me-5">
              <label>Due</label>
              <p
                className={`${findDueAmount() > 0 ? "text-danger" : ""}`}
              >{`$ ${findDueAmount()}`}</p>
            </div>
          </div>
        </div>
        <div className="d-flex m-2">
          <Button
            className="d-flex mx-1"
            onClick={() => handleClick("BILLTO")}
            disabled={checkForDisable()}
          >
            Bill To <span class="ms-1">*</span>
          </Button>
          <Button
            className="d-flex mx-1"
            onClick={() => handleClick("ADDRESSTO")}
            disabled={checkForDisable() || !formData.billToList?.length}
          >
            Address <span class="ms-1">*</span>
          </Button>
          <Button
            className="d-flex mx-1"
            onClick={() => handleClick("ITEMS")}
            disabled={checkForDisable()}
          >
            Items
          </Button>
          <Button
            className="d-flex mx-1"
            onClick={() => handleClick("NEWSERVICE")}
            disabled={checkForDisable()}
            color="success"
          >
            New Item
          </Button>
          <Button
            className="d-flex mx-1"
            onClick={() => handleClick("TIMED")}
            disabled={checkForDisable()}
            color="success"
          >
            Timed
          </Button>
          <Button
            className="d-flex mx-1"
            onClick={() => handleClick("TEMPLATE")}
            disabled={checkForDisable()}
            color="success"
          >
            Template
          </Button>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <TextInputField
              label="Date"
              name="date"
              placeholder="Date"
              type="date"
              required
              value={formData.invoiceDate}
              onChange={(e) => handleChange("invoiceDate", e.target.value)}
              disabled={checkForDisable()}
            />
          </div>
          <div className="col-md-6">{displayBillTo()}</div>
          <div className="col-md-3">{displayAddress()}</div>
        </div>
        <div className="mt-3">
          <ServiceLineSelected
            serviceList={formData.serviceLineList}
            onChange={handleChange}
            disabled={checkForDisable()}
            type="edit"
          />
          <SelectedTimedList
            selectedList={formData.timeBillingList}
            onChange={handleChange}
            disabled={checkForDisable()}
          />
        </div>
        <BillTo
          active={tab === "BILLTO"}
          close={handleCloseTab}
          contactList={contactList}
          onChange={handleChange}
          selectedList={formData.billToList}
        />
        <Address
          active={tab === "ADDRESSTO"}
          close={handleCloseTab}
          contactList={contactList}
          onChange={(arg) => setFormData({ ...formData, ...arg })}
        />
        <ItemsList
          active={tab === "ITEMS"}
          close={handleCloseTab}
          formData={formData}
          serviceList={serviceLineList}
          onChange={handleChange}
        />
        <TimedList
          active={tab === "TIMED"}
          close={handleCloseTab}
          formData={formData}
          timedList={timedList}
          onChange={handleChange}
        />
        <NewServiceLine
          active={tab === "NEWSERVICE"}
          close={handleCloseTab}
          serviceList={formData.serviceLineList}
          onChange={handleChange}
        />
        <TemplateList
          active={tab === "TEMPLATE"}
          close={handleCloseTab}
          templateList={templateList}
          serviceList={formData.serviceLineList}
          onChange={handleChange}
        />
      </Fragment>
    );
  };

  const markFinal = () => {
    return (
      <div className="bt-container p-2">
        <TextInputField
          label="Due Date"
          name="invoiceDueDate"
          placeholder="Due Date"
          type="date"
          required
          value={formData.invoiceDueDate}
          onChange={(e) => handleChange("invoiceDueDate", e.target.value)}
        />
        <Button className="mt-2" onClick={handleMarkFinal}>
          Confirm
        </Button>
      </div>
    );
  };

  return (
    <div className="ai-container p-2">
      {editInvoiceUi()}
      <CustomSideDrawer
        active={dueDate}
        onClose={() => setDueDate(false)}
        heading={"Mark Final"}
        body={markFinal}
      />
      {loading && <LoadingPage />}
    </div>
  );
};

export default EditInvoice;
