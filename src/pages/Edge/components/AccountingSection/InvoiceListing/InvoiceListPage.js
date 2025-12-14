import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import { getInvoiceList } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import InvoiceListTable from "./InvoiceListTable";
import { toast } from "react-toastify";
import Pagination from "../../Pagination";

const initialFilters = {
  invoiceNumber: "",
  invoiceDate: "",
  invoiceDueDate: "",
  matterNumber: "",
  totalAmount: "",
  createdBy: "",
  sortOn: "",
  sortType: "",
  pageNo: 0,
  pageSize: 25,
};

const InvoiceListPage = (props) => {
  document.title = "Invoices | EdgeLegal";
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterInput, setFilterInput] = useState(initialFilters);

  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchList = async (filters = filterInput) => {
    try {
      setLoading(true);
      const { data } = await getInvoiceList(filters);
      if (data.success) {
        setList(data?.data?.invoiceList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data?.metadata?.page?.totalRecords);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleResetFilter = () => {
    fetchList(initialFilters);
    setFilterInput(initialFilters);
  };

  const handlePreviousPage = () => {
    let pg = pageNo - 1;
    setPageNo(pg);

    fetchList({ ...filterInput, pageNo: pg });
  };

  const handleNextPage = () => {
    let pg = pageNo + 1;
    setPageNo(pg);

    fetchList({ ...filterInput, pageNo: pg });
  };

  const handleJumpToPage = (num) => {
    setPageNo(num - 1);
    fetchList({ ...filterInput, pageNo: num - 1 });
  };

  const changeNumberOfRows = (e) => {
    setPageSize(e.target.value);
    let currSize = e.target.value;

    let tempTotalPages = Math.ceil(totalRecords / currSize);
    let tempPageNo = tempTotalPages - 1;

    if (tempPageNo < pageNo) {
      setPageNo(tempPageNo);
    } else {
      tempPageNo = pageNo;
    }

    fetchList({
      ...filterInput,
      pageNo: tempPageNo,
      pageSize: currSize,
    });
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Invoices" pageTitle="Invoices" />
        <Card>
          <div className="bg-light d-flex align-items-center justify-content-between p-2">
            <h5 className="mb-0">Invoices</h5>
          </div>
          <InvoiceListTable
            list={list}
            filterInput={filterInput}
            setFilterInput={setFilterInput}
            handleRefresh={fetchList}
            handleResetFilter={handleResetFilter}
          />
          <div className="m-2">
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
          {loading && <LoadingPage />}
        </Card>
      </Container>
    </div>
  );
};

export default InvoiceListPage;
