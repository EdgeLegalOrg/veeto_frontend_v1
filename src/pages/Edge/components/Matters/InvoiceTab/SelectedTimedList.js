import { toast } from "react-toastify";
import React, { useEffect, useRef, useState } from "react";
import { Table, Button, Modal, ModalHeader, ModalBody, Spinner } from "reactstrap";
import { AiOutlineClose } from "react-icons/ai";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";
import { allStaffMemberAndAccountInfoStaff, getServiceLine, getMatterDetail } from "pages/Edge/apis";
import EditTimeBilling from "../TimeBilling/EditTimeBilling";
import { AlertPopup } from "../../customComponents/CustomComponents";

const SelectedTimedList = (props) => {
  const [list, setList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loadingEditor, setLoadingEditor] = useState(false);
  const openingEditor = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const [serviceLineList, setServiceLineList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [formStatus, setFormStatus] = useState({ isFormChanged: false, isShowModal: false });

  useEffect(() => {
    if (props.selectedList && props.selectedList.length) {
      const sorted = [...props.selectedList].sort(
        (a, b) => new Date(a.billingDate || 0) - new Date(b.billingDate || 0) || (a.id || 0) - (b.id || 0),
      );
      setList(sorted);
    } else {
      setList([]);
    }
  }, [props.selectedList]);

  const handleEditRow = async (item) => {
    if (props.disabled || openingEditor.current) return;
    openingEditor.current = true;
    setLoadingEditor(true);
    try {
      // Use the same hourly option shape as the main Time Billing editor. Both
      // dependencies must be available before presenting an editable form.
      const [services, staff] = await Promise.all([getServiceLine(), allStaffMemberAndAccountInfoStaff()]);
      if (!mounted.current) return;
      if (!services.data?.success || !staff.data?.success) throw new Error("Editor options are unavailable");
      setServiceLineList((services.data.data?.serviceLineList || [])
        .filter((line) => line.billingFrequency === "HOURLY")
        .map((line) => ({ display: line.serviceLineTitle, value: line.id, raw: line })));
      setStaffList((staff.data.data?.staffMemberList || [])
        .filter((member) => member.staffActive)
        .map((member) => ({
          display: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
          value: member.id,
          active: member.staffActive,
        })));
      setFormStatus({ isFormChanged: false, isShowModal: false });
      setEditingItem(item);
    } catch (error) {
      if (mounted.current) toast.warning("Unable to load time-billing options. Please try again.");
    } finally {
      openingEditor.current = false;
      if (mounted.current) setLoadingEditor(false);
    }
  };

  const handleEditSaved = async (updatedItem) => {
    // PUT returns no updated record. Reload server-calculated totals and the new
    // checksum before replacing the selected invoice row; never reuse submitted totals.
    const response = await getMatterDetail(updatedItem.matterId);
    const savedItem = response.data?.data?.timeBillingList?.find((item) => item.id === updatedItem.id);
    if (!response.data?.success || !savedItem) throw new Error("Saved entry could not be refreshed");
    if (!mounted.current) return;
    const updatedList = list.map((item) => (item.id === savedItem.id ? { ...item, ...savedItem } : item));
    setList(updatedList);
    props.onChange?.("timeBillingList", updatedList);
  };

  const closeEditModal = (force = false) => {
    const isForced = force === true;
    if (formStatus.isFormChanged && !isForced) {
      setFormStatus((prev) => ({ ...prev, isShowModal: true }));
      return;
    }
    setFormStatus({ isFormChanged: false, isShowModal: false });
    setEditingItem(null);
  };

  const handleDelete = (e, arg) => {
    e.stopPropagation();

    let arr = list.filter((s) => s.id !== arg.id);

    setTimeout(() => {
      setList(arr);
    }, 10);

    if (props.onChange) {
      props.onChange("timeBillingList", arr);
    }
  };

  const ui = () => {
    if (list && list.length > 0) {
      return (
        <div>
          <div className="bg-light">
            <p className="p-3">Time Billing Items</p>
          </div>
          {loadingEditor && <div className="text-center py-2" role="status"><Spinner size="sm" className="me-2" />Loading time-billing editor...</div>}
          <Table responsive={true} striped={true} hover={true}>
            <thead>
              <tr>
                <td>
                  <p className="m-0">Billed Date</p>
                </td>
                <td>
                  <p className="m-0">Description</p>
                </td>
                <td>
                  <p className="m-0">Units</p>
                </td>
                <td>
                  <p className="m-0">Rate</p>
                </td>
                <td>
                  <p className="m-0">Amount</p>
                </td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {list.map((l) => (
                <tr key={l.id} className={!props.disabled ? "pe-cursor" : undefined} onClick={() => handleEditRow(l)}>
                  <td>
                    <p className="m-0">{formatDateFunc(l.billingDate)}</p>
                  </td>
                  <td>
                    <p className="m-0">{l.description}</p>
                  </td>
                  <td>
                    <p className="m-0">{l.units}</p>
                  </td>
                  <td>
                    <p className="m-0">{l.rate ? `$ ${l.rate}` : ""}</p>
                  </td>
                  <td>
                    <p className="m-0">{l.total}</p>
                  </td>
                  <td>
                    <Button onClick={(e) => handleDelete(e, l)} disabled={props.disabled} color="danger">
                      <AiOutlineClose size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {editingItem && (
            <Modal isOpen={!!editingItem} toggle={() => closeEditModal(false)} backdrop="static" scrollable={true} size="lg" centered>
              <ModalHeader toggle={() => closeEditModal(false)} className="bg-light p-3">
                Edit Time Billing Detail
              </ModalHeader>
              <ModalBody>
                <EditTimeBilling
                  close={closeEditModal}
                  data={{ id: props.matterId ?? editingItem.matterId }}
                  details={editingItem}
                  staffList={staffList}
                  serviceLineList={serviceLineList}
                  refreshSavedEntry={handleEditSaved}
                  setFormStatus={setFormStatus}
                />
              </ModalBody>
            </Modal>
          )}
          {formStatus.isShowModal && (
            <Modal isOpen={formStatus.isShowModal} backdrop="static" scrollable={true} size="md" centered>
              <ModalHeader className="bg-light p-3">Confirm Your Action</ModalHeader>
              <ModalBody>
                <AlertPopup
                  message="You have unsaved data in your form are you sure you want to discard the changes?"
                  closeForm={() => setFormStatus((prev) => ({ ...prev, isShowModal: false }))}
                  btn1="No"
                  btn2="Yes"
                  handleFunc={() => closeEditModal(true)}
                />
              </ModalBody>
            </Modal>
          )}
        </div>
      );
    } else {
      return <></>;
    }
  };

  return ui();
};

export default SelectedTimedList;
