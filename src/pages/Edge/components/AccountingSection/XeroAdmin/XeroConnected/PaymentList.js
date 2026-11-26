import React, { useState, useEffect } from "react";
import {
  findDisplayname,
  formatCurrency,
  formatDateFunc,
  roundToDigit,
} from "../../../../utils/utilFunc";
import {
  Button,
  Input,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { MdSearch, MdFilterAltOff } from "react-icons/md";
import { getEligiblePayments, uploadPaymentToXero } from "../../../../apis";
import LoadingPage from "../../../../utils/LoadingPage";
import { toast } from "react-toastify";
import ResponseAlert from "./ResponseAlert";
import { useContinuousXeroList } from "./useContinuousXeroList";
import { ContinuousListStatus, ContinuousRowSpace } from "./ContinuousListStatus";
import upArrow from "../../../../images/upArrow.svg";
import downArrow from "../../../../images/downArrow.svg";
import upArrowColoured from "../../../../images/upArrowColoured.svg";
import downArrowColoured from "../../../../images/downArrowColoured.svg";

const PaymentList = (props) => {
  const [type, setType] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseAlert, setResponseAlert] = useState(null);
  const [sortField, setSortField] = useState("paymentDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterInput, setFilterInput] = useState({
    paymentNumber: "",
    matterNumber: "",
    paymentDate: "",
    amount: "",
    paymentType: "",
  });

  const { list, totalRecords, loadingRows, hasMore, error, loadMore, reload, scrollRef, sentinelRef, headerRef,
    visibleRows, topSpace, bottomSpace, rowOffset } = useContinuousXeroList({
    fetchPage: getEligiblePayments, resultKey: "invoicePaymentList", rowKey: (row) => `${row.paymentId}_${row.invoiceId}`,
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
    fetchPaymentList(filters, sortField, sortOrder);
  };

  const handleSortByLabel = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
      fetchPaymentList(filterInput, field, "asc");
    } else {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      fetchPaymentList(filterInput, field, newOrder);
    }
  };

  const handleResetFilter = () => {
    const reset = { paymentNumber: "", matterNumber: "", paymentDate: "", amount: "", paymentType: "" };
    setFilterInput(reset);
    setSelected([]);
    setSortField("paymentDate");
    setSortOrder("desc");
    fetchPaymentList(reset, "paymentDate", "desc");
  };

  const  handlePaymentTypeChange = (e)=>{
     const updated = {
    ...filterInput,
    paymentType: e.target.value,
  };
  setFilterInput(updated);
  handleSearch(updated);
  }

  const fetchPaymentList = (filters = filterInput, sortF = sortField, sortO = sortOrder) => {
    reload({ ...filters, sortOn: sortF, sortType: sortO.toUpperCase() });
  };

  const fetchEnums = () => {
    const enumList = JSON.parse(window.localStorage.getItem("enumList"));
    if (
      enumList &&
      enumList["PaymentType"] &&
      enumList["PaymentType"].length > 0
    ) {
      setType(enumList["PaymentType"]);
    }
  };

  const handleSelect = (payment) => {
    let newSelected = [...selected];

    let present = false;

    for (let a in selected) {
      let item = selected[a];

      if (
        item.paymentId === payment.paymentId &&
        item.invoiceId === payment.invoiceId
      ) {
        present = true;
        break;
      }
    }

    if (!present) {
      newSelected.push({
        paymentId: payment.paymentId,
        invoiceId: payment.invoiceId,
      });
    } else {
      newSelected = newSelected.filter(
        (i) =>
          i.paymentId !== payment.paymentId ||
          i.invoiceId !== payment.invoiceId,
      );
    }

    setSelected(newSelected);
  };

  const handleSelectAll = (e) => {
    const { checked } = e.target;
    let newSelected = [];
    if (checked) {
      list.forEach((payment) => {
        newSelected.push({
          paymentId: payment.paymentId,
          invoiceId: payment.invoiceId,
        });
      });
    }
    setSelected(newSelected);
  };

  const isSelected = (payment) => {
    let present = false;

    for (let a in selected) {
      let item = selected[a];

      if (
        item.paymentId === payment.paymentId &&
        item.invoiceId === payment.invoiceId
      ) {
        present = true;
        break;
      }
    }

    return present;
  };

  const handlePostPayment = async () => {
    let inputData = {
      paymentList: selected,
    };

    setLoading(true);

    // let allIds = [];

    // for (let a in selected) {
    //   const item = selected[a];
    //   allIds.push(`${item.invoiceId}-${item.paymentId}`);
    // }

    // allIds = allIds.join(',');

    try {
      const { data } = await uploadPaymentToXero(inputData);
      toast.success("Request Sent to Xero");
      if (data.success) {
        toast.success("Payment(s) uploaded successfully");
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
                      aria-label="Select all loaded payments"
                      checked={
                        list.length > 0 && selected.length === list.length
                      }
                    />
                  </th>
                  <th>
                    <div className="d-flex align-items-center labelCursor" onClick={() => handleSortByLabel("paymentNumber")} style={{ cursor: "pointer" }}>
                      <label style={{ cursor: "pointer", marginBottom: 0 }}>Payment No.</label>
                      {renderSortIcon("paymentNumber")}
                    </div>
                    <Input
                      type="text"
                      name="paymentNumber"
                      placeholder="Payment No."
                      value={filterInput.paymentNumber}
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
                    <div className="d-flex align-items-center labelCursor" onClick={() => handleSortByLabel("paymentDate")} style={{ cursor: "pointer" }}>
                      <label style={{ cursor: "pointer", marginBottom: 0 }}>Payment Date</label>
                      {renderSortIcon("paymentDate")}
                    </div>
                    <Input
                      type="date"
                      name="paymentDate"
                      value={filterInput.paymentDate}
                      onChange={(e) => {
                        const updated = {
                          ...filterInput,
                          paymentDate: e.target.value,
                        };
                        setFilterInput(updated);
                        handleSearch(updated);
                      }}
                    />
                  </th>
                  {/* <th>
                  <div className='d-flex'>
                    <label>Created by</label>
                  </div>
                </th> */}
                  <th>
                    <div className="d-flex align-items-center labelCursor" onClick={() => handleSortByLabel("paymentType")} style={{ cursor: "pointer" }}>
                      <label style={{ cursor: "pointer", marginBottom: 0 }}>Payment Type</label>
                      {renderSortIcon("paymentType")}
                    </div>
                    <Input
                      type="select"
                      name="paymentType"
                      value={filterInput.paymentType}
                      onChange={handlePaymentTypeChange}
                    >
                      <option value="">All</option>
                      <option value="EFT">EFT</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                      <option value= "Card">Card</option>
                    </Input>
                  </th>
                  <th>
                    <div className="d-flex align-items-center labelCursor" onClick={() => handleSortByLabel("amount")} style={{ cursor: "pointer" }}>
                      <label style={{ cursor: "pointer", marginBottom: 0 }}>Amount</label>
                      {renderSortIcon("amount")}
                    </div>
                    <Input
                      type="text"
                      name="amount"
                      placeholder="Amount"
                      value={filterInput.amount}
                      onChange={handleChangeFilter}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </th>
                  <th>
                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        color="success"
                        className="mx-1"
                        onClick={() => handleSearch()}
                      >
                        <MdSearch size={18} />
                      </Button>
                      <Button
                        color="danger"
                        className="mx-1"
                        onClick={handleResetFilter}
                      >
                        <MdFilterAltOff size={18} />
                      </Button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <ContinuousRowSpace height={topSpace} />
                {visibleRows.map((payment, i) => (
                  <tr
                    key={`${payment.paymentId}_${payment.invoiceId}`}
                    onClick={() => handleSelect(payment)}
                    className="pe-cursor"
                    aria-rowindex={rowOffset + i + 2}
                  >
                    <td>
                      <Input type="checkbox" checked={isSelected(payment)} readOnly aria-label={`Select payment ${payment.paymentNumStr}`} />
                    </td>
                    <td>
                      {/*<p className="mb-0">
                        {siteCode
                          ? `${siteCode}-${payment.paymentNumber}`
                          : payment.paymentNumber}
					</p>*/}
                      <p className="mb-0" title={payment.paymentNumStr}>{payment.paymentNumStr}</p>
                    </td>
                    <td>
                      <p className="mb-0">{payment.matterNumber}</p>
                    </td>
                    <td>
                      <p className="mb-0">
                        {formatDateFunc(payment.paymentDate)}
                      </p>
                    </td>
                    {/* <td>
                    <p className='mb-0'>{payment.createdBy}</p>
                  </td> */}
                    <td>
                      <p className="mb-0">
                        {findDisplayname(type, payment.paymentType)}
                      </p>
                    </td>
                    <td>
                      <p className="mb-0">{formatCurrency(payment.amount)}</p>
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
          <Button color="success" className="m-4" disabled={loading || !selected.length} onClick={handlePostPayment}>
            Post Payment
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

  return <div>{ui()}</div>;
};

export default PaymentList;
