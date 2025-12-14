import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Container,
  Card,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { AlertPopup } from "../customComponents/CustomComponents";
import { createPortal } from "react-dom";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";
import { TextInputField } from "../InputField";
import { archiveMatter } from "pages/Edge/apis";
import { toast } from "react-toastify";
import LoadingPage from "pages/Edge/utils/LoadingPage";

const ArchiveModal = forwardRef((props, ref) => {
  const [firstModal, setFirstModal] = useState(false);
  const [secondModal, setSecondModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [invalid, setInvalid] = useState({ archivedBy: false });
  const [archivedResp, setArchivedResp] = useState({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.data) {
      const user = JSON.parse(window.localStorage.getItem("userDetails"));
      setFormData({
        ...props.data,
        lastCorrespondenceDate:
          props?.data?.lastCorrespondenceDate || new Date(),
        archivedBy: `${user.firstName} ${user.lastName}`.trim(),
      });
    }
  }, [props.data]);

  useImperativeHandle(ref, () => ({
    openFundAlert() {
      setFirstModal(true);
    },
  }));

  const handleSubmit = async () => {
    if (formData.archivedBy) {
      try {
        setLoading(true);
        const { data } = await archiveMatter(formData);
        if (data.success) {
          toast.success("Matter archived successfully");
          props?.refresh(true);
          setArchivedResp(data.data);
          setTimeout(() => {
            setSuccessModal(true);
          }, 100);
        } else {
          toast.error("Something went wrong. Please try later.");
        }
      } catch (error) {
        toast.error("Something went wrong. Please try later.");
        console.error("error", error);
      } finally {
        setSecondModal(false);
        setLoading(false);
      }
    } else {
      setInvalid({ ...invalid, archivedBy: true });
    }
  };

  return (
    <>
      {createPortal(
        <Modal
          isOpen={firstModal}
          backdrop="static"
          scrollable={true}
          size="sm"
          centered
          toggle={() => setFirstModal(false)}
        >
          <ModalHeader
            toggle={() => setFirstModal(false)}
            className="bg-light p-3"
          >
            Archive Matter
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              message="Is there any funds in trust ?"
              closeForm={() => setFirstModal(false)}
              handleNoFunc={() => {
                setFirstModal(false);
                setTimeout(() => {
                  setSecondModal(true);
                }, 10);
              }}
              btn1={"No"}
              btn2="Yes"
              handleFunc={() => {
                setFirstModal(false);
              }}
            />
          </ModalBody>
        </Modal>,
        document.body
      )}
      {createPortal(
        <Modal
          isOpen={secondModal}
          backdrop="static"
          scrollable={true}
          size="sm"
          centered
          toggle={() => setSecondModal(false)}
        >
          <ModalHeader
            className="bg-light p-3"
            toggle={() => setSecondModal(false)}
          >
            Archive Matter
          </ModalHeader>
          <ModalBody>
            <div class="p-3">
              <TextInputField
                label="Archive Date"
                placeholder="Archive Date"
                value={formatDateFunc(new Date())}
                disabled={true}
              />
              <TextInputField
                label="Last Correspondence Date"
                type="date"
                name="lastCorrespondenceDate"
                value={formData.lastCorrespondenceDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastCorrespondenceDate: e.target.value,
                  })
                }
              />
              <TextInputField
                label="Archived by"
                value={formData.archivedBy || null}
                disabled={true}
              />

              <div className="d-flex align-items-center justify-content-end p-2 border-top">
                <Button
                  color="danger"
                  className="mx-1"
                  onClick={() => setSecondModal(false)}
                >
                  Cancel
                </Button>
                <Button color="success" className="mx-1" onClick={handleSubmit}>
                  Confirm
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>,
        document.body
      )}
      {createPortal(
        <Modal
          isOpen={successModal}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
          toggle={() => setSuccessModal(false)}
        >
          <ModalHeader
            className="bg-light p-3"
            toggle={() => setSecondModal(false)}
          >
            {`Matter #${formData.matterNumber} successfully archived!`}
          </ModalHeader>

          <ModalBody>
            <div class="p-3">
              <p class="fs-4  mt-1 mb-4">
                Archive number: #{archivedResp.archiveNumber}
              </p>

              <div className="d-flex align-items-center justify-content-end pt-2 border-top">
                <Button
                  color="success"
                  className="mx-1"
                  onClick={() => setSuccessModal(false)}
                >
                  Got it!
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>,
        document.body
      )}

      {loading && <LoadingPage />}
    </>
  );
});

export default ArchiveModal;
