import React, { useState, useEffect, Fragment } from "react";
import { Table, Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { FiEdit2 } from "react-icons/fi";
import { getXeroSetting, updateXeroSetting } from "../../../apis";
import { TextInputField } from "pages/Edge/components/InputField";
import LoadingPage from "pages/Edge/utils/LoadingPage";
import { toast } from "react-toastify";

const initialData = {
  xeroSolicitorId: "",
  xeroAccountId: "",
  xeroOfficeId: "",
};

const XeroSetting = ({ siteInfo, refresh }) => {
  const [xeroDetail, setXeroDetail] = useState(initialData);
  const [formData, setFormData] = useState(initialData);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await getXeroSetting();
      if (data && data.success && data.data) {
        const details = {
          xeroSolicitorId: data.data.xeroSolicitorId || "",
          xeroAccountId: data.data.xeroAccountId || "",
          xeroOfficeId: data.data.xeroOfficeId || "",
        };
        setXeroDetail(details);
        setFormData(details);
      }
    } catch (error) {
      console.error("Error fetching Xero settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [siteInfo?.siteId]);

  const handleOpenEdit = () => {
    setFormData(xeroDetail);
    setShowEdit(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data } = await updateXeroSetting(formData);
      if (data && data.success) {
        toast.success("Xero settings updated successfully");
        setXeroDetail(formData);
        if (refresh) refresh();
        setShowEdit(false);
      } else {
        const msg = data?.error?.message || "Failed to update Xero settings";
        toast.error(msg);
      }
    } catch (error) {
      console.error("Error updating Xero settings:", error);
      toast.error("Something went wrong, please try later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="bg-light d-flex align-items-center justify-content-between p-2">
        <h5 className="mb-0">Xero Settings</h5>
        <div className="d-flex">
          <Button
            className="mx-1 d-flex align-items-center"
            onClick={handleOpenEdit}
            color="warning"
          >
            <span className="plusdiv">
              <FiEdit2 />
            </span>
            Edit
          </Button>
        </div>
      </div>

      <Table responsive striped hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: "35%" }}>Setting Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="fw-medium text-dark">Xero Solicitor ID</td>
            <td>
              {xeroDetail.xeroSolicitorId ? (
                <span className="text-secondary">{xeroDetail.xeroSolicitorId}</span>
              ) : (
                <span className="text-muted fst-italic">Not configured</span>
              )}
            </td>
          </tr>
          <tr>
            <td className="fw-medium text-dark">Xero Account ID</td>
            <td>
              {xeroDetail.xeroAccountId ? (
                <span className="text-secondary">{xeroDetail.xeroAccountId}</span>
              ) : (
                <span className="text-muted fst-italic">Not configured</span>
              )}
            </td>
          </tr>
          <tr>
            <td className="fw-medium text-dark">Xero Office ID</td>
            <td>
              {xeroDetail.xeroOfficeId ? (
                <span className="text-secondary">{xeroDetail.xeroOfficeId}</span>
              ) : (
                <span className="text-muted fst-italic">Not configured</span>
              )}
            </td>
          </tr>
        </tbody>
      </Table>

      {showEdit && (
        <Modal
          isOpen={showEdit}
          toggle={() => setShowEdit(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setShowEdit(false)}
            className="bg-light p-3"
          >
            Edit Xero Settings
          </ModalHeader>
          <ModalBody>
            <div className="row">
              <div className="col-md-12 mb-3">
                <TextInputField
                  name="xeroSolicitorId"
                  label="Xero Solicitor ID"
                  placeholder="Enter Xero Solicitor ID"
                  value={formData.xeroSolicitorId}
                  onChange={handleFormChange}
                />
              </div>

              <div className="col-md-12 mb-3">
                <TextInputField
                  name="xeroAccountId"
                  label="Xero Account ID"
                  placeholder="Enter Xero Account ID"
                  value={formData.xeroAccountId}
                  onChange={handleFormChange}
                />
              </div>

              <div className="col-md-12 mb-3">
                <TextInputField
                  name="xeroOfficeId"
                  label="Xero Office ID"
                  placeholder="Enter Xero Office ID"
                  value={formData.xeroOfficeId}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-end p-2 border-top mt-3">
              <Button
                color="danger"
                className="mx-1"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </Button>
              <Button color="success" className="mx-1" onClick={handleUpdate}>
                Save
              </Button>
            </div>
          </ModalBody>
        </Modal>
      )}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default XeroSetting;
