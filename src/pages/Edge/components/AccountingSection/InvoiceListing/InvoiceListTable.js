import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import upArrow from "../../../images/upArrow.svg";
import downArrow from "../../../images/downArrow.svg";
import downArrowColoured from "../../../images/downArrowColoured.svg";
import upArrowColoured from "../../../images/upArrowColoured.svg";
import { MdSearch } from "react-icons/md";
import { AiOutlineClose, AiFillPrinter } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { formatCurrency, formatDateFunc } from "../../../utils/utilFunc";
import { toast } from "react-toastify";

import "../../../stylesheets/ManageUserPage.css";
import { deleteInvoiceById, printMatterInvoice } from "pages/Edge/apis";
import { createPortal } from "react-dom";

const InvoiceListTable = (props) => {
  const [labelSort, setLabelSort] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const invoiceId = useRef(null);

  const { handleRefresh, filterInput, setFilterInput, handleResetFilter } =
    props;

  useEffect(() => {
    setList(props.list);
  }, [props.list]);

  const handleSortByLabel = (field) => {
    if (labelSort !== field) {
      setLabelSort(field);
      setSortOrder("asc");
      setSortField(field);
      handleRefresh({ ...filterInput, sortOn: field, sortType: "ASC" });
      setFilterInput({ ...filterInput, sortOn: field, sortType: "ASC" });
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(field);
      handleRefresh({ ...filterInput, sortOn: field, sortType: "DESC" });
      setFilterInput({ ...filterInput, sortOn: field, sortType: "DESC" });
    }
  };

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
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

  const handleDeleteAlert = (id) => {
    invoiceId.current = id;
    setAlert(true);
  };
  const handleCloseAlert = () => {
    invoiceId.current = null;
    setAlert(false);
  };

  const deleteInvoice = async () => {
    setLoading(true);
    try {
      const { data } = await deleteInvoiceById(invoiceId.current);
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
            <th>
              {/* <Input
                type='checkbox'
                onChange={handleSelectAll}
                checked={
                  selected?.length > 0 && selected?.length === list?.length
                }
              /> */}
            </th>
            <th>
              <div
                className="d-flex"
                onClick={() => handleSortByLabel("invoiceNumber")}
              >
                <label>Invoice No.</label>
                <div className="associatedContacts-label-btn labelCursor">
                  {sortOrder === "asc" && sortField === "invoiceNumber" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "invoiceNumber" ? (
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
                placeholder="Invoice No."
                name="invoiceNumber"
                value={filterInput.invoiceNumber}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
              />
            </th>
            <th>
              <div
                className="d-flex"
                onClick={() => handleSortByLabel("createdBy")}
              >
                <label>Created By</label>
                <div className="associatedContacts-label-btn labelCursor">
                  {sortOrder === "asc" && sortField === "createdBy" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "createdBy" ? (
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
                name="createdBy"
                placeholder="Created By"
                value={filterInput.createdBy}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
              />
            </th>
            <th>
              <div
                className="d-flex"
                onClick={() => handleSortByLabel("invoiceDate")}
              >
                <label>Date</label>
                <div className="associatedContacts-label-btn labelCursor">
                  {sortOrder === "asc" && sortField === "invoiceDate" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "invoiceDate" ? (
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
                name="invoiceDate"
                placeholder="Date"
                value={filterInput.invoiceDate}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
              />
            </th>
            <th>
              <div
                className="d-flex"
                onClick={() => handleSortByLabel("invoiceDueDate")}
              >
                <label>Due Date</label>
                <div className="associatedContacts-label-btn labelCursor">
                  {sortOrder === "asc" && sortField === "invoiceDueDate" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "invoiceDueDate" ? (
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
                name="invoiceDueDate"
                value={filterInput.invoiceDueDate}
                placeholder="Due Date"
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
                name="matterNumber"
                placeholder="Matter No."
                value={filterInput.matterNumber}
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
              />
            </th>
            <th>
              <div
                className="d-flex"
                onClick={() => handleSortByLabel("totalAmount")}
              >
                <label>Amount</label>
                <div className="associatedContacts-label-btn labelCursor">
                  {sortOrder === "asc" && sortField === "totalAmount" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "totalAmount" ? (
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
                name="totalAmount"
                placeholder="Amount"
                value={filterInput.totalAmount}
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
                  <AiOutlineClose size={18} />
                </Button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {list?.map((invoice) => (
            <tr key={invoice.id} className="pe-cursor">
              <td>
                {/* <Input
                  type='checkbox'
                  checked={isSelected(invoice.id)}
                  onClick={(e) => handleSelect(e, invoice.id)}
                /> */}
              </td>
              <td>
			  {/*<p className="mb-0">{invoice.invoiceNumber}</p>*/}
				<p className="mb-0">{invoice.invoiceNumStr}</p>
              </td>
              <td>
                <p className="mb-0">{invoice.createdBy}</p>
              </td>
              <td>
                <p className="mb-0">
                  {invoice.invoiceDate
                    ? formatDateFunc(invoice.invoiceDate)
                    : ""}
                </p>
              </td>
              <td>
                <p className="mb-0">
                  {invoice.invoiceDueDate
                    ? formatDateFunc(invoice.invoiceDueDate)
                    : ""}
                </p>
              </td>
              <td>
                <p className="mb-0">{invoice.matterNumber}</p>
              </td>
              <td>
                <p className="mb-0">{formatCurrency(invoice.totalAmount)}</p>
              </td>
              <td className="d-flex">
                <Button
                  className="d-flex mx-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    printInvoice(invoice.id);
                  }}
                >
                  <AiFillPrinter size={18} />
                </Button>
                <Button
                  className="d-flex mx-1 btn btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlert(invoice.id);
                  }}
                >
                  <MdDelete size={18} />
                </Button>
              </td>
              {/* <td>
                <p className='mb-0'>{'Extra2'}</p>
              </td> */}
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
                      deleteInvoice();
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

      {/* <div className="matter-filterSec">
        <div className="matter-col ex-sm">
          <input
            className=""
            type="checkbox"
            onChange={handleSelectAll}
            checked={selected?.length > 0 && selected?.length === list?.length}
          />
        </div>
        <div className="matter-col md">
          <div className="flx">
            <label>Invoice No.</label>
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
          <input
            type="text"
            name="matterNumber"
          />
        </div>
        <div className="matter-col lg">
          <div className="flx">
            <label>Date</label>
            <div className="associatedContacts-label-btn labelCursor">
              {sortOrder === "asc" && sortField === "type" ? (
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
              {sortOrder === "desc" && sortField === "type" ? (
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
          <input
            type="text"
            name="type"
          />
        </div>
        <div className="matter-col lg">
          <div className="flx">
            <label>Due Date</label>
            <div className="associatedContacts-label-btn labelCursor">
              {sortOrder === "asc" && sortField === "subType" ? (
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
              {sortOrder === "desc" && sortField === "subType" ? (
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

          <input
            type="text"
            name="subType"
          />
        </div>
        <div className="matter-col lg">
          <div className="flx">
            <label>Extra 1</label>
            <div className="associatedContacts-label-btn labelCursor">
              {sortOrder === "asc" && sortField === "status" ? (
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
              {sortOrder === "desc" && sortField === "status" ? (
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
          <input
            type="text"
            name="status"
          />
        </div>
        <div className="matter-col lg">
          <div className="flx">
            <label>Extra 2</label>
            <div className="associatedContacts-label-btn labelCursor">
              {sortOrder === "asc" && sortField === "ourReference" ? (
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
              {sortOrder === "desc" && sortField === "ourReference" ? (
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

          <input
            type="text"
            name="ourReference"
          />
        </div>
      </div>
      <div className="matter-tableSec">
        {list?.map((invoice) => (
          <div
            className="matter-row"
            key={invoice.id}
          >
            <div className="matter-col ex-sm">
              <input
                type="checkbox"
                className="matter-checkbox"
                checked={isSelected(invoice.id)}
                onClick={(e) => handleSelect(e, invoice.id)}
              />
            </div>
            <div className="matter-col md">
              <p>{invoice.invoiceNumber}</p>
            </div>
            <div className="matter-col lg">
              <p>
                {invoice.invoiceDate
                  ? formatDateFunc(invoice.invoiceDate)
                  : ""}
              </p>
            </div>
            <div className="matter-col lg">
              <p>
                {invoice.invoiceDueDate
                  ? formatDateFunc(invoice.invoiceDueDate)
                  : ""}
              </p>
            </div>
            <div className="matter-col lg">
              <p>{"Extra1"}</p>
            </div>
            <div className="matter-col lg">
              <p>{"Extra2"}</p>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default InvoiceListTable;
