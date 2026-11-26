import React, { useState, useEffect } from "react";
import {
  findDisplayname,
  formatCurrency,
  formatDateFunc,
  roundToDigit,
} from "../../../../utils/utilFunc";
import {
  Input,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { MdSearch, MdFilterAltOff } from "react-icons/md";
import { getEligibleInvoice, uploadInvoiceToXero } from "../../../../apis";
import LoadingPage from "../../../../utils/LoadingPage";
import { toast } from "react-toastify";
import ResponseAlert from "./ResponseAlert";
import { useContinuousXeroList } from "./useContinuousXeroList";
import { ContinuousListStatus, ContinuousRowSpace } from "./ContinuousListStatus";
import upArrow from "../../../../images/upArrow.svg";
import downArrow from "../../../../images/downArrow.svg";
import upArrowColoured from "../../../../images/upArrowColoured.svg";
import downArrowColoured from "../../../../images/downArrowColoured.svg";

const InvoiceList = (props) => {
  const [invoiceStatus, setInvoiceStatus] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseAlert, setResponseAlert] = useState(null);
  const [sortField, setSortField] = useState("invoiceNumber");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterInput, setFilterInput] = useState({
    invoiceNumber: "",
    matterNumber: "",
    invoiceDate: "",
    totalAmount: "",
    status: "",
  });

  const { list, totalRecords, loadingRows, hasMore, error, loadMore, reload, scrollRef, sentinelRef, headerRef,
    visibleRows, topSpace, bottomSpace, rowOffset } = useContinuousXeroList({
    fetchPage: getEligibleInvoice, resultKey: "invoiceList", rowKey: (row) => row.id,
    initialQuery: { ...filterInput, sortOn: sortField, sortType: sortOrder.toUpperCase() },
    refreshList: props.refreshList, active: props.active,
    onLoaded: () => props.handleRefresh?.(false), onReset: () => setSelected([]),
  });

  const siteId =
    JSON.parse(window.localStorage.getItem("userDetails"))?.siteId || null;

  const siteList =
    JSON.parse(window.localStorage.getItem("companyInfo"))?.siteInfoList || [];
  const siteCode =
    siteList.find((site) => site.siteId === siteId)?.siteCode || "";

  useEffect(() => {
    fetchEnums();
  }, []);

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (filters = filterInput) => {
    setSelected([]);
    fetchInvoiceList(filters, sortField, sortOrder);
  };

  const handleSortByLabel = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
      fetchInvoiceList(filterInput, field, "asc");
    } else {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      fetchInvoiceList(filterInput, field, newOrder);
    }
  };
  const handleInvoiceStatusChange = (e) => {
    const updated = {
      ...filterInput,
      status: e.target.value,
    };
    setFilterInput(updated);
    handleSearch(updated);
                      
  }
  const handleResetFilter = () => {
    const reset = { invoiceNumber: "", matterNumber: "", invoiceDate: "", totalAmount: "", status: "" };
    setFilterInput(reset);
    setSelected([]);
    setSortField("invoiceNumber");
    setSortOrder("desc");
    fetchInvoiceList(reset, "invoiceNumber", "desc");
  };

  const fetchInvoiceList = (filters = filterInput, sortF = sortField, sortO = sortOrder) => {
    reload({ ...filters, sortOn: sortF, sortType: sortO.toUpperCase() });
  };

  const fetchEnums = () => {
    const enumList = JSON.parse(window.localStorage.getItem("enumList"));
    if (
      enumList &&
      enumList["InvoiceStatus"] &&
      enumList["InvoiceStatus"].length > 0
    ) {
      setInvoiceStatus(enumList["InvoiceStatus"]);
    }
  };

  const handleSelect = (id) => {
    let index = selected.indexOf(id);
    let newSelected = [...selected];

    if (index === -1) {
      newSelected.push(id);
    } else {
      newSelected = newSelected.filter((i) => i !== id);
    }

    setSelected(newSelected);
  };

  const handleSelectAll = (e) => {
    const { checked } = e.target;
    let newSelected = [];
    if (checked) {
      list.forEach((invoice) => {
        newSelected.push(invoice.id);
      });
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => (selected.indexOf(id) >= 0 ? true : false);

  const handlePostInvoice = async () => {
    let inputData = {
      invoiceList: selected,
    };

    setLoading(true);

    try {
      const { data } = await uploadInvoiceToXero(inputData);
      toast.success("Request Sent to Xero");
      if (data.success) {
        toast.success("Invoice(s) uploaded successfully");
      } else {
        if (data?.data?.xeroEntitiesResponseList?.length) {
          setResponseAlert(data?.data?.xeroEntitiesResponseList);
        } else {
          toast.error("Something went wrong, please try later.");
        }
      }

      if (props.handleRefresh) {
        props.handleRefresh(true);
      }
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Something went wrong, please try later.");
    } finally {
      setSelected([]);
      setLoading(false);
    }
  };

  const renderSortIcon = (field) => (
    <div className="associatedContacts-label-btn labelCursor d-inline-flex ml-1">
      <img
        src={sortOrder === "asc" && sortField === field ? upArrowColoured : upArrow}
        alt="asc"
        className="label-btn-img-1"
        style={{ width: "10px", height: "8px" }}
      />
      <img
        src={sortOrder === "desc" && sortField === field ? downArrowColoured : downArrow}
        alt="desc"
        className="label-btn-img-2"
        style={{ width: "10px", height: "8px" }}
      />
    </div>
  );

  const ui = () => {
    if (props.active) {
      return (
        <>
          <div className="mx-2 mb-2 small text-muted" role="status">
            Loaded {list.length} of {totalRecords} · {selected.length} selected. Select all applies to loaded records.
          </div>
          <div ref={scrollRef} className="mx-2 xero-continuous-scroll">
            <Table striped={true} hover={true} className="xero-continuous-table" aria-rowcount={totalRecords + 1}>
              <thead ref={headerRef} className="mb-2 bg-light">
                <tr>
                  <th>
                    <Input
                      type="checkbox"
                      onChange={handleSelectAll}
                      aria-label="Select all loaded invoices"
                      checked={
                        list.length > 0 && selected.length === list.length
                      }
                    />
                  </th>
                  <th>
                    <div className="d-flex align-items-center labelCursor" onClick={() => handleSortByLabel("invoiceNumber")} style={{ cursor: "pointer" }}>
                      <label style={{ cursor: "pointer", marginBottom: 0 }}>Invoice No.</label>
                      {renderSortIcon("invoiceNumber")}
                    </div>
                    <Input
                      type="text"
                      name="invoiceNumber"
                      placeholder="Invoice No."
                      value={filterInput.invoiceNumber}
                      onChange={handleChangeFilter}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </th>
                  <th>
                    <div className="d-flex align-items-center labelCursor" onClick={() => handleSortByLabel("matterNumber")} style={{ cursor: "pointer" }}>
                      <label style={{ cursor: "pointer", marginBottom: 0 }}>Matter No.</label>
                      {renderSortIcon("matterNumber")}
                    </div>
                    <Input
                      type="text"
                      name="matterNumber"
                      placeholder="Matter No."
                      value={filterInput.matterNumber}
                      onChange={handleChangeFilter}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </th>
                  <th>
                    <div className="d-flex align-items-center labelCursor" onClick={() => handleSortByLabel("invoiceDate")} style={{ cursor: "pointer" }}>
                      <label style={{ cursor: "pointer", marginBottom: 0 }}>Date</label>
                      {renderSortIcon("invoiceDate")}
                    </div>
                    <Input
                      type="date"
                      name="invoiceDate"
                      value={filterInput.invoiceDate}
                      onChange={(e) => {
                        const updated = { ...filterInput, invoiceDate: e.target.value };
                        setFilterInput(updated);
                        handleSearch(updated);
                      }}
                    />
                  </th>
                  <th>
                    <div className="d-flex align-items-center labelCursor" onClick={() => handleSortByLabel("totalAmount")} style={{ cursor: "pointer" }}>
                      <label style={{ cursor: "pointer", marginBottom: 0 }}>Total Amount</label>
                      {renderSortIcon("totalAmount")}
                    </div>
                    <Input
                      type="text"
                      name="totalAmount"
                      placeholder="Amount"
                      value={filterInput.totalAmount}
                      onChange={handleChangeFilter}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </th>
                  <th>
                    <div className="d-flex align-items-center labelCursor" onClick={() => handleSortByLabel("status")} style={{ cursor: "pointer" }}>
                      <label style={{ cursor: "pointer", marginBottom: 0 }}>Invoice Status</label>
                      {renderSortIcon("status")}
                    </div>
                    <Input
                      type="select"
                      name="status"
                      value={filterInput.status}
                      onChange={handleInvoiceStatusChange}
                    >
                      <option value="">All</option>
                      <option value="PAID">Paid</option>
                      <option value="UNPAID">Unpaid</option>
                      <option value="PARTIAL_PAID">Partially Paid</option>
                    </Input>
                  </th>
                  <th>
                    <div className="d-flex justify-content-end mt-3">
                      <Button color="success" className="mx-1" onClick={() => handleSearch()}>
                        <MdSearch size={18} />
                      </Button>
                      <Button color="danger" className="mx-1" onClick={handleResetFilter}>
                        <MdFilterAltOff size={18} />
                      </Button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <ContinuousRowSpace height={topSpace} />
                {visibleRows.map((invoice, i) => (
                  <tr
                    key={invoice.id}
                    onClick={() => handleSelect(invoice.id)}
                    className="pe-cursor"
                    aria-rowindex={rowOffset + i + 2}
                  >
                    <td>
                      <Input type="checkbox" checked={isSelected(invoice.id)} readOnly aria-label={`Select invoice ${invoice.invoiceNumStr}`} />
                    </td>
                    <td>
                      {/*
					  <p className="mb-0">
                        {siteCode
                          ? `${siteCode}-${invoice.invoiceNumber}`
                          : invoice.invoiceNumber}
						
                      </p>
					  */}
                      <p className="mb-0" title={invoice.invoiceNumStr}>{invoice.invoiceNumStr}</p>
                    </td>
                    <td>
                      <p className="mb-0">{invoice.matterNumber}</p>
                    </td>
                    <td>
                      <p className="mb-0">
                        {formatDateFunc(invoice.invoiceDate)}
                      </p>
                    </td>
                    <td>
                      <p className="mb-0">
                        {formatCurrency(invoice.totalAmount)}
                      </p>
                    </td>
                    <td>
                      <p className="mb-0">
                        {findDisplayname(invoiceStatus, invoice.status)}
                      </p>
                    </td>
                    <td></td>
                  </tr>
                ))}
                <ContinuousRowSpace height={bottomSpace} />
              </tbody>
            </Table>
            <ContinuousListStatus sentinelRef={sentinelRef} loading={loadingRows} error={error}
              hasMore={hasMore} loadMore={loadMore} count={list.length} />
          </div>
          {loading && <LoadingPage />}
          <Button color="success" className="m-4" disabled={loading || !selected.length} onClick={handlePostInvoice}>
            Post Invoice
          </Button>

          <div>
            <Modal
              isOpen={responseAlert}
              toggle={() => setResponseAlert(null)}
              backdrop="static"
              scrollable={true}
              size="md"
              centered
            >
              <ModalHeader
                toggle={() => setResponseAlert(null)}
                className="bg-light p-3"
              >
                Error Occured!
              </ModalHeader>
              <ModalBody>
                <ResponseAlert
                  data={responseAlert}
                  onClose={() => setResponseAlert(null)}
                />
              </ModalBody>
            </Modal>
          </div>
        </>
      );
    } else {
      return <></>;
    }
  };

  return ui();
};

export default InvoiceList;
