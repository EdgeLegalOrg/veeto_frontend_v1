import React, { useState, useEffect, Fragment } from "react";
import { Table, Button, Input } from "reactstrap";
import { convertSubstring, formatDateFunc } from "../../../utils/utilFunc";
import { returnFileIcon } from "../../../utils/Icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import fileDownload from "js-file-download";
import { downloadStaffAttach } from "../../../apis";
import { toast } from "react-toastify";
import TooltipWrapper from "../../../../../Components/Common/TooltipWrapper";

const AttachmentSection = (props) => {
  const [attachList, setAttachList] = useState([]);
  const [selectedAttach, setSelectedAttach] = useState([]);

  useEffect(() => {
    if (props?.selectedAttach?.length === 0) {
      setSelectedAttach([]);
    }
  }, [props.selectedAttach]);

  useEffect(() => {
    setAttachList(props?.details?.staffAttachments);
  }, [props.details]);

  const handleOpenAdd = () => {
    if (props.setShowAttach) {
      props.setShowAttach(true);
    }
  };

  const handleAttachSelect = (id) => {
    const selectedIndex = selectedAttach.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedAttach, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedAttach.slice(1));
    } else if (selectedIndex === selectedAttach?.length - 1) {
      newSelected = newSelected.concat(selectedAttach.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedAttach.slice(0, selectedIndex),
        selectedAttach.slice(selectedIndex + 1)
      );
    }
    setSelectedAttach(newSelected);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelecteds = attachList?.map((row) => row.id);
      setSelectedAttach(newSelecteds);
      return;
    }
    setSelectedAttach([]);
  };

  const isSelected = (id) => selectedAttach.indexOf(id) !== -1;

  const handleDelete = () => {
    if (selectedAttach?.length) {
      if (props.handleDelete) {
        props.handleDelete(selectedAttach);
      }
    } else {
      toast.warning("Please select some file.");
    }
  };

  const handleEdit = () => {
    if (selectedAttach?.length === 0) {
      toast.warning("Please select the file.");
    } else {
      if (selectedAttach?.length > 1) {
        toast.warning("Please select one file at a time.");
      } else {
        if (props.handleEdit) {
          let data = attachList.filter((d) => d.id === selectedAttach[0]);
          if (data && data?.length) {
            props.handleEdit(data[0]);
          }
        }
      }
    }
  };

  const handleDownload = (d) => {
    let rval = [];
    rval.push(d.name);

    if (d.type) {
      rval.push(d.type);
    }

    downloadStaffAttach(d.id).then((res) => {
      fileDownload(res.data, rval.join("."));
    });
  };

  return (
    <Fragment>
      <div className="bg-light d-flex align-items-center justify-content-between p-2">
        <h5 className="mb-0">Attachments</h5>
        <div className="d-flex">
          <Button
            className="d-flex mx-1"
            onClick={handleOpenAdd}
            color="success"
          >
            <span className="plusdiv">+</span> Add
          </Button>
          <Button className="d-flex mx-1" onClick={handleDelete} color="danger">
            <span className="plusdiv">-</span> Delete
          </Button>
          <Button className="d-flex mx-1" onClick={handleEdit} color="warning">
            Edit
          </Button>
        </div>
        {/* <button className='custodyAddbtn'>Download</button> */}
      </div>

      <Table responsive={true} striped={true} hover={true}>
        <thead className="mb-2">
          <tr>
            <th>
              <Input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  attachList?.length > 0 &&
                  selectedAttach?.length === attachList?.length
                }
              />
            </th>
            <th>
              <p>Document Name</p>
            </th>
            <th>
              <p>Date Received</p>
            </th>
            <th>
              <p>Uploaded By</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {attachList.map((a) => (
            <tr key={a.id} className="pe-cursor">
              <td onClick={(e) => e.stopPropagation()}>
                <Input
                  type="checkbox"
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleAttachSelect(a.id)}
                  checked={isSelected(a.id)}
                />
              </td>
              <td
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(a);
                }}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={returnFileIcon(a.type)}
                    alt={a.type}
                    width="30px"
                    height="30px"
                    className="mx-1"
                  />
                  {/* <OverlayTrigger
                    key="bottom"
                    placement="bottom-start"
                    overlay={
                      <Tooltip id={`tooltip-bottom`}>
                        <p className="mb-0">{a.name ? a.name : ""}</p>
                      </Tooltip>
                    }
                  > */}
                  <p className="mb-0">
                    <TooltipWrapper
                      id={`name-${a.id}`}
                      placement="bottom"
                      text={a.name}
                      content={convertSubstring(a.name, 25)}
                    ></TooltipWrapper>
                  </p>
                  {/* </OverlayTrigger> */}
                </div>
              </td>
              <td>
                <p className="mb-0">
                  {a.uploadDate ? formatDateFunc(a.uploadDate) : ""}
                </p>
              </td>
              <td>
                <p className="mb-0">{a.uploadedBy ?? ""}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="staff-attachTable" style={{ display: "none" }}>
        <div className="staff-attachHeader staff-attach-container">
          <div className="staff-col sm">
            <Input
              type="checkbox"
              onChange={handleSelectAll}
              checked={
                attachList?.length > 0 &&
                selectedAttach?.length === attachList?.length
              }
            />
          </div>
          <div className="staff-col lg">
            <p>Document Name</p>
          </div>
          <div className="staff-col md">
            <p>Date Received</p>
          </div>
          <div className="staff-col lg">
            <p>Uploaded By</p>
          </div>
          {/* <div className='staff-col lg'>
            <p>Comments</p>
          </div> */}
        </div>
        <div>
          {attachList.map((a) => (
            <div
              className="staff-attach-rowSec staff-attach-container pe-cursor"
              key={a.id}
            >
              <div
                className="staff-col sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  type="checkbox"
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleAttachSelect(a.id)}
                  checked={isSelected(a.id)}
                />
              </div>
              <div
                className="staff-col lg staff-attach-name"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(a);
                }}
              >
                <img
                  src={returnFileIcon(a.type)}
                  alt={a.type}
                  width="30px"
                  height="30px"
                />
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      {a.name ? a.name : ""}
                    </Tooltip>
                  }
                >
                  <p>{convertSubstring(a.name, 25)}</p>
                </OverlayTrigger>
              </div>
              <div className="staff-col md">
                <p>{a.uploadDate ? formatDateFunc(a.uploadDate) : ""}</p>
              </div>
              <div className="staff-col lg">
                <p>{a.uploadedBy ?? ""}</p>
              </div>
              {/* <div className='staff-col lg'>
                <p>Comments</p>
              </div> */}
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default AttachmentSection;
