import React, { useState, useEffect } from "react";
import { fetchPropertyList, linkMatterProperty } from "../../../apis";
import {
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  ModalFooter,
} from "reactstrap";
import { toast } from "react-toastify";
import Pagination from "../../Pagination";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";

const AddBtns = (props) => {
  const onClick = () => {
    if (props.showAdd) {
      props.showAdd();
    }
  };
  return (
    <div className="mc-addBtns">
      <button className="custodyAddbtn" onClick={onClick}>
        <span className="plusdiv">+</span>Add
      </button>
    </div>
  );
};

const filterFields = {
  titleReferences: "",
  address: "",
};

const LinkPropertyPage = (props) => {
  const [plist, setPlist] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [labelSort, setLabelSort] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterInput, setFilterInput] = useState(filterFields);

  const fetchList = async (filter = filterInput) => {
    setLoading(true);
    try {
      const { data } = await fetchPropertyList(filter);
      if (data.success) {
        setPlist(data?.data?.properties ? data.data.properties : []);
        setPageNo(data?.metadata?.page?.pageNumber);
        setTotalPages(data?.metadata?.page?.totalPages);
        setTotalRecords(data?.metadata?.page?.totalRecords);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList({
      pageNo: pageNo,
      pageSize: pageSize,
      titleReferences: "",
      address: "",
      sortField: sortField,
      sortOrder: sortOrder,
    });
  }, []);

  useEffect(() => {
    if (props.list && props.list.length > 0) {
      setPlist(props.list);
    }
  }, [props.list]);

  const handleRefresh = async (reset = false) => {
    try {
      const filters = reset
        ? {
            ...filterFields,
            pageNo: 0,
            pageSize: 25,
            sortField: "",
            sortOrder: "",
          }
        : {
            ...filterInput,
            pageNo: pageNo,
            pageSize: pageSize,
            sortField: sortField,
            sortOrder: sortOrder,
          };

      if (reset) {
        setFilterInput(filterFields);
        setLabelSort("");
        setSortOrder("");
        setSortField("");
      }

      await fetchList(filters);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePreviousPage = async () => {
    try {
      const pg = pageNo - 1;
      setPageNo(pg);
      await fetchList({
        ...filterInput,
        pageNo: pg,
        pageSize: pageSize,
        sortField: sortField,
        sortOrder: sortOrder?.toUpperCase(),
      });
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleNextPage = async () => {
    try {
      const pg = pageNo + 1;
      setPageNo(pg);
      await fetchList({
        ...filterInput,
        pageNo: pg,
        pageSize: pageSize,
        sortField: sortField,
        sortOrder: sortOrder?.toUpperCase(),
      });
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleJumpToPage = async (num) => {
    try {
      const pg = num - 1;
      setPageNo(pg);
      await fetchList({
        ...filterInput,
        pageNo: pg,
        pageSize: pageSize,
        sortField: sortField,
        sortOrder: sortOrder?.toUpperCase(),
      });
    } catch (error) {
      console.error("error", error);
    }
  };

  const changeNumberOfRows = async (e) => {
    try {
      const currSize = e.target.value;
      setPageSize(currSize);

      const tempTotalPages = Math.ceil(totalRecords / currSize);
      const tempPageNo = tempTotalPages - 1;

      if (tempPageNo < pageNo) {
        setPageNo(tempPageNo);
      } else {
        tempPageNo = pageNo;
      }

      await fetchList({
        ...filterInput,
        pageNo: tempPageNo,
        pageSize: currSize,
        sortField: sortField,
        sortOrder: sortOrder?.toUpperCase(),
      });
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelectedId = [];
      plist.forEach((a) => {
        newSelectedId.push(a.id);
      });
      setSelectedList(newSelectedId);
    } else {
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
    setSelectedList(newSelectedId);
  };

  const isSelected = (id) => selectedList.indexOf(id) !== -1;

  const linkProperty = async () => {
    let arr = [];
    selectedList.forEach((a) => {
      arr.push({ id: a });
    });

    let formData = {
      matterId: props.matterId,
      propertyList: arr,
    };

    try {
      const { data } = await linkMatterProperty(formData);
      if (data.success) {
        props.refresh();
        setSelectedList([]);
        setTimeout(() => {
          props.closeForm();
        }, 10);
      } else {
        toast.warning("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
  };

  const openAddModal = () => {
    props.closeForm();
    props.openAddModal();
  };

  return (
    <>
      <Modal
        isOpen={props.open}
        toggle={() => props.closeForm}
        backdrop="static"
        scrollable={true}
        size="xl"
        centered
      >
        <ModalHeader toggle={() => props.closeForm()} className="bg-light p-3">
          Link Property
        </ModalHeader>

        <ModalBody className="d-flex flex-column overflow-hidden bg-light">
          <Button
            type="submit"
            color="success"
            className="ms-auto me-3"
            onClick={openAddModal}
          >
            Add property
          </Button>
          <div className="d-flex flex-column overflow-hidden h-100">
            <div className="flex-1 overflow-y-auto">
              <Table responsive={true} striped={true} hover={true}>
                <thead className="mb-2 bg-light">
                  <tr>
                    <th>
                      <Input
                        type="checkbox"
                        checked={
                          plist.length > 0 &&
                          selectedList.length === plist.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>
                      <p className="mb-0">Title Ref.</p>
                      <Input
                        bsSize="sm"
                        name="titleReferences"
                        value={filterInput.titleReferences}
                        onChange={handleChangeFilter}
                      />
                    </th>
                    <th>
                      <p className="mb-0">Address</p>
                      <Input
                        bsSize="sm"
                        name="address"
                        value={filterInput.address}
                        onChange={handleChangeFilter}
                      />
                    </th>
                    <th>
                      <div className="d-flex justify-content-end">
                        <Button
                          type="button"
                          color="success"
                          className="mx-1"
                          onClick={() => handleRefresh()}
                        >
                          <MdFilterAlt size={18} />
                        </Button>
                        <Button
                          type="button"
                          color="danger"
                          className="mx-1"
                          onClick={() => handleRefresh(true)}
                        >
                          <MdFilterAltOff size={18} />
                        </Button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plist.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Input
                          type="checkbox"
                          checked={isSelected(p.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleSelect(p.id)}
                        />
                      </td>
                      <td>
                        <p className="mb-0">{p?.titleReferences}</p>
                      </td>
                      <td>
                        <p className="mb-0">{p?.address}</p>
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div style={{ display: "none" }}>
                <div className="mc-header">
                  <div className="mc-col xsm">
                    <input
                      className="mc-check"
                      type="checkbox"
                      checked={
                        plist.length > 0 && selectedList.length === plist.length
                      }
                      onChange={handleSelectAll}
                    />
                  </div>
                  <div className="mc-col fl">
                    <p>Title Ref.</p>
                    {/* <input type='text' /> */}
                  </div>
                  <div className="mc-col fl">
                    <p>Address</p>
                    {/* <input type='text' /> */}
                  </div>
                </div>
                <div className="mc-list-container">
                  {plist.map((p) => (
                    <div className="mc-row pe-cursor" key={p.id}>
                      <div className="mc-col xsm">
                        <input
                          className="mc-check"
                          type="checkbox"
                          checked={isSelected(p.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleSelect(p.id)}
                        />
                      </div>
                      <div className="mc-col fl">
                        <p>{p?.titleReferences}</p>
                      </div>
                      <div className="mc-col fl">
                        <p>{p?.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 pb-2 border-bottom">
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
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            color="light"
            onClick={props.closeForm}
            className="mx-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="success"
            onClick={linkProperty}
            className="mx-1"
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default LinkPropertyPage;
