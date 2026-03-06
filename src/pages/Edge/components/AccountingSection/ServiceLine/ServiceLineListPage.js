import React, { Fragment, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Button,
  Table,
  Form,
  Row,
  Col,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import {
  deleteServiceLine,
  getServiceLine,
  getServiceLineDetail,
} from "../../../apis";
import { AiOutlineClose } from "react-icons/ai";
import LoadingPage from "../../../utils/LoadingPage";
import "../../../stylesheets/ServiceLines.css";
import ServiceLineDetail from "./ServiceLineDetail";
import AddServiceLine from "./AddServiceLine";
import UpdateServiceDetails from "./UpdateServiceDetails";
import { AlertPopup } from "../../customComponents/CustomComponents";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import { toast } from "react-toastify";
import { TextInputField } from "pages/Edge/components/InputField";
import { MdFilterAltOff } from "react-icons/md";

const ServiceLineListPage = () => {
  document.title = "Service Lines | EdgeLegal";
  const [billingList, setBillingList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [taxTypeList, setTaxTypeList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [filterInput, setFilterInput] = useState("");
  const [serviceDetails, setServiceDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchServiceLines = async () => {
    try {
      setLoading(true);
      const { data } = await getServiceLine();
      if (data.success) {
        setServiceList(data.data.serviceLineList);
        setFilteredList(data.data.serviceLineList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data.metadata.page.totalRecords);
      } else {
        toast.warning(
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
      setBillingList(data.BillingFrequency ? data.BillingFrequency : []);
      setTaxTypeList(data.TaxType ? data.TaxType : []);
      setTypeList(data.ServiceLineType ? data.ServiceLineType : []);
    }
  };

  useEffect(() => {
    fetchServiceLines();
    fetchEnumList();
  }, []);

  const filterData = (search) => {
    const newData = serviceList.filter(
      (obj) =>
        `${obj.serviceLineTitle}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()) ||
        `$${obj.amount}`.includes(search.trim())
    );
    setFilteredList(newData);
  };

  const handleSearch = (e) => {
    setFilterInput(e.target.value);
    filterData(e.target.value);
  };
  const handleResetFilter = () => {
    setFilterInput("");
    setFilteredList(serviceList);
  };

  const fetchServiceDetails = async (id, hardRefresh = false) => {
    if (id !== serviceDetails?.id || hardRefresh) {
      setLoading(true);
      try {
        const { data } = await getServiceLineDetail(id);
        if (data.success) {
          setServiceDetails(data.data);
          handleRightSide();
        } else {
          toast.warning("Something went wrong please try later.");
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
      setServiceDetails({});
    }, 1);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const { data } = await deleteServiceLine(serviceDetails.id);
      if (!data.success) {
        toast.warning("Something went wrong, please try later");
      } else {
        fetchServiceLines();
        setTimeout(() => {
          handleCloseRight();
        }, 10);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleOpenAlert = () => {
    setOpenAlert(true);
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb Lines title="Service Lines" pageTitle="Service Lines" />
          <Card>
            <CardHeader className="border-0">
              <div className="d-md-flex align-items-center">
                <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                  Service Lines
                </h5>
                <Button
                  color="success"
                  className="d-flex"
                  onClick={() => setShowAdd(true)}
                >
                  <span className="plusdiv">+</span> Add
                </Button>
              </div>
            </CardHeader>
            <div className="serviceLine-containerDiv">
              <div id="serviceLine-left" className="serviceLine-leftDiv">
                <div className="serviceLine-searchDiv d-flex justify-content-between">
                  <TextInputField
                    placeholder="Search service line items"
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
                <Table responsive={true} striped={true} hover={true}>
                  <tbody>
                    {filteredList?.map((s) => (
                      <tr
                        onClick={() => fetchServiceDetails(s.id)}
                        key={s.id}
                        className="pe-cursor"
                      >
                        <td>{s.serviceLineTitle}</td>
                        <td>
                          <p className="serviceLine-amountPara mb-0">{`$${s.amount}`}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div id="serviceLine-right" className="serviceLine-hide">
                <div className="bg-light d-flex align-items-center p-2 border-top">
                  <Button
                    className="d-flex mx-1"
                    color="success"
                    onClick={() => setShowUpdate(true)}
                  >
                    Update
                  </Button>
                  <Button
                    className="d-flex mx-1"
                    color="danger"
                    onClick={handleOpenAlert}
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
                  <ServiceLineDetail
                    details={serviceDetails}
                    billingList={billingList}
                    typeList={typeList}
                    taxTypeList={taxTypeList}
                  />
                </div>
              </div>
            </div>

            {loading && <LoadingPage />}

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
                  Add New Service Line
                </ModalHeader>
                <ModalBody>
                  <AddServiceLine
                    setShowAdd={setShowAdd}
                    refresh={fetchServiceLines}
                    billingList={billingList}
                    typeList={typeList}
                    taxTypeList={taxTypeList}
                  />
                </ModalBody>
              </Modal>
            )}

            {showUpdate && (
              <Modal
                isOpen={showUpdate}
                toggle={() => setShowUpdate(false)}
                backdrop="static"
                scrollable={true}
                size="lg"
                centered
              >
                <ModalHeader
                  toggle={() => setShowUpdate(false)}
                  className="bg-light p-3"
                >
                  Update Service Line
                </ModalHeader>
                <ModalBody>
                  <UpdateServiceDetails
                    details={serviceDetails}
                    setShowUpdate={setShowUpdate}
                    refresh={() => {
                      fetchServiceDetails(serviceDetails.id, true);
                      fetchServiceLines();
                    }}
                    billingList={billingList}
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
          </Card>
        </Container>
      </div>
    </Fragment>
  );
};

export default ServiceLineListPage;
