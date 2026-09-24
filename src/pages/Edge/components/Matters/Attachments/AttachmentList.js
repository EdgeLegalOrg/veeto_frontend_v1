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
  handleAttachmentDragStart,
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

const getInitials = (name) => {
  if (!name) return "LD";
  const trimmed = name.trim();
  const parts = trimmed.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
};

const EmailReceivedIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="15" rx="2" stroke="#6b7280" strokeWidth="1.5" fill="#f9fafb"/>
    <path d="M2 7l10 6 10-6" stroke="#6b7280" strokeWidth="1.5"/>
    <circle cx="17" cy="15" r="5" fill="#10b981"/>
    <path d="M17 12.5v5M14.5 15l2.5 2.5 2.5-2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EmailSentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="15" rx="2" stroke="#6b7280" strokeWidth="1.5" fill="#f9fafb"/>
    <path d="M2 7l10 6 10-6" stroke="#6b7280" strokeWidth="1.5"/>
    <circle cx="17" cy="15" r="5" fill="#2563eb"/>
    <path d="M14.5 15h5M17 12.5l2.5 2.5-2.5 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("uploadDate");

  const applySort = (list, field = sortField, order = sortOrder) => {
    if (!field || !list || list.length === 0) return [...(list || [])];
    const newArr = [...list];
    if (field === "uploadDate") {
      const type = order || "desc";
      return newArr.sort((a, b) =>
        type === "desc"
          ? new Date(b.uploadDate) - new Date(a.uploadDate)
          : new Date(a.uploadDate) - new Date(b.uploadDate)
      );
    }
    const type = order || "asc";
    return newArr.sort((a, b) => {
      const va = a[field] ? a[field].toString().toLowerCase() : "";
      const vb = b[field] ? b[field].toString().toLowerCase() : "";
      if (va === vb) return 0;
      if (va === "" || va === null) return 1;
      if (vb === "" || vb === null) return -1;
      return type === "asc" ? (va < vb ? -1 : 1) : va < vb ? 1 : -1;
    });
  };

  const applyFilterAndSort = (filters, field = sortField, order = sortOrder, sourceList = null) => {
    let arr = filterData(filters, true, sourceList);
    arr = filterFileType(arr, filters.type);
    if (field) {
      arr = applySort(arr, field, order);
    }
    return arr;
  };

  useEffect(() => {
    if (
      props.data &&
      props.data.attachmentList &&
      props.data.attachmentList.length > 0
    ) {
      const latestList = [...props.data.attachmentList];
      setAttachList(latestList);

      const arr = applyFilterAndSort(
        filterInput,
        sortField || "uploadDate",
        sortOrder || "desc",
        latestList,
      );
      setFilteredList(arr);
    } else {
      setAttachList([]);
      setFilteredList([]);
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

  const filterData = (obj, returnData = false, sourceList = null) => {
    let list = sourceList || (attachList.length > 0 ? attachList : props?.data?.attachmentList);
    const newData = list?.filter(
      (data) =>
        (obj["name"] !== ""
          ? data?.["name"]?.toLowerCase()?.includes(obj["name"]?.toLowerCase()) ||
            data?.["emailSubject"]?.toLowerCase()?.includes(obj["name"]?.toLowerCase())
          : true) &&
        (obj["uploadedBy"] !== ""
          ? data?.["uploadedBy"]
              ?.toLowerCase()
              ?.includes(obj["uploadedBy"]?.toLowerCase()) ||
            data?.["sender"]
              ?.toLowerCase()
              ?.includes(obj["uploadedBy"]?.toLowerCase())
          : true) &&
        (obj["uploadDate"] !== ""
          ? formatDateFunc(data?.["uploadDate"]) ===
              formatDateFunc(obj["uploadDate"]) ||
            formatDateFunc(data?.["receivedDate"]) ===
              formatDateFunc(obj["uploadDate"])
          : true)
    );

    if (returnData) {
      return newData;
    } else {
      setFilteredList(newData);
    }
  };

  const sortFunc = (sorton) => {
    const newOrder = sortField === sorton && sortOrder === "asc" ? "desc" : "asc";
    setSortField(sorton);
    setSortOrder(newOrder);
    setFilteredList((prevList) => applySort(prevList, sorton, newOrder));
  };

  const handleFilter = (e) => {
    const { name, value } = e.target;
    const updatedFilter = { ...filterInput, [name]: value };
    setFilterInput(updatedFilter);
    const arr = applyFilterAndSort(updatedFilter, sortField, sortOrder, attachList);
    setFilteredList(arr);
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

  const hasExtension = d.name && /\.[^./\\]+$/.test(d.name);

  if (d.type && !hasExtension) {
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

  const startTypeFilter = (value, sortTo, sourceList = null) => {
    const updatedFilter = { ...filterInput, type: value };
    setFilterInput(updatedFilter);

    const targetField = sortTo ? "uploadDate" : sortField;
    const targetOrder = sortTo ? sortTo : sortOrder;
    if (sortTo) {
      setSortField("uploadDate");
      setSortOrder(sortTo);
    }

    const arr = applyFilterAndSort(updatedFilter, targetField, targetOrder, sourceList || attachList);
    setFilteredList(arr);
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

  const renderStorageBadge = (storageType) => {
    switch (storageType) {
      case "GOOGLE_DRIVE":
        return (
          <span
            className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded"
            style={{ background: "#e8f0fe", color: "#1a73e8", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap" }}
          >
            <svg width="14" height="14" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
            Google Drive
          </span>
        );
      case "ONEDRIVE":
        return (
          <span
            className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded"
            style={{ background: "#e3f2fd", color: "#0078d4", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap" }}
          >
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.6 4.4A3.6 3.6 0 0 0 6.2 2a3.6 3.6 0 0 0-3.4 2.45A2.8 2.8 0 0 0 0 7.2 2.8 2.8 0 0 0 2.8 10h9.6A2.6 2.6 0 0 0 15 7.4a2.6 2.6 0 0 0-2.4-2.6A3.6 3.6 0 0 0 9.6 4.4z" fill="#0078d4"/>
            </svg>
            OneDrive
          </span>
        );
      default:
        return (
          <span
            className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded"
            style={{ background: "#f1f3f4", color: "#5f6368", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="#5f6368" strokeWidth="2"/>
              <path d="M8 21h8M12 17v4" stroke="#5f6368" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Server
          </span>
        );
    }
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
                onClick={() => sortFunc("uploadDate")}
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
            <th>
              <p className="mb-0">Storage</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredList?.map((attach) => (
            <tr key={attach.id} draggable={true} onDragStart={(e) => handleAttachmentDragStart(e, attach, "/api/matter/attachment")}>
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
              <td className="pe-cursor" style={{ verticalAlign: "top", paddingTop: "12px" }}>
                {attach.emailSubject || ["email", "eml", "msg"].includes(attach.type?.toLowerCase()) ? (
                  <div onClick={() => handleEditRowDetail(attach)}>
                    <EmailReceivedIcon />
                  </div>
                ) : (
                  <img
                    src={returnFileIcon(attach.type)} draggable={false}
                    alt={attach.type}
                    width="30px"
                    height="30px"
                    className="mr-r16 pe-cursor"
                    onClick={() => handleEditRowDetail(attach)}
                  />
                )}
              </td>
              <td className="pe-cursor" style={{ verticalAlign: "top", paddingTop: "10px" }}>
                {attach.emailSubject ? (
                  <div>
                    <div
                      className="fw-medium pe-cursor"
                      style={{ color: "#1e40af", fontSize: "14px" }}
                      onClick={() => handleEditRowDetail(attach)}
                    >
                      {attach.emailSubject}
                    </div>
                    <div className="d-flex align-items-center mt-1">
                      <span
                        style={{
                          backgroundColor: "#64748b",
                          color: "#ffffff",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          letterSpacing: "0.5px",
                          marginRight: "6px",
                        }}
                      >
                        RECEIVED
                      </span>
                      <span style={{ fontSize: "12px", color: "#475569" }}>
                        {attach.sender || attach.uploadedBy}
                      </span>
                    </div>
                    {/* Tree branch connector to attachment */}
                    <div
                      className="d-flex align-items-center mt-2"
                      style={{ paddingLeft: "16px", position: "relative" }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "2px",
                          top: "-8px",
                          bottom: "8px",
                          width: "12px",
                          borderLeft: "2px solid #cbd5e1",
                          borderBottom: "2px solid #cbd5e1",
                          borderBottomLeftRadius: "3px",
                        }}
                      />
                      <span style={{ fontSize: "14px", marginRight: "6px", lineHeight: 1 }}>
                        📎
                      </span>
                      <span
                        className="pe-cursor underline"
                        style={{ fontSize: "13px", color: "#1e293b", fontWeight: "500" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(attach);
                        }}
                      >
                        {attach.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flx underline" draggable={true} onDragStart={(e) => { e.stopPropagation(); handleAttachmentDragStart(e, attach, "/api/matter/attachment"); }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(attach);
                    }}
                  >
                    <TooltipWrapper
                      id={`name-${attach.id}`}
                      placement="bottom"
                      text={attach.name ? attach.name : ""}
                      content={convertSubstring(attach.name, 40)}
                    ></TooltipWrapper>
                  </div>
                )}
              </td>
              <td className="pe-cursor" style={{ verticalAlign: "top", paddingTop: "12px" }}>
                <p className="mb-0" onClick={() => handleEditRowDetail(attach)}>
                  {attach.uploadDate ? formatDateFunc(attach.uploadDate) : ""}
                </p>
                {attach.receivedDate && (
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>
                    Received: {formatDateFunc(attach.receivedDate)}
                  </div>
                )}
              </td>
              <td
                className="pe-cursor"
                style={{ verticalAlign: "top", paddingTop: "10px" }}
                onClick={() => handleEditRowDetail(attach)}
              >
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "28px",
                      height: "28px",
                      backgroundColor: "#e2e8f0",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#475569",
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(attach.uploadedBy || attach.sender)}
                  </span>
                  <TooltipWrapper
                    id={`uploadedBy-${attach.id}`}
                    placement="bottom"
                    text={attach.uploadedBy ? attach.uploadedBy : ""}
                    content={convertSubstring(attach.uploadedBy || attach.sender, 20)}
                  ></TooltipWrapper>
                </div>
              </td>
              <td>{renderStorageBadge(attach.storageType)}</td>
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
              matterNumber={props?.data?.matterNumber}
              matterRe={props?.data?.letterSubject}
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
