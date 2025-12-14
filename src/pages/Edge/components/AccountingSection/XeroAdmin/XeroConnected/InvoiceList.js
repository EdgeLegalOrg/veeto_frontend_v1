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
import { getEligibleInvoice, uploadInvoiceToXero } from "../../../../apis";
import LoadingPage from "../../../../utils/LoadingPage";
import { toast } from "react-toastify";
import ResponseAlert from "./ResponseAlert";

const InvoiceList = (props) => {
  const [list, setList] = useState([]);
  const [invoiceStatus, setInvoiceStatus] = useState([]);
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
    fetchInvoiceList();
  }, []);

  const fetchInvoiceList = async () => {
    setLoading(true);
    try {
      const { data } = await getEligibleInvoice();
      if (data.success) {
        setList(data?.data?.invoiceList || []);
      } else {
        toast.warning("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error(error);
      toast.warning("Something went wrong, please try later.");
    } finally {
      setLoading(false);
    }
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

      fetchInvoiceList();
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
                      <label>Invoice No.</label>
                    </div>
                  </th>
                  <th>
                    <div className="d-flex">
                      <label>Matter No.</label>
                    </div>
                  </th>
                  <th>
                    <div className="d-flex">
                      <label>Date</label>
                    </div>
                  </th>
                  <th>
                    <div className="d-flex">
                      <label>Total Amount</label>
                    </div>
                  </th>
                  <th>
                    <div className="d-flex">
                      <label>Invoice Status</label>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list?.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => handleSelect(invoice.id)}
                    className="pe-cursor"
                  >
                    <td>
                      <Input type="checkbox" checked={isSelected(invoice.id)} />
                    </td>
                    <td>
                      <p className="mb-0">
                        {siteCode
                          ? `${siteCode}-${invoice.invoiceNumber}`
                          : invoice.invoiceNumber}
                      </p>
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
                  </tr>
                ))}
              </tbody>
            </Table>
            {loading && <LoadingPage />}
          </div>
          <Button color="success" className="m-4" onClick={handlePostInvoice}>
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
