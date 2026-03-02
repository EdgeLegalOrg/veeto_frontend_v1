import { getBankAccountDetails, printDepositSlip } from "pages/Edge/apis";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";
import React, { useEffect, useState } from "react";
import { AiFillPrinter } from "react-icons/ai";
import { Button } from "reactstrap";

const ViewDepositSlip = (props) => {
  const [data, setData] = useState(props.data);
  const [accountDetails, setAccountDetails] = useState({});
  const [paymentWithType, setPaymentWithType] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  useEffect(() => {
    if (props.data) {
      setData(props.data);
      parsePayments(props.data);
    }
  }, [props.data]);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const { siteId } = JSON.parse(window.localStorage.getItem("userDetails"));
      const { data } = await getBankAccountDetails(siteId);

      setAccountDetails(data?.data || {});

      setLoading(false);
    } catch (error) {
      console.error("error", error);
      setLoading(false);
    }
  };

  const parsePayments = (arg) => {
    const rval = {};
    const ls = arg.depositedPayments;

    if (ls && ls.length) {
      for (let a in ls) {
        let item = ls[a];
        if (rval[item.paymentType]) {
          rval[item.paymentType].push(item);
        } else {
          rval[item.paymentType] = [];
          rval[item.paymentType].push(item);
        }
      }
    }

    setPaymentWithType(rval);
  };

  const findTotal = (arg) => {
    let total = 0;
    for (let a in arg) {
      total += parseFloat(arg[a].amount) || 0;
    }

    return total.toFixed(2);
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

  const displayList = (arg) => {
    if (arg && arg.length > 0) {
      return arg.map((payment) => (
        <tr>
          <td></td>
          <td>
            <p>{payment.paymentId}</p>
          </td>
          <td>
            <p>{payment.matterNumber}</p>
          </td>
          <td>
            <p>{payment.paymentType}</p>
          </td>
          <td>
            <p>{payment.amount}</p>
          </td>
        </tr>
      ));
    } else {
      return <></>;
    }
  };

  const footer = (arg, k) => {
    if (arg && arg.length > 0) {
      return (
        <tbody className="w-100">
          <tr className=" bg-light">
            <td></td>
            <td className="text-dark fs-15">{`${arg.length} item(s)`}</td>
            <td></td>
            <td className="text-dark fs-15">
              <span style={{ fontWeight: "600", marginRight: "14px" }}>
                {k}
              </span>
              <span>{`Total:  $ ${findTotal(arg)}`}</span>
            </td>
            <td></td>
          </tr>
        </tbody>
      );
    } else {
      return <></>;
    }
  };

  const payments = () => {
    let keys = Object.keys(paymentWithType);

    if (keys && keys.length) {
      return keys.map((k) => (
        <>
          <tbody>{displayList(paymentWithType[k])}</tbody>
          {footer(paymentWithType[k], k)}
        </>
      ));
    } else {
      return <></>;
    }
  };

  return (
    <div>
      <div className="px-4 py-3">
        <div className="deposit-header row">
          <div className="deposit-label-info col-md-3">
            <label className="deposit-label text-muted mb-1">
              Date Created
            </label>
            <p className="deposit-info fs-15">
              {formatDateFunc(data.createdDate)}
            </p>
          </div>
          <div className="deposit-label-info col-md-3">
            {/* <label className="deposit-label text-muted mb-1 lh-1">
                Company Name
              </label>
              <p className="deposit-info fs-15">{"company name"}</p> */}
          </div>
          <div className="col-md-5"></div>
          <div className="col-md-1">
            <Button className="d-flex mx-1" onClick={() => printSlip(data.id)}>
              <AiFillPrinter size={18} />
            </Button>
          </div>
        </div>
        <div className="deposit-header row mt-3">
          <div className="deposit-label-info col-md-3">
            <label className="deposit-label text-muted mb-1 lh-1">ABN</label>
            <p className="deposit-info fs-15">{accountDetails.abn}</p>
          </div>
          <div className="deposit-label-info col-md-3">
            <label className="deposit-label text-muted mb-1 lh-1">BSB</label>
            <p className="deposit-info fs-15">{accountDetails.bankBSB}</p>
          </div>
          <div className="deposit-label-info col-md-3">
            <label className="deposit-label text-muted mb-1 lh-1">
              Account No.
            </label>
            <p className="deposit-info fs-15">{accountDetails.accountNumber}</p>
          </div>
          <div className="deposit-label-info col-md-3">
            <label className="deposit-label text-muted mb-1 lh-1">
              Total Deposit
            </label>
            <p className="deposit-info fs-15">
              {data.totalDepositAmount ? `$${data.totalDepositAmount}` : ""}
            </p>
          </div>
        </div>
        <div className="deposit-header row ">
          <div className="deposit-label-info col-md-12 mt-3">
            <label className="deposit-label text-muted mb-1 lh-1">
              Description
            </label>
            <p className="deposit-info fs-15">{data.description}</p>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="mb-2 bg-light">
            <tr>
              <th></th>
              <th>
                <p>Payment Id</p>
              </th>
              <th>
                <p>Matter Number</p>
              </th>
              <th>
                <p>Payment Type</p>
              </th>
              <th>
                <p>Amount</p>
              </th>
            </tr>
          </thead>
          {payments()}
        </table>
      </div>
    </div>
  );
};

export default ViewDepositSlip;
