import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Modal, ModalHeader, ModalBody } from "reactstrap";
import { printMatterInvoice } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import ReceivePayment from "./ReceivePayment";
import {
  roundToDigit,
  findDisplayname,
  formatDateFunc,
  formatCurrency,
  checkHasPermission,
} from "../../../utils/utilFunc";
import ReceivedPaymentDetails from "./ReceivedPaymentDetails";
import { Fragment } from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { AiFillPrinter } from "react-icons/ai";
import EditInvoice from "./EditInvoice";
import { CREATEINVOICE, CREATEPAYMENT } from "pages/Edge/utils/RightConstants";

const InvoiceList = (props) => {
  const history = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [selected, setSelected] = useState(null);

  const [paymentPopup, setPaymentPopup] = useState(false);
  const [receivedArr, setReceivedArr] = useState([]);

  useEffect(() => {
    fetchEnums();
  }, []);

  useEffect(() => {
    if (props.data) {
      setList(props?.data?.invoiceList);
    }
  }, [props.data]);

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

  const handleAdd = () => {
    history({
      search: "?addInvoice=true",
    });
  };

  const handleEdit = (arg) => {
    history({
      search: "?editInvoice=true",
      state: arg,
    });
  };

  const handleClickRow = (id) => {
    setLoading(true);
    setSelectedList([id]);
    let d = list.filter((a) => a.id === id);

    setSelected(d[0]);
    setTimeout(() => {
      // handleEdit(d[0]);
      setLoading(false);
    }, 30);
  };

  const findDueAmount = (ttl, rec) => {
    ttl = ttl ? ttl : 0.0;
    rec = rec ? rec : 0.0;
    let a = parseFloat(ttl) - parseFloat(rec);

    return <span className={a ? "text-danger" : ""}>{formatCurrency(a)}</span>;
  };

  const handleReceivedShow = (invoice) => {
    if (invoice.paymentList && invoice.paymentList.length > 0) {
      let id = invoice.id;
      let newArr = [...receivedArr];
      let index = newArr.indexOf(id);

      if (index >= 0) {
        newArr = newArr.filter((item) => item !== id);
      } else {
        newArr.push(id);
      }

      setReceivedArr(newArr);
    }
  };

  const expandOrCollapse = (invoice) => {
    if (invoice.paymentList && invoice.paymentList.length > 0) {
      return receivedArr.includes(invoice.id) ? (
        <MdExpandLess size={26} />
      ) : (
        <MdExpandMore size={26} />
      );
    } else {
      return "";
    }
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

  const showAddButton = () => {
    if (checkHasPermission(CREATEINVOICE)) {
      return (
        <Button color="success" onClick={handleAdd} className="d-flex mx-2">
          <span className="plusdiv">+</span>Add
        </Button>
      );
    } else {
      return null;
    }
  };

  const showReceivePaymentButton = () => {
    if (checkHasPermission(CREATEPAYMENT) && list.length) {
      return (
        <Button
          color="danger"
          onClick={() => setPaymentPopup(true)}
          className="d-flex mx-2"
        >
          Receive Payments
        </Button>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="mx-2">
      <div className="d-flex align-items-center justify-content-end mb-2">
        <div className="d-flex mx-4">
          {showAddButton()}
          {showReceivePaymentButton()}
        </div>
      </div>

      <Table responsive={true} striped={true} hover={true}>
        <thead className="mb-2 bg-light">
          <tr>
            <th>
              <p className="mb-0">Invoice No.</p>
            </th>
            <th>
              <p className="mb-0">Date</p>
            </th>
            <th>
              <p className="mb-0">Created by</p>
            </th>
            <th>
              <p className="mb-0">Total Amount</p>
            </th>
            <th>
              <p className="mb-0">Amount Applied</p>
            </th>
            <th>
              <p className="mb-0">Amount Due</p>
            </th>
            <th>
              <p className="mb-0">Payment Status</p>
            </th>
            <th>
              <p className="mb-0">Invoice Status</p>
            </th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list?.map((invoice) => (
            <>
              <tr
                key={`${invoice.id}`}
                onClick={() => handleReceivedShow(invoice)}
                className={`${expandOrCollapse(invoice) && "pe-cursor"}`}
              >
                <td>
                  <p className="mb-0">{invoice.invoiceNumber}</p>
                </td>
                <td>
                  <p className="mb-0">
                    {invoice.invoiceDate
                      ? formatDateFunc(invoice.invoiceDate)
                      : ""}
                  </p>
                </td>
                <td>
                  <p className="mb-0">{invoice.createdBy}</p>
                </td>
                <td>
                  <p className="mb-0">{formatCurrency(invoice.totalAmount)}</p>
                </td>
                <td>
                  <p className="mb-0">
                    {formatCurrency(invoice.amountApplied)}
                  </p>
                </td>
                <td>
                  <p className={`mb-0`}>
                    {findDueAmount(invoice.totalAmount, invoice.amountApplied)}
                  </p>
                </td>
                <td>
                  <p className="mb-0">
                    {findDisplayname(invoiceStatus, invoice.status)}
                  </p>
                </td>
                <td>
                  <p className="mb-0">
                    {invoice.flagFinal ? "FINAL" : "DRAFT"}
                  </p>
                </td>
                <td>
                  <Button
                    color="primary"
                    className="me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickRow(invoice.id);
                    }}
                  >
                    {invoice.flagFinal ? " View" : "Update"}
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => printInvoice(invoice.id)}
                  >
                    <AiFillPrinter size={18} />
                  </Button>
                </td>
                <td>
                  <div className="">{expandOrCollapse(invoice)}</div>
                </td>
              </tr>
              <ReceivedPaymentDetails
                show={receivedArr.includes(invoice.id)}
                list={invoice.paymentList}
              />
            </>
          ))}
        </tbody>
      </Table>

      <div className="mc-header" style={{ display: "none" }}>
        {/* <div className='mc-col xsm'>
          <input className='mc-check' type='checkbox' />
        </div> */}
        <div className="mc-col sm">
          <p>Invoice No.</p>
        </div>
        <div className="mc-col sm">
          <p>Date</p>
        </div>
        <div className="mc-col md">
          <p>Created by</p>
        </div>

        <div className="mc-col sm">
          <p>Total Amount</p>
        </div>
        <div className="mc-col sm">
          <p>Amount Applied</p>
        </div>
        <div className="mc-col sm red">
          <p>Amount Due</p>
        </div>
        <div className="mc-col md">
          <p>Payment Status</p>
        </div>
        <div className="mc-col md">
          <p>Invoice Status</p>
        </div>
        <div className="mc-col sm"></div>
      </div>
      <div className="mc-tBody" style={{ display: "none" }}>
        {list?.map((invoice) => (
          <Fragment key={`${invoice.id}`}>
            <div
              className="mc-row pe-cursor"
              key={`${invoice.id}`}
              onClick={(e) => {
                e.stopPropagation();
                handleReceivedShow(invoice);
              }}
            >
              {/* <div className='mc-col xsm'>
                <input className='mc-check' type='checkbox' />
              </div> */}
              <div className="mc-col sm">
                <p>{invoice.invoiceNumber}</p>
              </div>

              <div className="mc-col sm">
                <p>
                  {invoice.invoiceDate
                    ? formatDateFunc(invoice.invoiceDate)
                    : ""}
                </p>
              </div>
              <div className="mc-col md">
                <p>{invoice.createdBy}</p>
              </div>
              <div className="mc-col sm">
                <p className="three-dot">{`$ ${roundToDigit(
                  invoice.totalAmount
                )}`}</p>
              </div>
              <div className="mc-col sm">
                <p>{`$ ${roundToDigit(invoice.amountApplied)}`}</p>
              </div>
              <div className="mc-col sm">
                <p className="text-danger">
                  {findDueAmount(invoice.totalAmount, invoice.amountApplied)}
                </p>
              </div>
              <div className="mc-col md">
                <p>{findDisplayname(invoiceStatus, invoice.status)}</p>
              </div>
              <div className="mc-col md">
                <p>{invoice.flagFinal ? "FINAL" : "DRAFT"}</p>
              </div>
              <div className="mc-col sm flx">
                <button
                  className="custodyAddbtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickRow(invoice.id);
                  }}
                >
                  View
                </button>
                <div className="mr-l20">{expandOrCollapse(invoice)}</div>
              </div>
            </div>
            <ReceivedPaymentDetails
              show={receivedArr.includes(invoice.id)}
              list={invoice.paymentList}
            />
          </Fragment>
        ))}
      </div>
      {paymentPopup && (
        <ReceivePayment
          isOpen={paymentPopup}
          close={() => setPaymentPopup(false)}
          matterData={props.data}
          list={list}
          refresh={props.refresh}
        />
      )}
      {selected && (
        <Modal
          isOpen={selected}
          toggle={() => setSelected(null)}
          backdrop="static"
          scrollable={true}
          size="xl"
          centered
        >
          <ModalHeader
            toggle={() => setSelected(null)}
            className="bg-light p-3"
          >
            Edit Invoice
          </ModalHeader>
          <ModalBody>
            <EditInvoice
              data={props.data}
              invoiceData={selected}
              refresh={props.refresh}
              onClose={() => setSelected(null)}
            />
          </ModalBody>
        </Modal>
      )}
      {loading && <LoadingPage />}
    </div>
  );
};

export default InvoiceList;
