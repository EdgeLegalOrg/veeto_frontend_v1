import React, { Fragment, useEffect, useState } from "react";
import { addDepositSlip, allDSPaymentList } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { Input, Table, Button } from "reactstrap";
import {
  findDisplayname,
  formatCurrency,
  formatDateFunc,
} from "../../../utils/utilFunc";
import { toast } from "react-toastify";
import { TextInputField } from "../../InputField";

const initialState = {
  description: "",
  depositedPayments: [],
};

const CreateDepositSlip = (props) => {
  const [list, setList] = useState([]);
  const [type, setType] = useState([]);
  const [subType, setSubType] = useState([]);
  const [selected, setSelected] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchEnums();
    fetchPayments();
  }, []);

  const fetchEnums = () => {
    let enums = JSON.parse(window.localStorage.getItem("enumList"));

    if (enums) {
      if (enums["PaymentType"]) {
        setType(enums["PaymentType"]);
      }

      if (enums["PaymentSubType"]) {
        setSubType(enums["PaymentSubType"]);
      }
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await allDSPaymentList();
      if (data.success) {
        setList(data?.data?.paymentList);
      } else {
        toast.error("Something went wrong, please try later.");
      }
    } catch (error) {
      toast.error("Something went wrong, please try later.");
      console.error(error);
    } finally {
      setLoading(false);
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
  const isSelected = (id) => (selected.indexOf(id) >= 0 ? true : false);

  const handleClose = () => {
    setSelected([]);
    setFormData(initialState);
    if (props.close) {
      props.close();
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;

    setFormData({ ...formData, description: value });
  };

  const handleSubmit = async () => {
    // if (!formData.description) {
    //   return setSubmitted(true);
    //   // return toast.error('Description is required!');
    // }

    if (!selected.length) {
      return toast.error("Please select aleast one payment.");
    }

    let paymentList = [];

    for (let a in selected) {
      paymentList.push({ paymentId: selected[a] });
    }

    try {
      const { data } = await addDepositSlip({
        ...formData,
        depositedPayments: paymentList,
      });
      if (data.success) {
        if (props.refresh) {
          props.refresh();
        }

        toast.success("Deposit slip created successfully.");

        setTimeout(() => {
          handleClose();
        }, 10);
      } else {
        toast.warning("Something went wrong, please try later.");
      }
    } catch (error) {
      toast.warning("Something went wrong, please try later.");
      console.error("error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="px-4 py-3">
        <div>
          {/* <label>
            Description <span className='text-danger'>*</span>
          </label> */}
          <TextInputField
            name="description"
            label="Description"
            type="text"
            value={formData.description}
            onChange={handleChange}
            invalid={submitted && !formData.description}
            // invalidMessage="Description is required"
            // required={true}
            // required={isRequired("notProceedingDate")}
          />
        </div>
        <div className="mt-4 max-50vh">
          <Table responsive={true} striped={true} hover={true}>
            <thead className="mb-2 bg-light">
              <tr>
                <td></td>
                <th>
                  <div className="d-flex">
                    <label>Payment No.</label>
                  </div>
                </th>
                <th>
                  <div className="d-flex">
                    <label>Type</label>
                  </div>
                </th>
                <th>
                  <div className="d-flex">
                    <label>Sub Type</label>
                  </div>
                </th>
                <th>
                  <div className="d-flex">
                    <label>Matter No.</label>
                  </div>
                </th>
                <th>
                  <div className="d-flex">
                    <label>Amount</label>
                  </div>
                </th>
                <th>
                  <div className="d-flex">
                    <label>Date</label>
                  </div>
                </th>
                <th>
                  <div className="d-flex">
                    <label>Cheque No.</label>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {list?.map((payment) => {
                if (
                  payment.paymentType === "CASH" ||
                  payment.paymentType === "CHEQUE"
                ) {
                  return (
                    <tr
                      key={payment.id}
                      onClick={(e) => handleSelect(payment.id)}
                      className="pe-cursor"
                    >
                      <td>
                        <Input
                          type="checkbox"
                          checked={isSelected(payment.id)}
                          onClick={(e) => {}}
                        />
                      </td>
                      <td>
                        <p className="mb-0">{payment.paymentNumber}</p>
                      </td>
                      <td>
                        <p className="mb-0">
                          {findDisplayname(type, payment.paymentType)}
                        </p>
                      </td>
                      <td>
                        <p className="mb-0">
                          {findDisplayname(subType, payment.paymentSubType)}
                        </p>
                      </td>
                      <td>
                        <p className="mb-0">{payment.matterNumber}</p>
                      </td>
                      <td>
                        <p className="mb-0">{formatCurrency(payment.amount)}</p>
                      </td>
                      <td>
                        <p className="mb-0">
                          {payment.createdOn
                            ? formatDateFunc(payment.createdOn)
                            : ""}
                        </p>
                      </td>
                      <td>
                        <p className="mb-0">{payment.chequeNumber}</p>
                      </td>
                    </tr>
                  );
                } else {
                  return null;
                }
              })}
            </tbody>
          </Table>
        </div>
        <div className="row mt-4">
          <div className="d-flex align-items-center justify-content-end p-2 border-top">
            <Button
              type="button"
              color="danger"
              onClick={handleClose}
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
          </div>
        </div>
      </div>
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default CreateDepositSlip;
