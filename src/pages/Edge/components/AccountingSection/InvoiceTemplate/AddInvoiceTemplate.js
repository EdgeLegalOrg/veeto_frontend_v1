import React, { Fragment, useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { createInvoiceTemplate } from "../../../apis";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";

const AddInvoiceTemplate = (props) => {
  const { setShowAdd, serviceList, taxTypeList, refresh } = props;
  const [tempName, setTempName] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [optionList, setOptionList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const clearState = () => {
    setSearchInput("");
    setTempName("");
    setOptionList([]);
    setSelectedList([]);
  };

  const prepareData = () => {
    let newList = [];
    serviceList?.forEach((d) => {
      newList.push({ display: d.serviceLineTitle, value: d.id });
    });
    setOptionList(newList);
  };

  useEffect(() => {
    prepareData();
  }, [props.serviceList]);

  const findDisplayname = (from, val = "") => {
    if (val) {
      let data = from.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  const handleSelectOption = (val) => {
    setSearchInput(val.value);
    let isExist = selectedList.find((d) => d.id === val.value);
    if (isExist) {
      toast.warn("You have already selected this service line");
    } else {
      let data = serviceList.find((d) => d.id === val.value);
      setSelectedList([data, ...selectedList]);
    }
  };

  const handleClearSearch = (e) => {
    e.stopPropagation();
    setSearchInput("");
  };

  const handleRemove = (id) => {
    let newList = selectedList.filter((d) => d.id !== id);
    setSelectedList(newList);
  };

  const displayList = () => {
    return selectedList.map((data) => (
      <div className="invoice-selected pe-cursor">
        <div className="invoice-selectedDetail">
          <p>{data.serviceLineTitle}</p>
          <span>{`${data.serviceLineDesc} - ${findDisplayname(
            taxTypeList,
            data.taxType
          )} - ${data.amount}`}</span>
        </div>
        <Button
          className="invoice-selectedDelete"
          onClick={() => handleRemove(data.id)}
        >
          <AiOutlineClose />
        </Button>
      </div>
    ));
  };

  const handleCreate = async () => {
    if (tempName) {
      if (selectedList?.length > 0) {
        let idList = [];
        selectedList.forEach((d) => {
          idList.push({ id: d.id });
        });
        let formData = {
          templateName: tempName,
          serviceLineList: idList,
        };

        try {
          const { data } = await createInvoiceTemplate(formData);
          if (data.success) {
            refresh();
            setTimeout(() => {
              clearState();
            }, 10);
          } else {
            let msg = data?.error?.message
              ? data?.error?.message
              : "Something went wrong please try later.";
            toast.error(msg);
          }
          setShowAdd(false);
        } catch (error) {}
      } else {
        toast.warning("Please select atleast one service line.");
      }
    } else {
      setSubmitted(true);
      // toast.warning("Please enter template name.");
    }
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
        closeForm={() => setShowAdd(false)}
        btn1={"Cancel"}
        btn2="Add"
        heading="Add new Template"
        handleFunc={handleCreate}
        bodyStyle={{ minHeight: "35vh" }}
        autoClose={false}
      > */}
      <div style={{ minHeight: "35vh" }}>
        <div className="row mt-4">
          <div className="col-md-4">
            <TextInputField
              label="Template Name"
              name="templateName"
              placeholder="Template Name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              required={true}
              invalid={submitted && !tempName?.trim()}
              invalidMessage={"Template Name is required"}
            />
          </div>
          <div className="col-md-8">
            <SelectInputField
              // name='accountType'
              width="100%"
              label="Search Service Lines"
              placeholder="Search Service Lines"
              optionArray={optionList}
              value={searchInput}
              selected={searchInput}
              onSelectFunc={(val) => handleSelectOption(val)}
              fieldVal={findDisplayname(optionList, searchInput)}
              maxLength={null}
              required={true}
              invalid={submitted && !searchInput}
              invalidMessage={"Service Line is required"}
            />
            {/* {searchInput && (
              <span
                className="invoice-serviceLine-clear"
                onClick={handleClearSearch}
              >
                Clear
              </span>
            )} */}
          </div>
        </div>
        {selectedList?.length > 0 && (
          <div className="invoice-selectedList">{displayList()}</div>
        )}
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button
          color="danger"
          className="mx-1"
          onClick={() => setShowAdd(false)}
        >
          Cancel
        </Button>
        <Button
          color="success"
          className="mx-1"
          onClick={() => handleCreate()}
        >
          Save
        </Button>
      </div>
      {/* </CustomToastWindow> */}
    </Fragment>
  );
};

export default AddInvoiceTemplate;
