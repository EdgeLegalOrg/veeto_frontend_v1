import React, { useState } from "react";
import { v1 as uuidv1 } from "uuid";
import Dropzone from "react-dropzone";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import { TextInputField } from "pages/Edge/components/InputField";

const EditAttachment = (props) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setFileName(props?.selected?.name);
  }, [props.selected]);

  const handleClose = () => {
    if (props.close) {
      props.close();
    }
  };

  const handleEdit = () => {
    let inputData = new FormData();
    if (fileName) {
      let newData = {
        requestId: uuidv1(),
        data: {
          id: props?.selected?.id,
          name: fileName,
          staffId: props.staffId,
        },
      };
      inputData.append("staffAttachment", JSON.stringify(newData));
      inputData.append("attachment", uploadedFile);
      if (props.edit) {
        props.edit(inputData);
      }
    } else {
      setSubmitted(true);
      // toast.warning("Give file some name.");
    }
  };

  const handleUploadFile = (acceptedFile) => {
    setUploadedFile(acceptedFile[0]);
    let flname = acceptedFile?.[0]?.name?.split(".")?.slice(0, -1)?.join(".");
    setFileName(flname);
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (val) {
      val = val.replace(".", "");
    }
    setFileName(val);
  };

  return (
    <>
      {/* <CustomToastWindow
        closeForm={() => handleClose()}
        btn1={"Cancel"}
        btn2="Save"
        heading="Edit Attachment"
        handleFunc={handleEdit}
        autoClose={false}
        gridSize={"50%"}
        bodyStyle={{
          minHeight: "24vh",
        }}
      > */}
      <div className="mb-4">
        <div className="staff-attachDrop">
          <Dropzone onDrop={handleUploadFile}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({ className: "staff-dropzone" })}>
                <input {...getInputProps()} />
                <p style={{ paddingTop: "10px" }}>
                  Drag and drop to upload or browse for files
                </p>
                <span style={{ color: "#555", paddingTop: "10px" }}>
                  {fileName}
                </span>
              </div>
            )}
          </Dropzone>
        </div>
        {submitted && !uploadedFile && (
          <p className="mx-4 input-error">Please upload file</p>
        )}
        <div className="mx-4">
          <TextInputField
            label="File name"
            name="fileName"
            placeholder="File name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            required={true}
            invalid={submitted && !fileName ? true : false}
            invalidMessage={"File name is required"}
          />
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button
          className="mx-1"
          color="danger"
          onClick={() => handleClose()}
        >
          Cancel
        </Button>
        <Button
          className="mx-1"
          color="success"
          onClick={() => handleEdit()}
        >
          Update
        </Button>
      </div>
      {/* </CustomToastWindow> */}
    </>
  );
};

export default EditAttachment;
