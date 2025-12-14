import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Table } from "reactstrap";
import CustomSideDrawer from "../../customComponents/CustomSideDrawer";
import { TextInputField } from "pages/Edge/components/InputField";

const ItemsList = (props) => {
  const [serviceList, setServiceList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (props.serviceList && props.active) {
      setServiceList(props.serviceList);
      setFilteredList(props.serviceList);
    }
  }, [props.serviceList, props.active]);

  useEffect(() => {
    if (props.formData && props.formData.serviceLineList && props.active) {
      setSelected(props?.formData?.serviceLineList);
    }
  }, [props.formData, props.active]);

  const isSelected = (arg) => {
    for (let a in selected) {
      if (selected[a] && selected[a].id === arg.id) {
        return true;
      }
    }

    return false;
  };

  const handleClose = () => {
    if (props.close) {
      props.close();
    }
  };

  const handleSelect = (val) => {
    let arr = [...selected];

    if (val) {
      const obj = { ...val, uid: uuidv4() };
      delete obj.id;
      arr.push(obj);
    }

    setSelected(arr);

    setTimeout(() => {
      updateValue(arr);
    }, 10);
  };

  const updateValue = (arg) => {
    if (props.onChange) {
      props.onChange("serviceLineList", arg);
    }
  };

  const handleFilter = (e) => {
    const { value } = e.target;
    const filteredServices = serviceList.filter((item) => {
      return item.serviceLineTitle.toLowerCase().includes(value.toLowerCase());
    });

    setFilteredList(filteredServices);
  };

  const body = () => {
    return (
      <div className="bt-container">
        <div className="bt-searchDiv">
          <div className="bt-inputDiv">
            <TextInputField
              placeholder="Search items by title"
              onChange={handleFilter}
            />
          </div>
        </div>
        <Table responsive={true} striped={true} hover={true}>
          <tbody>
            {filteredList.map((service) => (
              <tr
                key={service.id}
                onClick={() => handleSelect(service)}
                className="pe-cursor"
              >
                <p className="m-0 mx-1">{service.serviceLineTitle}</p>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <div>
      <CustomSideDrawer
        active={props.active}
        onClose={handleClose}
        heading={"Service Lines"}
        body={body}
        doneBtn={true}
      />
    </div>
  );
};

export default ItemsList;
