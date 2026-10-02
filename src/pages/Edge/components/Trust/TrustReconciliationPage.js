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
  Row,
  Table,
} from "reactstrap";
import { toast } from "react-toastify";

import LoadingPage from "../../utils/LoadingPage";
import { checkHasPermission } from "../../utils/utilFunc";
import { GENERATETRUSTMONTHEND } from "../../utils/RightConstants";
import {
  addTrustReconciliationItem,
  completeTrustReconciliation,
  createTrustReconciliation,
  deleteTrustReconciliationDraft,
  fetchTrustAccounts,
  fetchTrustReconciliation,
  fetchTrustReconciliations,
  removeTrustReconciliationItem,
  updateTrustReconciliation,
} from "../../trustApis";
import {
  Balance,
  EmptyState,
  StatusBadge,
  TrustPage,
  errorMessage,
  money,
  monthEndOf,
  shortDate,
} from "./TrustShared";

/**
 * The monthly ADI reconciliation - Rule 48.
 *
 * What the user supplies is one number and some items: the closing balance off
 * the bank statement, and the unpresented cheques and outstanding deposits that
 * explain the gap between it and the practice's own cash book. Everything else
 * is derived.
 *
 * Once completed the statement is frozen and there is no way back. That is
 * Rule 38(4) and (5), and it is why the confirmation before completing says so.
 */
