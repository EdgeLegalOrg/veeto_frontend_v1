import React from "react";
import { Button, Spinner } from "reactstrap";
import "./ContinuousXeroList.css";

/** A sentinel plus an explicit keyboard/retry action; no page-number controls. */
export const ContinuousListStatus = ({ sentinelRef, loading, error, hasMore, loadMore, count }) => (
  <div ref={sentinelRef} className="xero-continuous-status">
    {loading ? (
      <span role="status">
        <Spinner size="sm" className="me-2" />
        Loading more records...
      </span>
    ) : error ? (
      <div role="alert">
        {error}
        <Button size="sm" color="primary" outline className="ms-2" onClick={loadMore}>
          Retry
        </Button>
      </div>
    ) : hasMore ? (
      <Button size="sm" color="primary" outline onClick={loadMore}>
        Load more
      </Button>
    ) : (
      <span role="status">{count ? "All matching records loaded." : "No matching records."}</span>
    )}
  </div>
);

/** Preserve the full scroll height while mounting only nearby table rows. */
export const ContinuousRowSpace = ({ height }) =>
  height > 0 ? (
    <tr className="xero-row-space" aria-hidden="true">
      <td colSpan={7} style={{ height, padding: 0, border: 0 }} />
    </tr>
  ) : null;
