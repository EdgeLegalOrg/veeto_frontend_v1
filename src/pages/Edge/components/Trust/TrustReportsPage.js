import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  Button,
  Col,
  FormGroup,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  Table,
  TabContent,
  TabPane,
} from "reactstrap";
import { toast } from "react-toastify";

import LoadingPage from "../../utils/LoadingPage";
import {
  fetchTrustAccounts,
  fetchTrustPaymentsCashBook,
  fetchTrustReceiptsCashBook,
  fetchTrustTrialBalance,
} from "../../trustApis";
import {
  Balance,
  EmptyState,
  TrustPage,
  errorMessage,
  money,
  monthEndOf,
  monthStartOf,
  shortDate,
} from "./TrustShared";

/**
 * The month-end reports - Rules 41, 44, 45 and 48(2)(b).
 *
 * All four are derived from the transactions every time they are asked for,
 * never stored. Two stored versions of the same figures that must agree is the
 * first disagreement an examination looks for.
 *
 * The trial balance shows whether it agreed with the cash book. Here it always
 * will, because both are summed from one table - which is the point of the
 * design, so the report says so rather than leaving it to be assumed.
 */
const TrustReportsPage = () => {
  document.title = "Trust reports | Veeto";

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [tab, setTab] = useState("trial");

  const [fromDate, setFromDate] = useState(monthStartOf(new Date()));
  const [toDate, setToDate] = useState(monthEndOf(new Date()));

  const [trialBalance, setTrialBalance] = useState(null);
  const [receipts, setReceipts] = useState(null);
  const [payments, setPayments] = useState(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const { data } = await fetchTrustAccounts();

        if (data.success) {
          const list = data.data || [];
          setAccounts(list);

          if (list.length === 1) {
            setAccountId(list[0].id);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadAccounts();
  }, []);

  const run = useCallback(async () => {
    if (!accountId || !fromDate || !toDate) {
      return;
    }

    setLoading(true);

    try {
      // All three at once. They are three views of the same month and somebody
      // checking a reconciliation needs to move between them without waiting
      // for a fetch each time.
      const [trial, receiptBook, paymentBook] = await Promise.all([
        fetchTrustTrialBalance(accountId, toDate),
        fetchTrustReceiptsCashBook(accountId, fromDate, toDate),
        fetchTrustPaymentsCashBook(accountId, fromDate, toDate),
      ]);

      if (trial.data.success) {
        setTrialBalance(trial.data.data);
      } else {
        toast.error(errorMessage(trial.data, "The trial balance could not be run."));
      }

      if (receiptBook.data.success) {
        setReceipts(receiptBook.data.data);
      }

      if (paymentBook.data.success) {
        setPayments(paymentBook.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("The reports could not be run.");
    } finally {
      setLoading(false);
    }
  }, [accountId, fromDate, toDate]);

  useEffect(() => {
    run();
  }, [run]);

  const debitLines = (trialBalance?.lines || []).filter((line) => line.inDebit);

  return (
    <Fragment>
      <TrustPage
        title="Trust reports"
        accounts={accounts}
        accountId={accountId}
        onAccountChange={setAccountId}
        note="Both cash books, the trial balance and the debit balance exception report are summed from the transactions each time they are run. Nothing here is stored, so none of it can drift out of step with the ledgers."
      >
        <Row className="mb-3">
          <Col md={3}>
            <FormGroup>
              <Label>From</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </FormGroup>
          </Col>
          <Col md={3}>
            <FormGroup>
              <Label>To / as at</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </FormGroup>
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <FormGroup>
              <Button color="light" onClick={run} disabled={!accountId}>
                Run
              </Button>
            </FormGroup>
          </Col>
        </Row>

        {!accountId ? (
          <EmptyState>Choose a trust account.</EmptyState>
        ) : (
          <Fragment>
            {trialBalance && !trialBalance.agreesWithCashBook && (
              <div className="alert alert-danger">
                <strong>The trial balance does not agree with the cash book.</strong>{" "}
                Trial balance {money(trialBalance.total)} against a cash book
                balance of {money(trialBalance.cashBookBalance)}. Both are summed
                from the same transactions, so this is a defect rather than a
                data entry problem, and the month cannot be reconciled until it
                is resolved.
              </div>
            )}

            <Nav tabs className="mb-3">
              <NavItem>
                <NavLink
                  href="#"
                  active={tab === "trial"}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab("trial");
                  }}
                >
                  Trial balance
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="#"
                  active={tab === "receipts"}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab("receipts");
                  }}
                >
                  Receipts cash book
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="#"
                  active={tab === "payments"}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab("payments");
                  }}
                >
                  Payments cash book
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="#"
                  active={tab === "debits"}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab("debits");
                  }}
                >
                  Debit balances
                  {debitLines.length > 0 && (
                    <span className="text-danger"> ({debitLines.length})</span>
                  )}
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={tab}>
              <TabPane tabId="trial">
                {!trialBalance ? (
                  <EmptyState>Run the report.</EmptyState>
                ) : (
                  <div className="table-responsive">
                    <Table size="sm" className="align-middle table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Matter</th>
                          <th>Client</th>
                          <th>Description</th>
                          <th className="text-end">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trialBalance.lines.map((line) => (
                          <tr
                            key={line.trustLedgerId}
                            className={line.closed ? "text-muted" : ""}
                          >
                            <td>{line.matterNumber || "-"}</td>
                            <td>{line.clientName}</td>
                            <td>
                              {line.matterDescription || "-"}
                              {line.closed && (
                                <span className="badge bg-light text-dark ms-2">
                                  closed
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              <Balance value={line.balance} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="fw-bold border-top">
                          <td colSpan={3}>
                            Total as at {shortDate(trialBalance.asAt)}
                            {trialBalance.agreesWithCashBook && (
                              <span className="text-success fw-normal ms-2 small">
                                agrees with the cash book
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            <Balance value={trialBalance.total} />
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                )}
              </TabPane>

              <TabPane tabId="receipts">
                <CashBook book={receipts} counterpartyLabel="Received from" />
              </TabPane>

              <TabPane tabId="payments">
                <CashBook book={payments} counterpartyLabel="Payee" />
              </TabPane>

              <TabPane tabId="debits">
                {debitLines.length === 0 ? (
                  <div className="alert alert-success mb-0">
                    No trust ledger was in debit as at{" "}
                    {shortDate(trialBalance?.asAt)}. Rule 41 asks for this
                    report, and an empty one is the answer an examiner hopes to
                    see.
                  </div>
                ) : (
                  <Fragment>
                    <div className="alert alert-danger">
                      A ledger in debit means client money has been paid out that
                      the client did not have in the account. Under s154 this may
                      be a reportable deficiency, and the obligation is
                      immediate. Record it on the Compliance screen.
                    </div>
                    <Table size="sm" className="align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Matter</th>
                          <th>Client</th>
                          <th className="text-end">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debitLines.map((line) => (
                          <tr key={line.trustLedgerId}>
                            <td>{line.matterNumber || "-"}</td>
                            <td>{line.clientName}</td>
                            <td className="text-end">
                              <Balance value={line.balance} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="fw-bold border-top">
                          <td colSpan={2}>Total in debit</td>
                          <td className="text-end">
                            <Balance value={trialBalance?.debitTotal} />
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </Fragment>
                )}
              </TabPane>
            </TabContent>
          </Fragment>
        )}
      </TrustPage>

      {loading && <LoadingPage />}
    </Fragment>
  );
};

/** One cash book - Rule 44 or 45. */
const CashBook = ({ book, counterpartyLabel }) => {
  if (!book) {
    return <EmptyState>Run the report.</EmptyState>;
  }

  if (!book.lines || book.lines.length === 0) {
    return (
      <EmptyState>
        No {book.book === "RECEIPTS" ? "receipts" : "payments"} between{" "}
        {shortDate(book.fromDate)} and {shortDate(book.toDate)}.
      </EmptyState>
    );
  }

  return (
    <div className="table-responsive">
      <Table size="sm" className="align-middle table-nowrap mb-0">
        <thead className="table-light">
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>{counterpartyLabel}</th>
            <th>Client ledger</th>
            <th>Details</th>
            <th className="text-end">Amount</th>
            <th className="text-end">Account balance</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-muted">
            <td>{shortDate(book.fromDate)}</td>
            <td colSpan={4}>Balance brought forward</td>
            <td />
            <td className="text-end">
              <Balance value={book.openingBalance} />
            </td>
          </tr>
          {book.lines.map((line) => (
            <tr key={line.trustTransactionId}>
              <td>{shortDate(line.transactionDate)}</td>
              <td>
                {line.reference || "-"}
                {line.transactionType === "REVERSAL" && (
                  <span className="badge bg-danger ms-1">reversal</span>
                )}
                {line.cancelled && (
                  <span className="badge bg-light text-dark ms-1">cancelled</span>
                )}
              </td>
              <td>{line.counterparty || "-"}</td>
              <td>{line.clientName || "-"}</td>
              <td className="small">{line.description || "-"}</td>
              <td className="text-end">{money(line.amount)}</td>
              <td className="text-end">
                <Balance value={line.runningBalance} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="fw-bold border-top">
            <td colSpan={5}>
              Total {book.book === "RECEIPTS" ? "received" : "paid"} in the period
            </td>
            <td className="text-end">{money(book.total)}</td>
            <td className="text-end">
              <Balance value={book.closingBalance} />
            </td>
          </tr>
        </tfoot>
      </Table>
      <small className="text-muted">
        Journal transfers are not in the cash books: they move money between
        ledgers without the bank being involved, so a cash book that listed them
        would not agree with the statement. A reversal of a receipt or payment
        is here, because the money really did move.
      </small>
    </div>
  );
};

export default TrustReportsPage;
