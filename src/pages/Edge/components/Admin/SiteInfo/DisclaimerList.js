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
import { MdFilterAltOff } from "react-icons/md";
import AddNewBank from "./AddNewBank";
import {
  addNewBank,
  addNewDisclaimer,
  deleteBankAccount,
  deleteDisclaimer,
  updatePreferred,
} from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import EditBankDetails from "./EditBankDetails";
import { AlertPopup } from "../../customComponents/CustomComponents";
import AddTaxDisclaimer from "./AddTaxDisclaimer";
import EditTaxDisclaimer from "./EditTaxDisclaimer";
import { convertSubstring } from "../../../utils/utilFunc";
import { toast } from "react-toastify";
import { AiOutlineClose } from "react-icons/ai";

const filterFields = {
  disclaimer: "",
};

const DisclaimerList = (props) => {
  const { disclaimerList, siteInfo, refresh } = props;
  const [filterInput, setFilterInput] = useState(filterFields);
  const [filteredData, setFilteredData] = useState(disclaimerList);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [labelSort, setLabelSort] = useState("");
  const [selectedDisclaimer, setSelectedDisclaimer] = useState(null);
  const [selectedList, setSelectedList] = useState([]);

  useEffect(() => {
    setFilteredData(disclaimerList);
  }, [props.disclaimerList]);

  const isSelected = (id) => selectedList.indexOf(id) !== -1;

  const handleTaxDisclaimer = async (disclaimer) => {
    setLoading(true);
    try {
      const { data } = await addNewDisclaimer(disclaimer);
      if (data.success) {
        refresh();
      } else {
        toast.error("Something went wrong, please try later");
      }
      setShowForm(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShowForm(false);
      toast.error("Something went wrong please check console.");
      console.error(error);
    }
  };

  const handlePreferred = async () => {
    if (selectedDisclaimer) {
      setLoading(true);

      let newData = {
        preferredDisclaimerId: selectedDisclaimer.id,
      };

      try {
        const { data } = await updatePreferred(newData);
        if (data.success) {
          refresh();
          setSelectedList([]);
          setSelectedDisclaimer(null);
        } else {
          toast.error("Something went wrong, please try later");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    } else {
      toast.warning("Please select one preferred disclaimer.");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelectedId = [];
      filteredData.forEach((a) => {
        newSelectedId.push(a.id);
      });
      setSelectedDisclaimer(null);
      setSelectedList(newSelectedId);
    } else {
      setSelectedList([]);
      setSelectedDisclaimer(null);
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
        setSelectedDisclaimer(data[0]);
      }
    } else {
      setSelectedDisclaimer(null);
    }
    setSelectedList(newSelectedId);
  };

  const handleClickRow = (id) => {
    setLoading(true);
    setSelectedList([id]);
    let data = filteredData.filter((a) => a.id === id);
    setSelectedDisclaimer(data[0]);
    setTimeout(() => {
      setShowEdit(true);
      setLoading(false);
    }, 30);
  };

  const handleEditForm = () => {
    if (selectedDisclaimer) {
      setShowEdit(true);
    } else {
      toast.warning("Please select one disclaimer.");
    }
  };

  const filterData = (obj) => {
    const newData = disclaimerList?.filter((data) =>
      obj["disclaimer"] !== ""
        ? data["disclaimer"]
            ?.toLowerCase()
            ?.includes(obj["disclaimer"]?.toLowerCase())
        : true
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
    let isPreferred = selectedList.includes(siteInfo.preferredDisclaimerId);

    if (!isPreferred) {
      setDeleteAlert(true);
    } else {
      toast.warning("Preferred tax disclaimer could not be deleted.");
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const ids = selectedList.join(",");
    try {
      const { data } = await deleteDisclaimer(ids);
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
    setFilteredData(disclaimerList);
  };

  return (
    <Fragment>
      <div className="bg-light d-flex align-items-center justify-content-between p-2">
        <h5 className="mb-0">Tax Disclaimers</h5>
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
            onClick={handlePreferred}
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
                onClick={() => sortFunc("disclaimer")}
              >
                <p>Disclaimer</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "disclaimer" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "disclaimer" ? (
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
                name="disclaimer"
                placeholder="Disclaimer"
                onChange={handleFilter}
                autoComplete="off"
                style={{ width: "15rem" }}
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
                  <AiOutlineClose size={18} />
                </Button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData?.map((disclaimer) => (
            <tr
              key={disclaimer.id}
              onClick={(e) => {
                e.stopPropagation();
                handleClickRow(disclaimer.id);
              }}
              className="pe-cursor"
            >
              <td className="companySites-row-sm">
                <input
                  type="checkbox"
                  checked={isSelected(disclaimer.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleSelect(disclaimer.id)}
                />
              </td>
              <td className="companySites-row-md">
                <p className="mb-0">
                  {siteInfo?.preferredDisclaimerId === disclaimer.id
                    ? "Yes"
                    : "No"}
                </p>
              </td>
              <td className="companySites-row-xlg">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`} className="disclaimer-tp">
                      <div>
                        <p
                          style={{ textAlign: "left", width: "100%" }}
                          className="mb-0"
                        >
                          {disclaimer?.disclaimer}
                        </p>
                      </div>
                    </Tooltip>
                  }
                >
                  <div>
                    <p
                      style={{ textAlign: "left", width: "100%" }}
                      className="mb-0"
                    >
                      {convertSubstring(disclaimer?.disclaimer, 50)}
                    </p>
                  </div>
                </OverlayTrigger>
              </td>
              <td></td>
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
            <div className="companySites-tableCol-xlg">
              <div
                className="companySites-labelDisclaimer"
                onClick={() => sortFunc("disclaimer")}
              >
                <p>Disclaimer</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "disclaimer" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "disclaimer" ? (
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
                name="disclaimer"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
          </div>
          {filteredData?.map((disclaimer) => (
            <div
              className="companySites-rowDiv pe-cursor"
              key={disclaimer.id}
              onClick={(e) => {
                e.stopPropagation();
                handleClickRow(disclaimer.id);
              }}
            >
              <div className="companySites-row-sm">
                <input
                  type="checkbox"
                  checked={isSelected(disclaimer.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleSelect(disclaimer.id)}
                />
              </div>
              <div className="companySites-row-md">
                <p>
                  {siteInfo?.preferredDisclaimerId === disclaimer.id
                    ? "Yes"
                    : "No"}
                </p>
              </div>
              <div className="companySites-row-xlg">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`} className="disclaimer-tp">
                      <div>
                        <p style={{ textAlign: "left", width: "100%" }}>
                          {disclaimer?.disclaimer}
                        </p>
                      </div>
                    </Tooltip>
                  }
                >
                  <div>
                    <p style={{ textAlign: "left", width: "100%" }}>
                      {convertSubstring(disclaimer?.disclaimer, 50)}
                    </p>
                  </div>
                </OverlayTrigger>
              </div>
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
            Add Tax Disclaimer
          </ModalHeader>
          <ModalBody>
            <AddTaxDisclaimer
              setShowForm={setShowForm}
              handleTaxDisclaimer={handleTaxDisclaimer}
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
            Edit Tax Disclaimer
          </ModalHeader>
          <ModalBody>
            <EditTaxDisclaimer
              setSelectedList={setSelectedList}
              selectedDisclaimer={selectedDisclaimer}
              setSelectedDisclaimer={setSelectedDisclaimer}
              refresh={refresh}
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

export default DisclaimerList;
