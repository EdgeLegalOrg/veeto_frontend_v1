import React, { useState, useEffect, Fragment } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { editInvoiceTemplate } from "../../../apis";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";

const UpdateInvoiceTemplate = (props) => {
  const { setShowEdit, serviceList, taxTypeList, refresh } = props;
  const [data, setData] = useState(props.data);
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
    if (props.data) {
      let { data } = props;
      setData(data);
      setTempName(data?.templateName ? data?.templateName : "");
      setSelectedList(data?.serviceLineList ? data?.serviceLineList : []);
    }
  }, [props.data]);

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
      toast.warning("You have already selected this service line");
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
    if (selectedList?.length > 0) {
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
    } else {
      return <></>;
    }
  };

  const handleUpdate = async () => {
    if (tempName) {
      if (selectedList?.length > 0) {
        let idList = [];
        selectedList.forEach((d) => {
          idList.push({ id: d.id });
        });

        let formData = {
          ...data,
          templateName: tempName,
          serviceLineList: idList,
        };

        try {
          const { data } = await editInvoiceTemplate(formData);
          setShowEdit(false);
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
        closeForm={() => setShowEdit(false)}
        btn1={"Cancel"}
        btn2="Save"
        heading="Update Invoice Template"
        handleFunc={handleUpdate}
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
              // value={searchInput}
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
        <div className="invoice-selectedList">{displayList()}</div>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button
          color="danger"
          className="mx-1"
          onClick={() => setShowEdit(false)}
        >
          Cancel
        </Button>
        <Button
          color="success"
          className="mx-1"
          onClick={() => handleUpdate()}
        >
          Save
        </Button>
      </div>
      {/* </CustomToastWindow> */}
    </Fragment>
  );
};

export default UpdateInvoiceTemplate;
