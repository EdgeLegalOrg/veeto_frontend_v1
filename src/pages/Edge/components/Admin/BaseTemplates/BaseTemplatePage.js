import React, { Fragment, useState, useEffect } from "react";
import {
  Container,
  Card,
  CardBody,
  Table,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import fileDownload from "js-file-download";
import { BiEditAlt } from "react-icons/bi";
import { returnFileIcon } from "../../../utils/Icons";
import LoadingPage from "../../../utils/LoadingPage";
import {
  deleteBaseTemplate,
  getAllBaseTemplates,
  downloadBaseTemplate,
} from "../../../apis";
import upArrow from "../../../images/upArrow.svg";
import downArrow from "../../../images/downArrow.svg";
import downArrowColoured from "../../../images/downArrowColoured.svg";
import upArrowColoured from "../../../images/upArrowColoured.svg";
import Pagination from "../../Pagination";
import { AlertPopup } from "../../customComponents/CustomComponents";

import "../../../stylesheets/ManageTemplate.css";
import AddNewTemplate from "./AddNewTemplate";
import EditTemplate from "./EditTemplate";
import { MdFilterAltOff, MdSearch } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { formatDateFunc } from "../../../utils/utilFunc";

const initialFilter = {
  name: "",
  uploadDate: "",
  uploadedBy: "",
  sortOn: "",
  sortType: "",
  pageNo: 0,
  pageSize: 25,
};

const BaseTemplatePage = () => {
  document.title = "Letterheads | EdgeLegal";
  const [templateList, setTemplateList] = useState([]);
  const [filterInput, setFilterInput] = useState(initialFilter);
  const [labelSort, setLabelSort] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedTemp, setSelectedTemp] = useState([]);

  const [boolVal, setBoolVal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [addToast, setAddToast] = useState(false);
  const [editTemp, setEditTemp] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await getAllBaseTemplates(filterInput);
      if (data.success) {
        setTemplateList(data?.data?.templateList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data.metadata.page.totalRecords);
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!boolVal) {
      fetchTemplates();
      setBoolVal(true);
    }
  }, [boolVal]);

  const handleRefresh = async (filters = filterInput) => {
    setLoading(true);
    setFilterInput({ ...filterInput, ...filters });
    try {
      const { data } = await getAllBaseTemplates(filters);
      if (data.success) {
        setTemplateList(data.data.templateList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data?.metadata?.page?.totalRecords);
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleSortByLabel = (field) => {
    if (labelSort !== field) {
      setLabelSort(field);
      setSortOrder("asc");
      setSortField(field);
      handleRefresh({ ...filterInput, sortOn: field, sortType: "ASC" });
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(field);
      handleRefresh({ ...filterInput, sortOn: field, sortType: "DESC" });
    }
  };

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
  };

  const handlePreviousPage = () => {
    let pg = pageNo - 1;
    setPageNo(pg);

    handleRefresh({ ...filterInput, pageNo: pg });
  };

  const handleNextPage = () => {
    let pg = pageNo + 1;
    setPageNo(pg);

    handleRefresh({ ...filterInput, pageNo: pg });
  };

  const handleJumpToPage = (num) => {
    setPageNo(num - 1);
    handleRefresh({ ...filterInput, pageNo: num - 1 });
  };

  const changeNumberOfRows = (e) => {
    setPageSize(e.target.value);
    let currSize = e.target.value;

    let tempTotalPages = Math.ceil(totalRecords / currSize);
    let tempPageNo = tempTotalPages - 1;

    if (tempPageNo < pageNo) {
      setPageNo(tempPageNo);
    } else {
      tempPageNo = pageNo;
    }

    handleRefresh({ ...filterInput, pageNo: tempPageNo, pageSize: currSize });
  };

  const handleSelect = (id) => {
    const selectedIndex = selectedTemp.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedTemp, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedTemp.slice(1));
    } else if (selectedIndex === selectedTemp?.length - 1) {
      newSelected = newSelected.concat(selectedTemp.slice(0, -1));
    } else {
      newSelected = newSelected.concat(
        selectedTemp.slice(0, selectedIndex),
        selectedTemp.slice(selectedIndex + 1)
      );
    }

    setSelectedTemp(newSelected);
  };

  const handleSelectAll = (e) => {
    let newSelectedId = [];

    if (e.target.checked) {
      templateList.forEach((temp) => newSelectedId.push(temp.id));
    }
    setSelectedTemp(newSelectedId);
  };

  const isSelected = (id) => selectedTemp.indexOf(id) !== -1;

  const handleAlertForDelete = () => {
    if (selectedTemp?.length > 0) {
      setOpenAlert(true);
    } else {
      toast.warning("Select atleast one template");
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      let ids = selectedTemp.join(",");
      const { data } = await deleteBaseTemplate(ids);
      if (data.success) {
        handleRefresh();
        setSelectedTemp([]);
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleDownloadWithLink = (id, fileName) => {
    setLoading(true);
    downloadBaseTemplate(id)
      .then((res) => {
        fileDownload(res.data, fileName);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        toast.warning("Some error occured, please check console.");
        setLoading(false);
      });
  };

  const handleClearFilter = () => {
    setFilterInput(initialFilter);

    setTimeout(() => {
      handleRefresh(initialFilter);
    }, 10);
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Letterheads" pageTitle="Admin" />
          <Card>
            <div className="">
              <div className="bg-light d-flex align-items-center justify-content-between p-2">
                <h5 className="mb-0">Letterheads</h5>
                <div className="d-flex">
                  <Button
                    color="success"
                    onClick={() => setAddToast(true)}
                    className="d-flex mx-1"
                  >
                    <span className="plusdiv">+</span> Add
                  </Button>
                  <Button
                    color="danger"
                    onClick={handleAlertForDelete}
                    className="d-flex mx-1"
                  >
                    <span className="plusdiv">-</span> Delete
                  </Button>
                </div>
              </div>

              <Table responsive={true} striped={true} hover={true}>
                <thead className="mb-2">
                  <tr>
                    <th>
                      <Input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          templateList?.length > 0 &&
                          selectedTemp?.length === templateList?.length
                        }
                      />
                    </th>
                    <th>
                      <p className="mb-0">Edit</p>
                    </th>
                    <th>
                      <div
                        className="template-colLabel"
                        onClick={() => handleSortByLabel("name")}
                      >
                        <p>Name</p>
                        <div className="associatedContacts-label-btn labelCursor">
                          {sortOrder === "asc" && sortField === "name" ? (
                            <img
                              src={upArrowColoured}
                              alt="asc"
                              className="label-btn-img-1"
                            />
                          ) : (
                            <img
                              src={upArrow}
                              alt="asc"
                              className="label-btn-img-1"
                            />
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
                        name="name"
                        placeholder="Name"
                        value={filterInput.name}
                        onChange={handleChangeFilter}
                        onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                      />
                    </th>
                    <th>
                      <div
                        className="template-colLabel "
                        onClick={() => handleSortByLabel("uploadDate")}
                      >
                        <p>Upload Date</p>
                        <div className="associatedContacts-label-btn labelCursor">
                          {sortOrder === "asc" && sortField === "uploadDate" ? (
                            <img
                              src={upArrowColoured}
                              alt="asc"
                              className="label-btn-img-1"
                            />
                          ) : (
                            <img
                              src={upArrow}
                              alt="asc"
                              className="label-btn-img-1"
                            />
                          )}
                          {sortOrder === "desc" &&
                          sortField === "uploadDate" ? (
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
                        name="uploadDate"
                        placeholder="Upload Date"
                        value={filterInput.uploadDate}
                        onChange={handleChangeFilter}
                        onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                      />
                    </th>
                    <th>
                      <div
                        className="template-colLabel"
                        onClick={() => handleSortByLabel("uploadedBy")}
                      >
                        <p>Uploaded By</p>
                        <div className="associatedContacts-label-btn labelCursor">
                          {sortOrder === "asc" && sortField === "uploadedBy" ? (
                            <img
                              src={upArrowColoured}
                              alt="asc"
                              className="label-btn-img-1"
                            />
                          ) : (
                            <img
                              src={upArrow}
                              alt="asc"
                              className="label-btn-img-1"
                            />
                          )}
                          {sortOrder === "desc" &&
                          sortField === "uploadedBy" ? (
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
                        name="uploadedBy"
                        placeholder="Uploaded By"
                        value={filterInput.uploadedBy}
                        onChange={handleChangeFilter}
                        onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                      />
                    </th>
                    <th>
                      <Button
                        type="button"
                        color="success"
                        className="mx-1"
                        onClick={() => handleRefresh()}
                      >
                        <MdSearch size={18} />
                      </Button>
                    </th>
                    <th>
                      <Button
                        type="button"
                        color="danger"
                        className="mx-1"
                        onClick={() => handleClearFilter()}
                      >
                        <MdFilterAltOff size={18} />
                      </Button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templateList?.map((template) => (
                    <tr
                      key={template.id}
                      onClick={() => setEditTemp(template)}
                      className="pe-cursor"
                    >
                      <td>
                        <Input
                          type="checkbox"
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleSelect(template.id)}
                          checked={isSelected(template.id)}
                        />
                      </td>
                      <td>
                        <BiEditAlt
                          className="template-editIcon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTemp(template);
                          }}
                        />
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={returnFileIcon(template.fileType)}
                            alt="file"
                            className="template-fileIcon pe-cursor"
                          />
                          <p
                            className="mb-0 mx-2 pe-cursor underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadWithLink(
                                template.id,
                                `${template.name}${
                                  template.fileType
                                    ? `.${template.fileType}`
                                    : ""
                                }`
                              );
                            }}
                          >
                            {template.name ? template.name : ""}
                          </p>
                        </div>
                      </td>
                      <td>
                        <p className="mb-0">
                          {template.uploadDate
                            ? formatDateFunc(template.uploadDate)
                            : ""}
                        </p>
                      </td>
                      <td>
                        <p className="mb-0">
                          {template.uploadedBy ? template.uploadedBy : ""}
                        </p>
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <CardBody className="mt-2">
                <Pagination
                  pageNo={pageNo}
                  pageSize={pageSize}
                  totalRecords={totalRecords}
                  totalPages={totalPages}
                  handlePreviousPage={handlePreviousPage}
                  handleNextPage={handleNextPage}
                  handleJumpToPage={handleJumpToPage}
                  changeNumberOfRows={changeNumberOfRows}
                />
              </CardBody>

              <div
                className="template-tableHeader jc-fs"
                style={{ display: "none" }}
              >
                <div className="template-esCol mr-r40 ">
                  <Input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      templateList?.length > 0 &&
                      selectedTemp?.length === templateList?.length
                    }
                  />
                </div>
                <div className="template-esCol mr-r40">
                  <p>Edit</p>
                </div>
                <div className="template-xlCol mr-r40">
                  <div
                    className="template-colLabel"
                    onClick={() => handleSortByLabel("name")}
                  >
                    <p>Name</p>
                    <div className="associatedContacts-label-btn labelCursor">
                      {sortOrder === "asc" && sortField === "name" ? (
                        <img
                          src={upArrowColoured}
                          alt="asc"
                          className="label-btn-img-1"
                        />
                      ) : (
                        <img
                          src={upArrow}
                          alt="asc"
                          className="label-btn-img-1"
                        />
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
                  <input
                    className="template-filterInput"
                    type="text"
                    name="name"
                    value={filterInput.name}
                    onChange={handleChangeFilter}
                    onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                  />
                </div>
                {/* <div className='template-tableCol'>
            <div className='template-colLabel '>
              <p> Type</p>
            </div>
            <input className='template-filterInput' type='text' />
          </div> */}

                {/* <div className='template-tableCol'>
            <div className='template-colLabel '>
              <p>File Path</p>
            </div>
            <input className='template-filterInput' type='text' />
          </div> */}
                {/* <div className='template-tableCol'>
            <div className='template-colLabel'>
              <p>Document Type</p>
            </div>
            <input className='template-filterInput' type='text' />
          </div> */}
                <div className="template-tableCol mr-r40">
                  <div
                    className="template-colLabel "
                    onClick={() => handleSortByLabel("uploadDate")}
                  >
                    <p>Upload Date</p>
                    <div className="associatedContacts-label-btn labelCursor">
                      {sortOrder === "asc" && sortField === "uploadDate" ? (
                        <img
                          src={upArrowColoured}
                          alt="asc"
                          className="label-btn-img-1"
                        />
                      ) : (
                        <img
                          src={upArrow}
                          alt="asc"
                          className="label-btn-img-1"
                        />
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
                  <input
                    className="template-filterInput"
                    type="date"
                    name="uploadDate"
                    value={filterInput.uploadDate}
                    onChange={handleChangeFilter}
                    onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                  />
                </div>
                <div className="template-largeTableCol mr-r40">
                  <div
                    className="template-colLabel"
                    onClick={() => handleSortByLabel("uploadedBy")}
                  >
                    <p>Uploaded By</p>
                    <div className="associatedContacts-label-btn labelCursor">
                      {sortOrder === "asc" && sortField === "uploadedBy" ? (
                        <img
                          src={upArrowColoured}
                          alt="asc"
                          className="label-btn-img-1"
                        />
                      ) : (
                        <img
                          src={upArrow}
                          alt="asc"
                          className="label-btn-img-1"
                        />
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
                  <input
                    className="template-filterInput"
                    type="text"
                    name="uploadedBy"
                    value={filterInput.uploadedBy}
                    onChange={handleChangeFilter}
                    onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                  />
                </div>
                <div className="template-esCol ">
                  <button
                    className="searchButton"
                    onClick={() => handleRefresh()}
                  >
                    <MdSearch size={25} />
                  </button>
                </div>
                <div className="template-esCol ">
                  <button
                    className="searchButton"
                    onClick={() => handleClearFilter()}
                  >
                    <MdFilterAltOff size={25} />
                  </button>
                </div>
              </div>
              <div
                className="template-tableContent"
                style={{ display: "none" }}
              >
                {templateList?.map((template) => (
                  <div
                    className="template-tableRow jc-fs pe-cursor"
                    key={template.id}
                    onClick={() => setEditTemp(template)}
                  >
                    <div className="template-esRow mr-r40">
                      <Input
                        type="checkbox"
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleSelect(template.id)}
                        checked={isSelected(template.id)}
                      />
                    </div>
                    <div className="template-esRow mr-r40">
                      <BiEditAlt
                        className="template-editIcon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTemp(template);
                        }}
                      />
                    </div>
                    <div className="template-xlRowDiv mr-r40">
                      <img
                        src={returnFileIcon(template.fileType)}
                        alt="file"
                        className="template-fileIcon"
                      />
                      <p
                        className="template-nameLink three-dot"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadWithLink(
                            template.id,
                            `${template.name}${
                              template.fileType ? `.${template.fileType}` : ""
                            }`
                          );
                        }}
                      >
                        {template.name ? template.name : ""}
                      </p>
                    </div>
                    {/* <div className='template-rowDiv'>
                <p>{template.type ? template.type : ''}</p>
              </div> */}
                    {/* <div className='template-rowDiv'>
                <p>{template.documentType ? template.documentType : ''}</p>
              </div> */}
                    <div className="template-rowDiv mr-r40">
                      <p>
                        {template.uploadDate
                          ? formatDateFunc(template.uploadDate)
                          : ""}
                      </p>
                    </div>
                    <div className="template-largeRowDiv mr-r40">
                      <p>{template.uploadedBy ? template.uploadedBy : ""}</p>
                    </div>
                    <div className="template-esCol "></div>
                    <div className="template-esCol "></div>
                  </div>
                ))}
              </div>
            </div>

            {addToast && (
              <Modal
                isOpen={addToast}
                toggle={() => setAddToast(false)}
                backdrop="static"
                scrollable={true}
                size="lg"
                centered
              >
                <ModalHeader
                  toggle={() => setAddToast(false)}
                  className="bg-light p-3"
                >
                  Add New Letterhead
                </ModalHeader>
                <ModalBody>
                  <AddNewTemplate
                    closeFormToast={() => setAddToast(false)}
                    refreshList={fetchTemplates}
                  />
                </ModalBody>
              </Modal>
            )}

            {editTemp && (
              <Modal
                isOpen={editTemp}
                toggle={() => setEditTemp(null)}
                backdrop="static"
                scrollable={true}
                size="lg"
                centered
              >
                <ModalHeader
                  toggle={() => setEditTemp(null)}
                  className="bg-light p-3"
                >
                  Edit New Letterhead
                </ModalHeader>
                <ModalBody>
                  <EditTemplate
                    refreshList={fetchTemplates}
                    closeForm={() => setEditTemp(null)}
                    file={editTemp}
                  />
                </ModalBody>
              </Modal>
            )}

            {openAlert && (
              <Modal
                isOpen={openAlert}
                toggle={() => setOpenAlert(false)}
                backdrop="static"
                scrollable={true}
                size="md"
                centered
              >
                <ModalHeader
                  toggle={() => setOpenAlert(false)}
                  className="bg-light p-3"
                >
                  Confirm Your Action
                </ModalHeader>
                <ModalBody>
                  <AlertPopup
                    heading="Confirm Your Action"
                    message="Are you sure you want to delete the record?"
                    btn1="No"
                    btn2="Yes"
                    closeForm={() => setOpenAlert(false)}
                    handleFunc={handleDelete}
                  />
                </ModalBody>
              </Modal>
            )}

            {loading && <LoadingPage />}
          </Card>
        </Container>
      </div>
    </Fragment>
  );
};

export default BaseTemplatePage;
