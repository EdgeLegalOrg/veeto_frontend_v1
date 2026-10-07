import React, { useState, useMemo } from "react";
import { Table, Input, Row, Col, Badge, Spinner, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { Link } from "react-router-dom";

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "$0.00";
  return (
    "$" +
    Number(val).toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const getInvoiceStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case "PAID":
      return <Badge color="success" className="badge-soft-success">Paid</Badge>;
    case "PARTIALLY_PAID":
      return <Badge color="warning" className="badge-soft-warning">Partially Paid</Badge>;
    case "UNPAID":
      return <Badge color="danger" className="badge-soft-danger">Unpaid</Badge>;
    case "CANCELLED":
      return <Badge color="secondary" className="badge-soft-secondary">Cancelled</Badge>;
    default:
      return <Badge color="light" className="text-dark border">{status || "Unknown"}</Badge>;
  }
};

const getAgingBadge = (days) => {
  const d = Number(days) || 0;
  if (d <= 30) {
    return <Badge color="success" className="badge-soft-success fs-11 px-2 py-1">{d}d (0-30d)</Badge>;
  } else if (d <= 60) {
    return <Badge color="warning" className="badge-soft-warning fs-11 px-2 py-1">{d}d (31-60d)</Badge>;
  } else if (d <= 90) {
    return <Badge color="info" className="badge-soft-info fs-11 px-2 py-1">{d}d (61-90d)</Badge>;
  } else {
    return <Badge color="danger" className="badge-soft-danger fs-11 px-2 py-1">{d}d (90+d)</Badge>;
  }
};

