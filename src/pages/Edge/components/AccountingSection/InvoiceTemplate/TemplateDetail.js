import React, { useState, useEffect } from "react";
import { Table } from "reactstrap";
import "../../../stylesheets/InvoiceTemplate.css";

const TemplateDetail = (props) => {
  const { typeList, taxTypeList } = props;
  const [data, setData] = useState(props.data);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  const findDisplayname = (from, val = "") => {
    if (val) {
      let data = from.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  const displayList = () => {
    if (data && data.serviceLineList) {
      if (data?.serviceLineList?.length > 0) {
        return data?.serviceLineList?.map((detail) => (
          <>
            <tr key={detail.id} className="pe-cursor">
              <td className="mb-0">{detail.serviceLineTitle}</td>
              <td className="mb-0">{findDisplayname(typeList, detail.type)}</td>
              <td className="mb-0">{`$ ${detail.amount}`}</td>
              <td className="mb-0">
                {findDisplayname(taxTypeList, detail.taxType)}
              </td>
            </tr>
            <td>
              <p className="mb-0">{detail.serviceLineDesc}</p>
            </td>
          </>
        ));
      } else {
        return (
          <div className="invoice-header">
            <p>No Result Found</p>
          </div>
        );
      }
    } else {
      return <></>;
    }
  };

  return (
    <Table
      responsive={true}
      striped={true}
      hover={true}
    >
      <thead></thead>
      <tbody>{displayList()}</tbody>
    </Table>
  );
};

export default TemplateDetail;
