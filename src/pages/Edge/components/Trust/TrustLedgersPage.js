import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
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
import { checkHasPermission } from "../../utils/utilFunc";
import {
  AUTHORISETRUSTPAYMENT,
  CREATETRUSTRECEIPT,
  MANAGETRUSTACCOUNT,
  PREPARETRUSTPAYMENT,
} from "../../utils/RightConstants";
import {
  authoriseTrustPayment,
  cancelTrustPayment,
  cancelTrustReceipt,
  closeTrustLedger,
  fetchTrustAccounts,
  fetchTrustLedgers,
  fetchTrustPayments,
  fetchTrustReceipts,
  issueTrustReceipt,
  markTrustChequeStale,
  openTrustLedger,
  prepareTrustPayment,
} from "../../trustApis";
import {
  Balance,
  EmptyState,
  StatusBadge,
  TrustPage,
  errorMessage,
  money,
  shortDate,
  toApiDate,
} from "./TrustShared";

/**
 * Trust ledgers, and the receipts and payments on one - Rules 36, 42, 43, 47.
 *
 * One screen rather than three, because the work is one task: somebody looking
 * at a client's trust position needs to see the balance, what came in and what
 * went out, and act on it. Splitting receipts and payments onto separate pages
 * would mean checking a balance on one page before issuing a receipt on
 * another.
 */
