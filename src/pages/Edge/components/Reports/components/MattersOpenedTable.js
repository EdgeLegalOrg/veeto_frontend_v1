import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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

const getStatusBadge = (status) => {
  switch (status) {
    case "INSTRUCTED":
      return <Badge color="primary" className="badge-soft-primary">Instructed</Badge>;
    case "IN_PROGRESS":
      return <Badge color="warning" className="badge-soft-warning">In Progress</Badge>;
    case "COOLING_OFF":
      return <Badge color="info" className="badge-soft-info">Cooling Off</Badge>;
    case "EXCHANGED":
      return <Badge color="secondary" className="badge-soft-secondary">Exchanged</Badge>;
    case "UNEXCHANGED":
      return <Badge color="dark" className="badge-soft-dark">Unexchanged</Badge>;
    case "COMPLETE":
      return <Badge color="success" className="badge-soft-success">Complete</Badge>;
    case "NOT_PROCEEDING":
      return <Badge color="danger" className="badge-soft-danger">Not Proceeding</Badge>;
    default:
      return <Badge color="light" className="text-dark">{status || "-"}</Badge>;
  }
};

const MattersOpenedTable = ({ rows, isLoading }) => {
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
        (r.clientNames && r.clientNames.toLowerCase().includes(term)) ||
        (r.titleOrReference && r.titleOrReference.toLowerCase().includes(term)) ||
        (r.actingPersonName && r.actingPersonName.toLowerCase().includes(term)) ||
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
    <div className="table-card bg-white rounded shadow-sm p-3">
      {/* Search & Page Size Bar */}
      <Row className="mb-3 align-items-center g-2">
        <Col sm={6} md={4}>
          <div className="search-box position-relative">
            <Input
              type="text"
              className="form-control form-control-sm ps-4"
              placeholder="Search by Matter #, Client, Reference, Staff..."
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
              <th scope="col" style={{ position: "sticky", left: 0, zIndex: 2, backgroundColor: "#f3f6f9", minWidth: "120px" }}>Matter #</th>
              <th scope="col">Client Name(s)</th>
              <th scope="col">Reference / Subject</th>
              <th scope="col">Type & Sub-Type</th>
              <th scope="col">Status</th>
              <th scope="col">Instruction Date</th>
              <th scope="col">Acting Staff</th>
              <th scope="col">Assisting Staff</th>
              <th scope="col">Office / Branch</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" className="text-center py-5">
                  <Spinner color="primary" size="sm" className="me-2" />
                  <span className="text-muted fs-14">Loading Matters Opened report...</span>
                </td>
              </tr>
            ) : paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <tr key={row.matterId}>
                  <td style={{ position: "sticky", left: 0, zIndex: 1, backgroundColor: "#fff", minWidth: "120px", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.12)" }}>
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
                    <span className="fw-medium text-dark">{row.clientNames || "-"}</span>
                  </td>
                  <td>
                    <span className="text-muted fs-13 text-truncate d-inline-block" style={{ maxWidth: "220px" }}>
                      {row.titleOrReference || "-"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1 align-items-center">
                      <Badge color="primary" className="badge-soft-primary">
                        {row.type ? row.type.replace(/_/g, " ") : "-"}
                      </Badge>
                      {row.subType && (
                        <Badge color="info" className="badge-soft-info">
                          {row.subType.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td>{getStatusBadge(row.status)}</td>
                  <td>
                    <span className="text-muted fs-13">
                      {row.instructionDate ? row.instructionDate.slice(0, 10) : "-"}
                    </span>
                  </td>
                  <td>
                    <span className="fs-13 text-dark">{row.actingPersonName || "-"}</span>
                  </td>
                  <td>
                    <span className="fs-13 text-muted">{row.assistingPersonName || "-"}</span>
                  </td>
                  <td>
                    <span className="badge bg-light text-body border">{row.siteName || "-"}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-5">
                  <i className="ri-folder-info-line fs-36 text-muted mb-2 d-block"></i>
                  <p className="text-muted mb-0 fs-14">No matters found matching the selected filter criteria.</p>
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

export default MattersOpenedTable;
