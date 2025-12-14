import React, { Fragment, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PreviewScreen from "./PreviewScreen";
// import DownloadIcon from '@mui/icons-material/Download';
// import PreviewIcon from '@mui/icons-material/Preview';
import { returnFileIcon } from "../../utils/Icons";
import {
  getPreparedReceipt,
  downloadContentAttachment,
  downloadReceipt,
} from "../../apis";
import fileDownload from "js-file-download";
import "../../stylesheets/safeCustody.css";
import { convertSubstring, formatDateFunc } from "../../utils/utilFunc";
import { toast } from "react-toastify";
import { Button, Table } from "reactstrap";
import TooltipWrapper from "../../../../Components/Common/TooltipWrapper";

const ReceiptDocument = (props) => {
  const { data } = props;
  const [selected, setSelected] = useState("");
  const [isOpen, setIsOpen] = useState("");
  const [receiptAttachments, setReceiptAttachments] = useState([]);
  const [selectedContent, setSelectedContent] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewScreen, setPreviewScreen] = useState(false);

  const handleContentSelect = (id, fileName) => {
    const selectedIndex = selectedContent.indexOf(id);
    let newSelected = [];
    let newSelectedFilename = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedContent, id);
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename,
        fileName
      );
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedContent.slice(1));
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename.slice(1)
      );
    } else if (selectedIndex === selectedContent?.length - 1) {
      newSelected = newSelected.concat(selectedContent.slice(0, -1));
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename.slice(0, -1)
      );
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedContent.slice(0, selectedIndex),
        selectedContent.slice(selectedIndex + 1)
      );
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename.slice(0, selectedIndex),
        selectedFilename.slice(selectedIndex + 1)
      );
    }
    setSelectedContent(newSelected);
    setSelectedFilename(newSelectedFilename);
  };

  const isContentSelected = (id) => selectedContent.indexOf(id) !== -1;

  const handleShowAttachments = async (id) => {
    try {
      const res = await getPreparedReceipt(id);
      setReceiptAttachments(res.data.data.custodyPacketAttachmentList);
      setIsOpen(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSingleDownload = (id, fileName, type) => {
    downloadContentAttachment(id)
      .then((res) => {
        if (
          type === "image" ||
          type === "jpeg" ||
          type === "jpg" ||
          type === "png" ||
          type === "tif"
        ) {
          setPreviewImage(URL.createObjectURL(res.data));
          setPreviewScreen(true);
        } else {
          fileDownload(res.data, fileName);
        }

        setSelectedContent([]);
        setSelectedFilename([]);
      })
      .catch((e) => {
        toast.error("Some error occured in downloading the file.");
        console.error(e);
      });
  };

  const handleDownloadReceipt = (id, fileName) => {
    downloadReceipt(id)
      .then((res) => {
        fileDownload(res.data, fileName);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handlePreviewReceipt = (id) => {
    downloadReceipt(id)
      .then((res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        //Build a URL from the file
        const fileURL = URL.createObjectURL(file);
        //Open the URL on new Window
        const pdfWindow = window.open();
        pdfWindow.location.href = fileURL;
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <div className="receiptParent-div">
      {data?.map((d, idx) => (
        <Fragment key={idx}>
          <div className="receiptBundle border-bottom">
            <p
              onClick={() =>
                isOpen === "" || isOpen !== d.id
                  ? handleShowAttachments(d.id)
                  : setIsOpen("")
              }
              className="labelCursor mb-0"
            >{`Receipt  id ${d.id}`}</p>
            <div className="receiptBtn-div">
              <Button
                onClick={() =>
                  handleDownloadReceipt(d.id, `receipt-${d.id}.pdf`)
                }
                color="success"
              >
                Download
              </Button>
              <Button
                onClick={() => handlePreviewReceipt(d.id)}
                color="success"
              >
                Preview
              </Button>
              <Button
                color="warning"
                onClick={() =>
                  isOpen === "" || isOpen !== d.id
                    ? handleShowAttachments(d.id)
                    : setIsOpen("")
                }
                size="sm"
              >
                {isOpen === d.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Button>
            </div>
          </div>
          {isOpen === d.id && (
            <div className="">
              <Table responsive={true} striped={true} hover={true}>
                <thead className="mb-2">
                  <tr>
                    <th>
                      <label className="receiptLabel">Document Name</label>
                    </th>
                    <th>
                      <label className="receiptLabel">Date Received</label>
                    </th>

                    <th>
                      <label className="receiptLabel">Uploaded By</label>
                    </th>
                    <th>
                      <label className="receiptLabel">Date Uplifted</label>
                    </th>
                    <th>
                      <label className="receiptLabel">Uplifted By</label>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receiptAttachments?.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        <p>No records to display</p>
                      </td>
                    </tr>
                  ) : (
                    <Fragment>
                      {receiptAttachments?.map((attachment, i) => (
                        <tr
                          style={{
                            padding: "10px 0",
                          }}
                          key={i}
                        >
                          <td>
                            <div className="document-nameDiv">
                              <img
                                src={returnFileIcon(attachment.type)}
                                alt={d.type}
                                width="30px"
                                height="30px"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleSingleDownload(
                                    attachment.id,
                                    attachment.name.split(".")[0] +
                                      "." +
                                      attachment.type,
                                    attachment.type
                                  )
                                }
                              />

                              <label
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleSingleDownload(
                                    attachment.id,
                                    attachment.name.split(".")[0] +
                                      "." +
                                      attachment.type,
                                    attachment.type
                                  )
                                }
                              >
                                <TooltipWrapper
                                  id={`doc-name-${attachment.id}`}
                                  placement="bottom"
                                  text={attachment.name}
                                  content={convertSubstring(
                                    attachment.name,
                                    100
                                  )}
                                ></TooltipWrapper>
                              </label>
                            </div>
                          </td>
                          <td>
                            <label>
                              {attachment.dateReceived
                                ? formatDateFunc(attachment.dateReceived)
                                : "date"}
                            </label>
                          </td>

                          <td>
                            <label>
                              <TooltipWrapper
                                id={`uploaded-by-${attachment.id}`}
                                placement="bottom"
                                text={attachment.uploadedBy}
                                content={convertSubstring(
                                  attachment.uploadedBy,
                                  20
                                )}
                              ></TooltipWrapper>
                            </label>
                          </td>
                          <td>
                            <label>
                              {attachment.dateOut
                                ? formatDateFunc(attachment.dateOut)
                                : "date"}
                            </label>
                          </td>
                          <td>
                            <label>{attachment.deliveredTo}</label>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Fragment>
      ))}
      {previewScreen && (
        <PreviewScreen
          previewImage={previewImage}
          setPreviewScreen={setPreviewScreen}
        />
      )}
    </div>
  );
};

export default ReceiptDocument;
