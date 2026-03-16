import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import { allPaymentList } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { toast } from "react-toastify";
import PaymentTable from "./PaymentTable";

const initialFilters = {
  paymentNumber: "",
  paymentType: "",
  createdOn: "",
  amount: "",
  status: "",
  matterNumber: "",
  createdBy: "",
  sortOn: "",
  sortType: "",
};

const PaymentListPage = (props) => {
  document.title = "Payments | EdgeLegal";
  const [list, setList] = useState([]);
  const [groupTotalAmountMap, setGroupTotalAmountMap] = useState({});
  const [groupSplitDetailsMap, setGroupSplitDetailsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterInput, setFilterInput] = useState(initialFilters);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async (filter = filterInput) => {
    try {
      setLoading(true);
      const { data } = await allPaymentList(filter);
      if (data.success) {
        setList(data?.data?.paymentList || []);
        setGroupTotalAmountMap(data?.data?.groupTotalAmountMap || {});
        setGroupSplitDetailsMap(data?.data?.groupSplitDetailsMap || {});
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    fetchList(initialFilters);
    setFilterInput(initialFilters);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Payments" pageTitle="Payments" />
        <Card>
          <div className="bg-light d-flex align-items-center justify-content-between p-2">
            <h5 className="mb-0">Payments</h5>
          </div>
          <PaymentTable
            list={list}
            groupTotalAmountMap={groupTotalAmountMap}
            groupSplitDetailsMap={groupSplitDetailsMap}
            filterInput={filterInput}
            setFilterInput={setFilterInput}
            handleRefresh={fetchList}
            handleResetFilter={handleResetFilter}
          />
          {loading && <LoadingPage />}
        </Card>
      </Container>
    </div>
  );
};

export default PaymentListPage;
