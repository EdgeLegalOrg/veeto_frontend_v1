import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import BillTo from "./BillTo";
import Address from "./Address";
import LoadingPage from "../../../utils/LoadingPage";
import {
  addOrPreviewInvoice,
  getInvoiceTemplate,
  getServiceLine,
} from "../../../apis";
import ItemsList from "./ItemsList";
import ServiceLineSelected from "./ServiceLineSelected";
import NewServiceLine from "./NewServiceLine";
import TemplateList from "./TemplateList";
import TimedList from "./TimedList";
import SelectedTimedList from "./SelectedTimedList";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";

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

const AddNewInvoice = (props) => {
  const history = useNavigate();
  const [tab, setTab] = useState("");
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
    history({
      search: "",
    });

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

  const handleSaveInvoice = async () => {
    let invoiceData = {
      ...formData,
      matterId: props?.data?.id,
    };

    if (
      !invoiceData?.billToList?.length ||
      !invoiceData.fullAddress ||
      !invoiceData.invoiceDate
    ) {
      return toast.error("* Please add the mandatory fields");
    }

    if (
      invoiceData?.timeBillingList?.length === 0 &&
      invoiceData?.serviceLineList?.length === 0
    ) {
      return toast.error("Please add any item to create invoice.");
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
          autoClose: 5000,
        }
      );
      return;
    }

    try {
      setLoading(true);

      delete invoiceData.fullAddress;

      const { data } = await addOrPreviewInvoice(invoiceData, false);
      if (data.success) {
        toast.success("Invoice Saved!");
        if (props.refresh) {
          props.refresh();
        }

        setTimeout(() => {
          handleClose();
        }, 1);
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
        <div className="">
          <div>Bill to:</div>
          <div className="d-flex flex-wrap me-2">
            {formData?.billToList?.map((bill, i) => (
              <span className="mb-2 me-1" key={`${bill.billTo}_${i}`}>
                {`${bill.billTo} `}{" "}
                <Button color="danger" size="sm" className="mx-1">
                  <AiOutlineClose
                    size={18}
                    onClick={() => handleDeleteBillTo(i)}
                  />
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

  const addInvoiceUi = () => {
    return (
      <Fragment>
        <div className="d-flex align-items-center justify-content-between m-2">
          <h5>New Invoice</h5>
          <div className="d-flex">
            <Button className="mx-1" color="light" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="mx-1"
              color="success"
              onClick={handleSaveInvoice}
            >
              Save
            </Button>
          </div>
        </div>
        <div className="d-flex m-2 py-2">
          <Button className="mx-1" onClick={() => handleClick("BILLTO")}>
            Bill To <span>*</span>
          </Button>
          <Button
            className="mx-1"
            onClick={() => handleClick("ADDRESSTO")}
            disabled={!formData.billToList?.length}
          >
            Address <span>*</span>
          </Button>
          <Button className="mx-1" onClick={() => handleClick("ITEMS")}>
            Items
          </Button>
          <Button
            className="mx-1"
            onClick={() => handleClick("NEWSERVICE")}
            color="success"
          >
            New Item
          </Button>
          <Button
            className="mx-1"
            onClick={() => handleClick("TIMED")}
            color="success"
          >
            Timed
          </Button>
          <Button
            className="mx-1"
            onClick={() => handleClick("TEMPLATE")}
            color="success"
          >
            Template
          </Button>
        </div>
        <div className="row m-2">
          <div className="col-md-3">
            <label>
              Date <span className="text-danger">*</span>
            </label>
            <input
              name="date"
              placeholder="Date"
              type="date"
              required
              value={formData.invoiceDate}
              onChange={(e) => handleChange("invoiceDate", e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-md-6">{displayBillTo()}</div>
          <div className="col-md-3">{displayAddress()}</div>
        </div>
        <div>
          <ServiceLineSelected
            serviceList={formData.serviceLineList}
            onChange={handleChange}
          />
          <SelectedTimedList
            selectedList={formData.timeBillingList}
            onChange={handleChange}
          />
        </div>
        <BillTo
          active={tab === "BILLTO"}
          close={handleCloseTab}
          contactList={contactList}
          onChange={handleChange}
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

  return (
    <div className="ai-container">
      {addInvoiceUi()}
      {loading && <LoadingPage />}
    </div>
  );
};

export default AddNewInvoice;
