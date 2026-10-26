import React, { useEffect, useState } from "react";
import { Table, Button, Input } from "reactstrap";
import { v4 as uuidv4 } from "uuid";
import {
  AiOutlineClose,
  AiOutlineArrowDown,
  AiOutlineArrowUp,
} from "react-icons/ai";
import { findDisplayname } from "../../../utils/utilFunc";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";

import { normalizeInvoiceServiceLine } from "../../../utils/invoiceServiceLines";

const ServiceLineSelected = (props) => {
  const [selectedList, setSelectedList] = useState([]);
  const [serviceType, setServiceType] = useState([]);
  const [taxType, setTaxType] = useState([]);
  const [billingFrequency, setBillingFrequency] = useState([]);

  useEffect(() => {
    if (props.serviceList) {
      if (props.type === "edit") {
        prepareSelectedList(props.serviceList);
      } else {
        setSelectedList(props.serviceList.map(normalizeInvoiceServiceLine));
      }
    }
  }, [props.serviceList]);

  useEffect(() => {
    fetchEnums();
  }, []);

  const prepareSelectedList = (arg) => {
    const newList = arg.map((service) => {
      return { ...normalizeInvoiceServiceLine(service), uid: service.uid || uuidv4() };
    });

    setSelectedList(newList);
  };

  const fetchEnums = () => {
    let enumList = JSON.parse(window.localStorage.getItem("enumList"));

    if (enumList) {
      if (enumList.BillingFrequency) {
        setBillingFrequency(enumList.BillingFrequency);
      }

      if (enumList.ServiceLineType) {
        setServiceType(enumList.ServiceLineType);
      }

      if (enumList.TaxType) {
        setTaxType(enumList.TaxType);
      }
    }
  };

  const handleChange = (e, i) => {
    let { name, value } = e.target;
    let arr = [...selectedList];
    let obj = arr[i];

    if (["units", "hourlyRate", "amount"].includes(name)) {
      const numeric = value === "" ? "" : Number(value);
      if (numeric !== "" && !Number.isFinite(numeric)) return;
      if ((name !== "amount" || obj.billingFrequency === "HOURLY") && numeric < 0) return;
      obj = { ...obj, [name]: numeric };
    } else {
      obj = { ...obj, [name]: value };
    }
    arr[i] = normalizeInvoiceServiceLine(obj);
    setSelectedList(arr);
    props.onChange?.("serviceLineList", arr);
  };

  const changeTaxType = (val, i) => {
    let arr = [...selectedList];
    let obj = arr[i];

    obj = { ...obj, taxType: val };

    arr[i] = obj;

    setTimeout(() => {
      setSelectedList(arr);
    }, 10);

    if (props.onChange) {
      props.onChange("serviceLineList", arr);
    }
  };

  const displayTaxType = (arg, index) => {
    if (taxType && taxType.length > 0) {
      return taxType.map((t) => (
        <div className="d-flex me-2 align-items-center" key={t.value}>
          <input
            type="radio"
            name={`taxType_${index}`}
            checked={t.value === arg.taxType}
            onChange={() => changeTaxType(t.value, index)}
            disabled={props.disabled}
            className="form-check-input mb-1 pe-cursor"
            id={`${t.value}_${index}`}
          />
          <label className="m-0 px-1 pe-cursor" htmlFor={`${t.value}_${index}`}>
            {t.display}
          </label>
        </div>
      ));
    } else {
      return <></>;
    }
  };

  const handleDelete = (e, arg) => {
    e.stopPropagation();

    let arr = selectedList.filter((s) => s.uid !== arg.uid);

    setTimeout(() => {
      setSelectedList(arr);
    }, 10);

    if (props.onChange) {
      props.onChange("serviceLineList", arr);
    }
  };

  const swap = (index, type) => {
    let arr = [...selectedList];

    if (type === "up") {
      let temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
    } else {
      let temp = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = temp;
    }

    setSelectedList(arr);
    if (props.onChange) {
      props.onChange("serviceLineList", arr);
    }
  };

  const sequence = (index) => {
    let isDisable = props.disabled;
    return (
      <div className="ac">
        {index > 0 && (
          <AiOutlineArrowUp
            size={25}
            className={isDisable ? "" : "cp"}
            onClick={() => {
              if (isDisable) {
                return;
              } else {
                swap(index, "up");
              }
            }}
          />
        )}
        <p className="sls-label mr-tb10">{index + 1}</p>
        {index >= 0 && index < selectedList.length - 1 && (
          <AiOutlineArrowDown
            size={25}
            className={isDisable ? "" : "cp"}
            onClick={() => {
              if (isDisable) {
                return;
              } else {
                swap(index, "down");
              }
            }}
          />
        )}
      </div>
    );
  };

  const ui = () => {
    if (selectedList && selectedList.length > 0) {
      return (
        <div>
          <Table responsive={true} striped={true} hover={true}>
            <thead>
              <tr>
                <td>
                  <p className="m-0">#</p>
                </td>
                <td>
                  <p className="m-0">Description</p>
                </td>
                <td>
                  <p className="m-0">Units</p>
                </td>
                <td>
                  <p className="m-0">Hourly Rate</p>
                </td>
                <td>
                  <p className="m-0">Amount</p>
                </td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {selectedList.map((service, i) => (
                <tr key={service.uid || service.id || i}>
                  <td>{sequence(i)}</td>
                  <td>
                    <TextInputField
                      type="textarea"
                      rows="2"
                      onChange={(e) => handleChange(e, i)}
                      name="serviceLineDesc"
                      value={service.serviceLineDesc}
                      disabled={props.disabled}
                    />
                    <div className="d-flex mt-2 justify-content-between align-items-center">
                      <div>
                        <span className="">
                          {findDisplayname(serviceType, service.type)}
                        </span>
                        <span>{`[${findDisplayname(
                          billingFrequency,
                          service.billingFrequency
                        )}]`}</span>
                      </div>
                      <div className="d-flex">{displayTaxType(service, i)}</div>
                    </div>
                  </td>
                  <td>
                    {service.billingFrequency === "HOURLY" ? (
                      <TextInputField
                        name="units"
                        value={service.units ? service.units : 0}
                        onChange={(e) => handleChange(e, i)}
                        type="number"
                        disabled={props.disabled}
                      />
                    ) : (
                      <p className="sls-label">NA</p>
                    )}
                  </td>
                  <td>
                    {service.billingFrequency === "HOURLY" ? (
                      <TextInputField
                        name="hourlyRate"
                        value={service.hourlyRate ?? ""}
                        onChange={(e) => handleChange(e, i)}
                        type="number"
                        disabled={props.disabled}
                      />
                    ) : (
                      <p className="sls-label">NA</p>
                    )}
                  </td>
                  <td>
                    <TextInputField
                      name="amount"
                      readOnly={service.billingFrequency === "HOURLY"}
                      value={service.amount ? service.amount : 0}
                      onChange={(e) => handleChange(e, i)}
                      type="number"
                      disabled={props.disabled}
                    />
                  </td>
                  <td>
                    <Button
                      onClick={(e) => handleDelete(e, service)}
                      disabled={props.disabled}
                      color="danger"
                      size="md"
                    >
                      <AiOutlineClose size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    } else {
      return <></>;
    }
  };

  return ui();
};

export default ServiceLineSelected;
