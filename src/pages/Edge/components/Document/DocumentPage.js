import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import fileDownload from "js-file-download";
import LoadingPage from "../../utils/LoadingPage";
import {
  deleteDocAttach,
  getDocuments,
  downloadDocAttach,
  getDocDetail,
} from "../../apis";
import { returnFileIcon } from "../../utils/Icons";
import UploadDocument from "./UploadDocument";
import DocumentDetail from "./DocumentDetail";
import Pagination from "../Pagination";
import { AlertPopup } from "../customComponents/CustomComponents";
import "../../stylesheets/DocumentPage.css";
import { convertSubstring, formatDateFunc } from "../../utils/utilFunc";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
} from "reactstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import ImageViewer from "../ImageViewer/ImageViewer";
import { toast } from "react-toastify";
// Actions
import { resetCurrentRouterState } from "../../../../slices/thunks.js";

const initialFilter = {
  pageNo: 0,
  pageSize: 25,
};

const DocumentPage = () => {
  document.title = "Document | EdgeLegal";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRouterState, navigationEditForm } = useSelector(
    (state) => state.Layout
  );
  const [documentList, setDocumentList] = useState([]);
  const [filterInput, setFilterInput] = useState(initialFilter);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState([]);
  const [openAddDoc, setOpenAddDoc] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [docId, setDocId] = useState("");
  const [docDetails, setDocDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState({
    show: false,
    fileName: "",
    image: "",
  });

  const fetchDocumentList = async () => {
    try {
      setLoading(true);
      const { data } = await getDocuments(filterInput);
      if (data.success) {
        setDocumentList(data?.data?.documentList);
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
    if (currentRouterState) {
      setDocId("");
      dispatch(resetCurrentRouterState());
    }
  }, [currentRouterState]);

  useEffect(() => {
    fetchDocumentList();
  }, []);

  useEffect(() => {
    if (navigationEditForm.isEditMode) {
      fetchDocDetails(navigationEditForm.editFormValue.id);
    }
  }, [navigationEditForm]);

  const handleOpenPopup = () => {
    setOpenAddDoc(true);
  };

  const handleClosePopup = () => {
    setOpenAddDoc(false);
  };

  const handleSelect = (id, fileName) => {
    const selectedIndex = selectedDoc.indexOf(id);
    let newSelected = [];
    let newSelectedFilename = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedDoc, id);
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename,
        fileName
      );
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedDoc.slice(1));
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename.slice(1)
      );
    } else if (selectedIndex === selectedDoc.length - 1) {
      newSelected = newSelected.concat(selectedDoc.slice(0, -1));
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename.slice(0, -1)
      );
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedDoc.slice(0, selectedIndex),
        selectedDoc.slice(selectedIndex + 1)
      );
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename.slice(0, selectedIndex),
        selectedFilename.slice(selectedIndex + 1)
      );
    }
    setSelectedDoc(newSelected);
    setSelectedFilename(newSelectedFilename);
  };

  const handleSelectAll = (e) => {
    let newSelectedId = [];

    if (e.target.checked) {
      documentList.forEach((doc) => newSelectedId.push(doc.id));
    }
    setSelectedDoc(newSelectedId);
  };

  const isSelected = (id) => selectedDoc.indexOf(id) !== -1;

  const handleCheckAlert = () => {
    if (selectedDoc.length > 0) {
      setOpenAlert(true);
    } else {
      toast.warning("Select atleast one document.");
    }
  };

  const handleDeleteDoc = async () => {
    let ids = selectedDoc.join(", ");
    try {
      setLoading(true);
      const { data } = await deleteDocAttach(ids);
      if (data.success) {
        setSelectedDoc([]);
        setSelectedFilename([]);
        fetchDocumentList();
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

  const handleDownloadDocWithBtn = () => {
    if (selectedDoc.length !== 0) {
      const ids = selectedDoc.join(",");
      setLoading(true);
      if (selectedDoc.length > 1) {
        downloadDocAttach(ids)
          .then((res) => {
            fileDownload(res.data, "documents.zip");
            setLoading(false);
          })
          .catch((error) => {
            console.error(error);
            toast.error("Some error occured, please check console.");
            setLoading(false);
          });
      } else {
        downloadDocAttach(ids)
          .then((res) => {
            fileDownload(res.data, selectedFilename[0]);
            setLoading(false);
          })
          .catch((error) => {
            console.error(error);
            toast.error("Some error occured, please check console.");
            setLoading(false);
          });
      }
    } else {
      toast.warning("Select document");
    }
  };

  const handleDownloadWithLink = (id, fileName) => {
    const extName = fileName?.split(".")?.pop();
    const IMAGE_TYPES = ["jpg", "png", "jpeg"];
    setLoading(true);
    downloadDocAttach(id)
      .then((res) => {
        setLoading(false);
        if (IMAGE_TYPES.includes(extName?.toLowerCase())) {
          return setShowImageModal({
            show: true,
            fileName,
            image: res.data,
          });
        }
        fileDownload(res.data, fileName);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Some error occured, please check console.");
        setLoading(false);
      });
  };

  const handleRefresh = async (filters = filterInput) => {
    setLoading(true);
    setFilterInput({ ...filterInput, ...filters });
    try {
      setLoading(true);
      const { data } = await getDocuments(filterInput);
      if (data.success) {
        setDocumentList(data?.data?.documentList);
        setTotalPages(data.metadata.page.totalPages);
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

  const fetchDocDetails = async (id) => {
    setLoading(true);
    try {
      const { data } = await getDocDetail(id);
      if (data.success) {
        setDocDetails(data.data);
        setDocId(id);
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

  const handleOpenDoc = (id) => {
    fetchDocDetails(id);
  };

  const handleShowImageModal = () => {
    setShowImageModal({
      show: false,
      fileName: "",
      image: "",
    });
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Document" pageTitle="Documents" />
          <Card>
            {docId === "" ? (
              <Fragment>
                <CardHeader className="border-0">
                  <div className="d-md-flex align-items-center">
                    <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                      Document
                    </h5>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-2 flex-wrap">
                        <Button color="success" onClick={handleOpenPopup}>
                          + Add
                        </Button>
                        <Button color="danger" onClick={handleCheckAlert}>
                          Delete
                        </Button>
                        <Button
                          color="success"
                          onClick={handleDownloadDocWithBtn}
                        >
                          Download
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            if (navigationEditForm.isEditMode) {
                              return navigate(-1);
                            }
                            setDocDetails({});
                            setDocId("");
                          }}
                          color="warning"
                          className="mx-1"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <div>
                  <Table responsive={true} striped={true} hover={true}>
                    <thead className="table-light">
                      <tr>
                        <th>
                          <Input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={
                              documentList.length > 0 &&
                              selectedDoc.length === documentList.length
                            }
                          />
                        </th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Created On</th>
                        <th>Created By</th>
                        <th>Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentList?.map((doc) => (
                        <tr key={doc?.id} className="pe-cursor">
                          <td>
                            <Input
                              type="checkbox"
                              onChange={() =>
                                handleSelect(
                                  doc?.id,
                                  `${doc?.name}${
                                    doc?.type ? `.${doc?.type}` : ""
                                  }`
                                )
                              }
                              checked={isSelected(doc?.id)}
                            />
                          </td>
                          <td>
                            <div className="document-largeRowDiv">
                              <img
                                src={returnFileIcon(doc?.type)}
                                alt="file"
                                className="document-fileIcon pe-cursor"
                              />
                              <p
                                className="mb-0 mx-2 pe-cursor underline"
                                onClick={() =>
                                  handleDownloadWithLink(
                                    doc?.id,
                                    `${doc?.name}${
                                      doc?.type ? `.${doc?.type}` : ""
                                    }`
                                  )
                                }
                              >
                                {doc?.name ? doc?.name : "name"}
                              </p>
                            </div>
                          </td>
                          <td onClick={() => handleOpenDoc(doc?.id)}>
                            <p className="mb-0">
                              {doc?.status ? doc?.status : "status"}
                            </p>
                          </td>
                          <td onClick={() => handleOpenDoc(doc?.id)}>
                            <p className="mb-0">
                              {doc?.createdDate
                                ? formatDateFunc(doc?.createdDate)
                                : "Date"}
                            </p>
                          </td>
                          <td onClick={() => handleOpenDoc(doc?.id)}>
                            <p className="mb-0">
                              {doc?.createdBy ? doc?.createdBy : "createdBy"}
                            </p>
                          </td>
                          <td onClick={() => handleOpenDoc(doc?.id)}>
                            {/* <p>{doc.comments}</p> */}
                            <p className="mb-0">
                              <OverlayTrigger
                                key="bottom"
                                placement="bottom-start"
                                overlay={
                                  <Tooltip id={`tooltip-bottom`}>
                                    <p
                                      className="mb-0"
                                      style={{ textAlign: "left" }}
                                    >
                                      {doc?.comments ? doc?.comments : ""}
                                    </p>
                                  </Tooltip>
                                }
                              >
                                <p className="mb-0">
                                  {convertSubstring(doc?.comments, 47)}
                                </p>
                              </OverlayTrigger>
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <CardBody>
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
                        handleFunc={handleDeleteDoc}
                      />
                    </ModalBody>
                  </Modal>
                )}
                {openAddDoc && (
                  <Modal
                    isOpen={openAddDoc}
                    toggle={() => handleClosePopup()}
                    backdrop="static"
                    scrollable={true}
                    size="lg"
                    centered
                  >
                    <ModalHeader
                      toggle={() => handleClosePopup()}
                      className="bg-light p-3"
                    >
                      Upload Document
                    </ModalHeader>
                    <ModalBody>
                      <UploadDocument
                        closeForm={handleClosePopup}
                        refreshList={fetchDocumentList}
                      />
                    </ModalBody>
                  </Modal>
                )}
              </Fragment>
            ) : (
              <DocumentDetail
                docDetails={docDetails}
                setDocId={setDocId}
                handleOpenDoc={handleOpenDoc}
                fetchDocumentList={fetchDocumentList}
                fetchDocDetails={fetchDocDetails}
                handleDownloadWithLink={handleDownloadWithLink}
              />
            )}
            {loading && <LoadingPage />}
            {showImageModal.show && (
              <ImageViewer
                showModal={showImageModal.show}
                fileName={showImageModal.fileName}
                image={showImageModal.image}
                setShowModal={handleShowImageModal}
              />
            )}
          </Card>
        </Container>
      </div>
    </Fragment>
  );
};

export default DocumentPage;
