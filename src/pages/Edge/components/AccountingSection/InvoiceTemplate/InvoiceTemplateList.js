import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import {
  deleteInvoiceTemplate,
  getInvoiceDetail,
  getInvoiceTemplate,
  getServiceLine,
} from "../../../apis";
import { AiOutlineClose } from "react-icons/ai";
import LoadingPage from "../../../utils/LoadingPage";
import TemplateDetail from "./TemplateDetail";
import AddInvoiceTemplate from "./AddInvoiceTemplate";
import UpdateInvoiceTemplate from "./UpdateInvoiceTemplate";
import { AlertPopup } from "../../customComponents/CustomComponents";
import "../../../stylesheets/ServiceLines.css";
import { toast } from "react-toastify";
import { TextInputField } from "pages/Edge/components/InputField";
import { MdFilterAltOff } from "react-icons/md";

const InvoiceTemplateList = () => {
  document.title = "Invoices | EdgeLegal";
  const [typeList, setTypeList] = useState([]);
  const [taxTypeList, setTaxTypeList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [filterInput, setFilterInput] = useState("");
  const [tempDetail, setTempDetail] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchInvoiceTemplate = async () => {
    try {
      setLoading(true);
      const { data } = await getInvoiceTemplate();
      if (data.success) {
        setTemplateList(data.data.templateList);
        setFilteredList(data.data.templateList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data.metadata.page.totalRecords);
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const fetchServiceLines = async () => {
    try {
      setLoading(true);
      const { data } = await getServiceLine();
      if (data.success) {
        setServiceList(data.data.serviceLineList);
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const fetchEnumList = () => {
    let data = JSON.parse(window.localStorage.getItem("enumList"));
    if (data) {
      setTaxTypeList(data.TaxType ? data.TaxType : []);
      setTypeList(data.ServiceLineType ? data.ServiceLineType : []);
    }
  };

  useEffect(() => {
    fetchServiceLines();
    fetchInvoiceTemplate();
    fetchEnumList();
  }, []);

  const filterData = (search) => {
    const newData = templateList.filter((obj) =>
      `${obj?.templateName}`
        ?.toLowerCase()
        ?.includes(search?.trim()?.toLowerCase())
    );
    setFilteredList(newData);
  };

  const handleSearch = (e) => {
    setFilterInput(e.target.value);
    filterData(e.target.value);
  };

  const fetchTempDetail = async (id, hardRefresh = false) => {
    if (id !== tempDetail?.id || hardRefresh) {
      setLoading(true);
      try {
        const { data } = await getInvoiceDetail(id);
        if (data.success) {
          setTempDetail(data.data);
          handleRightSide();
        } else {
          toast.error("Something went wrong please try later.");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    }
  };

  const handleRightSide = () => {
    const rightSide = document.querySelector("#serviceLine-right");
    const leftSide = document.querySelector("#serviceLine-left");
    rightSide.classList.remove("serviceLine-hide");
    rightSide.classList.add("serviceLine-show");
    leftSide.style.width = "40%";
  };

  const handleCloseRight = () => {
    const rightSide = document.querySelector("#serviceLine-right");
    const leftSide = document.querySelector("#serviceLine-left");
    rightSide.classList.remove("serviceLine-show");
    rightSide.classList.add("serviceLine-hide");
    leftSide.style.width = "100%";
    setTimeout(() => {
      setTempDetail({});
    }, 1);
  };

  const handleDeleteAlert = () => {
    setOpenAlert(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { data } = await deleteInvoiceTemplate(tempDetail.id);
      if (data.success) {
        fetchInvoiceTemplate();
        handleCloseRight();
      } else {
        let msg = data?.error?.message
          ? data.error.message
          : "Something went wrong please try later.";
        toast.error(msg);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setFilterInput("");
    setFilteredList(templateList);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Invoices" pageTitle="Invoices" />
        <Card>
          <div className="serviceLine-containerDiv">
            <div id="serviceLine-left" className="serviceLine-leftDiv">
              <div className="bg-light d-flex align-items-center justify-content-between p-2">
                <h5 className="mb-0">Invoice Templates</h5>
                <Button
                  color="success"
                  className="d-flex"
                  onClick={() => setShowAdd(true)}
                >
                  <span className="plusdiv">+</span> Add
                </Button>
              </div>
              <div className="d-flex justify-content-between serviceLine-searchDiv">
                <TextInputField
                  placeholder="Search by name"
                  type="text"
                  onChange={handleSearch}
                  value={filterInput}
                />
                <Button
                  type="button"
                  color="danger"
                  className="mx-1"
                  onClick={() => handleResetFilter()}
                >
                  <MdFilterAltOff size={18} />
                </Button>
              </div>
              <div className="serviceLine-listContainer m-2">
                <Table responsive={true} striped={true} hover={true}>
                  <tbody>
                    {filteredList?.map((t) => (
                      <tr
                        // onClick={() => handleRightSide()}
                        onClick={() => fetchTempDetail(t.id)}
                        key={t.id}
                        className="pe-cursor"
                      >
                        <td>
                          <p className="mb-0">{t.templateName}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
            <div id="serviceLine-right" className="serviceLine-hide">
              <div className="bg-light d-flex align-items-center p-2 border-top">
                <h5 className="mx-2">{tempDetail.templateName}</h5>
                <Button
                  className="mx-1"
                  color="success"
                  onClick={() => setShowEdit(true)}
                >
                  Update
                </Button>
                <Button
                  className="d-flex mx-1"
                  color="danger"
                  onClick={handleDeleteAlert}
                >
                  <span className="plusdiv">-</span> Delete
                </Button>
                <Button
                  className="d-flex mx-1"
                  color="warning"
                  onClick={handleCloseRight}
                >
                  <span>
                    <AiOutlineClose /> Close
                  </span>
                </Button>
              </div>
              <div>
                <TemplateDetail
                  data={tempDetail}
                  // billingList={billingList}
                  typeList={typeList}
                  taxTypeList={taxTypeList}
                />
              </div>
            </div>
          </div>
          {showAdd && (
            <Modal
              isOpen={showAdd}
              toggle={() => setShowAdd(false)}
              backdrop="static"
              scrollable={true}
              size="lg"
              centered
            >
              <ModalHeader
                toggle={() => setShowAdd(false)}
                className="bg-light p-3"
              >
                Add new Template
              </ModalHeader>
              <ModalBody>
                <AddInvoiceTemplate
                  setShowAdd={setShowAdd}
                  serviceList={serviceList}
                  typeList={typeList}
                  taxTypeList={taxTypeList}
                  refresh={fetchInvoiceTemplate}
                />
              </ModalBody>
            </Modal>
          )}
          {showEdit && (
            <Modal
              isOpen={showEdit}
              toggle={() => setShowEdit(false)}
              backdrop="static"
              scrollable={true}
              size="lg"
              centered
            >
              <ModalHeader
                toggle={() => setShowEdit(false)}
                className="bg-light p-3"
              >
                Add new Template
              </ModalHeader>
              <ModalBody>
                <UpdateInvoiceTemplate
                  data={tempDetail}
                  setShowEdit={setShowEdit}
                  refresh={() => {
                    fetchTempDetail(tempDetail.id, true);
                    // fetchServiceLines();
                  }}
                  serviceList={serviceList}
                  typeList={typeList}
                  taxTypeList={taxTypeList}
                />
              </ModalBody>
            </Modal>
          )}
          {openAlert && (
            <Modal
              isOpen={openAlert}
              toggle={() => setOpenAlert(false)}
              backdrop="static"
              scrollable={true}
              size="md"
              centered
            >
              <ModalHeader
                toggle={() => setOpenAlert(false)}
                className="bg-light p-3"
              >
                Confirm Your Action
              </ModalHeader>
              <ModalBody>
                <AlertPopup
                  message="Are you sure you want to delete the record?"
                  heading="Confirm Your Action"
                  closeForm={() => setOpenAlert(false)}
                  btn1={"No"}
                  btn2="Yes"
                  handleFunc={handleDelete}
                />
              </ModalBody>
            </Modal>
          )}
          {loading && <LoadingPage />}
        </Card>
      </Container>
    </div>
  );
};

export default InvoiceTemplateList;
