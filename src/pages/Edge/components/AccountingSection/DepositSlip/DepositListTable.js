import React, { useState, useEffect, Fragment, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { AiFillPrinter } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import upArrow from "../../../images/upArrow.svg";
import downArrow from "../../../images/downArrow.svg";
import downArrowColoured from "../../../images/downArrowColoured.svg";
import upArrowColoured from "../../../images/upArrowColoured.svg";
import { MdSearch } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import { formatCurrency, formatDateFunc } from "../../../utils/utilFunc";
import "../../../stylesheets/ManageUserPage.css";
import LoadingPage from "../../../utils/LoadingPage";
import ViewDepositSlip from "./ViewDepositSlip";
import { deleteDepositSlipById, printDepositSlip } from "pages/Edge/apis";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import Pagination from "../../Pagination";

const initialFilter = {
  description: "",
  createdDate: "",
  matterNumber: "",
  amount: "",
  sortOn: "",
  sortType: "",
  pageNo: 0,
  pageSize: 25,
};

const DepositListTable = (props) => {
  const [labelSort, setLabelSort] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");

  const [list, setList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [filterInput, setFilterInput] = useState(initialFilter);
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const depositSlipId = useRef(null);

  useEffect(() => {
    setList(props.list);
  }, [props.list]);

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

  const filterChange = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
  };

  const handleSortByLabel = (field) => {
    if (labelSort !== field) {
      setLabelSort(field);
      setSortOrder("asc");
      setSortField(field);
      setFilterInput({ ...filterInput, sortOn: field, sortType: "ASC" });

      handleRefresh({ ...filterInput, sortOn: field, sortType: "ASC" });
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(field);
      setFilterInput({ ...filterInput, sortOn: field, sortType: "DESC" });
      handleRefresh({ ...filterInput, sortOn: field, sortType: "DESC" });
    }
  };

  const handlePreviousPage = () => {
    const pg = props?.pageNo - 1;

    handleRefresh({ ...filterInput, pageNo: pg });
  };

  const handleNextPage = () => {
    const pg = props?.pageNo + 1;

    handleRefresh({ ...filterInput, pageNo: pg });
  };

  const handleJumpToPage = (num) => {
    handleRefresh({ ...filterInput, pageNo: num - 1 });
  };

  const changeNumberOfRows = (e) => {
    let currSize = e.target.value;

    let tempTotalPages = Math.ceil(props?.totalRecords / currSize);
    let tempPageNo = tempTotalPages - 1;

    if (tempPageNo >= props?.pageNo) {
      tempPageNo = props?.pageNo;
    }

    handleRefresh({
      ...filterInput,
      pageNo: tempPageNo,
      pageSize: currSize,
    });
  };

  const handleResetFilter = () => {
    setFilterInput(initialFilter);
    setLabelSort("");
    setSortOrder("");
    setSortField("");
    if (props.refresh) {
      props.refresh(initialFilter);
    }
  };

  const handleRefresh = (filters) => {
    if (props.refresh) {
      props.refresh(filters || filterInput);
    }
  };

  const handleEdit = (arg) => {
    setSelectedData(arg);
    setSelected([arg.id]);
  };

  const closeEditForm = () => {
    setSelected([]);
    setSelectedData(null);
  };

  const handleDeleteAlert = (id) => {
    depositSlipId.current = id;
    setAlert(true);
  };
  const handleCloseAlert = () => {
    depositSlipId.current = null;
    setAlert(false);
  };

  const printSlip = async (id) => {
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

      const { data } = await printDepositSlip(id);
      const html = data;

      if (newTab) {
        // Write HTML content to the new tab if it's open and not blocked
        newTab.document.write(html);
      }
    } catch (error) {
      console.error("Error fetching HTML:", error);
    }
  };

  const deleteDepositSlip = async () => {
    setLoading(true);
    try {
      const { data } = await deleteDepositSlipById(depositSlipId.current);
      if (data.success) {
        props.refresh();
        toast.error("Successfully deleted deposit slip.");
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
    <Fragment>
      <div className="">
        <Table responsive={true} striped={true} hover={true}>
          <thead className="mb-2 bg-light">
            <tr>
              {/* <th>
                <Input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selected?.length > 0 && selected?.length === list?.length
                  }
                />
              </th> */}
              <th>
                <div
                  className="d-flex"
                  onClick={() => handleSortByLabel("createdDate")}
                >
                  <label>Date</label>
                  <div className="associatedContacts-label-btn labelCursor">
                    {sortOrder === "asc" && sortField === "createdDate" ? (
                      <img
                        src={upArrowColoured}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    ) : (
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    )}
                    {sortOrder === "desc" && sortField === "createdDate" ? (
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
                  name="createdDate"
                  placeholder="Created Date"
                  value={filterInput.createdDate}
                  onChange={filterChange}
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
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
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
                  onChange={filterChange}
                  onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                />
              </th>
              <th>
                <div
                  className="d-flex"
                  onClick={() => handleSortByLabel("matterNumber")}
                >
                  <label>Matter Nos.</label>
                  <div className="associatedContacts-label-btn labelCursor">
                    {sortOrder === "asc" && sortField === "matterNumber" ? (
                      <img
                        src={upArrowColoured}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    ) : (
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
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
                  name="matterNumber"
                  placeholder="Matter Nos."
                  value={filterInput.matterNumber}
                  onChange={filterChange}
                  onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                />
              </th>
              <th>
                <div
                  className="d-flex"
                  onClick={() => handleSortByLabel("description")}
                >
                  <label>Description</label>
                  <div className="associatedContacts-label-btn labelCursor">
                    {sortOrder === "asc" && sortField === "description" ? (
                      <img
                        src={upArrowColoured}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    ) : (
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    )}
                    {sortOrder === "desc" && sortField === "description" ? (
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
                  name="description"
                  placeholder="Description"
                  value={filterInput.description}
                  onChange={filterChange}
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
                    <AiOutlineClose size={18} />
                  </Button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {list?.map((slip) => (
              <tr
                key={slip.id}
                onClick={() => handleEdit(slip)}
                className="pe-cursor"
              >
                {/* <td>
                  <Input
                    type="checkbox"
                    checked={isSelected(slip.id)}
                    onClick={(e) => handleSelect(e, slip.id)}
                  />
                </td> */}
                <td>
                  <p className="mb-0">
                    {slip.createdDate ? formatDateFunc(slip.createdDate) : ""}
                  </p>
                </td>
                <td>
                  <p className="mb-0">
                    {formatCurrency(slip.totalDepositAmount)}
                  </p>
                </td>
                <td>
                  <p className="mb-0">{slip.matterNumbers ? slip.matterNumbers.split(",").map(s => s.trim()).join(", ") : ""}</p>
                </td>
                <td>
                  <p className="mb-0">{slip.description}</p>
                </td>
                <td className="d-flex">
                  <Button
                    className="d-flex mx-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      printSlip(slip.id);
                    }}
                  >
                    <AiFillPrinter size={18} />
                  </Button>
                  <Button
                    className="d-flex mx-1 btn btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAlert(slip.id);
                    }}
                  >
                    <MdDelete size={18} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="px-3 pb-3 pt-2">
          <Pagination
            pageNo={props?.pageNo}
            pageSize={props?.pageSize}
            totalRecords={props?.totalRecords}
            totalPages={props?.totalPages}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
            handleJumpToPage={handleJumpToPage}
            changeNumberOfRows={changeNumberOfRows}
          />
        </div>
      </div>
      {selectedData && (
        <Modal
          isOpen={selectedData}
          toggle={closeEditForm}
          backdrop="static"
          scrollable={true}
          size="xl"
          centered
        >
          <ModalHeader toggle={closeEditForm} className="bg-light p-3">
            Bank Deposit Slip
          </ModalHeader>
          <ModalBody>
            <ViewDepositSlip data={selectedData} />
          </ModalBody>
        </Modal>
      )}
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
                      deleteDepositSlip();
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
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default DepositListTable;
