import React, { useState, useEffect } from "react";
import { Table } from "reactstrap";
import CustomSideDrawer from "../../customComponents/CustomSideDrawer";
import { v4 as uuidv4 } from "uuid";

const TemplateList = (props) => {
  const [templateList, setTemplateList] = useState([]);

  useEffect(() => {
    if (props.templateList && props.active) {
      setTemplateList(props.templateList);
    }
  }, [props.templateList, props.active]);

  const handleClose = () => {
    if (props.close) {
      props.close();
    }
  };

  const body = () => {
    return (
      <div className="bt-container">
        <Table
          responsive={true}
          striped={true}
          hover={true}
        >
          <tbody>
            {templateList.map((template) => (
              <tr
                key={template.id}
                onClick={() => handleSelect(template)}
                className="pe-cursor"
              >
                <p className="m-0">{template.templateName}</p>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  const handleSelect = (val) => {
    let arr = props.serviceList ? props.serviceList : [];

    if (val && val.serviceLineList && val.serviceLineList.length > 0) {
      let list = val.serviceLineList;
      list.forEach((l) => {
        arr.push({ ...l, uid: uuidv4() });
      });
    }

    setTimeout(() => {
      if (props.onChange) {
        props.onChange("serviceLineList", arr);
      }
    }, 10);
  };

  return (
    <div>
      <CustomSideDrawer
        active={props.active}
        onClose={handleClose}
        heading={"Templates"}
        body={body}
        doneBtn={true}
      />
    </div>
  );
};

export default TemplateList;
