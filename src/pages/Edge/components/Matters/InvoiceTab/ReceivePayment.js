import React, { Fragment, useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { getRequiredFields, validate } from "../../../utils/Validation";
import InvoiceToBePaid from "./InvoiceToBePaid";
import LoadingPage from "../../../utils/LoadingPage";
import { addReceivedPayment } from "../../../apis";
import { toast } from "react-toastify";
import { TextInputField } from "pages/Edge/components/InputField";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";

const initialData = {
  paymentType: "CARD",
  paymentSubType: "CARD",
  amount: "",
  paymentDate: new Date(),
  bSB: "",
  accountName: "",
  accountNumber: "",
  chequeNumber: "",
  note: "",
  status: null,
  paymentNumber: "",
  createdBy: "",
  createdOn: "",
  invoicePaymentList: [],
};

const ReceivePayment = (props) => {
  const [formData, setFormData] = useState(initialData);
  const [requiredFields, setRequiredFields] = useState([]);
  const [paymentType, setPaymentType] = useState([]);
  const [paymentSubType, setPaymentSubType] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchEnumList();
  }, []);

  const parseList = (arg) => {
    let arr = [];
    arr = arg.filter(
      (l) =>
        l.flagFinal === true &&
        (l.status === "PARTIAL_PAID" || l.status === "UNPAID")
    );

    let formArr = [];

    for (let a in arr) {
      let item = arr[a];
      arr[a].error = { valid: true, message: "Amount entered is not correct." };
      formArr.push({ invoiceId: item.id, amount: 0, matterId: item.matterId});
    }
    setList(arr);
    setFormData({ ...formData, invoicePaymentList: formArr });
  };

  const fetchEnumList = () => {
    let req = getRequiredFields("matter_payment");

    if (req && req.requiredFields && req.requiredFields.length > 0) {
      setRequiredFields(req.requiredFields);
    }

    let enums = JSON.parse(window.localStorage.getItem("enumList"));
    if (enums) {
      let pt = enums.PaymentType || [];
      setPaymentType(pt);
      if (formData.paymentType) {
        let type = pt.find((d) => d.value === formData.paymentType);
        setPaymentSubType(type?.subType || []);
      }
    }
  };

  const isRequired = (field) => {
    return requiredFields.includes(field);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "amount") {
      value = value ? parseFloat(value) : 0;
    }

    setFormData({ ...formData, [name]: value });
  };

  const labelReq = (fieldName) => {
    if (isRequired(fieldName)) {
      return (
        <span
          style={{
            color: "#eb3d30",
            marginLeft: "2px",
            fontWeight: "500",
          }}
        >
          *
        </span>
      );
    } else {
      return <></>;
    }
  };

  const handleRadioBtn = (arg, name) => {
    let { value } = arg;
    let inputData = { ...formData };
    if (name === "paymentType") {
      let sub = arg.subType ? arg.subType : [];
      if (sub.length > 0) {
        inputData.paymentSubType = sub[0].value;
        setTimeout(() => {
          setPaymentSubType(sub);
        }, 10);
      }
    }

    setFormData({ ...inputData, [name]: value });
  };

  const dueValidInList = () => {
    let valid = true;
    for (let a in list) {
      let item = list[a];
      if (item?.error && !item?.error?.valid) {
        valid = false;
        break;
      }
    }

    return valid;
  };

  const checkAmountValid = () => {
    let amtSum = 0;
    let amountReceived = formData.amount ? parseFloat(formData.amount) : 0;
    let invList = formData.invoicePaymentList;

    invList.forEach((inv) => {
      amtSum += inv.amount;
    });

    let dueValid = dueValidInList();
    let totalValid = true;

    if (amtSum != amountReceived) {
      totalValid = false;
    }

    return dueValid && totalValid;
  };

  const startSubmit = async (arg) => {
    let isAmountValid = checkAmountValid();
    if (isAmountValid) {
      try {
        const { data } = await addReceivedPayment(arg);
        if (data.success) {
          if (props.refresh) {
            props.refresh();
            setTimeout(() => {
              props.close();
            }, 1);
          }
        } else {
          toast.error("Something went wrong, please try again later.");
        }
        setLoading(false);
      } catch (error) {
        toast.error("Something went wrong, please try again later.");
        console.error(error);
        setLoading(false);
      }
    } else {
      setLoading(false);
      toast.error("Incorrect Amount Division, Please check again.");
    }
  };

  const handleSubmit = () => {
    let invoiceList = [...formData.invoicePaymentList];
    invoiceList = invoiceList.filter((ls) => ls.amount > 0);

    let d = {
      ...formData,
      invoicePaymentList: invoiceList,
      // matterId: props.matterData.id,
    };

    setLoading(true);

    let skipFields = [
      "note",
      "status",
      "paymentNumber",
      "createdBy",
      "createdOn",
      // 'bSB',
      // 'chequeNumber',
      // 'accountNumber',
    ];

    if (formData.paymentType !== "CHEQUE") {
      skipFields = [
        ...skipFields,
        "bSB",
        "chequeNumber",
        "accountNumber",
        "accountName",
      ];
    }

    let invalid = validate(d, "matter_payment", skipFields);

    if (invalid) {
      setSubmitted(true);
      // toast.warning(`${invalid} field is required !`);
      setLoading(false);
    } else {
      startSubmit(d);
    }
  };

  const accountDetails = () => {
    let type = formData.paymentType;

    if (type === "CHEQUE") {
      return (
        <div className="flx mr-t20 mx-2">
          <div className="mr-r16">
            <TextInputField
              name="accountName"
              label="Account Name"
              value={formData.accountName}
              onChange={handleChange}
              required={isRequired("accountName")}
              invalid={submitted && isRequired("accountName")}
              invalidMessage="Account Name is required"
            />
          </div>
          <div>
            <TextInputField
              name="chequeNumber"
              label="Cheque Number"
              value={formData.chequeNumber}
              onChange={handleChange}
              required={isRequired("chequeNumber")}
              invalid={submitted && isRequired("chequeNumber")}
              invalidMessage="Cheque Number is required"
            />
          </div>
          <div>
            <TextInputField
              name="bSB"
              label="BSB"
              value={formData.bSB}
              onChange={handleChange}
              required={isRequired("bSB")}
              invalid={submitted && isRequired("bSB")}
              invalidMessage="BSB is required"
            />
          </div>
          <div>
            <TextInputField
              name="accountNumber"
              label="Account Number"
              value={formData.accountNumber}
              onChange={handleChange}
              required={isRequired("accountNumber")}
              invalid={submitted && isRequired("accountNumber")}
              invalidMessage="Account Number is required"
            />
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={() => props.close()}
      backdrop="static"
      scrollable={true}
      size="lg"
      centered
    >
      <ModalHeader toggle={() => props.close()} className="bg-light p-3">
        Receive Payments
      </ModalHeader>

      <ModalBody>
        <div>
          <div className="mt-3">
            <div className="">
              <div className="mx-2">
                <label className="invoice-radio-label">
                  Payment Type {labelReq("paymentType")}
                </label>
              </div>
              <div className="d-flex  align-items-center">
                {paymentType.map((type) => (
                  <div
                    className="d-flex align-items-center mx-2 pe-cursor"
                    key={type.value}
                    onClick={() => handleRadioBtn(type, "paymentType")}
                  >
                    <Input
                      type="radio"
                      onChange={() => {}}
                      checked={formData.paymentType === type.value}
                      className="form-check-input"
                    />
                    <p className="m-0 my-1 mx-2">{type.display}</p>
                  </div>
                ))}
              </div>
            </div>

            {paymentSubType?.length > 0 && (
              <div className="">
                <div className="mx-2">
                  <label className="invoice-radio-label">
                    Payment Sub Type {labelReq("paymentSubType")}
                  </label>
                </div>
                <div className="d-flex  align-items-center">
                  {paymentSubType.map((type) => (
                    <div
                      className="d-flex align-items-center mx-2 pe-cursor"
                      key={type.value}
                      onClick={() => handleRadioBtn(type, "paymentSubType")}
                    >
                      <Input
                        type="radio"
                        onChange={() => {}}
                        checked={formData.paymentSubType === type.value}
                        className="form-check-input"
                      />
                      <p className="m-0 my-1 mx-2">{type.display}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="row mt-3">
              <div className="col-md-6">
                <TextInputField
                  label="Payment Date"
                  name="paymentDate"
                  placeholder="Payment Date"
                  type="date"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  required={isRequired("paymentDate")}
                  invalid={submitted && isRequired("paymentDate")}
                  invalidMessage="Payment Date is required"
                />
              </div>
              <div className="col-md-6">
                <TextInputField
                  label="Amount"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount ? formData.amount : ""}
                  type="number"
                  onChange={handleChange}
                  required={isRequired("amount")}
                  invalid={submitted && isRequired("amount")}
                  invalidMessage="Amount is required"
                />
              </div>
            </div>
            <div className="mt-3">{accountDetails()}</div>
          </div>
          <InvoiceToBePaid
            matterId={props.matterData.id}
            matterNumber={props.matterData.matterNumber}
            // list={props.list}
            list={list}
            setList={setList}
            formData={formData}
            setFormData={setFormData}
            setLoading={setLoading}
            parseList={parseList}
          />
        </div>
        {loading && <LoadingPage />}
      </ModalBody>
      <ModalFooter className="border-top">
        <Button
          type="button"
          color="danger"
          onClick={props.close}
          className="mx-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          color="success"
          onClick={handleSubmit}
          className="mx-1"
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReceivePayment;
