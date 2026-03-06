import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
} from "reactstrap";
import upArrow from "../../../images/upArrow.svg";
import downArrow from "../../../images/downArrow.svg";
import downArrowColoured from "../../../images/downArrowColoured.svg";
import upArrowColoured from "../../../images/upArrowColoured.svg";
import {
  formatDateFunc,
  findDisplayname,
  formatCurrency,
} from "../../../utils/utilFunc";
import { MdFilterAltOff, MdSearch } from "react-icons/md";
import { AiOutlineClose, AiFillPrinter } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";

import "../../../stylesheets/ManageUserPage.css";
import ViewPaymentDetails from "./ViewPaymentDetails";
import { deletePaymentById } from "pages/Edge/apis";
import { createPortal } from "react-dom";
import LoadingPage from "pages/Edge/utils/LoadingPage";

const PaymentTable = (props) => {
  const [labelSort, setLabelSort] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [viewDetail, setViewDetail] = useState(null);
  const [type, setType] = useState([]);
  const [status, setStatus] = useState([]);
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const paymentId = useRef(null);

  const { handleRefresh, filterInput, setFilterInput, handleResetFilter } =
    props;

  useEffect(() => {
    setList(props.list);
  }, [props.list]);

  useEffect(() => {
    fetchEnums();
  }, []);

  const fetchEnums = () => {
    const enums = JSON.parse(window.localStorage.getItem("enumList"));

    if (enums) {
      if (enums["PaymentType"]) {
        setType(enums["PaymentType"]);
      }

      if (enums["PaymentStatus"]) {
        setStatus(enums["PaymentStatus"]);
      }
    }
  };

  const handleSortByLabel = (field) => {
    if (labelSort !== field) {
      setLabelSort(field);
      setSortOrder("asc");
      setSortField(field);
      handleRefresh({ ...filterInput, sortOn: field, sortType: "ASC" });
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(field);
      handleRefresh({ ...filterInput, sortOn: field, sortType: "DESC" });
    }
  };

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });

    setTimeout(() => {
      if (["paymentType"].includes(name)) {
        handleRefresh({ ...filterInput, [name]: value });
      }
    }, 10);
  };

  // const handleStatusFilter = (e) => {
  //   const { name, value } = e.target;
  //   setFilterInput({
  //     ...filterInput,
  //     [name]: value === '' || value === 'None' ? '' : value,
  //   });
  //   handleRefreshList({
  //     ...filterInput,
  //     [name]: value === '' || value === 'None' ? '' : value,
  //   });
  // };

  const handleSelect = (e, id) => {
    e.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected?.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      let newSelected = [];
      list?.forEach((l) => newSelected.push(l.id));
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const isSelected = (id) => selected.includes(id);

  const closeViewDetail = () => {
    setViewDetail(null);
  };

  const handleViewDetail = (arg) => {
    setViewDetail(arg);
  };

  const handleDeleteAlert = (id) => {
    paymentId.current = id;
    setAlert(true);
  };
  const handleCloseAlert = () => {
    paymentId.current = null;
    setAlert(false);
  };

  const deletePayment = async () => {
    setLoading(true);
    try {
      const { data } = await deletePaymentById(paymentId.current);
      if (data.success) {
        handleRefresh(filterInput);
      } else {
        toast.error("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong, please try later.");
    } finally {
      setLoading(false);
      handleCloseAlert();
    }
  };

  return (
    <div className="">
      <Table responsive={true} striped={true} hover={true}>
        <thead className="mb-2">
          <tr>
            <th></th>
            <th>
              <div
                className="d-flex"
                onClick={() => handleSortByLabel("paymentNumber")}
              >
                <label>Payment No.</label>
                <div className="associatedContacts-label-btn labelCursor">
                  {sortOrder === "asc" && sortField === "paymentNumber" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "paymentNumber" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <Input
                type="text"
                placeholder="Payment No."
                name="paymentNumber"
                value={filterInput.paymentNumber}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
              />
            </th>
            <th>
              <div
                className="d-flex"
                onClick={() => handleSortByLabel("matterNumber")}
              >
                <label>Matter No.</label>
                <div className="associatedContacts-label-btn labelCursor">
                  {sortOrder === "asc" && sortField === "matterNumber" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "matterNumber" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <Input
                type="text"
                placeholder="Matter Number"
                name="matterNumber"
                value={filterInput.matterNumber}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
              />
            </th>
            <th>
              <div
                className="d-flex"
                onClick={() => handleSortByLabel("paymentType")}
              >
                <label>Payment Type</label>
                <div className="associatedContacts-label-btn labelCursor">
                  {sortOrder === "asc" && sortField === "paymentType" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "paymentType" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              {/* <Input
                type='text'
                name='paymentType'
                placeholder='Payment Type'
                value={filterInput.paymentType}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === 'Enter' && handleRefresh()}
              /> */}
              <select
                className="form-select"
                name="paymentType"
                value={filterInput.paymentType}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
              >
                <option value="">All</option>
                {type.map((t, idx) => (
                  <option key={idx} value={t.value}>
                    {t.display}
                  </option>
                ))}
              </select>
            </th>
            {/* <th>
              <div
                className='d-flex'
                onClick={() => handleSortByLabel('createdBy')}
              >
                <label>Created By</label>
                <div className='associatedContacts-label-btn labelCursor'>
                  {sortOrder === 'asc' && sortField === 'createdBy' ? (
                    <img
                      src={upArrowColoured}
                      alt='asc'
                      className='label-btn-img-1'
                    />
                  ) : (
                    <img src={upArrow} alt='asc' className='label-btn-img-1' />
                  )}
                  {sortOrder === 'desc' && sortField === 'createdBy' ? (
                    <img
                      src={downArrowColoured}
                      alt='desc'
                      className='label-btn-img-2'
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt='desc'
                      className='label-btn-img-2'
                    />
                  )}
                </div>
              </div>
              <Input
                type='text'
                name='createdBy'
                placeholder='Created By'
                value={filterInput.createdBy}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === 'Enter' && handleRefresh()}
              />
            </th> */}
            <th>
              <div
                className="d-flex"
                onClick={() => handleSortByLabel("createdOn")}
              >
                <label>Date</label>
                <div className="associatedContacts-label-btn labelCursor">
                  {sortOrder === "asc" && sortField === "createdOn" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "createdOn" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <Input
                type="date"
                name="createdOn"
                placeholder="Date"
                value={filterInput.createdOn}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
              />
            </th>
            <th>
              <div
                className="d-flex"
                onClick={() => handleSortByLabel("amount")}
              >
                <label>Amount</label>
                <div className="associatedContacts-label-btn labelCursor">
                  {sortOrder === "asc" && sortField === "amount" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "amount" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <Input
                type="text"
                name="amount"
                placeholder="Amount"
                value={filterInput.amount}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
              />
            </th>
            <th>
              <div className="d-flex justify-content-end">
                <Button
                  type="button"
                  color="success"
                  className="mx-1"
                  onClick={() => handleRefresh()}
                >
                  <MdSearch size={18} />
                </Button>
                <Button
                  type="button"
                  color="danger"
                  className="mx-1"
                  onClick={() => handleResetFilter()}
                >
                  <MdFilterAltOff size={18} />
                </Button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {list?.map((payment) => (
            <tr
              key={payment.id}
              onClick={() => handleViewDetail(payment)}
              className="pe-cursor"
            >
              {/* <td>
                <Input
                  type='checkbox'
                  checked={isSelected(payment.id)}
                  onClick={(e) => handleSelect(e, payment.id)}
                />
              </td> */}
              <td></td>
              <td>
                <p className="mb-0">
				{/*{payment.paymentNumber ? `${payment.paymentNumber}` : ""}*/}
				  {payment.paymentNumStr ? `${payment.paymentNumStr}` : ""}
                </p>
              </td>
              <td>
                <p className="mb-0">
                  {payment.matterNumber ? `${payment.matterNumber}` : ""}
                </p>
              </td>
              <td>
                <p className="mb-0">
                  {findDisplayname(type, payment.paymentType)}
                </p>
              </td>
              {/* <td>
                <p className='mb-0'>{payment.createdBy}</p>
              </td> */}
              <td>
                <p className="mb-0">
                  {payment.createdOn ? formatDateFunc(payment.createdOn) : ""}
                </p>
              </td>
              <td>
                <p className="mb-0">{formatCurrency(payment.amount)}</p>
              </td>
              {/* <td>
                <p className='mb-0'>
                  {findDisplayname(status, payment.status)}
                </p>
              </td> */}
              <td className="d-flex justify-content-end">
                {/* <Button
                  className='d-flex mx-1'
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('WIP');
                    // printInvoice(invoice.id);
                  }}
                >
                  <AiFillPrinter size={18} />
                </Button> */}
                <Button
                  className="d-flex mx-1 btn btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlert(payment.id);
                  }}
                >
                  <MdDelete size={18} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {alert &&
        createPortal(
          <Modal
            isOpen={alert}
            toggle={handleCloseAlert}
            backdrop="static"
            scrollable={true}
            size="md"
            centered
          >
            <ModalHeader toggle={handleCloseAlert} className="bg-light p-3">
              Confirm Your Action
            </ModalHeader>
            <ModalBody>
              <div>
                <div className="p-4">
                  <p>Are you sure you want to delete the record?</p>
                </div>
                <div className="d-flex align-items-center justify-content-end p-2 border-top">
                  <Button
                    color="danger"
                    className="mx-1"
                    onClick={handleCloseAlert}
                  >
                    No
                  </Button>
                  <Button
                    color="success"
                    className="mx-1"
                    onClick={() => {
                      setAlert(false);
                      deletePayment();
                    }}
                  >
                    Yes
                  </Button>
                </div>
              </div>
            </ModalBody>
          </Modal>,
          document.body
        )}

      <Modal
        isOpen={viewDetail}
        toggle={closeViewDetail}
        backdrop="static"
        scrollable={true}
        size="lg"
        centered
      >
        <ModalHeader toggle={closeViewDetail} className="bg-light p-3">
          Payment Details
        </ModalHeader>
        <ModalBody>
          <ViewPaymentDetails data={viewDetail} />
        </ModalBody>
      </Modal>
      {loading && <LoadingPage />}
    </div>
  );
};

export default PaymentTable;
