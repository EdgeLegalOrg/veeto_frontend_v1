import fileDownload from "js-file-download";
import React, { Fragment, useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import { Input } from "reactstrap";
import { downloadContentAttachment } from "../../apis";
import "../../stylesheets/safeCustody.css";
import { returnFileIcon } from "../../utils/Icons";
import { convertSubstring, formatDateFunc } from "../../utils/utilFunc";
import PreviewScreen from "./PreviewScreen";
import TooltipWrapper from "../../../../Components/Common/TooltipWrapper";
import ImageViewer from "../ImageViewer/ImageViewer";

const Document = (props) => {
  const {
    data,
    setSelectedContent,
    selectedContent,
    selectedFilename,
    setSelectedFilename,
  } = props;

  const [attachList, setAttachList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewScreen, setPreviewScreen] = useState(false);
  const [showImageModal, setShowImageModal] = useState({
    show: false,
    fileName: "",
    image: "",
  });

  useEffect(() => {
    if (props.data) {
      sortAndSet(props.data);
    }
  }, [props.data]);

  const sortAndSet = (arg) => {
    let list =
      arg?.custodyPacketAttachments?.length > 0
        ? arg?.custodyPacketAttachments
        : [];

    if (list && list?.length > 0) {
      list = list.sort(
        (a, b) => new Date(b.dateReceived) - new Date(a.dateReceived)
      );
    }
    setAttachList(list);
  };

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

  const handleSelectAllContent = (event) => {
    if (event.target.checked) {
      const newSelectedId = data?.custodyPacketAttachments?.map(
        (row) => row.id
      );
      const newSelectedName = data?.custodyPacketAttachments?.map((row) => {
        let name = row.name.split(".");
        return `${name[0]}.${row.type}`;
      });
      setSelectedContent(newSelectedId);
      setSelectedFilename(newSelectedName);
      return;
    }
    setSelectedContent([]);
    setSelectedFilename([]);
  };

  // to check whether the property is selected or not
  const isContentSelected = (id) => selectedContent.indexOf(id) !== -1;

  const handleSingleDownload = (id, fileName, type) => {
    downloadContentAttachment(id)
      .then((res) => {
        const IMAGE_TYPES = ["image", "jpeg", "jpg", "png", "tif"];
        if (IMAGE_TYPES.includes(type?.toLowerCase())) {
          setShowImageModal({
            show: true,
            fileName,
            image: res.data,
          });
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

  const handleShowImageModal = () => {
    setShowImageModal({
      show: false,
      fileName: "",
      image: "",
    });
  };

  return (
    <Fragment>
      {attachList?.length === 0 ? (
        <tr style={{ textAlign: "center" }}>
          <td colSpan={5}>
            <p>No records to display</p>
          </td>
        </tr>
      ) : (
        <Fragment>
          {attachList?.map((d) => {
            if (d.dateOut === null) {
              return (
                <tr key={d.id}>
                  <td>
                    <Input
                      type="checkbox"
                      checked={isContentSelected(d.id)}
                      onChange={() =>
                        handleContentSelect(
                          d.id,
                          d.name.split(".")[0] + "." + d.type
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <img
                        src={returnFileIcon(d.type)}
                        alt={d.type}
                        width="30px"
                        height="30px"
                        className="pe-cursor"
                        onClick={() =>
                          handleSingleDownload(
                            d.id,
                            d.name.split(".")[0] + "." + d.type,
                            d.type
                          )
                        }
                      />

                      <label
                        className="mb-0 mx-2 pe-cursor underline"
                        onClick={() =>
                          handleSingleDownload(
                            d.id,
                            d.name.split(".")[0] + "." + d.type,
                            d.type
                          )
                        }
                      >
                        <TooltipWrapper
                          id={`doc-name-${d.id}`}
                          placement="bottom"
                          text={d.name}
                          content={convertSubstring(d.name, 47)}
                        ></TooltipWrapper>
                      </label>
                    </div>
                  </td>
                  <td>
                    <label>
                      {d.dateReceived ? formatDateFunc(d.dateReceived) : "date"}
                    </label>
                  </td>

                  <td>
                    <label>{d.uploadedBy}</label>
                  </td>
                  <td>
                    <label>
                      <TooltipWrapper
                        id={`comment-${d.id}`}
                        placement="bottom"
                        text={d.comments}
                        content={convertSubstring(d.comments, 47)}
                      ></TooltipWrapper>
                    </label>
                  </td>
                </tr>
              );
            }
          })}
        </Fragment>
      )}
      {previewScreen && (
        <PreviewScreen
          previewImage={previewImage}
          setPreviewScreen={setPreviewScreen}
        />
      )}
      {showImageModal.show && (
        <ImageViewer
          showModal={showImageModal.show}
          fileName={showImageModal.fileName}
          image={showImageModal.image}
          setShowModal={handleShowImageModal}
        />
      )}
    </Fragment>
  );
};

export default Document;
