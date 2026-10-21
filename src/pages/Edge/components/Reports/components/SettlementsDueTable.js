import React, { useState, useMemo } from "react";
import {
  Table,
  Badge,
  Input,
  Row,
  Col,
  Pagination,
  PaginationItem,
  PaginationLink,
  Spinner,
} from "reactstrap";
import { Link } from "react-router-dom";
import moment from "moment";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const cleanStr = String(dateStr).trim().slice(0, 10);
  const parts = cleanStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const m = moment(dateStr);
  if (m.isValid()) {
    return m.format("DD-MM-YYYY");
  }
  return dateStr;
};

const getSettlementStatusBadge = (status) => {
  switch (status) {
    case "OVERDUE":
      return (
        <Badge color="danger" className="badge-soft-danger px-2 py-1">
          <i className="ri-error-warning-line me-1 align-middle"></i> Overdue
        </Badge>
      );
    case "TODAY":
      return (
        <Badge color="warning" className="badge-soft-warning px-2 py-1">
          <i className="ri-alarm-warning-line me-1 align-middle"></i> Due Today
        </Badge>
      );
    case "UPCOMING":
      return (
        <Badge color="primary" className="badge-soft-primary px-2 py-1">
          <i className="ri-time-line me-1 align-middle"></i> Upcoming
        </Badge>
      );
    case "SETTLED":
      return (
        <Badge color="success" className="badge-soft-success px-2 py-1">
          <i className="ri-checkbox-circle-line me-1 align-middle"></i> Settled
        </Badge>
      );
    default:
      return (
        <Badge color="secondary" className="badge-soft-secondary px-2 py-1">
          {status ? status.replace(/_/g, " ") : "-"}
        </Badge>
      );
  }
};

const SettlementsDueTable = ({ rows, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Client-side search filter
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows || [];
    const term = searchTerm.toLowerCase();
    return (rows || []).filter(
      (r) =>
        (r.matterNumber && String(r.matterNumber).includes(term)) ||
        (r.letterSubject && r.letterSubject.toLowerCase().includes(term)) ||
        (r.clientNames && r.clientNames.toLowerCase().includes(term)) ||
        (r.propertyAddress && r.propertyAddress.toLowerCase().includes(term)) ||
        (r.titleOrReference && r.titleOrReference.toLowerCase().includes(term)) ||
        (r.subType && r.subType.toLowerCase().includes(term)) ||
        (r.settlementVenue && r.settlementVenue.toLowerCase().includes(term)) ||
        (r.actingPersonName && r.actingPersonName.toLowerCase().includes(term)) ||
        (r.assistingPersonName && r.assistingPersonName.toLowerCase().includes(term)) ||
        (r.siteName && r.siteName.toLowerCase().includes(term))
    );
  }, [rows, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  return (
    <div className="table-card m-0 bg-white rounded shadow-sm p-3">
      {/* Search & Page Size Bar */}
      <Row className="mb-3 align-items-center g-2">
        <Col sm={6} md={4}>
          <div className="search-box position-relative">
            <Input
              type="text"
              className="form-control form-control-sm ps-4"
              placeholder="Search by Matter, RE, Client, Address, Staff..."
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
              <th scope="col" style={{ minWidth: "130px" }}>Settlement Date</th>
              <th scope="col">Settlement Status</th>
              <th scope="col" style={{ minWidth: "220px" }}>Matter</th>
              <th scope="col">Matter #</th>
              <th scope="col">Acting Staff</th>
              <th scope="col">Assisting Staff</th>
              <th scope="col">Sub-Type</th>
              <th scope="col">Exchange Date</th>
              <th scope="col">Cooling Off Expiry</th>
              <th scope="col">Office / Branch</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="10" className="text-center py-5">
                  <Spinner color="primary" size="sm" className="me-2" />
                  <span className="text-muted fs-14">Loading Settlements Due report...</span>
                </td>
              </tr>
            ) : paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <tr key={row.matterId}>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-medium text-dark fs-13">
                        {formatDate(row.settlementDate)}
                      </span>
                      {row.settlementTime && (
                        <span className="text-muted fs-11">
                          <i className="ri-time-line me-1 align-middle"></i>
                          {row.settlementTime}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{getSettlementStatusBadge(row.settlementDisplayStatus)}</td>
                  <td>
                    <span
                      className="fw-medium text-dark fs-13 text-truncate d-inline-block"
                      style={{ maxWidth: "280px" }}
                      title={
                        row.letterSubject
                          ? `${row.letterSubject}${row.propertyAddress ? ` - ${row.propertyAddress}` : ""}`
                          : (row.titleOrReference || "-")
                      }
                    >
                      {row.letterSubject || row.titleOrReference || "-"}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/Matters?matterId=${row.matterId}`}
                      className="fw-bold text-primary text-decoration-none"
                    >
                      {row.matterNumber ? `#${row.matterNumber}` : `#${row.matterId}`}
                    </Link>
                    {row.flagArchived && (
                      <Badge color="danger" className="badge-soft-danger ms-2 fs-10">
                        Archived
                      </Badge>
                    )}
                  </td>
                  <td>
                    <span className="fs-13 text-dark">{row.actingPersonName || "-"}</span>
                  </td>
                  <td>
                    <span className="fs-13 text-muted">{row.assistingPersonName || "-"}</span>
                  </td>
                  <td>
                    {row.subType ? (
                      <Badge color="info" className="badge-soft-info">
                        {row.subType.replace(/_/g, " ")}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span className="text-muted fs-13">
                      {formatDate(row.exchangeDate)}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted fs-13">
                      {formatDate(row.coolingOffDate)}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-light text-body border">{row.siteName || "-"}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-5">
                  <i className="ri-calendar-close-line fs-36 text-muted mb-2 d-block"></i>
                  <p className="text-muted mb-0 fs-14">
                    No settlements found matching the selected filter criteria.
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

export default SettlementsDueTable;
