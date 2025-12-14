import React, { Fragment, useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import LoadingPage from "../../../utils/LoadingPage";
import DepositListTable from "./DepositListTable";
import { getDepositList } from "../../../apis";
import { toast } from "react-toastify";
import CreateDepositSlip from "./CreateDepositSlip";

const initialFilter = {
  description: "",
  createdDate: "",
  matterNumber: "",
  amount: "",
  sortOn: "",
  sortType: "",
  pageNo: 0,
  pageSize: 25,
};

const DepositListPage = (props) => {
  document.title = "Deposit slips | EdgeLegal";
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [list, setList] = useState([]);

  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async (filters = initialFilter) => {
    setLoading(true);
    try {
      // setTotalRecords(0);
      const { data } = await getDepositList(filters);
      if (data.success) {
        setList(data?.data?.depositSlipList);
        setPageNo(data?.metadata?.page?.pageNumber);
        setTotalPages(data?.metadata?.page?.totalPages);
        setTotalRecords(data?.metadata?.page?.totalRecords);
      } else {
        toast.error("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const listing = () => {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Deposit Slips" pageTitle="Deposit Slips" />
          <Card>
            <div className="d-flex align-items-center justify-content-between p-2">
              <h5 className="mb-0">Deposit Slips</h5>
              <Button
                color="success"
                className="d-flex"
                onClick={() => setShowAdd(true)}
              >
                <span className="plusdiv">+</span> Add
              </Button>
            </div>
            <DepositListTable
              list={list}
              refresh={fetchList}
              pageNo={pageNo}
              pageSize={pageSize}
              totalPages={totalPages}
              totalRecords={totalRecords}
            />
            {showAdd && (
              <Modal
                isOpen={showAdd}
                toggle={() => setShowAdd(false)}
                backdrop="static"
                scrollable={true}
                size="xl"
                centered
              >
                <ModalHeader
                  toggle={() => setShowAdd(false)}
                  className="bg-light p-3"
                >
                  Create Bank Deposit Slip
                </ModalHeader>
                <ModalBody>
                  <CreateDepositSlip
                    close={() => setShowAdd(false)}
                    refresh={fetchList}
                  />
                </ModalBody>
              </Modal>
            )}
          </Card>
        </Container>
      </div>
    );
  };

  const ui = () => {
    if (details) {
      return <></>;
    } else {
      return listing();
    }
  };

  return (
    <Fragment>
      {ui()}
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default DepositListPage;