const TrustReconciliationPage = () => {
  document.title = "Trust reconciliation | Veeto";

  const canReconcile = checkHasPermission(GENERATETRUSTMONTHEND);

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [list, setList] = useState([]);
  const [starting, setStarting] = useState(false);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const { data } = await fetchTrustAccounts();

        if (data.success) {
          const accountList = data.data || [];
          setAccounts(accountList);

          if (accountList.length === 1) {
            setAccountId(accountList[0].id);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadAccounts();
  }, []);

  const load = useCallback(async () => {
    if (!accountId) {
      setList([]);
      return;
    }

    setLoading(true);

    try {
      const { data } = await fetchTrustReconciliations(accountId);

      if (data.success) {
        setList(data.data || []);
      } else {
        toast.error(errorMessage(data, "The reconciliations could not be loaded."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The reconciliations could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    load();
  }, [load]);

  const discard = async (reconciliation) => {
    if (
      !window.confirm(
        `Discard the draft reconciliation for ${shortDate(
          reconciliation.reconciliationDate
        )}? Its unpresented items go with it.`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await deleteTrustReconciliationDraft(reconciliation.id);

      if (data.success) {
        toast.success("Draft discarded.");
        load();
      } else {
        toast.error(errorMessage(data, "The draft could not be discarded."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The draft could not be discarded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <TrustPage
        title="ADI reconciliation"
        accounts={accounts}
        accountId={accountId}
        onAccountChange={setAccountId}
        note="One reconciliation per account per month. Rule 48(1) allows 15 working days after month end. A completed reconciliation cannot be altered or reopened - a correction goes in the following month."
        actions={
          canReconcile &&
          accountId && (
            <Button color="success" onClick={() => setStarting(true)}>
              <span className="plusdiv">+</span> Start a reconciliation
            </Button>
          )
        }
      >
        {!accountId ? (
          <EmptyState>Choose a trust account.</EmptyState>
        ) : list.length === 0 && !loading ? (
          <EmptyState>
            No reconciliations on this account yet. Rule 48 wants one for every
            month the account has been open.
          </EmptyState>
        ) : (
          <div className="table-responsive">
            <Table className="align-middle table-nowrap mb-0">
              <thead className="table-light">
                <tr>
                  <th>Month end</th>
                  <th>Status</th>
                  <th className="text-end">ADI balance</th>
                  <th className="text-end">Cash book</th>
                  <th className="text-end">Difference</th>
                  <th>Debit ledgers</th>
                  <th>Completed</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((reconciliation) => (
                  <tr key={reconciliation.id}>
                    <td className="fw-semibold">
                      {shortDate(reconciliation.reconciliationDate)}
                    </td>
                    <td>
                      <StatusBadge status={reconciliation.status} />
                    </td>
                    <td className="text-end">
                      {money(reconciliation.adiClosingBalance)}
                    </td>
                    <td className="text-end">
                      {money(reconciliation.cashBookBalance)}
                    </td>
                    <td className="text-end">
                      {reconciliation.balanced ? (
                        <span className="text-success">Balanced</span>
                      ) : (
                        <span className="text-danger fw-bold">
                          {money(reconciliation.difference)}
                        </span>
                      )}
                    </td>
                    <td>
                      {reconciliation.debitLedgerCount > 0 ? (
                        <span className="text-danger fw-bold">
                          {reconciliation.debitLedgerCount}
                        </span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td>
                      {reconciliation.completedOn ? (
                        <Fragment>
                          {shortDate(reconciliation.completedOn)}
                          <div className="small text-muted">
                            by {reconciliation.completedBy}
                            {reconciliation.daysToComplete !== null &&
                              reconciliation.daysToComplete !== undefined &&
                              ` - ${reconciliation.daysToComplete} days after month end`}
                          </div>
                        </Fragment>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <Button
                          size="sm"
                          color="light"
                          onClick={() => setOpenId(reconciliation.id)}
                        >
                          {reconciliation.status === "DRAFT" ? "Work on" : "View"}
                        </Button>
                        {canReconcile && reconciliation.status === "DRAFT" && (
                          <Button
                            size="sm"
                            color="light"
                            onClick={() => discard(reconciliation)}
                          >
                            Discard
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </TrustPage>

      {starting && (
        <StartForm
          trustAccountId={accountId}
          onClose={() => setStarting(false)}
          onSaved={(id) => {
            setStarting(false);
            load();
            setOpenId(id);
          }}
        />
      )}

      {openId && (
        <ReconciliationDetail
          reconciliationId={openId}
          canReconcile={canReconcile}
          onClose={() => {
            setOpenId(null);
            load();
          }}
        />
      )}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

/** Starting a reconciliation: the month and the ADI closing balance. */
const StartForm = ({ trustAccountId, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    reconciliationDate: monthEndOf(new Date()),
    adiClosingBalance: "",
    adiStatementReference: "",
    notes: "",
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();

    if (!form.reconciliationDate) {
      toast.error("Choose the month end being reconciled.");
      return;
    }

    if (form.adiClosingBalance === "") {
      toast.error("Enter the closing balance from the bank statement.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await createTrustReconciliation({
        ...form,
        trustAccountId,
        adiClosingBalance: Number(form.adiClosingBalance),
      });

      if (data.success) {
        toast.success("Reconciliation started.");
        onSaved(data.data.id);
      } else {
        toast.error(errorMessage(data, "The reconciliation could not be started."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The reconciliation could not be started.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" centered>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Start a reconciliation
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submit}>
          <FormGroup>
            <Label>Month end</Label>
            <Input
              type="date"
              value={form.reconciliationDate}
              onChange={(e) => set("reconciliationDate", e.target.value)}
            />
            <small className="text-muted">
              The month being reconciled, not today. A month that has not ended
              cannot be reconciled.
            </small>
          </FormGroup>
          <FormGroup>
            <Label>Closing balance per the bank statement</Label>
            <Input
              type="number"
              step="0.01"
              value={form.adiClosingBalance}
              onChange={(e) => set("adiClosingBalance", e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Statement reference</Label>
            <Input
              value={form.adiStatementReference}
              onChange={(e) => set("adiStatementReference", e.target.value)}
              placeholder="e.g. STMT-2026-09"
            />
          </FormGroup>
          <FormGroup>
            <Label>Notes</Label>
            <Input
              type="textarea"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </FormGroup>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? "Starting..." : "Start"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

/** Working on a reconciliation: the statement, its items, and completing it. */
const ReconciliationDetail = ({ reconciliationId, canReconcile, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [reconciliation, setReconciliation] = useState(null);
  const [adi, setAdi] = useState("");
  const [reference, setReference] = useState("");
  const [item, setItem] = useState({
    itemType: "UNPRESENTED_CHEQUE",
    itemDate: "",
    reference: "",
    description: "",
    amount: "",
  });

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await fetchTrustReconciliation(reconciliationId);

      if (data.success) {
        setReconciliation(data.data);
        setAdi(
          data.data.adiClosingBalance === null ? "" : String(data.data.adiClosingBalance)
        );
        setReference(data.data.adiStatementReference || "");
      } else {
        toast.error(errorMessage(data, "The reconciliation could not be loaded."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The reconciliation could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [reconciliationId]);

  useEffect(() => {
    load();
  }, [load]);

  const isDraft = reconciliation?.status === "DRAFT";
  const editable = isDraft && canReconcile;

  const saveAdi = async () => {
    setLoading(true);

    try {
      const { data } = await updateTrustReconciliation({
        id: reconciliationId,
        checksum: reconciliation.checksum,
        adiClosingBalance: adi === "" ? null : Number(adi),
        adiStatementReference: reference,
        notes: reconciliation.notes,
      });

      if (data.success) {
        toast.success("Saved. The derived figures have been re-read.");
        setReconciliation(data.data);
      } else {
        toast.error(errorMessage(data, "The reconciliation could not be saved."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The reconciliation could not be saved.");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();

    if (!item.itemDate || item.amount === "") {
      toast.error("An item needs a date and an amount.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await addTrustReconciliationItem(reconciliationId, {
        ...item,
        amount: Number(item.amount),
      });

      if (data.success) {
        setReconciliation(data.data);
        setItem({
          itemType: item.itemType,
          itemDate: "",
          reference: "",
          description: "",
          amount: "",
        });
      } else {
        toast.error(errorMessage(data, "The item could not be added."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The item could not be added.");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (toRemove) => {
    setLoading(true);

    try {
      const { data } = await removeTrustReconciliationItem(
        reconciliationId,
        toRemove.id
      );

      if (data.success) {
        setReconciliation(data.data);
      } else {
        toast.error(errorMessage(data, "The item could not be removed."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The item could not be removed.");
    } finally {
      setLoading(false);
    }
  };

  const complete = async () => {
    if (
      !window.confirm(
        "Complete this reconciliation? It cannot be altered or reopened afterwards - Rule 38 requires the monthly records to be incapable of change once made. A correction goes in the following month."
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await completeTrustReconciliation(reconciliationId);

      if (data.success) {
        toast.success("Reconciliation completed. The month-end pack can now be produced.");
        setReconciliation(data.data);
      } else {
        toast.error(errorMessage(data, "The reconciliation could not be completed."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The reconciliation could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  if (!reconciliation) {
    return (
      <Modal isOpen toggle={onClose} backdrop="static" centered>
        <ModalHeader toggle={onClose} className="bg-light p-3">
          Reconciliation
        </ModalHeader>
        <ModalBody>{loading ? <LoadingPage /> : <EmptyState>Not found.</EmptyState>}</ModalBody>
      </Modal>
    );
  }

  return (
    <Modal isOpen toggle={onClose} backdrop="static" size="xl" centered scrollable>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Reconciliation - {shortDate(reconciliation.reconciliationDate)}{" "}
        <StatusBadge status={reconciliation.status} />
      </ModalHeader>
      <ModalBody>
        {reconciliation.earlierMonthsOutstanding?.length > 0 && (
          <div className="alert alert-warning py-2 px-3">
            Rule 48 wants a reconciliation for every month. These earlier months
            on this account have none completed:{" "}
            {reconciliation.earlierMonthsOutstanding
              .map((d) => shortDate(d))
              .join(", ")}
            . That does not stop this month being done.
          </div>
        )}

        <Row>
          <Col md={6}>
            <h6>Statement - Rule 48(3)</h6>
            <Table size="sm" borderless className="mb-2">
              <tbody>
                <tr>
                  <td>Balance per the bank statement</td>
                  <td className="text-end">
                    {editable ? (
                      <Input
                        type="number"
                        step="0.01"
                        bsSize="sm"
                        value={adi}
                        onChange={(e) => setAdi(e.target.value)}
                        style={{ maxWidth: "9rem", display: "inline-block" }}
                      />
                    ) : (
                      money(reconciliation.adiClosingBalance)
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Add outstanding deposits</td>
                  <td className="text-end">
                    {money(reconciliation.outstandingDepositsTotal)}
                  </td>
                </tr>
                <tr>
                  <td>Less unpresented cheques</td>
                  <td className="text-end">
                    ({money(reconciliation.unpresentedChequesTotal)})
                  </td>
                </tr>
                <tr>
                  <td>Add ADI adjustments</td>
                  <td className="text-end">
                    {money(reconciliation.adjustmentsTotal)}
                  </td>
                </tr>
                <tr>
                  <td>Less balance per the cash book</td>
                  <td className="text-end">
                    ({money(reconciliation.cashBookBalance)})
                  </td>
                </tr>
                <tr className="fw-bold border-top">
                  <td>Difference</td>
                  <td className="text-end">
                    {reconciliation.balanced ? (
                      <span className="text-success">{money(0)}</span>
                    ) : (
                      <span className="text-danger">
                        {money(reconciliation.difference)}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>

            {editable && (
              <Fragment>
                <FormGroup>
                  <Label className="small">Statement reference</Label>
                  <Input
                    bsSize="sm"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </FormGroup>
                <Button color="light" size="sm" onClick={saveAdi}>
                  Save and re-read the figures
                </Button>
              </Fragment>
            )}

            <div className="mt-3 small text-muted">
              Trial balance: <Balance value={reconciliation.trialBalanceTotal} /> -{" "}
              {reconciliation.trialBalanceTotal ===
              reconciliation.cashBookBalance ? (
                <span className="text-success">agrees with the cash book</span>
              ) : (
                <span className="text-danger fw-bold">
                  does NOT agree with the cash book
                </span>
              )}
              <br />
              Ledgers in debit at month end:{" "}
              {reconciliation.debitLedgerCount > 0 ? (
                <span className="text-danger fw-bold">
                  {reconciliation.debitLedgerCount}
                </span>
              ) : (
                "none"
              )}
            </div>
          </Col>

          <Col md={6}>
            <h6>Unpresented items</h6>
            {(reconciliation.items || []).length === 0 ? (
              <p className="text-muted small">
                Nothing yet. These are what explain the gap between the bank&apos;s
                figure and the practice&apos;s own.
              </p>
            ) : (
              <Table size="sm" className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th className="text-end">Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {reconciliation.items.map((row) => (
                    <tr key={row.id}>
                      <td>{shortDate(row.itemDate)}</td>
                      <td className="small">
                        {(row.itemType || "").replace(/_/g, " ").toLowerCase()}
                      </td>
                      <td className="small">
                        {row.reference || "-"}
                        {row.description && (
                          <div className="text-muted">{row.description}</div>
                        )}
                      </td>
                      <td className="text-end">{money(row.amount)}</td>
                      <td className="text-end">
                        {editable && (
                          <Button
                            size="sm"
                            color="light"
                            onClick={() => removeItem(row)}
                          >
                            &times;
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {editable && (
              <Form onSubmit={addItem} className="border-top pt-2">
                <Row className="g-2">
                  <Col md={6}>
                    <Input
                      type="select"
                      bsSize="sm"
                      value={item.itemType}
                      onChange={(e) =>
                        setItem((prev) => ({ ...prev, itemType: e.target.value }))
                      }
                    >
                      <option value="UNPRESENTED_CHEQUE">
                        Unpresented cheque
                      </option>
                      <option value="OUTSTANDING_DEPOSIT">
                        Outstanding deposit
                      </option>
                      <option value="ADI_ADJUSTMENT">
                        ADI adjustment (signed)
                      </option>
                    </Input>
                  </Col>
                  <Col md={6}>
                    <Input
                      type="date"
                      bsSize="sm"
                      value={item.itemDate}
                      onChange={(e) =>
                        setItem((prev) => ({ ...prev, itemDate: e.target.value }))
                      }
                    />
                  </Col>
                  <Col md={6}>
                    <Input
                      bsSize="sm"
                      placeholder="Reference"
                      value={item.reference}
                      onChange={(e) =>
                        setItem((prev) => ({ ...prev, reference: e.target.value }))
                      }
                    />
                  </Col>
                  <Col md={6}>
                    <Input
                      type="number"
                      step="0.01"
                      bsSize="sm"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) =>
                        setItem((prev) => ({ ...prev, amount: e.target.value }))
                      }
                    />
                  </Col>
                  <Col md={12}>
                    <Input
                      bsSize="sm"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        setItem((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </Col>
                  <Col md={12} className="d-flex justify-content-end">
                    <Button color="light" size="sm" type="submit">
                      Add item
                    </Button>
                  </Col>
                </Row>
                <small className="text-muted">
                  Only an ADI adjustment may be negative - a bank error can go
                  either way. The others are always positive and the type decides
                  the direction.
                </small>
              </Form>
            )}
          </Col>
        </Row>

        {editable && (
          <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-3">
            <Button
              color="success"
              onClick={complete}
              disabled={!reconciliation.balanced}
              title={
                reconciliation.balanced
                  ? ""
                  : "The difference must be fully explained by unpresented items first."
              }
            >
              Complete reconciliation
            </Button>
          </div>
        )}

        {!isDraft && (
          <div className="alert alert-success mt-3 mb-0">
            Completed {shortDate(reconciliation.completedOn)} by{" "}
            {reconciliation.completedBy}. This statement and its items are frozen.
          </div>
        )}

        {loading && <LoadingPage />}
      </ModalBody>
    </Modal>
  );
};

export default TrustReconciliationPage;
