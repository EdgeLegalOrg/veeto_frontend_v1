import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Table } from "reactstrap";
import fileDownload from "js-file-download";
import { formatCurrency } from "../../../utils/utilFunc";
import { reportDate, rangeLabel } from "../utils/reportComparison";

const METRICS = {
  matters: [["Matters Opened", "totalMatters"], ["Open Matters", "openCount"], ["Closed Matters", "closedCount"]],
  fees: [["Fees Excl. GST", "totalProfessionalFeesExGst", true], ["Fees Incl. GST", "totalProfessionalFeesIncGst", true],
    ["Average Fee per Matter", "averageFeePerMatter", true], ["Invoices Billed", "totalInvoicesCount"], ["Invoiced Matters", "invoicedMattersCount"]],
  settlements: [["Total Settlements", "totalSettlements"], ["Pending", "pendingCount"], ["Overdue", "overdueCount"]],
  outstanding: [["Outstanding Balance", "totalOutstandingBalance", true], ["Unpaid Invoices", "totalUnpaidInvoicesCount"],
    ["0–30 Days", "current0To30Balance", true], ["31–60 Days", "overdue31To60Balance", true],
    ["61–90 Days", "overdue61To90Balance", true], ["90+ Days", "overdue90PlusBalance", true]],
};

const ReportComparison = ({ type, dateRange, comparisonRange, fetchReport, payload, summary,
  isPrimaryLoading, refreshTrigger, renderDetails }) => {
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [retry, setRetry] = useState(0);
  // A stable key avoids repeat requests caused by new payload objects during rendering.
  const requestKey = comparisonRange ? JSON.stringify({ ...payload,
    startDate: reportDate(comparisonRange[0]), endDate: reportDate(comparisonRange[1]) }) : null;

  useEffect(() => {
    if (!requestKey) { setResult(null); return; }
    let current = true;
    const controller = new AbortController();
    setResult(null);
    const load = async () => {
      try {
        const response = await fetchReport(JSON.parse(requestKey), { signal: controller.signal });
        if (response?.data?.success === false) throw new Error("Report request failed");
        const data = response?.data?.data || response?.data;
        if (!data?.summary || !Array.isArray(data.rows)) throw new Error("Report data unavailable");
        if (current) setResult({ key: requestKey, data });
      } catch (error) {
        if (current) setResult({ key: requestKey, error: true });
      }
    };
    load();
    return () => { current = false; controller.abort(); };
  }, [requestKey, fetchReport, refreshTrigger, retry]);

  if (!comparisonRange) return null;
  const ready = result?.key === requestKey && result.data && !isPrimaryLoading && summary;
  const display = (value, currency) => currency ? formatCurrency(value) : value.toLocaleString();
  const rows = ready ? METRICS[type].map(([label, key, currency]) => {
    const selected = Number(summary[key] || 0);
    const previous = Number(result.data.summary[key] || 0);
    const difference = Math.round((selected - previous) * 100) / 100;
    // A zero comparison value has no defined percentage increase.
    const percent = previous === 0 ? (selected === 0 ? "0%" : "—")
      : `${difference > 0 ? "+" : ""}${((difference / Math.abs(previous)) * 100).toFixed(1)}%`;
    return { label, selected, previous, difference, percent, currency };
  }) : [];
  const exportComparison = () => {
    const csv = [
      ["Metric", `Selected: ${rangeLabel(dateRange)}`, `Comparison: ${rangeLabel(comparisonRange)}`, "Difference", "Change (%)"],
      ...rows.map((row) => [row.label, row.selected, row.previous, row.difference, row.percent]),
    ].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    fileDownload(csv, `${type}_comparison_${reportDate(dateRange[0])}.csv`, "text/csv;charset=utf-8");
  };
  return (
    <Card className="mb-3">
      <CardBody className="p-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 className="mb-0 text-primary">Period Comparison</h5>
          <Button color="success" size="sm" onClick={exportComparison} disabled={!ready}>
            <i className="ri-file-excel-2-line me-1" />Export Comparison
          </Button>
        </div>
        {result?.error ? <div className="text-danger" role="alert">
          Could not load the comparison. <Button color="link" size="sm" onClick={() => setRetry((value) => value + 1)}>Retry</Button>
        </div> : !isPrimaryLoading && !summary ? (
          <p className="text-danger mb-0" role="alert">The selected period could not be loaded. Refresh the report to compare.</p>
        ) : !ready ? <p className="text-muted mb-0">Loading comparison…</p> : <>
          <div className="table-responsive">
            <Table className="align-middle table-nowrap mb-0" hover>
              <thead className="table-light"><tr><th>Metric</th><th>Selected period<br /><small>{rangeLabel(dateRange)}</small></th>
                <th>Comparison period<br /><small>{rangeLabel(comparisonRange)}</small></th><th>Difference</th><th>Change</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.label}><td>{row.label}</td>
                <td>{display(row.selected, row.currency)}</td><td>{display(row.previous, row.currency)}</td>
                <td>{row.difference > 0 ? "+" : ""}{display(row.difference, row.currency)}</td><td>{row.percent}</td></tr>)}</tbody>
            </Table>
          </div>
          <Button color="light" size="sm" className="mt-3" onClick={() => setShowDetails((value) => !value)}>
            {showDetails ? "Hide" : "View"} Comparison Details
          </Button>
          {showDetails && <div className="mt-3" key={requestKey}>{renderDetails(result.data.rows)}</div>}
        </>}
      </CardBody>
    </Card>
  );
};

export default ReportComparison;
