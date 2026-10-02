import React from "react";
import { Alert, Badge, Card, Container, Input } from "reactstrap";

import BreadCrumb from "../../../../Components/Common/BreadCrumb";

// ---------------------------------------------------------------------------
// Shared pieces for the trust screens.
//
// Ten screens that all need the same four things: an account picker, money
// formatted the same way everywhere, a status badge, and the page shell. Worth
// one module rather than ten copies - particularly for the money format, where
// two screens disagreeing about rounding on a trust balance is the kind of
// thing that gets noticed in an examination.
// ---------------------------------------------------------------------------

/**
 * Money, for display.
 *
 * Always two decimal places and always a sign for negatives, because a trust
 * ledger in debit is the single most important thing on any of these screens
 * and "-1,200.00" must never render as "1,200.00".
 *
 * Intl, not toFixed: toFixed gives no thousands separators, and a six-figure
 * trust balance with no separators is genuinely hard to read off a screen.
 */
export const money = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const n = Number(value);

  if (Number.isNaN(n)) {
    return "-";
  }

  return n.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * A date for display, from whatever the server sent.
 *
 * The API returns dates in a few shapes depending on the column type, so this
 * takes the first ten characters of an ISO string where it can and falls back
 * to Date parsing. Returns a dash rather than "Invalid Date", which is what
 * users report as a bug.
 */
export const shortDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * yyyy-MM-dd, which is what every trust endpoint expects for a date parameter.
 *
 * Built from the local date parts rather than toISOString(), which converts to
 * UTC first - in Sydney that turns a date picked as the 1st into the 30th of
 * the previous month for most of the day, and a month-end pack generated for
 * the wrong month cannot be deleted.
 */
export const toApiDate = (value) => {
  if (!value) {
    return "";
  }

  const d = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${d.getFullYear()}-${month}-${day}`;
};

/** The last day of the month a date falls in, as yyyy-MM-dd. */
export const monthEndOf = (value) => {
  const d = value ? new Date(value) : new Date();

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  return toApiDate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
};

/** The first day of the month a date falls in, as yyyy-MM-dd. */
export const monthStartOf = (value) => {
  const d = value ? new Date(value) : new Date();

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  return toApiDate(new Date(d.getFullYear(), d.getMonth(), 1));
};

/** Colours for the statuses the trust screens show. */
const STATUS_COLOURS = {
  PREPARED: "warning",
  AUTHORISED: "success",
  CANCELLED: "secondary",
  REVERSED: "danger",
  STALE: "dark",
  DRAFT: "warning",
  COMPLETED: "success",
  OPEN: "danger",
  RECTIFIED: "success",
  NOT_REPORTABLE: "secondary",
};

/** A status badge, with the underscores taken out for reading. */
export const StatusBadge = ({ status }) => {
  if (!status) {
    return <span className="text-muted">-</span>;
  }

  return (
    <Badge color={STATUS_COLOURS[status] || "light"} className="text-uppercase">
      {String(status).replace(/_/g, " ")}
    </Badge>
  );
};

/**
 * A balance, red and signed when it is in debit.
 *
 * A debit balance on a trust ledger means client money has gone out that the
 * client did not have in the account, which under s154 may be a reportable
 * deficiency. It should not look like any other number on the page.
 */
export const Balance = ({ value }) => {
  const n = Number(value);
  const inDebit = !Number.isNaN(n) && n < 0;

  return (
    <span className={inDebit ? "text-danger fw-bold" : ""}>{money(value)}</span>
  );
};

/** The account picker every screen starts with. */
export const AccountSelector = ({ accounts, value, onChange, allowAll }) => (
  <Input
    type="select"
    value={value || ""}
    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    style={{ maxWidth: "26rem" }}
  >
    {allowAll && <option value="">All trust accounts</option>}
    {!allowAll && <option value="">Select a trust account...</option>}
    {(accounts || []).map((account) => (
      <option key={account.id} value={account.id}>
        {account.name}
        {account.closedDate ? " (closed)" : ""}
      </option>
    ))}
  </Input>
);

/**
 * The page shell: breadcrumb, title, and the account picker where the screen
 * needs one.
 */
export const TrustPage = ({
  title,
  accounts,
  accountId,
  onAccountChange,
  allowAllAccounts,
  actions,
  children,
  note,
}) => (
  <div className="page-content">
    <Container fluid>
      <BreadCrumb title={title} pageTitle="Trust Accounting" />
      <Card className="p-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h5 className="mb-0 me-2">{title}</h5>
            {onAccountChange && (
              <AccountSelector
                accounts={accounts}
                value={accountId}
                onChange={onAccountChange}
                allowAll={allowAllAccounts}
              />
            )}
          </div>
          <div className="d-flex align-items-center gap-2">{actions}</div>
        </div>
        {note && (
          <Alert color="light" className="border mb-3 py-2 px-3 small mb-3">
            {note}
          </Alert>
        )}
        {children}
      </Card>
    </Container>
  </div>
);

/** Shown instead of an empty table, so a blank screen never looks broken. */
export const EmptyState = ({ children }) => (
  <div className="text-center text-muted py-4">{children}</div>
);

/**
 * Turns a failed ResponseData into something worth showing.
 *
 * The server's Error enum carries a message written for the person reading it -
 * "Only an authorised signatory on this trust account can authorise a payment
 * from it" - so that message is shown rather than replaced with "Something
 * went wrong". On these screens the reason a thing was refused is usually the
 * whole point.
 */
export const errorMessage = (data, fallback) => {
  if (data && data.error && data.error.message) {
    return data.error.message;
  }

  return fallback || "Something went wrong, please try again.";
};

/** Saves a PDF the browser just fetched as a blob. */
export const saveBlobAsFile = (blob, fileName) => {
  const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", fileName || "download.pdf");
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Released on the next tick rather than immediately: revoking before the
  // click has been processed cancels the download in some browsers.
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};
