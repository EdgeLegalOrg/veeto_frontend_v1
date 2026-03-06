import React, { useState, Fragment, useEffect } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  Table,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { FiEdit2 } from "react-icons/fi";
import upArrow from "../../../images/upArrow.svg";
import downArrow from "../../../images/downArrow.svg";
import downArrowColoured from "../../../images/downArrowColoured.svg";
import upArrowColoured from "../../../images/upArrowColoured.svg";
import AddNewBank from "./AddNewBank";
import { addNewBank, deleteBankAccount, updatePreferred } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import EditBankDetails from "./EditBankDetails";
import { AlertPopup } from "../../customComponents/CustomComponents";
import { convertSubstring } from "../../../utils/utilFunc";
import { toast } from "react-toastify";
import { MdFilterAltOff } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";

const filterFields = {
  bankAccountName: "",
  bankName: "",
  bankBSB: "",
  accountNumber: "",
  accountType: "",
};

const BankAccountList = (props) => {
  const { bankList, siteInfo, refresh } = props;
  const [accTypeList, setAccTypeList] = useState([]);
  const [filterInput, setFilterInput] = useState(filterFields);
  const [filteredData, setFilteredData] = useState(bankList);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [labelSort, setLabelSort] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedList, setSelectedList] = useState([]);

  const fetchEnumList = () => {
    let obj = JSON.parse(window.localStorage.getItem("enumList"));
    if (obj && obj.BankAccountType && obj.BankAccountType?.length > 0) {
      setAccTypeList(obj.BankAccountType);
    }
  };

  useEffect(() => {
    fetchEnumList();
  }, []);

  useEffect(() => {
    setFilteredData(bankList);
  }, [props.bankList]);

  const findDisplayname = (val = "") => {
    if (val) {
      let data = accTypeList.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  const isSelected = (id) => selectedList.indexOf(id) !== -1;

  const handleAddBank = async (data) => {
    setLoading(true);
    let newData = { ...data, siteId: siteInfo.siteId };
    try {
      const { data } = await addNewBank(newData);
      if (data.success) {
        refresh();
      } else {
        toast.error("Something went wrong, please try later");
      }
      setLoading(false);
      setShowForm(false);
    } catch (error) {
      setLoading(false);
      setShowForm(false);
      toast.error("Something went wrong please check console.");
      console.error(error);
    }
  };

  const handlePreferredAccount = async () => {
    if (selectedBank) {
      setLoading(true);

      let newData = {
        preferredBankAccountId: selectedBank.id,
      };

      try {
        const { data } = await updatePreferred(newData);
        if (data.success) {
          refresh();
          setSelectedList([]);
          setSelectedBank(null);
        } else {
          toast.error("Something went wrong, please try later");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    } else {
      toast.error("Please select one preferred bank account.");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelectedId = [];
      filteredData.forEach((a) => {
        newSelectedId.push(a.id);
      });
      setSelectedBank(null);
      setSelectedList(newSelectedId);
    } else {
      setSelectedList([]);
      setSelectedBank(null);
    }
  };

  const handleSelect = (id) => {
    const selectedIndex = selectedList.indexOf(id);
    let newSelectedId = [];
    if (selectedIndex === -1) {
      newSelectedId = newSelectedId.concat(selectedList, id);
    } else if (selectedIndex === 0) {
      newSelectedId = newSelectedId.concat(selectedList.slice(1));
    } else if (selectedIndex === selectedList?.length - 1) {
      newSelectedId = newSelectedId.concat(selectedList.slice(0, -1));
    } else {
      newSelectedId = newSelectedId.concat(
        selectedList.slice(0, selectedIndex),
        selectedList.slice(selectedIndex + 1)
      );
    }
    if (newSelectedId?.length === 1) {
      let data = filteredData.filter((a) => a.id === newSelectedId[0]);
      if (data && data?.length > 0) {
        setSelectedBank(data[0]);
      }
    } else {
      setSelectedBank(null);
    }
    setSelectedList(newSelectedId);
  };

  const handleClickRow = (id) => {
    setLoading(true);
    setSelectedList([id]);
    let data = filteredData.filter((a) => a.id === id);
    setSelectedBank(data[0]);
    setTimeout(() => {
      setShowEdit(true);
      setLoading(false);
    }, 30);
  };

  const handleEditForm = () => {
    if (selectedBank) {
      setShowEdit(true);
    } else {
      toast.warning("Please select one bank account.");
    }
  };

  const filterData = (obj) => {
    const newData = bankList?.filter(
      (data) =>
        (obj["bankAccountName"] !== ""
          ? data["bankAccountName"]
              ?.toLowerCase()
              ?.includes(obj["bankAccountName"]?.toLowerCase())
          : true) &&
        (obj["bankName"] !== ""
          ? data["bankName"]
              ?.toLowerCase()
              ?.includes(obj["bankName"]?.toLowerCase())
          : true) &&
        (obj["accountNumber"] !== ""
          ? data["accountNumber"]
              ?.toString()
              ?.toLowerCase()
              ?.includes(obj["accountNumber"]?.toString()?.toLowerCase())
          : true) &&
        (obj["bankBSB"] !== ""
          ? data["bankBSB"]
              ?.toString()
              ?.toLowerCase()
              ?.includes(obj["bankBSB"]?.toString()?.toLowerCase())
          : true) &&
        (obj["accountType"] !== ""
          ? data["accountType"]
              ?.toLowerCase()
              ?.includes(obj["accountType"]?.toLowerCase())
          : true)
    );
    if (selectedList?.length > 0) {
      setSelectedList([]);
    }
    setFilteredData(newData);
  };

  const handleFilter = (e) => {
    const { name } = e.target;
    setFilterInput({ ...filterInput, [name]: e.target.value });
    filterData({ ...filterInput, [name]: e.target.value });
  };

  const sortFunc = (sorton) => {
    let newArray = [];
    if (labelSort !== sorton) {
      setLabelSort(sorton);
      setSortOrder("asc");
      setSortField(sorton);
      newArray = filteredData.sort((a, b) => {
        if (a[sorton] === b[sorton]) {
          return 0;
        }

        if (a[sorton] === "" || a[sorton] === null) {
          return 1;
        }
        if (b[sorton] === "" || b[sorton] === null) {
          return -1;
        }

        return (a[sorton] ? a[sorton].toLowerCase() : "") <
          (b[sorton] ? b[sorton].toLowerCase() : "")
          ? -1
          : 1;
      });
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(sorton);
      newArray = filteredData.sort((a, b) => {
        if (a[sorton] === b[sorton]) {
          return 0;
        }

        if (a[sorton] === "" || a[sorton] === null) {
          return 1;
        }
        if (b[sorton] === "" || b[sorton] === null) {
          return -1;
        }

        return (a[sorton] ? a[sorton].toLowerCase() : "") <
          (b[sorton] ? b[sorton].toLowerCase() : "")
          ? 1
          : -1;
      });
    }
    setFilteredData(newArray);
  };

  const handleDeleteAlert = () => {
    let isPreferred = selectedList.includes(siteInfo.preferredBankAccountId);

    if (!isPreferred) {
      setDeleteAlert(true);
    } else {
      toast.warning("Preferred bank account could not be deleted.");
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const ids = selectedList.join(",");
    try {
      const { data } = await deleteBankAccount(ids);
      if (data.success) {
        refresh();
        setTimeout(() => {
          setSelectedList([]);
        }, 10);
      } else {
        let msg = data?.error?.message
          ? data.error.message
          : "Something went wrong please try later.";
        toast.error(msg);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setFilterInput(filterFields);
    setSortField("");
    setSortOrder("");
    setLabelSort("");
    setFilteredData(bankList);
  };

  return (
    <Fragment>
      <div className="bg-light d-flex align-items-center justify-content-between p-2">
        <h5 className="mb-0">Bank Accounts</h5>
        <div className="d-flex">
          <Button
            className="mx-1 d-flex"
            onClick={() => setShowForm(true)}
            color="success"
          >
            <span className="plusdiv">+</span> Add
          </Button>
          <Button
            className="mx-1 d-flex"
            onClick={handleDeleteAlert}
            color="danger"
          >
            <span className="plusdiv">-</span> Delete
          </Button>
          <Button
            className="mx-1 d-flex"
            onClick={handleEditForm}
            color="warning"
          >
            <span className="plusdiv">
              <FiEdit2 />
            </span>
            Edit
          </Button>
          <Button
            className="mx-1 d-flex"
            onClick={handlePreferredAccount}
            color="success"
          >
            Set as Default
          </Button>
        </div>
      </div>

      <Table responsive={true} striped={true} hover={true}>
        <thead className="mb-2">
          <tr>
            <th className="align-bottom">
              <input
                type="checkbox"
                checked={
                  filteredData?.length > 0 &&
                  selectedList?.length === filteredData?.length
                }
                onChange={handleSelectAll}
              />
            </th>
            <th className="align-top">
              <p>Default</p>
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("bankAccountName")}
              >
                <p>Account Name</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "bankAccountName" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "bankAccountName" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <Input
                type="text"
                name="bankAccountName"
                placeholder="Account Name"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("bankName")}
              >
                <p>Bank</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "bankName" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "bankName" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <Input
                type="text"
                name="bankName"
                placeholder="Bank Name"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("bankBSB")}
              >
                <p>BSB</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "bankBSB" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "bankBSB" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <Input
                type="text"
                name="bankBSB"
                placeholder="BSB"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("accountNumber")}
              >
                <p>Account </p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "accountNumber" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "accountNumber" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <Input
                type="text"
                name="accountNumber"
                placeholder="Account Number"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("accountType")}
              >
                <p>Acc. Type</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "accountType" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "accountType" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <Input
                type="text"
                name="accountType"
                placeholder="Account Type"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div className="d-flex justify-content-end">
                <Button
                  type="button"
                  color="danger"
                  className="mx-1"
                  onClick={() => handleResetFilter()}
                >
                  <MdFilterAltOff size={18} />
                </Button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData?.map((bank) => (
            <tr
              key={bank.id}
              onClick={(e) => {
                e.stopPropagation();
                handleClickRow(bank.id);
              }}
              className="pe-cursor"
            >
              <td>
                <input
                  type="checkbox"
                  checked={isSelected(bank.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleSelect(bank.id)}
                />
              </td>
              <td>
                <p className="mb-0">
                  {siteInfo.preferredBankAccountId === bank.id ? "Yes" : "No"}
                </p>
              </td>
              <td>
                <p className="mb-0">{bank.bankAccountName}</p>
              </td>
              <td>
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p style={{ textAlign: "left" }} className="mb-0">
                        {bank.bankName}
                      </p>
                    </Tooltip>
                  }
                >
                  <p className="mb-0">{convertSubstring(bank.bankName)}</p>
                </OverlayTrigger>
              </td>
              <td>
                <p className="mb-0">{bank.bankBSB}</p>
              </td>
              <td>
                <p className="mb-0">{bank.accountNumber}</p>
              </td>
              <td>
                <p className="mb-0">{findDisplayname(bank.accountType)}</p>
              </td>
              <td></td>
              {/* <div className="companySites-row-md">
                  <p>{bank.abn}</p>
                </div> */}
              {/* <div className="companySites-row-md">
                  <p>Date</p>
                </div>
                <div className="companySites-row-md">
                  <p>Date</p>
                </div> */}
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="companySites-tableContainer" style={{ display: "none" }}>
        <div className="bankList-tableDiv">
          <div className="companySites-tableHeader">
            <div className="companySites-tableCol-sm">
              <input
                type="checkbox"
                checked={
                  filteredData?.length > 0 &&
                  selectedList?.length === filteredData?.length
                }
                onChange={handleSelectAll}
              />
            </div>
            <div className="companySites-tableCol-md">
              <p>Default</p>
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("bankAccountName")}
              >
                <p>Account Name</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "bankAccountName" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "bankAccountName" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <input
                type="text"
                className="companySites-inputFilter"
                name="bankAccountName"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("bankName")}
              >
                <p>Bank</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "bankName" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "bankName" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <input
                type="text"
                className="companySites-inputFilter"
                name="bankName"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("bankBSB")}
              >
                <p>BSB</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "bankBSB" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "bankBSB" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <input
                type="text"
                className="companySites-inputFilter"
                name="bankBSB"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("accountNumber")}
              >
                <p>Account </p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "accountNumber" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "accountNumber" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <input
                type="text"
                className="companySites-inputFilter"
                name="accountNumber"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-md">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("accountType")}
              >
                <p>Acc. Type</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "accountType" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "accountType" ? (
                    <img
                      src={downArrowColoured}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <input
                type="text"
                className="companySites-inputFilter"
                name="accountType"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            {/* <div className='companySites-tableCol-md'>
              <div
                className='companySites-labelDiv'
                onClick={() => sortFunc('abn')}
              >
                <p>ABN</p>
                <div className='associatedContacts-label-btn'>
                  {sortOrder === 'asc' && sortField === 'abn' ? (
                    <img
                      src={upArrowColoured}
                      alt='asc'
                      className='label-btn-img-1'
                    />
                  ) : (
                    <img src={upArrow} alt='asc' className='label-btn-img-1' />
                  )}
                  {sortOrder === 'desc' && sortField === 'abn' ? (
                    <img
                      src={downArrowColoured}
                      alt='desc'
                      className='label-btn-img-2'
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt='desc'
                      className='label-btn-img-2'
                    />
                  )}
                </div>
              </div>
              <input
                type='text'
                className='companySites-inputFilter'
                name='abn'
                onChange={handleFilter}
                autoComplete='off'
              />
            </div> */}
            {/* <div className='companySites-tableCol-md'>
              <div className='companySites-labelDiv'>
                <p>Date Active</p>
              </div>
              <input type='text' className='companySites-inputFilter' />
            </div>
            <div className='companySites-tableCol-md'>
              <div className='companySites-labelDiv'>
                <p>Date Deactivated</p>
              </div>
              <input type='text' className='companySites-inputFilter' />
            </div> */}
          </div>
          {filteredData?.map((bank) => (
            <div
              className="companySites-rowDiv pe-cursor"
              key={bank.id}
              onClick={(e) => {
                e.stopPropagation();
                handleClickRow(bank.id);
              }}
            >
              <div className="companySites-row-sm">
                <input
                  type="checkbox"
                  checked={isSelected(bank.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleSelect(bank.id)}
                />
              </div>
              <div className="companySites-row-md">
                <p>
                  {siteInfo.preferredBankAccountId === bank.id ? "Yes" : "No"}
                </p>
              </div>
              <div className="companySites-row-lg">
                <p>{bank.bankAccountName}</p>
              </div>
              <div className="companySites-row-lg">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p style={{ textAlign: "left" }}>{bank.bankName}</p>
                    </Tooltip>
                  }
                >
                  <p>{convertSubstring(bank.bankName)}</p>
                </OverlayTrigger>
              </div>
              <div className="companySites-row-lg">
                <p>{bank.bankBSB}</p>
              </div>
              <div className="companySites-row-lg">
                <p>{bank.accountNumber}</p>
              </div>
              <div className="companySites-row-md">
                <p>{findDisplayname(bank.accountType)}</p>
              </div>
              {/* <div className='companySites-row-md'>
                <p>{bank.abn}</p>
              </div> */}
              {/* <div className='companySites-row-md'>
                <p>Date</p>
              </div>
              <div className='companySites-row-md'>
                <p>Date</p>
              </div> */}
            </div>
          ))}
        </div>
      </div>
      {showForm && (
        <Modal
          isOpen={showForm}
          toggle={() => setShowForm(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setShowForm(false)}
            className="bg-light p-3"
          >
            Add new Account
          </ModalHeader>
          <ModalBody>
            <AddNewBank
              setShowForm={setShowForm}
              handleAddBank={handleAddBank}
              accTypeList={accTypeList}
            />
          </ModalBody>
        </Modal>
      )}
      {showEdit && (
        <Modal
          isOpen={showEdit}
          toggle={() => setShowEdit(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setShowEdit(false)}
            className="bg-light p-3"
          >
            Edit Account Details
          </ModalHeader>
          <ModalBody>
            <EditBankDetails
              setSelectedList={setSelectedList}
              selectedBank={selectedBank}
              setSelectedBank={setSelectedBank}
              refresh={refresh}
              accTypeList={accTypeList}
              setShowEdit={setShowEdit}
            />
          </ModalBody>
        </Modal>
      )}
      {deleteAlert && (
        <Modal
          isOpen={deleteAlert}
          toggle={() => setDeleteAlert(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setDeleteAlert(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              message="Are you sure you want to delete the record?"
              heading="Confirm Your Action"
              closeForm={() => setDeleteAlert(false)}
              btn1={"No"}
              btn2="Yes"
              handleFunc={handleDelete}
            />
          </ModalBody>
        </Modal>
      )}
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default BankAccountList;
