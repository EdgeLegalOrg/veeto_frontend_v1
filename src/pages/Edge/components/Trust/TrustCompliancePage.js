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
import { MANAGETRUSTACCOUNT } from "../../utils/RightConstants";
import {
  closeTrustDeficiency,
  deriveTrustDepositInputs,
  fetchTrustAccounts,
  fetchTrustDeficiencies,
  fetchTrustDeposits,
  fetchTrustStaleCheques,
  fetchTrustUnrecordedDebits,
  recordTrustDeficiency,
  recordTrustDeficiencyReport,
  recordTrustDeposit,
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
 * Compliance records: statutory deposit, deficiencies, stale cheques.
 *
 * None of these screens decides anything. They derive the objective figures -
 * the lowest balance over a period, which ledgers are in debit, which cheques
 * are old enough to be stale - and record what the practice decided.
 *
 * In particular the statutory deposit amount is NOT calculated. It comes from
 * the Law Society's current determination, and whether one calculation covers
 * the practice or each account needs its own is still an open question for the
 * external examiner. A confident number from an invented formula would be worse
 * than no number, because somebody would rely on it.
 */
const TrustCompliancePage = () => {
  document.title = "Trust compliance | Veeto";

  const canManage = checkHasPermission(MANAGETRUSTACCOUNT);

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [tab, setTab] = useState("deficiencies");

  const [deficiencies, setDeficiencies] = useState([]);
  const [unrecorded, setUnrecorded] = useState([]);
  const [staleCheques, setStaleCheques] = useState([]);
  const [deposits, setDeposits] = useState([]);

  const [recording, setRecording] = useState(null);
  const [depositForm, setDepositForm] = useState(false);

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

  const load = useCallback(async () => {
    setLoading(true);

    try {
      // Deposits are practice-wide, so they load whether or not an account is
      // chosen - H§14.5 may mean one calculation for the whole practice.
      const depositResponse = await fetchTrustDeposits();

      if (depositResponse.data.success) {
        setDeposits(depositResponse.data.data || []);
      }

      if (!accountId) {
        setDeficiencies([]);
        setUnrecorded([]);
        setStaleCheques([]);
        return;
      }

      const asAt = toApiDate(new Date());

      const [deficiencyResponse, unrecordedResponse, staleResponse] =
        await Promise.all([
          fetchTrustDeficiencies(accountId),
          fetchTrustUnrecordedDebits(accountId, asAt),
          fetchTrustStaleCheques(accountId, null),
        ]);

      if (deficiencyResponse.data.success) {
        setDeficiencies(deficiencyResponse.data.data || []);
      }

      if (unrecordedResponse.data.success) {
        setUnrecorded(unrecordedResponse.data.data || []);
      }

      if (staleResponse.data.success) {
        setStaleCheques(staleResponse.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("The compliance records could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    load();
  }, [load]);

  const reportDeficiency = async (deficiency) => {
    const reportedTo = window.prompt(
      "Who was this reported to? s154 makes a deficiency reportable and the obligation is immediate.",
      "Law Society of NSW"
    );

    if (!reportedTo || !reportedTo.trim()) {
      return;
    }

    const reportReference = window.prompt("Reference for the report, if there is one:");

    setLoading(true);

    try {
      const { data } = await recordTrustDeficiencyReport(deficiency.id, {
        reportedTo: reportedTo.trim(),
        reportReference: reportReference ? reportReference.trim() : null,
      });

      if (data.success) {
        toast.success("Report recorded.");
        load();
      } else {
        toast.error(errorMessage(data, "The report could not be recorded."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The report could not be recorded.");
    } finally {
      setLoading(false);
    }
  };

  const closeOut = async (deficiency, status) => {
    const notes = window.prompt(
      status === "RECTIFIED"
        ? "How was this rectified? The record is kept either way."
        : "Why is this not reportable? The reasoning is kept - the record cannot be deleted."
    );

    if (!notes || !notes.trim()) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await closeTrustDeficiency(deficiency.id, {
        status,
        rectificationNotes: notes.trim(),
        rectifiedDate: toApiDate(new Date()),
      });

      if (data.success) {
        toast.success("Deficiency closed.");
        load();
      } else {
        toast.error(errorMessage(data, "The deficiency could not be closed."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The deficiency could not be closed.");
    } finally {
      setLoading(false);
    }
  };

  const openCount = deficiencies.filter((d) => d.reportOutstanding).length;

  return (
    <Fragment>
      <TrustPage
        title="Compliance"
        accounts={accounts}
        accountId={accountId}
        onAccountChange={setAccountId}
        note="Nothing on this screen decides anything. The figures are derived; what the practice concluded is recorded. A deficiency record can never be deleted - under s154 that would remove the evidence that the practice knew of it."
      >
        <Nav tabs className="mb-3">
          <NavItem>
            <NavLink
              href="#"
              active={tab === "deficiencies"}
              onClick={(e) => {
                e.preventDefault();
                setTab("deficiencies");
              }}
            >
              Deficiencies
              {openCount > 0 && <span className="text-danger"> ({openCount})</span>}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              active={tab === "stale"}
              onClick={(e) => {
                e.preventDefault();
                setTab("stale");
              }}
            >
              Stale cheques
              {staleCheques.length > 0 && (
                <span className="text-warning"> ({staleCheques.length})</span>
              )}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              active={tab === "deposit"}
              onClick={(e) => {
                e.preventDefault();
                setTab("deposit");
              }}
            >
              Statutory deposit
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={tab}>
          <TabPane tabId="deficiencies">
            {!accountId ? (
              <EmptyState>Choose a trust account.</EmptyState>
            ) : (
              <Fragment>
                {unrecorded.length > 0 && (
                  <div className="alert alert-danger">
                    <strong>
                      {unrecorded.length} ledger
                      {unrecorded.length === 1 ? "" : "s"} in debit with no
                      deficiency recorded.
                    </strong>
                    <div className="small mt-1">
                      Rule 41 asks for the exception report; s154 is about
                      disclosing what it finds. This list should be empty.
                    </div>
                    <Table size="sm" className="mt-2 mb-0 bg-white">
                      <thead>
                        <tr>
                          <th>Matter</th>
                          <th>Client</th>
                          <th className="text-end">Balance</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {unrecorded.map((line) => (
                          <tr key={line.trustLedgerId}>
                            <td>{line.matterNumber || "-"}</td>
                            <td>{line.clientName}</td>
                            <td className="text-end">
                              <Balance value={line.balance} />
                            </td>
                            <td className="text-end">
                              {canManage && (
                                <Button
                                  size="sm"
                                  color="light"
                                  onClick={() =>
                                    setRecording({
                                      trustLedgerId: line.trustLedgerId,
                                      cause: "DEBIT_LEDGER",
                                      amount: Math.abs(Number(line.balance) || 0),
                                      description: `Trust ledger for ${line.clientName} in debit by ${money(
                                        Math.abs(Number(line.balance) || 0)
                                      )}`,
                                    })
                                  }
                                >
                                  Record
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                <div className="d-flex justify-content-end mb-2">
                  {canManage && (
                    <Button color="success" size="sm" onClick={() => setRecording({})}>
                      <span className="plusdiv">+</span> Record a deficiency
                    </Button>
                  )}
                </div>

                {deficiencies.length === 0 ? (
                  <EmptyState>No deficiencies recorded on this account.</EmptyState>
                ) : (
                  <div className="table-responsive">
                    <Table size="sm" className="align-middle table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Discovered</th>
                          <th>Cause</th>
                          <th>What was found</th>
                          <th className="text-end">Amount</th>
                          <th>Status</th>
                          <th>Reported</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {deficiencies.map((deficiency) => (
                          <tr key={deficiency.id}>
                            <td>{shortDate(deficiency.discoveredDate)}</td>
                            <td className="small">
                              {(deficiency.cause || "")
                                .replace(/_/g, " ")
                                .toLowerCase()}
                            </td>
                            <td style={{ maxWidth: "22rem" }}>
                              <div className="small">{deficiency.description}</div>
                              {deficiency.rectificationNotes && (
                                <div className="small text-muted">
                                  {deficiency.rectificationNotes}
                                </div>
                              )}
                            </td>
                            <td className="text-end">{money(deficiency.amount)}</td>
                            <td>
                              <StatusBadge status={deficiency.status} />
                            </td>
                            <td>
                              {deficiency.reportedDate ? (
                                <Fragment>
                                  {shortDate(deficiency.reportedDate)}
                                  <div className="small text-muted">
                                    {deficiency.reportedTo}
                                    {deficiency.reportReference &&
                                      ` (${deficiency.reportReference})`}
                                  </div>
                                </Fragment>
                              ) : (
                                <span className="text-danger">
                                  Not reported
                                  {deficiency.daysSinceDiscovery !== null &&
                                    deficiency.daysSinceDiscovery !== undefined &&
                                    ` - ${deficiency.daysSinceDiscovery} days`}
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              {canManage && (
                                <div className="d-flex gap-1 justify-content-end">
                                  {!deficiency.reportedDate && (
                                    <Button
                                      size="sm"
                                      color="light"
                                      onClick={() => reportDeficiency(deficiency)}
                                    >
                                      Reported
                                    </Button>
                                  )}
                                  {deficiency.status === "OPEN" && (
                                    <Fragment>
                                      <Button
                                        size="sm"
                                        color="light"
                                        onClick={() =>
                                          closeOut(deficiency, "RECTIFIED")
                                        }
                                      >
                                        Rectified
                                      </Button>
                                      <Button
                                        size="sm"
                                        color="light"
                                        onClick={() =>
                                          closeOut(deficiency, "NOT_REPORTABLE")
                                        }
                                      >
                                        Not reportable
                                      </Button>
                                    </Fragment>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Fragment>
            )}
          </TabPane>

          <TabPane tabId="stale">
            {!accountId ? (
              <EmptyState>Choose a trust account.</EmptyState>
            ) : staleCheques.length === 0 ? (
              <div className="alert alert-success mb-0">
                No cheque on this account was authorised more than 15 months ago.
              </div>
            ) : (
              <Fragment>
                <div className="alert alert-warning">
                  These are <strong>candidates, not findings</strong>. The system
                  does not know whether a cheque was presented - that comes off
                  the bank statement. What it can say is that these are old
                  enough that H§6.8.8 requires the practice to deal with them.
                  Mark one stale from the ledger screen; the amount goes back to
                  the client&apos;s ledger and the practice then holds money it
                  still owes the payee.
                </div>
                <Table size="sm" className="align-middle table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Cheque</th>
                      <th>Date</th>
                      <th>Payee</th>
                      <th>Reason</th>
                      <th>Authorised by</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staleCheques.map((cheque) => (
                      <tr key={cheque.id}>
                        <td>{cheque.chequeNumber || "-"}</td>
                        <td>{shortDate(cheque.paymentDate)}</td>
                        <td>{cheque.payeeName}</td>
                        <td className="small">{cheque.reason}</td>
                        <td className="small">{cheque.authorisedBy}</td>
                        <td className="text-end">{money(cheque.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Fragment>
            )}
          </TabPane>

          <TabPane tabId="deposit">
            <div className="alert alert-light border">
              <strong>The required amount is not calculated here.</strong>
              <div className="small mt-1">
                It is set by the Law Society&apos;s current determination, and
                whether H§14.5 means one calculation across the practice or one
                per account is still an open question for the external examiner.
                What this screen derives is the lowest balance over the period and
                the closing balance - the figures any determination works on. The
                amount and the provision it comes from are entered, and the basis
                is required.
              </div>
            </div>

            <div className="d-flex justify-content-end mb-2">
              {canManage && (
                <Button color="success" size="sm" onClick={() => setDepositForm(true)}>
                  <span className="plusdiv">+</span> Record a calculation
                </Button>
              )}
            </div>

            {deposits.length === 0 ? (
              <EmptyState>No statutory deposit calculations recorded.</EmptyState>
            ) : (
              <div className="table-responsive">
                <Table size="sm" className="align-middle table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Calculated</th>
                      <th>Account</th>
                      <th>Period</th>
                      <th className="text-end">Lowest balance</th>
                      <th className="text-end">Required</th>
                      <th className="text-end">Held</th>
                      <th>Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((deposit) => (
                      <tr key={deposit.id}>
                        <td>
                          {shortDate(deposit.calculationDate)}
                          <div className="small text-muted">
                            by {deposit.calculatedBy}
                          </div>
                        </td>
                        <td>
                          {deposit.trustAccountName || (
                            <span className="text-muted">Practice-wide</span>
                          )}
                        </td>
                        <td className="small">
                          {shortDate(deposit.periodFromDate)} to{" "}
                          {shortDate(deposit.periodToDate)}
                        </td>
                        <td className="text-end">
                          {money(deposit.lowestBalance)}
                          {deposit.lowestBalanceDate && (
                            <div className="small text-muted">
                              {shortDate(deposit.lowestBalanceDate)}
                            </div>
                          )}
                          {deposit.lowestAtPeriodStart && (
                            <div className="small text-muted">at period start</div>
                          )}
                        </td>
                        <td className="text-end">{money(deposit.depositRequired)}</td>
                        <td className="text-end">
                          {money(deposit.depositHeld)}
                          {deposit.shortfallExists && (
                            <div className="small text-danger fw-bold">
                              short {money(deposit.shortfall)}
                            </div>
                          )}
                        </td>
                        <td style={{ maxWidth: "20rem" }}>
                          <div className="small">{deposit.basis}</div>
                          {deposit.depositAccountReference && (
                            <div className="small text-muted">
                              {deposit.depositAccountReference}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </TabPane>
        </TabContent>
      </TrustPage>

      {recording && (
        <DeficiencyForm
          preset={recording}
          trustAccountId={accountId}
          onClose={() => setRecording(null)}
          onSaved={() => {
            setRecording(null);
            load();
          }}
        />
      )}

      {depositForm && (
        <DepositFormModal
          accounts={accounts}
          defaultAccountId={accountId}
          onClose={() => setDepositForm(false)}
          onSaved={() => {
            setDepositForm(false);
            load();
          }}
        />
      )}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

/** Recording a deficiency - s154. */
const DeficiencyForm = ({ preset, trustAccountId, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    trustLedgerId: preset.trustLedgerId || "",
    discoveredDate: toApiDate(new Date()),
    amount: preset.amount || "",
    cause: preset.cause || "OTHER",
    description: preset.description || "",
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("A deficiency needs an amount.");
      return;
    }

    if (!form.description.trim()) {
      toast.error(
        "Describe what was found. An amount with no explanation discloses nothing."
      );
      return;
    }

    setSaving(true);

    try {
      const { data } = await recordTrustDeficiency({
        ...form,
        trustAccountId,
        trustLedgerId: form.trustLedgerId ? Number(form.trustLedgerId) : null,
        amount: Number(form.amount),
      });

      if (data.success) {
        toast.success(
          "Deficiency recorded. s154 makes this reportable and the obligation is immediate."
        );
        onSaved();
      } else {
        toast.error(errorMessage(data, "The deficiency could not be recorded."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The deficiency could not be recorded.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" centered>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Record a deficiency
      </ModalHeader>
      <ModalBody>
        <p className="small text-muted">
          This record cannot be deleted. If it turns out not to be reportable,
          close it as not reportable with the reasoning - deleting it would
          remove the evidence that the practice knew of it.
        </p>
        <Form onSubmit={submit}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Discovered</Label>
                <Input
                  type="date"
                  value={form.discoveredDate}
                  onChange={(e) => set("discoveredDate", e.target.value)}
                />
              </FormGroup>
            </Col>
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
          </Row>
          <FormGroup>
            <Label>Cause</Label>
            <Input
              type="select"
              value={form.cause}
              onChange={(e) => set("cause", e.target.value)}
            >
              <option value="DEBIT_LEDGER">A client ledger in debit</option>
              <option value="DISHONOURED_RECEIPT">
                Money paid out against a receipt that was dishonoured
              </option>
              <option value="UNRECONCILED_DIFFERENCE">
                A reconciliation that will not balance
              </option>
              <option value="MISAPPROPRIATION">Trust money taken</option>
              <option value="OTHER">Something else</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Trust ledger ID (leave blank if account level)</Label>
            <Input
              type="number"
              value={form.trustLedgerId}
              onChange={(e) => set("trustLedgerId", e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>What was found</Label>
            <Input
              type="textarea"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </FormGroup>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? "Recording..." : "Record"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

/**
 * Recording a statutory deposit calculation.
 *
 * Derives the inputs first, shows them, and asks for the amount and the basis.
 * The derived figures are re-read by the server on save, so what is stored
 * always sits against the figures the accounts actually show.
 */
const DepositFormModal = ({ accounts, defaultAccountId, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [deriving, setDeriving] = useState(false);
  const [derived, setDerived] = useState(null);
  const [form, setForm] = useState({
    trustAccountId: defaultAccountId || "",
    periodFromDate: "",
    periodToDate: toApiDate(new Date()),
    depositRequired: "",
    depositHeld: "",
    basis: "",
    depositAccountReference: "",
    notes: "",
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const derive = async () => {
    if (!form.periodFromDate || !form.periodToDate) {
      toast.error("Choose the period.");
      return;
    }

    setDeriving(true);

    try {
      const { data } = await deriveTrustDepositInputs(
        form.trustAccountId ? Number(form.trustAccountId) : null,
        form.periodFromDate,
        form.periodToDate
      );

      if (data.success) {
        setDerived(data.data);
      } else {
        toast.error(errorMessage(data, "The figures could not be derived."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The figures could not be derived.");
    } finally {
      setDeriving(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.depositRequired === "") {
      toast.error("Enter the amount required.");
      return;
    }

    if (!form.basis.trim()) {
      toast.error(
        "Record the determination or handbook provision the amount was worked out from."
      );
      return;
    }

    setSaving(true);

    try {
      const { data } = await recordTrustDeposit({
        ...form,
        trustAccountId: form.trustAccountId ? Number(form.trustAccountId) : null,
        depositRequired: Number(form.depositRequired),
        depositHeld: form.depositHeld === "" ? 0 : Number(form.depositHeld),
      });

      if (data.success) {
        toast.success("Calculation recorded.");
        onSaved();
      } else {
        toast.error(errorMessage(data, "The calculation could not be recorded."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The calculation could not be recorded.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" size="lg" centered scrollable>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Record a statutory deposit calculation
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submit}>
          <Row>
            <Col md={4}>
              <FormGroup>
                <Label>Scope</Label>
                <Input
                  type="select"
                  value={form.trustAccountId}
                  onChange={(e) => {
                    set("trustAccountId", e.target.value);
                    setDerived(null);
                  }}
                >
                  <option value="">The whole practice</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Period from</Label>
                <Input
                  type="date"
                  value={form.periodFromDate}
                  onChange={(e) => {
                    set("periodFromDate", e.target.value);
                    setDerived(null);
                  }}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Period to</Label>
                <Input
                  type="date"
                  value={form.periodToDate}
                  onChange={(e) => {
                    set("periodToDate", e.target.value);
                    setDerived(null);
                  }}
                />
              </FormGroup>
            </Col>
          </Row>

          <Button color="light" type="button" onClick={derive} disabled={deriving}>
            {deriving ? "Working..." : "Derive the figures"}
          </Button>

          {derived && (
            <Table size="sm" borderless className="mt-3 mb-3">
              <tbody>
                <tr>
                  <td>Lowest balance over the period</td>
                  <td className="text-end">
                    <Balance value={derived.lowestBalance} />
                    {derived.lowestBalanceDate && (
                      <span className="small text-muted ms-2">
                        on {shortDate(derived.lowestBalanceDate)}
                      </span>
                    )}
                    {derived.lowestAtPeriodStart && (
                      <span className="small text-muted ms-2">
                        (the opening position - the balance only rose)
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Closing balance</td>
                  <td className="text-end">
                    <Balance value={derived.closingBalance} />
                  </td>
                </tr>
              </tbody>
            </Table>
          )}

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Amount required</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.depositRequired}
                  onChange={(e) => set("depositRequired", e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Amount currently held on deposit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.depositHeld}
                  onChange={(e) => set("depositHeld", e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>Basis - the determination or provision relied on</Label>
            <Input
              type="textarea"
              rows={2}
              value={form.basis}
              onChange={(e) => set("basis", e.target.value)}
              placeholder="e.g. Law Society determination of [date], handbook 14.2"
            />
            <small className="text-muted">
              Required. A figure with nothing behind it is the first thing an
              examiner asks about.
            </small>
          </FormGroup>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Deposit account reference</Label>
                <Input
                  value={form.depositAccountReference}
                  onChange={(e) => set("depositAccountReference", e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? "Recording..." : "Record"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default TrustCompliancePage;
