import React, { useState, useEffect } from "react";
import { findDisplayname, formatDateFunc } from "../../../utils/utilFunc";
import LoadingPage from "../../../utils/LoadingPage";
import { useParams } from "react-router-dom";
import { getInvoiceById } from "../../../apis";
import { toast } from "react-toastify";

const PreviewInvoiceTemplate = (props) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [taxType, setTaxType] = useState([]);
  let { invoiceId } = useParams();

  const fetchEnums = () => {
    let enums = JSON.parse(window.localStorage.getItem("enumList"));

    if (enums && enums["TaxType"]) {
      setTaxType(enums["TaxType"]);
    }
  };

  useEffect(() => {
    fetchEnums();
  }, []);

  useEffect(() => {
    if (props.data) {
      setFormData(props.data);
      setLoading(false);
    }
  }, [props.data]);

  useEffect(() => {
    if (props.fetchData) {
      fetchInvoiceById();
    }
  }, []);

  const fetchInvoiceById = async () => {
    try {
      const { data } = await getInvoiceById(invoiceId);
      if (data.success) {
        setFormData(data.data);
      } else {
        toast.warning("Something went wrong, please try again.");
      }
    } catch (error) {
      toast.warning("Something went wrong, please try again.");
      console.error("error", error);
    } finally {
      setLoading(false);
    }
  };

  const billToNames = () => {
    let ls = formData?.billToList;
    let rv = [];

    if (ls && ls.length > 0) {
      ls.forEach((d) => {
        if (d.billTo) {
          rv.push(d.billTo);
        }
      });
    }

    return rv.length > 0 ? rv.join("; ") : "";
  };

  const displayServiceLine = () => {
    let srv = formData.serviceLineList;

    if (srv && srv.length > 0) {
      return srv.map((d) => (
        <div className="pre-tm-tableRow pe-cursor" key={d.id}>
          <div className="table-colDiv lg">
            <p>{d.serviceLineDesc}</p>
          </div>
          <div className="table-colDiv sm">
            <p>{d.unit}</p>
          </div>
          <div className="table-colDiv sm">
            <p>{d.rate ? `$ ${d.rate}` : ""}</p>
          </div>
          <div className="table-colDiv sm">
            <p>{d.amount ? `$ ${d.amount}` : ""}</p>
          </div>
          <div className="table-colDiv sm">
            <p>{findDisplayname(taxType, d.taxType)}</p>
          </div>
        </div>
      ));
    }

    return <></>;
  };

  // return <h2>hello Dear</h2>;

  const ui = () => {
    if (loading) {
      return <LoadingPage />;
    } else {
      return (
        <div style={{ margin: "8px" }}>
          <div className="d-flex align-items-center py-2 mx-2">
            <div className="pre-tm-container">
              <div className="pre-tm-header">
                <div className="pre-tm-brandImg">
                  <img
                    src={formData.logoUri}
                    alt="brand-name"
                    className="tm-brandImg"
                  />
                </div>
                <div className="pre-tm-headContent">
                  <p className="pre-tm-re">RE :</p>
                  <p className="pre-tm-re-content">{formData.letterSubject}</p>
                </div>
              </div>
              <div className="pre-tm-mailInfo">
                <div className="pre-tm-billTo">
                  <label className="pre-label-text">Bill to:</label>
                  <p>{billToNames()}</p>
                  <p>{formData.address1}</p>
                </div>
                <div className="pre-tm-otherDetails">
                  <div className="other-details">
                    <label className="pre-label-text">ABN:</label>
                    <p>{formData.abn}</p>
                  </div>
                  <div className="other-details">
                    <label className="pre-label-text">Invoice No.:</label>
                    <p>{formData.invoiceNumber}</p>
                  </div>
                  <div className="other-details">
                    <label className="pre-label-text">Date:</label>
                    <p>
                      {formData.invoiceDate
                        ? formatDateFunc(formData.invoiceDate)
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pre-tm-body">
                <div className="pre-tm-tableHeader">
                  <div className="table-colDiv lg">
                    <label className="pre-label-text">Description</label>
                  </div>
                  <div className="table-colDiv sm">
                    <label className="pre-label-text">Units</label>
                  </div>
                  <div className="table-colDiv sm">
                    <label className="pre-label-text">Rate</label>
                  </div>
                  <div className="table-colDiv sm">
                    <label className="pre-label-text">Amount</label>
                  </div>
                  <div className="table-colDiv sm">
                    <label className="pre-label-text">Code</label>
                  </div>
                </div>
                {displayServiceLine()}
              </div>

              <div className="pre-tm-taxContainer">
                <div className="pre-tm-taxDetails">
                  <div className="pre-tm-tax bgf2">
                    <p className="w-50">Service Items Tax GST </p>
                    <p className="w-25">10%</p>
                    <p className="w-25">
                      $
                      {formData.serviceLineTax
                        ? formData.serviceLineTax.toFixed(2)
                        : "0.0"}
                    </p>
                  </div>
                  <div className="pre-tm-tax bge7 ">
                    <p className="w-50">Service Items Total </p>
                    <p className="w-25"></p>
                    <p className="w-25">
                      $
                      {formData.serviceLineTotal
                        ? formData.serviceLineTotal.toFixed(2)
                        : "0.0"}
                    </p>
                  </div>
                  <div className="pre-tm-tax bgCyan pd-t16">
                    <p className="w-50">Invoice Total including tax</p>
                    <p className="w-25"></p>
                    <p className="w-25">
                      {formData.totalAmount >= 0
                        ? `$ ${formData?.totalAmount?.toFixed(2)}`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return ui();
};

export default PreviewInvoiceTemplate;
