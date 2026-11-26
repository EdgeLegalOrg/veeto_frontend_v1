import React, { useState, useEffect, useRef } from "react";
import { Container, Card } from "reactstrap";
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
};

const InvoiceListPage = (props) => {
  document.title = "Invoices | Veeto";
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterInput, setFilterInput] = useState(initialFilters);

  // Request offsets and the visible range always use the same pagination values.
  const [pagination, setPagination] = useState({ pageNo: 0, pageSize: 25 });
  const { pageNo, pageSize } = pagination;
  const requestVersion = useRef(0);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchList = async (filters = filterInput, paging = { pageNo: 0, pageSize }) => {
    const version = ++requestVersion.current;
    const requestedPage = { pageNo: paging.pageNo, pageSize: Number(paging.pageSize) };
    setLoading(true);
    try {
      const { data } = await getInvoiceList({ ...filters, ...requestedPage });
      // Ignore a slower earlier request (or a response after leaving the page).
      if (version !== requestVersion.current) return;
      if (data.success) {
        setList(data?.data?.invoiceList || []);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data?.metadata?.page?.totalRecords);
        // Publish the range with the returned rows, not ahead of a failed request.
        setPagination({ ...requestedPage, pageNo: data.metadata.page.pageNumber ?? requestedPage.pageNo });
      } else {
        toast.error("Something went wrong, please try later.");
      }
    } catch (error) {
      if (version === requestVersion.current) {
        console.error(error);
        toast.error("Unable to load invoices. Please try again.");
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    return () => { requestVersion.current += 1; };
  }, []);

  const handleResetFilter = () => {
    setFilterInput(initialFilters);
    fetchList(initialFilters, { pageNo: 0, pageSize: 25 });
  };

  const goToPage = (nextPage) => {
    const boundedPage = Math.max(0, Math.min(nextPage, Math.max(0, totalPages - 1)));
    fetchList(filterInput, { pageNo: boundedPage, pageSize });
  };

  const handlePreviousPage = () => goToPage(pageNo - 1);
  const handleNextPage = () => goToPage(pageNo + 1);
  const handleJumpToPage = (num) => goToPage(num - 1);

  const changeNumberOfRows = (event) => {
    const nextSize = Number(event.target.value);
    if (!Number.isInteger(nextSize) || nextSize <= 0) return;
    // Page-size changes and filter/sort refreshes start at the first page.
    // An empty result must never produce a negative page index.
    fetchList(filterInput, { pageNo: 0, pageSize: nextSize });
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
