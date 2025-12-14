import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { deleteTimeBilling, getServiceLine } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import AddBilling from "./AddBilling";
import EditTimeBilling from "./EditTimeBilling";
import { AlertPopup } from "../../customComponents/CustomComponents";
import { toast } from "react-toastify";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";

const initFilter = {
  invoiceId: "",
  billingDate: "",
  description: "",
  units: "",
  taxAmount: "",
  total: "",
};

const TimeBillingList = (props) => {
  // const { formStatus } = useSelector((state) => state.Layout);
  const [formStatus, setFormStatus] = useState({
    isFormChanged: false,
    isShowModal: false,
  });
  const [filterInput, setFilterInput] = useState(initFilter);
  const [filteredList, setFilteredList] = useState([]);
  const [billingList, setBillingList] = useState([]);
  const [serviceLines, setServiceLines] = useState([]);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [deletePop, setDeletePop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (props.data) {
      if (props.data.timeBillingList && props.data.timeBillingList.length > 0) {
        setBillingList(props.data.timeBillingList);
        setFilteredList(props.data.timeBillingList);
      }
    }
  }, [props.data]);

  const updateFormStatusAction = ({ key, value }) => {
    return setFormStatus((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const resetFormStatusAction = () => {
    setFormStatus({
      isFormChanged: false,
      isShowModal: false,
    });
  };

  const fetchServiceLines = async () => {
    try {
      setLoading(true);
      const { data } = await getServiceLine();
      if (data.success) {
        parseServiceLine(data.data.serviceLineList);
      } else {
        toast.warning("Something went wrong, please try later");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.warning("Something went wrong, please try later");
    }
  };

  const filterData = (obj) => {
    const newData = billingList?.filter(
      (data) =>
        (obj["invoiceId"] !== ""
          ? data?.["invoiceId"]
              ?.toLowerCase()
              ?.includes(obj["invoiceId"]?.toLowerCase())
          : true) &&
        (obj["description"] !== ""
          ? data["description"]
              ?.toLowerCase()
              ?.includes(obj["description"]?.toLowerCase())
          : true) &&
        (obj["billingDate"] !== ""
          ? formatDateFunc(data?.["billingDate"]) ===
            formatDateFunc(obj["billingDate"])
          : true) &&
        (obj["units"] !== ""
          ? data?.["units"]?.toString()?.includes(obj["units"]?.toString()) ||
            data?.["rate"]?.toString()?.includes(obj["units"]?.toString())
          : true) &&
        (obj["taxAmount"] !== ""
          ? data?.["taxAmount"]
              ?.toString()
              ?.includes(obj["taxAmount"]?.toString())
          : true) &&
        (obj["total"] !== ""
          ? data?.["total"]?.toString()?.includes(obj["total"]?.toString())
          : true)
    );

    setFilteredList(newData);
  };

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
    filterData({ ...filterInput, [name]: value });
  };

  const handleAdd = () => {
    fetchServiceLines();
    setTimeout(() => {
      setAdd(true);
    }, 10);
  };

  const parseServiceLine = (arg) => {
    let arr = [];
    arg?.forEach((a) => {
      if (a.billingFrequency === "HOURLY") {
        arr.push({ display: a.serviceLineTitle, value: a.id, raw: a });
      }
    });
    setServiceLines(arr);
  };

  const calcAmount = (d) => {
    let amt = 0;
    if (d.units && d.rate) {
      amt = d.units * d.rate;
    }

    return amt + (d.taxAmount ? d.taxAmount : 0);
  };

  const handleUpdate = () => {
    if (selectedList && selectedList.length === 1) {
      setEdit(true);
    } else {
      toast.warning("Please select atleast 1 record");
    }
  };

  const isSelected = (id) => selectedList.indexOf(id) !== -1;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelectedId = [];
      billingList.forEach((a) => {
        newSelectedId.push(a.id);
      });
      setSelected(null);
      setSelectedList(newSelectedId);
    } else {
      setSelected(null);
      setSelectedList([]);
    }
  };

  const handleSelect = (id) => {
    const selectedIndex = selectedList.indexOf(id);
    let newSelectedId = [];
    if (selectedIndex === -1) {
      newSelectedId = newSelectedId.concat(selectedList, id);
    } else if (selectedIndex === 0) {
      newSelectedId = newSelectedId.concat(selectedList.slice(1));
    } else if (selectedIndex === selectedList.length - 1) {
      newSelectedId = newSelectedId.concat(selectedList.slice(0, -1));
    } else {
      newSelectedId = newSelectedId.concat(
        selectedList.slice(0, selectedIndex),
        selectedList.slice(selectedIndex + 1)
      );
    }

    if (newSelectedId.length === 1) {
      let d = billingList.filter((a) => a.id === newSelectedId[0]);
      if (d && d.length > 0) {
        setSelected(d[0]);
      }
    } else {
      setSelected(null);
    }

    setSelectedList(newSelectedId);
  };

  const handleClickRow = (id) => {
    setLoading(true);
    setSelectedList([id]);
    let d = billingList.filter((a) => a.id === id);
    setSelected(d[0]);
    setTimeout(() => {
      setEdit(true);
      setLoading(false);
    }, 30);
  };

  const handleDeleteAlert = () => {
    if (selectedList && selectedList.length > 0) {
      setDeletePop(true);
    } else {
      toast.warning("Please select any record");
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      let ids = selectedList.join(",");
      const { data } = await deleteTimeBilling(ids);
      if (data.success) {
        props.refresh();
        setSelectedList([]);
        setTimeout(() => {
          setDeletePop(false);
        }, 10);
      } else {
        toast.warning("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      toast.warning("Something went wrong, please try again later.");
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="mx-2">
      <div className="d-flex align-items-center justify-content-end mb-2">
        <Button color="success" onClick={handleAdd} className="d-flex mx-2">
          <span className="plusdiv">+</span>Add
        </Button>
        {/* <button className='custodyAddbtn' onClick={handleUpdate}>
          Update
        </button> */}
        <Button
          color="danger"
          onClick={handleDeleteAlert}
          className="d-flex mx-2"
        >
          <span className="plusdiv">-</span>Delete
        </Button>
      </div>

      <Table responsive={true} striped={true} hover={true}>
        <thead className="mb-2 bg-light">
          <tr>
            <th>
              <Input
                type="checkbox"
                onClick={(e) => e.stopPropagation()}
                checked={
                  billingList.length > 0 &&
                  selectedList.length === billingList.length
                }
                onChange={handleSelectAll}
              />
            </th>
            <th>
              <p>Invoice No.</p>
              <Input
                type="text"
                autoComplete="off"
                name="invoiceId"
                value={filterInput.invoiceId}
                onChange={handleFilter}
              />
            </th>
            <th>
              <p>Billing Dt.</p>
              <Input
                type="date"
                autoComplete="off"
                name="billingDate"
                value={filterInput.billingDate}
                onChange={handleFilter}
              />
            </th>
            <th>
              <p>Type Description</p>
              <Input
                type="text"
                autoComplete="off"
                name="description"
                value={filterInput.description}
                onChange={handleFilter}
              />
            </th>
            <th>
              <p>Unit (Rate)</p>
              <Input
                type="text"
                autoComplete="off"
                name="units"
                value={filterInput.units}
                onChange={handleFilter}
              />
            </th>
            <th>
              <p>GST</p>
              <Input
                type="text"
                autoComplete="off"
                name="taxAmount"
                value={filterInput.taxAmount}
                onChange={handleFilter}
              />
            </th>
            <th>
              <p>Amount</p>
              <Input
                type="text"
                autoComplete="off"
                name="total"
                value={filterInput.total}
                onChange={handleFilter}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredList?.map((bill) => (
            <tr
              key={`${bill.id}`}
              onClick={() => handleClickRow(bill.id)}
              className="pe-cursor"
            >
              <td>
                <Input
                  type="checkbox"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  checked={isSelected(bill.id)}
                  onChange={() => handleSelect(bill.id)}
                />
              </td>
              <td>
                <p className="mb-0">
                  {bill.invoiceId ? bill.invoiceId : "Unbilled"}
                </p>
              </td>
              <td>
                <p className="mb-0">
                  {bill.billingDate ? formatDateFunc(bill.billingDate) : ""}
                </p>
              </td>
              <td>
                <p className="mb-0">{bill.description}</p>
              </td>
              <td>
                <p className="mb-0">{`${bill.units} ${
                  bill.rate ? `($ ${(bill?.rate || 0)?.toFixed(2)})` : ""
                }`}</p>
              </td>
              <td>
                <p className="mb-0">{`$ ${(bill?.taxAmount || 0)?.toFixed(
                  2
                )}`}</p>
              </td>
              <td>
                <p className="mb-0">{`$ ${(bill?.total || 0)?.toFixed(2)}`}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="mc-header" style={{ display: "none" }}>
        <div className="mc-col xsm">
          <input
            className="mc-check"
            type="checkbox"
            onClick={(e) => e.stopPropagation()}
            checked={
              billingList.length > 0 &&
              selectedList.length === billingList.length
            }
            onChange={handleSelectAll}
          />
        </div>
        <div className="mc-col md">
          <p>Invoice No.</p>
          <input
            type="text"
            autoComplete="off"
            name="invoiceId"
            value={filterInput.invoiceId}
            onChange={handleFilter}
          />
        </div>
        <div className="mc-col md">
          <p>Billing Dt.</p>
          <input
            type="date"
            autoComplete="off"
            name="billingDate"
            value={filterInput.billingDate}
            onChange={handleFilter}
          />
        </div>
        <div className="mc-col md">
          <p>Type Description</p>
          <input
            type="text"
            autoComplete="off"
            name="description"
            value={filterInput.description}
            onChange={handleFilter}
          />
        </div>
        <div className="mc-col md">
          <p>Unit (Rate)</p>
          <input
            type="text"
            autoComplete="off"
            name="units"
            value={filterInput.units}
            onChange={handleFilter}
          />
        </div>
        <div className="mc-col md">
          <p>Tax (Code)</p>
          <input
            type="text"
            autoComplete="off"
            name="taxAmount"
            value={filterInput.taxAmount}
            onChange={handleFilter}
          />
        </div>
        <div className="mc-col md">
          <p>Amount</p>
          <input
            type="text"
            autoComplete="off"
            name="total"
            value={filterInput.total}
            onChange={handleFilter}
          />
        </div>
        {/* <div className='mc-col md'>
          <p>Actions</p>
        </div> */}
      </div>
      {/************Table rows************ */}
      <div className="mc-tBody" style={{ display: "none" }}>
        {filteredList?.map((bill) => (
          <div
            className="mc-row pe-cursor"
            key={`${bill.id}`}
            onClick={() => handleClickRow(bill.id)}
          >
            <div className="mc-col xsm">
              <input
                className="mc-check"
                type="checkbox"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                checked={isSelected(bill.id)}
                onChange={() => handleSelect(bill.id)}
              />
            </div>
            <div className="mc-col md">
              <p>{bill.invoiceId ? bill.invoiceId : "Unbilled"}</p>
            </div>
            <div className="mc-col md">
              <p>{bill.billingDate ? formatDateFunc(bill.billingDate) : ""}</p>
            </div>
            <div className="mc-col md">
              <p className="three-dot">{bill.description}</p>
            </div>
            <div className="mc-col md">
              <p>{`${bill.units} ${bill.rate ? `($ ${bill.rate})` : ""}`}</p>
            </div>
            <div className="mc-col md">
              <p>{`$ ${bill.taxAmount}`}</p>
            </div>
            <div className="mc-col md">
              {/* <p>{`$ ${calcAmount(bill)}`}</p> */}
              <p>{`$ ${bill.total}`}</p>
            </div>
          </div>
        ))}
      </div>

      {add && (
        <Modal
          isOpen={add}
          toggle={() => {
            if (formStatus.isFormChanged) {
              return updateFormStatusAction({
                key: "isShowModal",
                value: true,
              });
            }
            setAdd(false);
          }}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => {
              if (formStatus.isFormChanged) {
                return updateFormStatusAction({
                  key: "isShowModal",
                  value: true,
                });
              }
              setAdd(false);
            }}
            className="bg-light p-3"
          >
            Add Time Billing
          </ModalHeader>
          <ModalBody>
            <AddBilling
              close={(isClose = false) => {
                const isCloseType = isClose && typeof isClose === "boolean";
                if (formStatus.isFormChanged && !isCloseType) {
                  return updateFormStatusAction({
                    key: "isShowModal",
                    value: true,
                  });
                }
                setAdd(false);
              }}
              data={props.data}
              staffList={props.staffList}
              serviceLineList={serviceLines}
              refresh={props.refresh}
              setFormStatus={setFormStatus}
            />
          </ModalBody>
        </Modal>
      )}

      {edit && (
        <Modal
          isOpen={edit}
          toggle={() => {
            if (formStatus.isFormChanged) {
              return updateFormStatusAction({
                key: "isShowModal",
                value: true,
              });
            }
            setSelectedList([]);
            setEdit(false);
          }}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => {
              if (formStatus.isFormChanged) {
                return updateFormStatusAction({
                  key: "isShowModal",
                  value: true,
                });
              }
              setSelectedList([]);
              setEdit(false);
            }}
            className="bg-light p-3"
          >
            Edit Time Billing Detail
          </ModalHeader>
          <ModalBody>
            <EditTimeBilling
              close={(isClose = false) => {
                const isCloseType = isClose && typeof isClose === "boolean";
                if (formStatus.isFormChanged && !isCloseType) {
                  return updateFormStatusAction({
                    key: "isShowModal",
                    value: true,
                  });
                }
                setSelectedList([]);
                setEdit(false);
              }}
              data={props.data}
              details={selected}
              staffList={props.staffList}
              serviceLineList={serviceLines}
              refresh={props.refresh}
              setFormStatus={setFormStatus}
            />
          </ModalBody>
        </Modal>
      )}

      {deletePop && (
        <Modal
          isOpen={deletePop}
          toggle={() => setDeletePop(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setDeletePop(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              message="Are you sure you want to delete the record?"
              heading="Confirm Your Action"
              closeForm={() => setDeletePop(false)}
              btn1={"No"}
              btn2="Yes"
              handleFunc={handleDelete}
            />
          </ModalBody>
        </Modal>
      )}

      {formStatus.isShowModal && (
        <Modal
          isOpen={formStatus.isShowModal}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader className="bg-light p-3">
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              message="You have unsaved data in your form are you sure you want to
                      discard the changes?"
              closeForm={() => {
                updateFormStatusAction({
                  key: "isShowModal",
                  value: false,
                });
              }}
              btn1={"No"}
              btn2="Yes"
              handleFunc={() => {
                setAdd(false);
                setEdit(false);
                formStatus.callback?.();
                resetFormStatusAction();
              }}
            />
          </ModalBody>
        </Modal>
      )}

      {loading && <LoadingPage />}
    </div>
  );
};

export default TimeBillingList;