const TrustLedgersPage = () => {
  document.title = "Trust ledgers | Veeto";

  const canManage = checkHasPermission(MANAGETRUSTACCOUNT);
  const canReceipt = checkHasPermission(CREATETRUSTRECEIPT);
  const canPrepare = checkHasPermission(PREPARETRUSTPAYMENT);
  const canAuthorise = checkHasPermission(AUTHORISETRUSTPAYMENT);

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [includeClosed, setIncludeClosed] = useState(false);
  const [ledgers, setLedgers] = useState([]);

  const [selected, setSelected] = useState(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);

      try {
        const { data } = await fetchTrustAccounts();

        if (data.success) {
          const list = data.data || [];
          setAccounts(list);

          // Pre-select when there is only one account, which is the common
          // case - making somebody choose from a list of one is friction with
          // no purpose.
          if (list.length === 1) {
            setAccountId(list[0].id);
          }
        } else {
          toast.error(errorMessage(data, "The trust accounts could not be loaded."));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const loadLedgers = useCallback(async () => {
    if (!accountId) {
      setLedgers([]);
      return;
    }

    setLoading(true);

    try {
      const { data } = await fetchTrustLedgers(accountId, includeClosed);

      if (data.success) {
        setLedgers(data.data || []);
      } else {
        toast.error(errorMessage(data, "The ledgers could not be loaded."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The ledgers could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [accountId, includeClosed]);

  useEffect(() => {
    loadLedgers();
  }, [loadLedgers]);

  const close = async (ledger) => {
    if (
      !window.confirm(
        `Close the ledger for ${ledger.clientName}? It must be at a nil balance.`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await closeTrustLedger(ledger.id);

      if (data.success) {
        toast.success("Ledger closed.");
        loadLedgers();
      } else {
        toast.error(errorMessage(data, "The ledger could not be closed."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The ledger could not be closed.");
    } finally {
      setLoading(false);
    }
  };

  const debitCount = ledgers.filter((l) => l.inDebit).length;

  return (
    <Fragment>
      <TrustPage
        title="Trust ledgers"
        accounts={accounts}
        accountId={accountId}
        onAccountChange={setAccountId}
        note="One ledger per matter, on one trust account, for the life of the matter. Balances are summed from the transactions every time they are shown, so a ledger, the cash books and the trial balance cannot disagree."
        actions={
          <Fragment>
            <FormGroup check className="mb-0 me-2">
              <Input
                type="checkbox"
                id="includeClosed"
                checked={includeClosed}
                onChange={(e) => setIncludeClosed(e.target.checked)}
              />
              <Label check for="includeClosed" className="mb-0">
                Include closed
              </Label>
            </FormGroup>
            {canManage && accountId && (
              <Button color="success" onClick={() => setOpening(true)}>
                <span className="plusdiv">+</span> Open ledger
              </Button>
            )}
          </Fragment>
        }
      >
        {!accountId ? (
          <EmptyState>Choose a trust account to see its ledgers.</EmptyState>
        ) : ledgers.length === 0 && !loading ? (
          <EmptyState>No trust ledgers on this account yet.</EmptyState>
        ) : (
          <Fragment>
            {debitCount > 0 && (
              <div className="alert alert-danger py-2 px-3">
                <strong>
                  {debitCount} ledger{debitCount === 1 ? "" : "s"} in debit.
                </strong>{" "}
                A trust ledger in debit means client money has gone out that the
                client did not have in the account. Under s154 this may be a
                reportable deficiency - record it on the Compliance screen.
              </div>
            )}
            <div className="table-responsive">
              <Table className="align-middle table-nowrap mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Matter</th>
                    <th>Client</th>
                    <th>Description</th>
                    <th>Opened</th>
                    <th className="text-end">Balance</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {ledgers.map((ledger) => (
                    <tr key={ledger.id} className={ledger.closedDate ? "text-muted" : ""}>
                      <td>{ledger.matterNumber || "-"}</td>
                      <td className="fw-semibold">{ledger.clientName}</td>
                      <td>{ledger.matterDescription || "-"}</td>
                      <td>{shortDate(ledger.openedDate)}</td>
                      <td className="text-end">
                        <Balance value={ledger.balance} />
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <Button
                            size="sm"
                            color="light"
                            onClick={() => setSelected(ledger)}
                          >
                            Open
                          </Button>
                          {canManage && !ledger.closedDate && (
                            <Button
                              size="sm"
                              color="light"
                              onClick={() => close(ledger)}
                            >
                              Close
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Fragment>
        )}
      </TrustPage>

      {opening && (
        <OpenLedgerForm
          trustAccountId={accountId}
          onClose={() => setOpening(false)}
          onSaved={() => {
            setOpening(false);
            loadLedgers();
          }}
        />
      )}

      {selected && (
        <LedgerDetail
          ledger={selected}
          canReceipt={canReceipt}
          canPrepare={canPrepare}
          canAuthorise={canAuthorise}
          onClose={() => setSelected(null)}
          onChanged={loadLedgers}
        />
      )}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

/** Opening a ledger - Rule 47. */
const OpenLedgerForm = ({ trustAccountId, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    matterId: "",
    clientName: "",
    clientAddress: "",
    matterDescription: "",
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();

    if (!form.matterId) {
      toast.error("The ledger needs a matter.");
      return;
    }

    if (!form.clientName.trim()) {
      toast.error("Rule 47 requires the ledger to name the client.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await openTrustLedger({
        ...form,
        trustAccountId,
        matterId: Number(form.matterId),
      });

      if (data.success) {
        toast.success("Trust ledger opened.");
        onSaved();
      } else {
        toast.error(errorMessage(data, "The ledger could not be opened."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The ledger could not be opened.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" centered>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Open a trust ledger
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submit}>
          <FormGroup>
            <Label>Matter ID</Label>
            <Input
              type="number"
              value={form.matterId}
              onChange={(e) => set("matterId", e.target.value)}
            />
            <small className="text-muted">
              The ledger can only be opened on an account the matter&apos;s
              office is allowed to use.
            </small>
          </FormGroup>
          <FormGroup>
            <Label>Client name</Label>
            <Input
              value={form.clientName}
              onChange={(e) => set("clientName", e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Client address</Label>
            <Input
              type="textarea"
              rows={2}
              value={form.clientAddress}
              onChange={(e) => set("clientAddress", e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Matter description</Label>
            <Input
              value={form.matterDescription}
              onChange={(e) => set("matterDescription", e.target.value)}
            />
          </FormGroup>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? "Opening..." : "Open ledger"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

/** One ledger: its receipts and its payments. */
const LedgerDetail = ({
  ledger,
  canReceipt,
  canPrepare,
  canAuthorise,
  onClose,
  onChanged,
}) => {
  const [tab, setTab] = useState("receipts");
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [issuing, setIssuing] = useState(false);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [receiptResponse, paymentResponse] = await Promise.all([
        fetchTrustReceipts(ledger.id),
        fetchTrustPayments(ledger.id),
      ]);

      if (receiptResponse.data.success) {
        setReceipts(receiptResponse.data.data || []);
      }

      if (paymentResponse.data.success) {
        setPayments(paymentResponse.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("The ledger's entries could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [ledger.id]);

  useEffect(() => {
    load();
  }, [load]);

  const afterChange = () => {
    load();
    onChanged();
  };

  const cancelReceipt = async (receipt) => {
    const reason = window.prompt(
      "Why is this receipt being cancelled? A dishonoured cheque, a duplicate, or a data entry error - the reason is kept with the receipt and is the first thing an examiner reads about it."
    );

    if (!reason || !reason.trim()) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await cancelTrustReceipt(receipt.id, reason.trim());

      if (data.success) {
        toast.success(`Receipt ${receipt.receiptNumber} cancelled.`);
        afterChange();
      } else {
        toast.error(errorMessage(data, "The receipt could not be cancelled."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The receipt could not be cancelled.");
    } finally {
      setLoading(false);
    }
  };

  const authorise = async (payment) => {
    if (
      !window.confirm(
        `Authorise this payment of ${money(payment.amount)} to ${
          payment.payeeName
        }? The money leaves the trust account when you do.`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await authoriseTrustPayment(payment.id);

      if (data.success) {
        toast.success("Payment authorised.");
        afterChange();
      } else {
        // The server's refusals are the interesting part here - not a
        // signatory, or you prepared it yourself - so they are shown as they
        // come back rather than replaced with something generic.
        toast.error(errorMessage(data, "The payment could not be authorised."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The payment could not be authorised.");
    } finally {
      setLoading(false);
    }
  };

  const cancelPayment = async (payment) => {
    const authorised = payment.status === "AUTHORISED";
    const reason = window.prompt(
      authorised
        ? "Why is this authorised payment being reversed? The amount goes back into the client's ledger."
        : "Why is this prepared payment being cancelled? Nothing has moved yet."
    );

    if (!reason || !reason.trim()) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await cancelTrustPayment(payment.id, reason.trim());

      if (data.success) {
        toast.success(authorised ? "Payment reversed." : "Payment cancelled.");
        afterChange();
      } else {
        toast.error(errorMessage(data, "The payment could not be cancelled."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The payment could not be cancelled.");
    } finally {
      setLoading(false);
    }
  };

  const markStale = async (payment) => {
    const reason = window.prompt(
      "Why is this cheque stale? The amount goes back into the client's ledger, and the practice then holds money it still owes the payee."
    );

    if (!reason || !reason.trim()) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await markTrustChequeStale(payment.id, reason.trim());

      if (data.success) {
        toast.success("Cheque marked stale and credited back.");
        afterChange();
      } else {
        toast.error(errorMessage(data, "The cheque could not be marked stale."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The cheque could not be marked stale.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" size="xl" centered scrollable>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        {ledger.clientName} - {ledger.matterNumber || `ledger ${ledger.id}`}
        <span className="ms-3">
          <Balance value={ledger.balance} />
        </span>
      </ModalHeader>
      <ModalBody>
        <Nav tabs className="mb-3">
          <NavItem>
            <NavLink
              href="#"
              active={tab === "receipts"}
              onClick={(e) => {
                e.preventDefault();
                setTab("receipts");
              }}
            >
              Receipts ({receipts.length})
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
              Payments ({payments.length})
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={tab}>
          <TabPane tabId="receipts">
            <div className="d-flex justify-content-end mb-2">
              {canReceipt && !ledger.closedDate && (
                <Button color="success" size="sm" onClick={() => setIssuing(true)}>
                  <span className="plusdiv">+</span> Issue receipt
                </Button>
              )}
            </div>
            {receipts.length === 0 ? (
              <EmptyState>No receipts on this ledger.</EmptyState>
            ) : (
              <Table size="sm" className="align-middle table-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>No.</th>
                    <th>Date</th>
                    <th>Received from</th>
                    <th>Form</th>
                    <th>Reason</th>
                    <th className="text-end">Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      className={receipt.cancelledDate ? "text-muted" : ""}
                    >
                      <td>{receipt.receiptNumber}</td>
                      <td>{shortDate(receipt.receiptDate)}</td>
                      <td>{receipt.receivedFrom}</td>
                      <td>{receipt.receivedForm || "-"}</td>
                      <td>
                        {receipt.reason}
                        {receipt.cancelledDate && (
                          <div className="text-danger small">
                            Cancelled {shortDate(receipt.cancelledDate)}:{" "}
                            {receipt.cancellationReason}
                          </div>
                        )}
                      </td>
                      <td className="text-end">{money(receipt.amount)}</td>
                      <td className="text-end">
                        {canReceipt && !receipt.cancelledDate && (
                          <Button
                            size="sm"
                            color="light"
                            onClick={() => cancelReceipt(receipt)}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <small className="text-muted">
              A cancelled receipt keeps its number and is never deleted - Rule
              36 numbers receipts consecutively, so a missing number is a gap
              nothing explains.
            </small>
          </TabPane>

          <TabPane tabId="payments">
            <div className="d-flex justify-content-end mb-2">
              {canPrepare && !ledger.closedDate && (
                <Button color="success" size="sm" onClick={() => setPaying(true)}>
                  <span className="plusdiv">+</span> Prepare payment
                </Button>
              )}
            </div>
            {payments.length === 0 ? (
              <EmptyState>No payments on this ledger.</EmptyState>
            ) : (
              <Table size="sm" className="align-middle table-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Payee</th>
                    <th>Basis</th>
                    <th>Status</th>
                    <th className="text-end">Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        {payment.paymentMethod === "CHEQUE"
                          ? `Cheque ${payment.chequeNumber || "-"}`
                          : `EFT ${payment.eftReference || "-"}`}
                      </td>
                      <td>{shortDate(payment.paymentDate)}</td>
                      <td>{payment.payeeName}</td>
                      <td className="small">
                        {(payment.withdrawalBasis || "").replace(/_/g, " ")}
                      </td>
                      <td>
                        <StatusBadge status={payment.status} />
                        {payment.preparedBy && (
                          <div className="small text-muted">
                            Prepared by {payment.preparedBy}
                            {payment.authorisedBy
                              ? `, authorised by ${payment.authorisedBy}`
                              : ""}
                          </div>
                        )}
                        {payment.cancellationReason && (
                          <div className="small text-danger">
                            {payment.cancellationReason}
                          </div>
                        )}
                      </td>
                      <td className="text-end">{money(payment.amount)}</td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          {canAuthorise && payment.status === "PREPARED" && (
                            <Button
                              size="sm"
                              color="success"
                              onClick={() => authorise(payment)}
                            >
                              Authorise
                            </Button>
                          )}
                          {(canPrepare || canAuthorise) &&
                            ["PREPARED", "AUTHORISED"].includes(payment.status) && (
                              <Button
                                size="sm"
                                color="light"
                                onClick={() => cancelPayment(payment)}
                              >
                                {payment.status === "PREPARED" ? "Cancel" : "Reverse"}
                              </Button>
                            )}
                          {canAuthorise &&
                            payment.status === "AUTHORISED" &&
                            payment.paymentMethod === "CHEQUE" && (
                              <Button
                                size="sm"
                                color="light"
                                onClick={() => markStale(payment)}
                              >
                                Stale
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <small className="text-muted">
              A payment is prepared by one person and authorised by another. The
              money only moves on authorisation, and the authoriser must be a
              current signatory on this account.
            </small>
          </TabPane>
        </TabContent>

        {issuing && (
          <IssueReceiptForm
            ledger={ledger}
            onClose={() => setIssuing(false)}
            onSaved={() => {
              setIssuing(false);
              afterChange();
            }}
          />
        )}

        {paying && (
          <PreparePaymentForm
            ledger={ledger}
            onClose={() => setPaying(false)}
            onSaved={() => {
              setPaying(false);
              afterChange();
            }}
          />
        )}

        {loading && <LoadingPage />}
      </ModalBody>
    </Modal>
  );
};

/** Issuing a receipt - Rule 36. */
const IssueReceiptForm = ({ ledger, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    receiptDate: toApiDate(new Date()),
    moneyReceivedDate: toApiDate(new Date()),
    receivedFrom: "",
    receivedForm: "EFT",
    reason: "",
    instrumentReference: "",
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("A receipt must be for a positive amount.");
      return;
    }

    if (!form.receivedFrom.trim()) {
      toast.error("Rule 36 requires the name of the person the money came from.");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Rule 36 requires the reason the money was received.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await issueTrustReceipt({
        ...form,
        trustLedgerId: ledger.id,
        amount: Number(form.amount),
      });

      if (data.success) {
        toast.success(`Receipt ${data.data.receiptNumber} issued.`);
        onSaved();
      } else {
        toast.error(errorMessage(data, "The receipt could not be issued."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The receipt could not be issued.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" centered>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Issue a trust receipt
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submit}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Received as</Label>
                <Input
                  type="select"
                  value={form.receivedForm}
                  onChange={(e) => set("receivedForm", e.target.value)}
                >
                  <option value="EFT">EFT</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="BANK_CHEQUE">Bank cheque</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="MONEY_ORDER">Money order</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Receipt date</Label>
                <Input
                  type="date"
                  value={form.receiptDate}
                  onChange={(e) => set("receiptDate", e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Date the money was received</Label>
                <Input
                  type="date"
                  value={form.moneyReceivedDate}
                  onChange={(e) => set("moneyReceivedDate", e.target.value)}
                />
                <small className="text-muted">
                  Separate from the receipt date on purpose - they can differ.
                </small>
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <Label>Received from</Label>
            <Input
              value={form.receivedFrom}
              onChange={(e) => set("receivedFrom", e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Reason the money was received</Label>
            <Input
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
              placeholder="e.g. deposit on purchase of 12 Smith Street"
            />
          </FormGroup>
          <FormGroup>
            <Label>Cheque or transfer reference</Label>
            <Input
              value={form.instrumentReference}
              onChange={(e) => set("instrumentReference", e.target.value)}
            />
          </FormGroup>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? "Issuing..." : "Issue receipt"}
            </Button>
          </div>
          <small className="text-muted d-block mt-2">
            The receipt number is allocated by the server and cannot be chosen.
          </small>
        </Form>
      </ModalBody>
    </Modal>
  );
};

/** Preparing a payment - Rules 42 and 43. */
const PreparePaymentForm = ({ ledger, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    paymentMethod: "EFT",
    paymentDate: toApiDate(new Date()),
    amount: "",
    payeeName: "",
    payeeAccountName: "",
    payeeBSB: "",
    payeeAccountNumber: "",
    chequeNumber: "",
    onBehalfOf: "",
    reason: "",
    withdrawalBasis: "NOT_COSTS",
    invoiceId: "",
    authorityReference: "",
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const isCosts = form.withdrawalBasis !== "NOT_COSTS";

  const submit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("A payment must be for a positive amount.");
      return;
    }

    if (!form.payeeName.trim()) {
      toast.error("Rule 43 requires the name of the person being paid.");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Rule 43 requires the reason for the payment.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await prepareTrustPayment({
        ...form,
        trustLedgerId: ledger.id,
        amount: Number(form.amount),
        invoiceId: form.invoiceId ? Number(form.invoiceId) : null,
      });

      if (data.success) {
        toast.success(
          "Payment prepared. A second person holding the authoriser right has to release it."
        );
        onSaved();
      } else {
        toast.error(errorMessage(data, "The payment could not be prepared."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The payment could not be prepared.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" size="lg" centered scrollable>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Prepare a trust payment
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submit}>
          <Row>
            <Col md={4}>
              <FormGroup>
                <Label>Method</Label>
                <Input
                  type="select"
                  value={form.paymentMethod}
                  onChange={(e) => set("paymentMethod", e.target.value)}
                >
                  <option value="EFT">EFT</option>
                  <option value="CHEQUE">Cheque</option>
                </Input>
                <small className="text-muted">
                  There is no cash option: s144 allows a withdrawal by cheque or
                  electronic transfer only.
                </small>
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                />
                <small className="text-muted">
                  Available: {money(ledger.balance)}
                </small>
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Payment date</Label>
                <Input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => set("paymentDate", e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Payee</Label>
                <Input
                  value={form.payeeName}
                  onChange={(e) => set("payeeName", e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>On behalf of</Label>
                <Input
                  value={form.onBehalfOf}
                  onChange={(e) => set("onBehalfOf", e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>

          {form.paymentMethod === "CHEQUE" ? (
            <FormGroup>
              <Label>Cheque number</Label>
              <Input
                value={form.chequeNumber}
                onChange={(e) => set("chequeNumber", e.target.value)}
              />
            </FormGroup>
          ) : (
            <Row>
              <Col md={5}>
                <FormGroup>
                  <Label>Account name</Label>
                  <Input
                    value={form.payeeAccountName}
                    onChange={(e) => set("payeeAccountName", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>BSB</Label>
                  <Input
                    value={form.payeeBSB}
                    onChange={(e) => set("payeeBSB", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Account number</Label>
                  <Input
                    value={form.payeeAccountNumber}
                    onChange={(e) => set("payeeAccountNumber", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
          )}

          <FormGroup>
            <Label>Reason for the payment</Label>
            <Input
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>What this withdrawal relies on</Label>
            <Input
              type="select"
              value={form.withdrawalBasis}
              onChange={(e) => set("withdrawalBasis", e.target.value)}
            >
              <option value="NOT_COSTS">Not a withdrawal of costs</option>
              <option value="BILL_ISSUED">A bill has been given to the client</option>
              <option value="AUTHORITY">A written authority from the client</option>
              <option value="REIMBURSEMENT">
                Reimbursement of money already paid
              </option>
              <option value="COMMERCIAL_GOVERNMENT_CLIENT">
                Commercial or government client agreement
              </option>
            </Input>
            <small className="text-muted">
              Rule 42(3) to (6). Withdrawing costs needs the bill or the
              authority relied on to be recorded, and the payment cannot be
              authorised without it.
            </small>
          </FormGroup>

          {isCosts && (
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Invoice ID</Label>
                  <Input
                    type="number"
                    value={form.invoiceId}
                    onChange={(e) => set("invoiceId", e.target.value)}
                  />
                  <small className="text-muted">
                    The matching office receipt is raised against this invoice
                    automatically when the payment is authorised.
                  </small>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Authority reference</Label>
                  <Input
                    value={form.authorityReference}
                    onChange={(e) => set("authorityReference", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? "Preparing..." : "Prepare payment"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default TrustLedgersPage;
