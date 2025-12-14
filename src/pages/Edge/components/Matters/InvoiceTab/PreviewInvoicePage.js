import React, { useState, useEffect } from "react";
import PreviewInvoiceTemplate from "./PreviewInvoiceTemplate";
import "../../../stylesheets/PreviewInvoice.css";
import LoadingPage from "../../../utils/LoadingPage";
import { addOrPreviewInvoice } from "../../../apis";
import { toast } from "react-toastify";
import { Button } from "reactstrap";

const PreviewInvoicePage = (props) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.data) {
      setFormData(props.data);
    }
  }, [props.data]);

  const update = () => {
    if (props.update) {
      props.update();
    }
  };

  const close = () => {
    if (props.closeAll) {
      props.closeAll();
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data } = await addOrPreviewInvoice(props.apiPayload, false);
      if (data.success) {
        if (props.refresh) {
          props.refresh();
          setTimeout(() => {
            close();
          }, 10);
        }
      } else {
        toast.warning("Something went wrong please try later.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.warning("Something went wrong please try later.");
      console.error("error");
    }
  };

  return (
    <div>
      {/* <div className='flx mc-ai-header'>
        <p>New Invoice</p>
        <div className='flx'>
          <button className='custodyAddbtn' onClick={handleSave}>
            Save
          </button>
          <button className='custodyAddbtn' onClick={update}>
            Update
          </button>
          <button className='custodyAddbtn' onClick={close}>
            Close
          </button>
        </div>
      </div> */}
      <div className="d-flex align-items-center justify-content-between m-2">
        <h5>New Invoice</h5>
        <div className="d-flex">
          <Button className="mx-1" color="danger" onClick={handleSave}>
            Save
          </Button>
          <Button className="mx-1" color="success" onClick={update}>
            Update
          </Button>
          <Button className="mx-1" color="success" onClick={close}>
            Close
          </Button>
        </div>
      </div>
      <div className="preview-invoiceDiv">
        <PreviewInvoiceTemplate data={formData} />
      </div>
      {loading && <LoadingPage />}
    </div>
  );
};

export default PreviewInvoicePage;
