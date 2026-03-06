import React, { Fragment, useState, useEffect } from "react";
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
import { addNewAddress, deleteAddress, updatePreferred } from "../../../apis";
import upArrow from "../../../images/upArrow.svg";
import downArrow from "../../../images/downArrow.svg";
import downArrowColoured from "../../../images/downArrowColoured.svg";
import upArrowColoured from "../../../images/upArrowColoured.svg";
import LoadingPage from "../../../utils/LoadingPage";
import AddNewAddress from "./AddNewAddress";
import EditAddressInfo from "./EditAddressInfo";
import { AlertPopup } from "../../customComponents/CustomComponents";
import { convertSubstring } from "../../../utils/utilFunc";
import { toast } from "react-toastify";
import TooltipWrapper from "../../../../../Components/Common/TooltipWrapper";
import { MdFilterAltOff } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";

const filterFields = {
  address1: "",
  address2: "",
  city: "",
  state: "",
  country: "",
  postCode: "",
  phoneNumber1: "",
  phoneNumber2: "",
};

const AddressList = (props) => {
  const { addressList, siteInfo, refresh } = props;
  const [filterInput, setFilterInput] = useState(filterFields);
  const [filteredData, setFilteredData] = useState(addressList);
  const [editShow, setEditShow] = useState(false);
  const [addShow, setAddShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [labelSort, setLabelSort] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedList, setSelectedList] = useState([]);

  useEffect(() => {
    setFilteredData(addressList);
  }, [props.addressList]);

  const isSelected = (id) => selectedList.indexOf(id) !== -1;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelectedId = [];
      filteredData.forEach((a) => {
        newSelectedId.push(a.id);
      });
      setSelectedAddress(null);
      setSelectedList(newSelectedId);
    } else {
      setSelectedList([]);
      setSelectedAddress(null);
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
        setSelectedAddress(data[0]);
      }
    } else {
      setSelectedAddress(null);
    }
    setSelectedList(newSelectedId);
  };

  const handleClickRow = (id) => {
    setLoading(true);
    setSelectedList([id]);
    let data = filteredData.filter((a) => a.id === id);
    setSelectedAddress(data[0]);
    setTimeout(() => {
      setEditShow(true);
      setLoading(false);
    }, 30);
  };

  const handlePreferredAddress = async () => {
    if (selectedList?.length === 1) {
      setLoading(true);

      let newData = {
        preferredAddressId: selectedAddress.id,
      };

      try {
        const { data } = await updatePreferred(newData);
        if (data.success) {
          refresh();
          setSelectedList([]);
          setSelectedAddress(null);
        } else {
          toast.error("Something went wrong, please try later");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    } else {
      toast.error("Please select one preferred address.");
    }
  };

  const handleEditForm = () => {
    if (selectedList?.length === 1) {
      setEditShow(true);
    } else {
      toast.warning("Please select one address.");
    }
  };

  const filterData = (obj) => {
    const newData = addressList?.filter(
      (data) =>
        (obj["address1"] !== ""
          ? data["address1"]
              ?.toLowerCase()
              ?.includes(obj["address1"]?.toLowerCase())
          : true) &&
        (obj["address2"] !== ""
          ? data["address2"]
              ?.toLowerCase()
              ?.includes(obj["address2"]?.toLowerCase())
          : true) &&
        (obj["phoneNumber1"] !== ""
          ? data["phoneNumber1"]
              ?.toString()
              ?.includes(obj["phoneNumber1"]?.toString())
          : true) &&
        (obj["city"] !== ""
          ? data["city"]?.toLowerCase()?.includes(obj["city"]?.toLowerCase())
          : true) &&
        (obj["postCode"] !== ""
          ? data["postCode"]?.toString()?.includes(obj["postCode"]?.toString())
          : true) &&
        (obj["state"] !== ""
          ? data["state"]?.toLowerCase()?.includes(obj["state"]?.toLowerCase())
          : true) &&
        (obj["country"] !== ""
          ? data["country"]
              ?.toLowerCase()
              ?.includes(obj["country"]?.toLowerCase())
          : true)
    );
    if (selectedList?.length > 0) {
      setSelectedList([]);
    }
    setFilteredData(newData);
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

  const handleFilter = (e) => {
    const { name } = e.target;
    setFilterInput({ ...filterInput, [name]: e.target.value });
    filterData({ ...filterInput, [name]: e.target.value });
  };

  const handleDeleteAlert = () => {
    let isPreferred = selectedList.includes(siteInfo.preferredAddressId);
    if (!isPreferred) {
      setDeleteAlert(true);
    } else {
      toast.warning("Preferred address could not be deleted.");
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const ids = selectedList.join(",");
    try {
      const { data } = await deleteAddress(ids);
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
    setFilteredData(addressList);
  };

  return (
    <Fragment>
      <div className="bg-light d-flex align-items-center justify-content-between p-2">
        <h5 className="mb-0">Address</h5>
        <div className="d-flex">
          <Button
            className="mx-1 d-flex"
            onClick={() => setAddShow(true)}
            color="success"
          >
            + Add
          </Button>
          <Button
            className="mx-1 d-flex"
            onClick={handleDeleteAlert}
            color="danger"
          >
            Delete
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
            onClick={handlePreferredAddress}
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
              <Input
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
                onClick={() => sortFunc("address1")}
              >
                <p>Address 1</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "address1" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "address1" ? (
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
                name="address1"
                placeholder="Address 1"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("address2")}
              >
                <p>Address 2</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "address2" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "address2" ? (
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
                name="address2"
                placeholder="Address 2"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("phoneNumber1")}
              >
                <p>Phone Number</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "phoneNumber1" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "phoneNumber1" ? (
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
                name="phoneNumber1"
                placeholder="Phone number"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("city")}
              >
                <p>Suburb</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "city" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "city" ? (
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
                name="city"
                placeholder="City"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("postCode")}
              >
                <p>Post Code</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "postCode" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "postCode" ? (
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
                name="postCode"
                placeholder="Post Code"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("state")}
              >
                <p>State</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "state" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "state" ? (
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
                name="state"
                placeholder="State"
                onChange={handleFilter}
                autoComplete="off"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("country")}
              >
                <p>Country</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "country" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "country" ? (
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
                name="country"
                placeholder="Country"
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
          {filteredData?.map((address, i) => (
            <tr
              key={address.id}
              onClick={(e) => {
                e.stopPropagation();
                handleClickRow(address.id);
              }}
              className="pe-cursor"
            >
              <td>
                <Input
                  type="checkbox"
                  checked={isSelected(address.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleSelect(address.id)}
                />
              </td>
              <td>
                <p className="mb-0">
                  {siteInfo?.preferredAddressId === address.id ? "Yes" : "No"}
                </p>
              </td>
              <td>
                <p className="mb-0">{address.address1}</p>
              </td>
              <td>
                <p className="mb-0">{address.address2}</p>
              </td>
              {/* <div className='companySites-row-lg'>
                <p>{address.address3}</p>
              </div> */}
              <td>
                <p className="mb-0">{address.phoneNumber1}</p>
              </td>
              {/* <div className='companySites-row-lg'>
                <p>{address.phoneNumber2}</p>
              </div> */}
              <td>
                {/* <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p
                        style={{ textAlign: "left" }}
                        className="mb-0"
                      >
                        {address.city}
                      </p>
                    </Tooltip>
                  }
                > */}
                <p className="mb-0">
                  <TooltipWrapper
                    id={`city-${address.id}`}
                    placement="bottom"
                    text={address.city}
                    content={convertSubstring(address.city)}
                  ></TooltipWrapper>
                </p>
                {/* </OverlayTrigger> */}
              </td>
              <td>
                <p className="mb-0">{address.postCode}</p>
              </td>
              <td>
                {/* <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p
                        style={{ textAlign: "left" }}
                        className="mb-0"
                      >
                        {address.state}
                      </p>
                    </Tooltip>
                  }
                > */}
                <p className="mb-0">
                  <TooltipWrapper
                    id={`state-${address.id}`}
                    placement="bottom"
                    text={address.state}
                    content={convertSubstring(address.state)}
                  ></TooltipWrapper>
                </p>
                {/* </OverlayTrigger> */}
              </td>
              <td>
                {/* <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p
                        style={{ textAlign: "left" }}
                        className="mb-0"
                      >
                        {address.country}
                      </p>
                    </Tooltip>
                  }
                > */}
                <p className="mb-0">
                  <TooltipWrapper
                    id={`country-${address.id}`}
                    placement="bottom"
                    text={address.country}
                    content={convertSubstring(address.country)}
                  ></TooltipWrapper>
                </p>
                {/* </OverlayTrigger> */}
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="companySites-tableContainer" style={{ display: "none" }}>
        <div className="companySites-tableDiv">
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
                onClick={() => sortFunc("address1")}
              >
                <p>Address 1</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "address1" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "address1" ? (
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
                name="address1"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("address2")}
              >
                <p>Address 2</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "address2" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "address2" ? (
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
                name="address2"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            {/* <div className='companySites-tableCol-lg'>
              <div className='companySites-labelDiv'>
                <p>Address 3</p>
              </div>
              <input type='text' className='companySites-inputFilter' />
            </div> */}
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("phoneNumber1")}
              >
                <p>Phone Number</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "phoneNumber1" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "phoneNumber1" ? (
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
                name="phoneNumber1"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            {/* <div className='companySites-tableCol-lg'>
              <div
                className='companySites-labelDiv'
                onClick={() => sortFunc('phoneNumber2')}
              >
                <p>Mobile Number</p>
                <div className='associatedContacts-label-btn'>
                  {sortOrder === 'asc' && sortField === 'phoneNumber2' ? (
                    <img
                      src={upArrowColoured}
                      alt='asc'
                      className='label-btn-img-1'
                    />
                  ) : (
                    <img src={upArrow} alt='asc' className='label-btn-img-1' />
                  )}
                  {sortOrder === 'desc' && sortField === 'phoneNumber2' ? (
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
                name='phoneNumber2'
                onChange={handleFilter}
                autoComplete='off'
              />
            </div> */}
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("city")}
              >
                <p>Suburb</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "city" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "city" ? (
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
                name="city"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("postCode")}
              >
                <p>Post Code</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "postCode" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "postCode" ? (
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
                name="postCode"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("state")}
              >
                <p>State</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "state" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "state" ? (
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
                name="state"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("country")}
              >
                <p>Country</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "country" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "country" ? (
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
                name="country"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
          </div>
          {filteredData?.map((address, i) => (
            <div
              className="companySites-rowDiv pe-cursor"
              key={address.id}
              onClick={(e) => {
                e.stopPropagation();
                handleClickRow(address.id);
              }}
            >
              <div className="companySites-row-sm">
                <input
                  type="checkbox"
                  checked={isSelected(address.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleSelect(address.id)}
                />
              </div>
              <div className="companySites-row-md">
                <p>
                  {siteInfo?.preferredAddressId === address.id ? "Yes" : "No"}
                </p>
              </div>
              <div className="companySites-row-lg">
                <p>{address.address1}</p>
              </div>
              <div className="companySites-row-lg">
                <p>{address.address2}</p>
              </div>
              {/* <div className='companySites-row-lg'>
                <p>{address.address3}</p>
              </div> */}
              <div className="companySites-row-lg">
                <p>{address.phoneNumber1}</p>
              </div>
              {/* <div className='companySites-row-lg'>
                <p>{address.phoneNumber2}</p>
              </div> */}
              <div className="companySites-row-lg">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p style={{ textAlign: "left" }}>{address.city}</p>
                    </Tooltip>
                  }
                >
                  <p>{convertSubstring(address.city)}</p>
                </OverlayTrigger>
              </div>
              <div className="companySites-row-lg">
                <p>{address.postCode}</p>
              </div>
              <div className="companySites-row-lg">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p style={{ textAlign: "left" }}>{address.state}</p>
                    </Tooltip>
                  }
                >
                  <p>{convertSubstring(address.state)}</p>
                </OverlayTrigger>
              </div>
              <div className="companySites-row-lg">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p style={{ textAlign: "left" }}>{address.country}</p>
                    </Tooltip>
                  }
                >
                  <p>{convertSubstring(address.country)}</p>
                </OverlayTrigger>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editShow && (
        <Modal
          isOpen={editShow}
          toggle={() => setEditShow(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setEditShow(false)}
            className="bg-light p-3"
          >
            Edit Address Details
          </ModalHeader>
          <ModalBody>
            <EditAddressInfo
              setSelectedList={setSelectedList}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
              refresh={refresh}
              setShowEdit={setEditShow}
            />
          </ModalBody>
        </Modal>
      )}

      {addShow && (
        <Modal
          isOpen={addShow}
          toggle={() => setAddShow(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setAddShow(false)}
            className="bg-light p-3"
          >
            Add new Address
          </ModalHeader>
          <ModalBody>
            <AddNewAddress setShowForm={setAddShow} refresh={refresh} />
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

export default AddressList;
