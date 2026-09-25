import React, { useEffect, useState } from "react";
import { Table, Button, Input } from "reactstrap";
import { formatDateFunc, roundToDigit } from "../../../utils/utilFunc";
import { get } from "../../../utils/Json";
import { TextInputField } from "pages/Edge/components/InputField";
import { getUnpaidInvoiceOfMatter, getMattersList } from "../../../apis";
import { toast } from "react-toastify";
import { MdAdd } from "react-icons/md";

const InvoiceToBePaid = (props) => {
  const { formData, setFormData, matterId, setLoading, parseList } = props;
  const [list, setList] = useState([]);
  const [otherMatterNo, setOtherMatterNo] = useState("");
  const [searchingMatter, setSearchingMatter] = useState(false);

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

  const handleAddOtherMatterInvoices = async () => {
    const searchVal = String(otherMatterNo || "").trim();
    if (!searchVal) {
      toast.warning("Please enter a matter number to add invoices.");
      return;
    }

    setSearchingMatter(true);
    try {
      const res = await getMattersList({ matterNumber: searchVal, pageSize: 10 });
      const matters = res?.data?.data?.matterList || [];
      const matchedMatter =
        matters.find(
          (m) =>
            String(m.matterNumber).toLowerCase() === searchVal.toLowerCase() ||
            String(m.id) === searchVal
        ) || matters[0];

      if (!matchedMatter) {
        toast.warning(`Matter "${searchVal}" not found.`);
        setSearchingMatter(false);
        return;
      }

      const invRes = await getUnpaidInvoiceOfMatter(matchedMatter.id);
      const invoices = (invRes?.data?.data?.invoiceList || []).filter(
        (l) =>
          l.flagFinal === true &&
          (l.status === "PARTIAL_PAID" || l.status === "UNPAID")
      );

      if (invoices.length === 0) {
        toast.info(
          `No unpaid invoices found for matter ${matchedMatter.matterNumber}.`
        );
        setSearchingMatter(false);
        return;
      }

      const existingIds = new Set(list.map((inv) => inv.id));
      const newInvoices = invoices.filter((inv) => !existingIds.has(inv.id));

      if (newInvoices.length === 0) {
        toast.info(
          `Invoices for matter ${matchedMatter.matterNumber} are already in the list.`
        );
        setSearchingMatter(false);
        return;
      }

      newInvoices.forEach((inv) => {
        inv.error = { valid: true, message: "Amount entered is not correct." };
      });

      const updatedList = [...list, ...newInvoices];
      const newFormEntries = newInvoices.map((inv) => ({
        invoiceId: inv.id,
        amount: 0,
        matterId: inv.matterId || matchedMatter.id,
      }));

      const updatedFormList = [
        ...(formData.invoicePaymentList || []),
        ...newFormEntries,
      ];

      setList(updatedList);
      props.setList(updatedList);
      setFormData({ ...formData, invoicePaymentList: updatedFormList });
      setOtherMatterNo("");
      toast.success(
        `Added ${newInvoices.length} invoice(s) from matter ${matchedMatter.matterNumber}.`
      );
    } catch (error) {
      console.error("Error adding other matter invoices:", error);
      toast.error("Failed to load invoices for the specified matter.");
    } finally {
      setSearchingMatter(false);
    }
  };

  const findDueAmount = (ttl, rec, value = false) => {
    ttl = ttl ? ttl : 0.0;
    rec = rec ? rec : 0.0;
    let a = Math.round((parseFloat(ttl) - parseFloat(rec)) * 100) / 100;

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

    if (Math.round(enteredAmt * 100) > Math.round(remaining * 100)) {
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

    if (amt !== undefined && amt !== null && amt !== "") {
      return amt;
    } else {
      return "";
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2 mt-3">
        <h6 className="mb-0 fw-semibold">Invoices to be Paid</h6>
        <div
          className="d-flex align-items-center"
          style={{ maxWidth: "340px" }}
        >
          <Input
            type="text"
            size="sm"
            placeholder="Add Matter No. (e.g. 2602210)"
            value={otherMatterNo}
            onChange={(e) => setOtherMatterNo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddOtherMatterInvoices();
              }
            }}
          />
          <Button
            type="button"
            color="primary"
            size="sm"
            className="ms-2 text-nowrap d-flex align-items-center"
            disabled={searchingMatter}
            onClick={handleAddOtherMatterInvoices}
          >
            <MdAdd className="me-1" /> Add Invoices
          </Button>
        </div>
      </div>
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
                <p className="m-0 fw-semibold">{invoice.matterNumber}</p>
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
                  <span className="mx-1 text-danger small">
                    {invoice?.error?.message}
                  </span>
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
