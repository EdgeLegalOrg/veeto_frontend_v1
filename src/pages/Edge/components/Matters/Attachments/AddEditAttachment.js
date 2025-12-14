import React, { Fragment, useState, useEffect } from "react";
import { Button } from "reactstrap";
import { v1 as uuidv1 } from "uuid";
import Dropzone from "react-dropzone";
import { editMatterAttach, uploadMatterAttach } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { toast } from "react-toastify";
import { TextInputField } from "pages/Edge/components/InputField";

const AddAttachment = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isEditing = props.mode === "edit" ? true : false;

  useEffect(() => {
    if (props.mode === "edit") {
      setFormData([{ ...props.editState }]);
      setUploadedFiles([{ name: props.editState.name }]);
    }
  }, [props.editState]);

  const handleClose = () => {
    if (props.closeForm) {
      props.closeForm();
    }
  };

  const handleSubmit = async () => {
    if (uploadedFiles && uploadedFiles.length > 0) {
      setLoading(true);

      let count = 0;
      let size = uploadedFiles.length;

      for (let i = 0; i < size; i++) {
        count += 1;
        const temp = { ...formData[i] };
        if (temp?.name) {
          try {
            let inputData = new FormData();
            let dataInput = {
              requestId: uuidv1(),
              data: {
                ...(isEditing
                  ? { id: formData[i].id, name: formData[i].name }
                  : { name: formData[i].name }),
                matterId: props.matterId,
              },
            };
            inputData.append("matterAttachment", JSON.stringify(dataInput));
            if (uploadedFiles[i].path) {
              inputData.append("attachment", uploadedFiles[i]);
            } else {
              inputData.append("attachment", null);
            }

            const { data } = await (isEditing
              ? editMatterAttach(inputData)
              : uploadMatterAttach(inputData));

            if (!data.success) {
              let arr1 = uploadedFiles.slice(i + 1, uploadedFiles.length);
              let arr2 = formData.slice(i + 1, formData.length);
              toast.error(
                `${temp.name} could not be uploaded, please try again later.`
              );
              setUploadedFiles(arr1);
              setFormData(arr2);
            } else {
              let arr1 = uploadedFiles.slice(i + 1, uploadedFiles.length);
              let arr2 = formData.slice(i + 1, formData.length);
              setUploadedFiles(arr1);
              setFormData(arr2);
            }
          } catch (error) {
            toast.error(
              `${temp.name} could not be uploaded, please try again later.`
            );
            console.error(error);
            let arr1 = uploadedFiles.slice(i + 1, uploadedFiles.length);
            let arr2 = formData.slice(i + 1, formData.length);
            setUploadedFiles(arr1);
            setFormData(arr2);
          }
        } else {
          toast.warning("Filename is required !");
        }
        if (count === size) {
          props.refresh();
          setUploadedFiles([]);
          setFormData([]);

          setTimeout(() => {
            handleClose();
            setLoading(false);
          }, 10);

          return;
        }
      }
    } else {
      setSubmitted(true);
    }
  };

  const handleUploadFile = (acceptedFile) => {
    setLoading(true);
    if (acceptedFile.length) {
      if (isEditing) {
        setUploadedFiles(acceptedFile);
      } else {
        setUploadedFiles([...uploadedFiles, ...acceptedFile]);

        let arr = [...formData];
        acceptedFile.forEach((file) => {
          let filename = file.name;
          arr.push({
            name: filename.split(".").slice(0, -1).join("."),
          });
        });
        setFormData(arr);
      }
    }
    setLoading(false);
  };

  const handleFormChange = (e, ind) => {
    const { name, value } = e.target;
    let data = [...formData];
    data[ind] = {
      ...formData[ind],
      [name]: value,
    };
    setFormData(data);
  };

  return (
    <Fragment>
      <div>
        <div
          className="staff-attachDrop"
          style={{ margin: "0 10px", marginBottom: "5px" }}
        >
          <Dropzone
            onDrop={handleUploadFile}
            multiple={props.mode === "edit" ? false : true}
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({ className: "staff-dropzone" })}>
                <input
                  {...getInputProps()}
                  style={{
                    display: "none",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                />
                <p style={{ paddingTop: "10px" }}>
                  Drag and drop to upload or browse for files
                </p>
                <div>
                  {uploadedFiles.length > 1 ? (
                    <>
                      {uploadedFiles.slice(0, 1).map((file, i) => (
                        <span
                          style={{
                            color: "#555",
                            padding: "2px",
                            margin: "0",
                          }}
                          key={i}
                        >
                          {file.name}
                        </span>
                      ))}
                      <span
                        style={{ color: "#555", padding: "2px", margin: "0" }}
                      >
                        +{uploadedFiles.length - 1} more
                      </span>
                    </>
                  ) : (
                    uploadedFiles.map((file, i) => (
                      <span
                        style={{ color: "#555", padding: "2px", margin: "0" }}
                        key={i}
                      >
                        {file.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </Dropzone>
        </div>
        {!uploadedFiles?.length && submitted && (
          <span className="input-error" style={{ margin: "10px" }}>
            Please select a file
          </span>
        )}
        <div className="staff-attachName">
          {formData.map((file, i) => (
            <div
              className="d-flex align-items-center"
              key={`${file.name}_${i}`}
            >
              <span className="mx-1">{`${i + 1}.`}</span>
              <TextInputField
                name="name"
                label="File name"
                value={file.name}
                onChange={(e) => handleFormChange(e, i)}
                required={true}
                invalid={submitted && !file.name}
                invalidMessage={"File name is required"}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="row mt-4">
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            type="button"
            color="light"
            onClick={handleClose}
            className="mx-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="success"
            onClick={handleSubmit}
            className="mx-1"
          >
            {props.mode === "edit" ? "Edit" : "Save"}
          </Button>
        </div>
      </div>
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default AddAttachment;
