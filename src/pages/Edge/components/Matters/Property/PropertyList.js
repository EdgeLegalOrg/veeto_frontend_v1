import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Button,
  Table,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { unlinkMatterProp } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { AlertPopup } from "../../customComponents/CustomComponents";
import LinkPropertyPage from "./LinkPropertyPage";
import upArrow from "../../../images/upArrow.svg";
import downArrow from "../../../images/downArrow.svg";
import downArrowColoured from "../../../images/downArrowColoured.svg";
import upArrowColoured from "../../../images/upArrowColoured.svg";
import { toast } from "react-toastify";
import { navigationEditFormAction } from "slices/layouts/reducer";
import CreateNewProperty from "./CreateNewProperty";
import { MdOutlinePersonAddAlt } from "react-icons/md";

const initFilter = {
  address: "",
  titleReferences: "",
};
const PropertyList = (props) => {
  const { setExtraButtons } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filteredList, setFilteredList] = useState([]);
  const [filterInput, setFilterInput] = useState(initFilter);
  const [pList, setPList] = useState([]);
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedList, setSelectedList] = useState([]);
  const [unLinkAlert, setUnLinkAlert] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [labelSort, setLabelSort] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPList(props?.data?.propertyList);
    setFilteredList(props?.data?.propertyList);
  }, [props.data]);

  useEffect(() => {
    if (setExtraButtons) {
      setExtraButtons(
        <div className="d-flex align-items-center">
          <Button
            color="success"
            disabled={props.isArchived}
            onClick={() => setOpen(true)}
            className="d-flex mx-2"
          >
            <span className="plusdiv">+</span>Link
          </Button>
          <Button
            color="danger"
            disabled={props.isArchived}
            onClick={handleDeleteAlert}
            className="d-flex mx-2"
          >
            <span className="plusdiv">-</span>Unlink
          </Button>
        </div>,
      );
    }
  }, [setExtraButtons, pList, selectedList]);

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
    filterData({ ...filterInput, [name]: value });
  };

  const handleEditRowDetail = (row) => {
    const formValue = {
      ...row,
      matterId: props.data.id,
    };
    dispatch(
      navigationEditFormAction({
        currentValue: { ...formValue, tab: "PROPERTY" },
        newValue: formValue,
      })
    );
    navigate("/property");
  };

  const filterData = (obj) => {
    const newData = filteredList?.filter(
      (data) =>
        (obj["titleReferences"] !== ""
          ? data["titleReferences"]
              ?.toLowerCase()
              ?.includes(obj["titleReferences"]?.toLowerCase())
          : true) &&
        (obj["address"] !== ""
          ? data["address"]
              ?.toLowerCase()
              ?.includes(obj["address"]?.toLowerCase())
          : true)
    );

    setFilteredList(newData);
  };

  const sortFunc = (sorton) => {
    let newArray = [];
    if (labelSort !== sorton) {
      setLabelSort(sorton);
      setSortOrder("asc");
      setSortField(sorton);
      newArray = filteredList.sort((a, b) => {
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
      newArray = filteredList.sort((a, b) => {
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
    setFilteredList(newArray);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelectedId = [];
      pList.forEach((a) => {
        newSelectedId.push(a.id);
      });
      setSelectedList(newSelectedId);
    } else {
      setSelectedList([]);
    }
  };

  const handleSelect = (id) => {
    const selectedIndex = selectedList.indexOf(id);
    let newSelectedId = [];
    if (selectedIndex === -1) {
      newSelectedId = newSelectedId.concat(selectedList, id);
    } else if (selectedIndex === 0) {
      newSelectedId = newSelectedId.concat(selectedList.slice(1));
    } else if (selectedIndex === selectedList.length - 1) {
      newSelectedId = newSelectedId.concat(selectedList.slice(0, -1));
    } else {
      newSelectedId = newSelectedId.concat(
        selectedList.slice(0, selectedIndex),
        selectedList.slice(selectedIndex + 1)
      );
    }
    setSelectedList(newSelectedId);
  };

  const isSelected = (id) => selectedList.indexOf(id) !== -1;

  const handleDeleteAlert = () => {
    if (selectedList && selectedList.length > 0) {
      setUnLinkAlert(true);
    } else {
      toast.warning("Please select any property");
    }
  };

  const handleDelete = async () => {
    let arr = [];
    selectedList.forEach((a) => {
      arr.push({ id: a });
    });

    let formData = {
      matterId: props?.data?.id,
      propertyList: arr,
    };
    try {
      setLoading(true);
      const { data } = await unlinkMatterProp(formData);
      if (data.success) {
        props.refresh();
        setTimeout(() => {
          setSelectedList([]);
          setUnLinkAlert(false);
        }, 10);
      } else {
        toast.warning("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.warning("Something went wrong, please try again later.");
    }
  };

  return (
    <div className="mx-2">
      {/* <div className="d-flex align-items-center justify-content-end mb-2">
        <Button
          color="success"
          onClick={() => setOpen(true)}
          className="d-flex mx-2"
        >
          <span className="plusdiv">+</span>Link
        </Button>
        <Button
          color="danger"
          onClick={handleDeleteAlert}
          className="d-flex mx-2"
        >
          <span className="plusdiv">-</span>Unlink
        </Button>
      </div> */}

      <Table responsive={true} striped={true} hover={true}>
        <thead className="mb-2 bg-light">
          <tr>
            <th>
              <Input
                type="checkbox"
                checked={
                  pList.length > 0 && selectedList.length === pList.length
                }
                onChange={handleSelectAll}
              />
            </th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() => sortFunc("titleReferences")}
              >
                <p>Title Ref.</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "titleReferences" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "titleReferences" ? (
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
                name="titleReferences"
                value={filterInput.titleReferences}
                onChange={handleFilter}
              />
            </th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() => sortFunc("address")}
              >
                <p>Address</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "address" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "address" ? (
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
                name="address"
                value={filterInput.address}
                onChange={handleFilter}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredList?.map((property) => (
            <tr
              key={property.id}
              onClick={() => handleEditRowDetail(property)}
              className="pe-cursor"
            >
              <td>
                <Input
                  type="checkbox"
                  checked={isSelected(property.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleSelect(property.id)}
                />
              </td>
              <td>
                <p className="mb-0">{property.titleReferences}</p>
              </td>
              <td>
                <p className="mb-0">{property.address}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="mc-header" style={{ display: "none" }}>
        <div className="mc-col xsm">
          <input
            className="mc-check"
            type="checkbox"
            checked={pList.length > 0 && selectedList.length === pList.length}
            onChange={handleSelectAll}
          />
        </div>
        <div className="mc-col xlg">
          <div
            className="matter-sorting-label"
            onClick={() => sortFunc("titleReferences")}
          >
            <p>Title Ref.</p>
            <div className="associatedContacts-label-btn">
              {sortOrder === "asc" && sortField === "titleReferences" ? (
                <img
                  src={upArrowColoured}
                  alt="asc"
                  className="label-btn-img-1"
                />
              ) : (
                <img src={upArrow} alt="asc" className="label-btn-img-1" />
              )}
              {sortOrder === "desc" && sortField === "titleReferences" ? (
                <img
                  src={downArrowColoured}
                  alt="desc"
                  className="label-btn-img-2"
                />
              ) : (
                <img src={downArrow} alt="desc" className="label-btn-img-2" />
              )}
            </div>
          </div>
          <input
            type="text"
            autoComplete="off"
            name="titleReferences"
            value={filterInput.titleReferences}
            onChange={handleFilter}
          />
        </div>
        <div className="mc-col xlg">
          <div
            className="matter-sorting-label"
            onClick={() => sortFunc("address")}
          >
            <p>Address</p>
            <div className="associatedContacts-label-btn">
              {sortOrder === "asc" && sortField === "address" ? (
                <img
                  src={upArrowColoured}
                  alt="asc"
                  className="label-btn-img-1"
                />
              ) : (
                <img src={upArrow} alt="asc" className="label-btn-img-1" />
              )}
              {sortOrder === "desc" && sortField === "address" ? (
                <img
                  src={downArrowColoured}
                  alt="desc"
                  className="label-btn-img-2"
                />
              ) : (
                <img src={downArrow} alt="desc" className="label-btn-img-2" />
              )}
            </div>
          </div>
          <input
            type="text"
            autoComplete="off"
            name="address"
            value={filterInput.address}
            onChange={handleFilter}
          />
        </div>
      </div>
      {/************Table rows************ */}
      <div className="mc-tBody" style={{ display: "none" }}>
        {filteredList?.map((property) => (
          <div className="mc-row" key={property.id}>
            <div className="mc-col xsm">
              <input
                className="mc-check"
                type="checkbox"
                checked={isSelected(property.id)}
                onClick={(e) => e.stopPropagation()}
                onChange={() => handleSelect(property.id)}
              />
            </div>
            <div className="mc-col xlg">
              <p>{property.titleReferences}</p>
            </div>
            <div className="mc-col xlg">
              <p>{property.address}</p>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <LinkPropertyPage
          open={open}
          openAddModal={() => setOpenAdd(true)}
          closeForm={() => setOpen(false)}
          matterId={props?.data?.id}
          refresh={props.refresh}
        />
      )}

      <CreateNewProperty
        open={openAdd}
        closeForm={() => setOpenAdd(false)}
        matterId={props?.data?.id}
        refresh={props.refresh}
      />

      {unLinkAlert && (
        <Modal
          isOpen={unLinkAlert}
          toggle={() => {
            setUnLinkAlert(false);
            setSelectedList([]);
          }}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => {
              setUnLinkAlert(false);
              setSelectedList([]);
            }}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              message="Are you sure you want to unlink this property?"
              heading="Confirm Your Action"
              closeForm={() => {
                setUnLinkAlert(false);
                setSelectedList([]);
              }}
              btn1="No"
              btn2="Yes"
              handleFunc={handleDelete}
            />
          </ModalBody>
        </Modal>
      )}
      {loading && <LoadingPage />}
    </div>
  );
};

export default PropertyList;
