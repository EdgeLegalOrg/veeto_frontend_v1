import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Table,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import {
  checkHasPermission,
  convertSubstring,
  formatDateFunc,
} from "../../../utils/utilFunc";
import { returnFileIcon, filterFileType } from "../../../utils/Icons";
import fileDownload from "js-file-download";
import LoadingPage from "../../../utils/LoadingPage";
import AddEditAttachment from "./AddEditAttachment";
import { deleteMatterAttach, downloadMatterAttach } from "../../../apis";
import { AlertPopup } from "../../customComponents/CustomComponents";
import upArrow from "../../../images/upArrow.svg";
import downArrow from "../../../images/downArrow.svg";
import downArrowColoured from "../../../images/downArrowColoured.svg";
import upArrowColoured from "../../../images/upArrowColoured.svg";
import TooltipWrapper from "../../../../../Components/Common/TooltipWrapper";
import { toast } from "react-toastify";
import { DELETEMATTERATTACHMENT } from "pages/Edge/utils/RightConstants";
// import { navigationEditFormAction } from "slices/layouts/reducer";

const initFilter = {
  name: "",
  uploadDate: "",
  type: "ALL",
  uploadedBy: "",
};

const AttachmentList = (props) => {
  const { setExtraButtons } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filteredList, setFilteredList] = useState([]);
  const [filterInput, setFilterInput] = useState(initFilter);
  const [attachList, setAttachList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [add, setAdd] = useState(false);
  const [editState, setEditState] = useState({
    show: false,
    data: {},
  });
  const [deletePop, setDeletePop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [labelSort, setLabelSort] = useState("");

  useEffect(() => {
    if (
      props.data &&
      props.data.attachmentList &&
      props.data.attachmentList.length > 0
    ) {
      setAttachList(props.data.attachmentList);
      // setFilteredList(props.data.attachmentList);
      setTimeout(() => {
        startTypeFilter(filterInput.type, true);
      }, 10);
    }
  }, [props.data]);

  useEffect(() => {
    if (setExtraButtons) {
      setExtraButtons(
        <div className="d-flex align-items-center">
          <Button
            color="success"
            onClick={() => setAdd(true)}
            className="d-flex mx-2"
          >
            <span className="plusdiv">+</span>Add
          </Button>
          {showDeleteButton()}
        </div>,
      );
    }
  }, [setExtraButtons, attachList, selectedList]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelectedId = [];
      attachList.forEach((a) => {
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

  const filterData = (obj, returnData = false) => {
    let list = attachList.length > 0 ? attachList : props?.data?.attachmentList;
    const newData = list?.filter(
      (data) =>
        (obj["name"] !== ""
          ? data?.["name"]?.toLowerCase()?.includes(obj["name"]?.toLowerCase())
          : true) &&
        (obj["uploadedBy"] !== ""
          ? data?.["uploadedBy"]
              ?.toLowerCase()
              ?.includes(obj["uploadedBy"]?.toLowerCase())
          : true) &&
        (obj["uploadDate"] !== ""
          ? formatDateFunc(data?.["uploadDate"]) ===
            formatDateFunc(obj["uploadDate"])
          : true)
    );

    if (returnData) {
      return newData;
    } else {
      setFilteredList(newData);
    }
  };

  const handleSortListByDate = (arg, type) => {
    let newArray = [];
    type = type ? type : "asc";
    if (labelSort === "uploadDate") {
      if (sortOrder === "desc") {
        type = "asc";
      } else {
        type = "desc";
      }
    }

    if (arg && arg.length > 0) {
      if (type === "desc") {
        newArray = arg.sort(
          (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
        );
      } else {
        newArray = arg.sort(
          (a, b) => new Date(a.uploadDate) - new Date(b.uploadDate)
        );
      }
    }
    setLabelSort("uploadDate");
    setSortField("uploadDate");
    setSortOrder(type);
    setFilteredList(newArray);
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

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
    filterData({ ...filterInput, [name]: value });
  };

  const handleEditRowDetail = (row) => {
    setEditState({
      show: true,
      data: row,
    });
    // const formValue = {
    //   ...row,
    //   matterId: props.data.id
    // };
    // dispatch(
    //   navigationEditFormAction({
    //     currentValue: { ...formValue,  tab: "ATTACHMENTS" },
    //     newValue: formValue,
    //   })
    // );
    // navigate("/Documents");
  };

  const handleDownload = (d) => {
    let rval = [];
    rval.push(d.name);

    if (d.type) {
      rval.push(d.type);
    }

    downloadMatterAttach(d.id).then((res) => {
      fileDownload(res.data, rval.join("."));
    });
  };

  const handleDeleteAlert = () => {
    if (selectedList && selectedList.length > 0) {
      setDeletePop(true);
    } else {
      toast.warning("Please select any attachment");
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const ids = selectedList.join(",");
      const { data } = await deleteMatterAttach(ids);
      if (data.success) {
        const deletedIds = [...selectedList];
        const remaining = attachList.filter((a) => !deletedIds.includes(a.id));
        setAttachList(remaining);
        setFilteredList((prev) =>
          prev.filter((a) => !deletedIds.includes(a.id)),
        );
        setSelectedList([]);
        setTimeout(() => {
          setDeletePop(false);
        }, 10);
        props.refresh();
      } else {
        toast.warning("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      toast.warning("Something went wrong, please try again later.");
      setLoading(false);
      console.error(error);
    }
  };

  const startTypeFilter = (value, sortTo) => {
    let arr = filterData(filterInput, true);
    arr = filterFileType(arr, value);
    setFilterInput({ ...filterInput, type: value });

    if (sortTo) {
      setTimeout(() => {
        handleSortListByDate(arr, "desc");
      }, 10);
    } else {
      setFilteredList(arr);
    }
  };

  const handleChangeType = (e) => {
    const { value } = e.target;
    startTypeFilter(value);
  };

  const showDeleteButton = () => {
    if (checkHasPermission(DELETEMATTERATTACHMENT)) {
      return (
        <Button
          color="danger"
          onClick={handleDeleteAlert}
          className="d-flex mx-2"
          disabled={props.isArchived}
        >
          <span className="plusdiv">-</span>Delete
        </Button>
      );
    } else {
      return null;
    }
  };

  const showCheckBox = () => {
    return checkHasPermission(DELETEMATTERATTACHMENT);
  };

  return (
    <div className="mx-2">
      {/* <div className="d-flex align-items-center justify-content-end mb-2">
        <div className="d-flex mx-4">
          <Button
            color="success"
            onClick={() => setAdd(true)}
            className="d-flex mx-2"
          >
            <span className="plusdiv">+</span>Add
          </Button>
          {showDeleteButton()}
        </div>
      </div> */}

      <Table responsive={true} striped={true} hover={true}>
        <thead className="mb-2 bg-light">
          <tr>
            {showCheckBox() && (
              <th>
                <Input
                  type="checkbox"
                  checked={
                    attachList.length > 0 &&
                    selectedList.length === attachList.length
                  }
                  onChange={handleSelectAll}
                />
              </th>
            )}
            <th>
              <div>
                <p className="mb-0">Type</p>
                <Input
                  type="select"
                  name="type"
                  value={filterInput.type}
                  onChange={handleChangeType}
                >
                  <option value="ALL">All</option>
                  {["WORD", "MAIL", "IMAGE", "PDF", "EXCEL", "OTHER"].map(
                    (t) => (
                      <option key={t} className="cap" value={t}>
                        {t.toLowerCase()}
                      </option>
                    )
                  )}
                </Input>
              </div>
            </th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() => sortFunc("name")}
              >
                <p className="mb-0">Filename</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "name" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "name" ? (
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
                autoComplete="off"
                name="name"
                value={filterInput.name}
                onChange={handleFilter}
              />
            </th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() => handleSortListByDate(filteredList)}
              >
                <p className="mb-0">Upload Date</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "uploadDate" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "uploadDate" ? (
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
                type="date"
                autoComplete="off"
                name="uploadDate"
                value={filterInput.uploadDate}
                onChange={handleFilter}
              />
            </th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() => sortFunc("uploadedBy")}
              >
                <p className="mb-0">Added By</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "uploadedBy" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "uploadedBy" ? (
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
                autoComplete="off"
                name="uploadedBy"
                value={filterInput.uploadedBy}
                onChange={handleFilter}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredList?.map((attach) => (
            <tr key={attach.id}>
              {showCheckBox() && (
                <td>
                  <Input
                    type="checkbox"
                    checked={isSelected(attach.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleSelect(attach.id)}
                    className="pe-cursor"
                  />
                </td>
              )}
              <td className="pe-cursor">
                <img
                  src={returnFileIcon(attach.type)}
                  alt={attach.type}
                  width="30px"
                  height="30px"
                  className="mr-r16 pe-cursor"
                  onClick={() => handleEditRowDetail(attach)}
                />
              </td>
              <td className="pe-cursor">
                <div
                  className="flx underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(attach);
                  }}
                >
                  <TooltipWrapper
                    id={`name-${attach.id}`}
                    placement="bottom"
                    text={attach.name ? attach.name : ""}
                    content={convertSubstring(attach.name, 25)}
                  ></TooltipWrapper>
                </div>
              </td>
              <td className="pe-cursor">
                <p className="mb-0" onClick={() => handleEditRowDetail(attach)}>
                  {attach.uploadDate ? formatDateFunc(attach.uploadDate) : ""}
                </p>
              </td>
              <td
                className="pe-cursor"
                onClick={() => handleEditRowDetail(attach)}
              >
                <TooltipWrapper
                  id={`uploadedBy-${attach.id}`}
                  placement="bottom"
                  text={attach.uploadedBy ? attach.uploadedBy : ""}
                  content={convertSubstring(attach.uploadedBy, 25)}
                ></TooltipWrapper>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {add && (
        <Modal
          isOpen={add}
          toggle={() => setAdd(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader toggle={() => setAdd(false)} className="bg-light p-3">
            Add Attachment
          </ModalHeader>
          <ModalBody>
            <AddEditAttachment
              closeForm={() => setAdd(false)}
              refresh={props.refresh}
              matterId={props?.data?.id}
              mode="add"
            />
          </ModalBody>
        </Modal>
      )}
      {editState.show && (
        <Modal
          isOpen={editState.show}
          toggle={() =>
            setEditState({
              show: false,
              data: {},
            })
          }
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() =>
              setEditState({
                show: false,
                data: {},
              })
            }
            className="bg-light p-3"
          >
            Edit Attachment
          </ModalHeader>
          <ModalBody>
            <AddEditAttachment
              closeForm={() =>
                setEditState({
                  show: false,
                  data: {},
                })
              }
              refresh={props.refresh}
              matterId={props?.data?.id}
              editState={editState.data}
              mode="edit"
            />
          </ModalBody>
        </Modal>
      )}
      {deletePop && (
        <Modal
          isOpen={deletePop}
          toggle={() => setDeletePop(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setDeletePop(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              message="Are you sure you want to delete the record?"
              heading="Confirm Your Action"
              closeForm={() => setDeletePop(false)}
              btn1={"No"}
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

export default AttachmentList;
