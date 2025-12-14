import React, { useEffect, useState } from "react";
import "../../../stylesheets/ServiceLines.css";

const ServiceLineDetail = (props) => {
  const { billingList, typeList, taxTypeList } = props;
  const [details, setDetails] = useState({});

  useEffect(() => {
    setDetails(props.details);
  }, [props.details]);

  const findDisplayname = (from, val = "") => {
    if (val) {
      let data = from.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  return (
    <div className="serviceLine-detailContainer">
      <div className="serviceLine-detailSection">
        <div className="serviceLine-contentDiv">
          <label className="serviceLine-label">Type</label>
          <p className="mb-0">
            {findDisplayname(typeList, details?.type)}
          </p>
        </div>
        <div className="serviceLine-wrapper">
          <div className="serviceLine-contentDiv">
            <label className="serviceLine-label">Billing Frequency</label>
            <p className="mb-0">
              {findDisplayname(billingList, details?.billingFrequency)}
            </p>
          </div>
          <div className="serviceLine-contentDiv">
            <label className="serviceLine-label">Amount</label>
            <p className="mb-0">{`$ ${details?.amount}`}</p>
          </div>
        </div>
        <div className="serviceLine-contentDiv">
          <label className="serviceLine-label">Tax Description</label>
          <p className="mb-0">
            {findDisplayname(taxTypeList, details?.taxType)}
          </p>
        </div>
        <div className="serviceLine-contentDiv">
          <label className="serviceLine-label">Title</label>
          <p className="mb-0">{details?.serviceLineTitle}</p>
        </div>
      </div>
      <div className="serviceLine-divider"></div>
      <p className="serviceLine-desc">{details?.serviceLineDesc}</p>
    </div>
  );
};

export default ServiceLineDetail;
