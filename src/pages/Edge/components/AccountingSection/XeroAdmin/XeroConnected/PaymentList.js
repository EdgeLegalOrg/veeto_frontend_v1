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
import { getEligiblePayments, uploadPaymentToXero } from "../../../../apis";
import LoadingPage from "../../../../utils/LoadingPage";
import { toast } from "react-toastify";
import ResponseAlert from "./ResponseAlert";

const PaymentList = (props) => {
  const [list, setList] = useState([]);
  const [type, setType] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseAlert, setResponseAlert] = useState(null);

  const siteId =
    JSON.parse(window.localStorage.getItem("userDetails"))?.siteId || null;

  const siteList =
    JSON.parse(window.localStorage.getItem("companyInfo"))?.siteInfoList || [];
  const siteCode =
    siteList.find((site) => site.siteId === siteId)?.siteCode || "";

  useEffect(() => {
    fetchEnums();
    fetchPaymentList();
  }, []);

  useEffect(() => {
    if (props.refreshList) {
      fetchPaymentList();
    }
  }, [props.refreshList]);

  const fetchPaymentList = async () => {
    setLoading(true);
    try {
      const { data } = await getEligiblePayments();
      if (data.success) {
        setList(data?.data?.invoicePaymentList || []);
        if (props.handleRefresh) {
          props.handleRefresh(false);
        }
      } else {
        toast.error("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, please try later.");
    } finally {
      setLoading(false);
    }
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
          i.paymentId !== payment.paymentId || i.invoiceId !== payment.invoiceId
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

  const ui = () => {
    if (props.active) {
      return (
        <>
          <div className="mx-2 max-50vh">
            <Table responsive={true} striped={true} hover={true}>
              <thead className="mb-2 bg-light">
                <tr>
                  <th>
                    <Input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        list.length > 0 && selected.length === list.length
                      }
                    />
                  </th>
                  <th>
                    <div className="d-flex">
                      <label>Payment No.</label>
                    </div>
                  </th>
                  <th>
                    <div className="d-flex">
                      <label>Matter No.</label>
                    </div>
                  </th>
                  <th>
                    <div className="d-flex">
                      <label>Payment Date</label>
                    </div>
                  </th>
                  {/* <th>
                  <div className='d-flex'>
                    <label>Created by</label>
                  </div>
                </th> */}
                  <th>
                    <div className="d-flex">
                      <label>Payment Type</label>
                    </div>
                  </th>
                  <th>
                    <div className="d-flex">
                      <label>Amount</label>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list?.map((payment, i) => (
                  <tr
                    key={`${payment.paymentId}_${payment.invoiceId}`}
                    onClick={() => handleSelect(payment)}
                    className="pe-cursor"
                  >
                    <td>
                      <Input type="checkbox" checked={isSelected(payment)} />
                    </td>
                    <td>
                      {/*<p className="mb-0">
                        {siteCode
                          ? `${siteCode}-${payment.paymentNumber}`
                          : payment.paymentNumber}
					</p>*/}
                      <p className="mb-0">{payment.paymentNumStr}</p>
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
                  </tr>
                ))}
              </tbody>
            </Table>
            {loading && <LoadingPage />}
          </div>
          <Button color="success" className="m-4" onClick={handlePostPayment}>
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