const OutstandingInvoicesTable = ({ rows, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filteredRows = useMemo(() => {
    if (!rows || !Array.isArray(rows)) return [];
    if (!searchTerm.trim()) return rows;

    const term = searchTerm.toLowerCase();
    return rows.filter((r) => {
      const invoiceNum = r.invoiceNumber ? String(r.invoiceNumber) : "";
      const matterNum = r.matterNumber ? String(r.matterNumber) : "";
      const client = (r.clientNames || "").toLowerCase();
      const title = (r.titleOrReference || "").toLowerCase();
      const type = (r.matterType || "").toLowerCase();
      const feeEarner = (r.feeEarnerName || "").toLowerCase();
      const site = (r.siteName || "").toLowerCase();

      return (
        invoiceNum.includes(term) ||
        matterNum.includes(term) ||
        client.includes(term) ||
        title.includes(term) ||
        type.includes(term) ||
        feeEarner.includes(term) ||
        site.includes(term)
      );
    });
  }, [rows, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  return (
    <div className="card border-0 shadow-sm p-3">
      {/* Search & Page Size Bar */}
      <Row className="mb-3 align-items-center g-2">
        <Col sm={6} md={4}>
          <div className="search-box position-relative">
            <Input
              type="text"
              className="form-control form-control-sm ps-4"
              placeholder="Search by Invoice #, Matter #, Client, Staff..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <i className="ri-search-line search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"></i>
          </div>
        </Col>
        <Col sm={6} md={8} className="text-sm-end">
          <span className="text-muted fs-12 me-2">Showing</span>
          <select
            className="form-select form-select-sm d-inline-block w-auto"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-muted fs-12 ms-2">entries ({filteredRows.length} total)</span>
        </Col>
      </Row>

      {/* Table */}
      <div className="table-responsive">
        <Table hover className="align-middle table-nowrap mb-0">
          <thead className="table-light text-muted fs-12">
            <tr>
              <th scope="col">Invoice #</th>
              <th scope="col">Invoice Date</th>
              <th scope="col">Due Date</th>
              <th scope="col">Aging</th>
              <th
                scope="col"
                style={{
                  position: "sticky",
                  left: 0,
                  zIndex: 2,
                  backgroundColor: "#f3f6f9",
                  minWidth: "120px",
                }}
              >
                Matter #
              </th>
              <th scope="col">Client / Bill-To</th>
              <th scope="col">Reference / Subject</th>
              <th scope="col">Type</th>
              <th scope="col">Fee Earner</th>
              <th scope="col" className="text-end">Total ($)</th>
              <th scope="col" className="text-end">Paid ($)</th>
              <th scope="col" className="text-end">Balance Due ($)</th>
              <th scope="col">Status</th>
              <th scope="col">Office / Branch</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="14" className="text-center py-5">
                  <Spinner color="primary" size="sm" className="me-2" />
                  <span className="text-muted fs-14">Loading Outstanding Invoices report...</span>
                </td>
              </tr>
            ) : paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <tr key={row.invoiceId}>
                  <td>
                    <span className="fw-semibold text-dark">
                      {row.invoiceNumber ? `#${row.invoiceNumber}` : `#${row.invoiceId}`}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted fs-13">
                      {row.invoiceDate ? String(row.invoiceDate).slice(0, 10) : "-"}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted fs-13">
                      {row.invoiceDueDate ? String(row.invoiceDueDate).slice(0, 10) : "-"}
                    </span>
                  </td>
                  <td>{getAgingBadge(row.daysOverdue)}</td>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      backgroundColor: "#fff",
                      minWidth: "120px",
                      boxShadow: "2px 0 5px -2px rgba(0,0,0,0.12)",
                    }}
                  >
                    <Link
                      to={`/Matters?matterId=${row.matterId}`}
                      className="fw-bold text-primary text-decoration-none"
                    >
                      {row.matterNumber ? `#${row.matterNumber}` : `#${row.matterId}`}
                    </Link>
                  </td>
                  <td>
                    <span className="fw-medium text-dark">{row.clientNames || "-"}</span>
                  </td>
                  <td>
                    <span
                      className="text-muted fs-13 text-truncate d-inline-block"
                      style={{ maxWidth: "180px" }}
                      title={row.titleOrReference}
                    >
                      {row.titleOrReference || "-"}
                    </span>
                  </td>
                  <td>
                    {row.matterType ? (
                      <Badge color="primary" className="badge-soft-primary">
                        {row.matterType.replace(/_/g, " ")}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span className="fs-13 text-dark">{row.feeEarnerName || "-"}</span>
                  </td>
                  <td className="text-end text-dark">
                    {formatCurrency(row.totalAmount)}
                  </td>
                  <td className="text-end text-success">
                    {formatCurrency(row.amountApplied)}
                  </td>
                  <td className="text-end fw-bold text-danger">
                    {formatCurrency(row.outstandingBalance)}
                  </td>
                  <td>{getInvoiceStatusBadge(row.invoiceStatus)}</td>
                  <td>
                    <span className="badge bg-light text-body border">{row.siteName || "-"}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="14" className="text-center py-5">
                  <i className="ri-alarm-warning-line fs-36 text-muted mb-2 d-block"></i>
                  <p className="text-muted mb-0 fs-14">
                    No outstanding invoices found matching the selected filter criteria.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <Row className="align-items-center mt-3 g-2">
          <Col sm={6}>
            <div className="text-muted fs-12">
              Page <span className="fw-semibold">{currentPage}</span> of{" "}
              <span className="fw-semibold">{totalPages}</span>
            </div>
          </Col>
          <Col sm={6}>
            <Pagination className="pagination-sm justify-content-end mb-0">
              <PaginationItem disabled={currentPage <= 1}>
                <PaginationLink onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
                  Prev
                </PaginationLink>
              </PaginationItem>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem active={pageNum === currentPage} key={pageNum}>
                    <PaginationLink onClick={() => setCurrentPage(pageNum)}>
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem disabled={currentPage >= totalPages}>
                <PaginationLink onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>
                  Next
                </PaginationLink>
              </PaginationItem>
            </Pagination>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default OutstandingInvoicesTable;
