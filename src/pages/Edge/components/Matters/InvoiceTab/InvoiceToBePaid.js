import React, { useEffect, useState } from "react";
import { Table } from "reactstrap";
import { formatDateFunc, roundToDigit } from "../../../utils/utilFunc";
import { get } from "../../../utils/Json";
import { TextInputField } from "pages/Edge/components/InputField";
import { getUnpaidInvoiceOfMatter } from "../../../apis";

const InvoiceToBePaid = (props) => {
  const { formData, setFormData, matterId, setLoading, parseList } = props;
  const [list, setList] = useState([]);

  useEffect(() => {
    if (matterId) {
      fetchUnpaidInvoices();
    }
  }, [matterId]);

  const fetchUnpaidInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await getUnpaidInvoiceOfMatter(matterId);
      if (data && data.success) {
        let invoiceList = data?.data?.invoiceList || [];
        parseList(invoiceList);
      }
    } catch (error) {
      console.error("Error fetching unpaid invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (props.list && props.list.length > 0) {
      setList(props.list);
    }
  }, [props.list]);

  const findDueAmount = (ttl, rec, value = false) => {
    ttl = ttl ? ttl : 0.0;
    rec = rec ? rec : 0.0;
    let a = parseFloat(ttl) - parseFloat(rec);

    if (value) {
      return a;
    } else {
      return a ? `$ ${roundToDigit(a)}` : `$ 0.0`;
    }
  };

  const updatePayment = (e, index) => {
    const { value } = e.target;

    let newArr = [];
    let newList = [...list];
    let remaining = findDueAmount(
      newList[index].totalAmount,
      newList[index].amountApplied,
      true
    );

    let enteredAmt = value && parseFloat(value) >= 0 ? parseFloat(value) : 0;

    if (enteredAmt > remaining) {
      newList[index].error.valid = false;
    } else {
      newList[index].error.valid = true;
    }

    setList(newList);
    setTimeout(() => {
      props.setList(newList);
    }, 10);

    if (formData?.invoicePaymentList?.length > 0) {
      newArr = [...formData.invoicePaymentList];
    }

    if (newArr.length > 0) {
      newArr[index].amount = enteredAmt;

      setFormData({ ...formData, invoicePaymentList: newArr });
    }
  };

  const paymentValue = (index) => {
    let amt = get(formData, `invoicePaymentList.${index}.amount`);

    if (amt) {
      return amt;
    } else {
      return "";
    }
  };

  return (
    <div>
      <Table responsive={true} striped={true} hover={true}>
        <thead>
          <tr>
            <td>
              <p className="m-0">Matter No.</p>
            </td>
            <td>
              <p className="m-0">Invoice No.</p>
            </td>
            <td>
              <p className="m-0">Date</p>
            </td>
            <td>
              <p className="m-0">Amount</p>
            </td>
            <td>
              <p className="m-0">Received</p>
            </td>
            <td>
              <p className="m-0">Due</p>
            </td>
            <td>
              <p className="m-0">Payment</p>
            </td>
          </tr>
        </thead>
        <tbody>
          {list?.map((invoice, index) => (
            <tr key={invoice.id} className="pe-cursor align-middle">
              <td>
                <p className="m-0">{invoice.matterNumber}</p>
              </td>
              <td>
                <p className="m-0">{invoice.invoiceNumber}</p>
              </td>
              <td>
                <p className="m-0">
                  {invoice.invoiceDate
                    ? formatDateFunc(invoice.invoiceDate)
                    : ""}
                </p>
              </td>
              <td>
                <p className="m-0">{`$ ${roundToDigit(
                  invoice.totalAmount
                )}`}</p>
              </td>
              <td>
                <p className="m-0">{`$ ${roundToDigit(
                  invoice.amountApplied
                )}`}</p>
              </td>
              <td>
                <p className="m-0">
                  {findDueAmount(invoice.totalAmount, invoice.amountApplied)}
                </p>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="mx-1">{`$ `}</span>
                  <TextInputField
                    containerClassName="mb-0"
                    type="number"
                    placeholder="Enter Amount"
                    value={paymentValue(index)}
                    onChange={(e) => updatePayment(e, index)}
                  />
                </div>
                {!invoice?.error?.valid && (
                  <span className="mx-1">{invoice?.error?.message}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default InvoiceToBePaid;
