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
import { CREATETRUSTRECEIPT } from "../../utils/RightConstants";
import {
  downloadTrustStatement,
  fetchTrustAccounts,
  fetchTrustLedgers,
  fetchTrustStatementsAnnualOutstanding,
  fetchTrustStatementsUndelivered,
  generateTrustStatement,
  recordTrustStatementDelivery,
} from "../../trustApis";
import {
  Balance,
  EmptyState,
  TrustPage,
  errorMessage,
  money,
  saveBlobAsFile,
  shortDate,
  toApiDate,
} from "./TrustShared";

/**
 * Statements of account - Rule 52.
 *
 * Built around the thing that actually matters: Rule 52(1) requires the
 * practice to GIVE the client a statement, so a statement produced and left in
 * a folder discharges nothing. The default tab is therefore the undelivered
 * list, not a list of everything ever issued - the undelivered ones are the
 * only ones that represent an unmet obligation.
 *
 * The annual tab answers "which ledgers have not had one for this year end",
 * which is how the small-balance ledgers get missed when it is done by hand.
 */
const TrustStatementsPage = () => {
  document.title = "Trust statements | Veeto";

  const canIssue = checkHasPermission(CREATETRUSTRECEIPT);

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [tab, setTab] = useState("undelivered");

  const [undelivered, setUndelivered] = useState([]);
  const [outstanding, setOutstanding] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [yearEnd, setYearEnd] = useState(defaultYearEnd());
  const [generating, setGenerating] = useState(null);
  const [delivering, setDelivering] = useState(null);

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
    if (!accountId) {
      setUndelivered([]);
      setOutstanding([]);
      setLedgers([]);
      return;
    }

    setLoading(true);

    try {
      const [undeliveredResponse, outstandingResponse, ledgerResponse] =
        await Promise.all([
          fetchTrustStatementsUndelivered(accountId),
          fetchTrustStatementsAnnualOutstanding(accountId, yearEnd),
          fetchTrustLedgers(accountId, false),
        ]);

      if (undeliveredResponse.data.success) {
        setUndelivered(undeliveredResponse.data.data || []);
      }

      if (outstandingResponse.data.success) {
        setOutstanding(outstandingResponse.data.data || []);
      }

      if (ledgerResponse.data.success) {
        setLedgers(ledgerResponse.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("The statements could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [accountId, yearEnd]);

  useEffect(() => {
    load();
  }, [load]);

  const download = async (statement) => {
    setLoading(true);

    try {
      const response = await downloadTrustStatement(statement.id);

      saveBlobAsFile(
        response.data,
        statement.fileName || `trust-statement-${statement.id}.pdf`
      );
    } catch (error) {
      console.error(error);
      toast.error("The statement could not be downloaded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <TrustPage
        title="Client statements"
        accounts={accounts}
        accountId={accountId}
        onAccountChange={setAccountId}
        note="Rule 52 requires the practice to give the client a statement - producing one is not enough. A statement is recorded as delivered with the date, the method and who it went to, and only then does it count."
        actions={
          canIssue &&
          accountId && (
            <Button color="success" onClick={() => setGenerating({})}>
              <span className="plusdiv">+</span> Produce a statement
            </Button>
          )
        }
      >
        {!accountId ? (
          <EmptyState>Choose a trust account.</EmptyState>
        ) : (
          <Fragment>
            <Nav tabs className="mb-3">
              <NavItem>
                <NavLink
                  href="#"
                  active={tab === "undelivered"}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab("undelivered");
                  }}
                >
                  Not yet delivered
                  {undelivered.length > 0 && (
                    <span className="text-danger"> ({undelivered.length})</span>
                  )}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="#"
                  active={tab === "annual"}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab("annual");
                  }}
                >
                  Annual statements owed
                  {outstanding.length > 0 && (
                    <span className="text-warning"> ({outstanding.length})</span>
                  )}
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={tab}>
              <TabPane tabId="undelivered">
                {undelivered.length === 0 ? (
                  <div className="alert alert-success mb-0">
                    Every statement produced on this account has been recorded as
                    delivered.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table size="sm" className="align-middle table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Period</th>
                          <th>Reason</th>
                          <th>Produced</th>
                          <th className="text-end">Closing balance</th>
                          <th>Document</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {undelivered.map((statement) => (
                          <tr key={statement.id}>
                            <td>
                              {shortDate(statement.fromDate)} to{" "}
                              {shortDate(statement.toDate)}
                            </td>
                            <td className="small">
                              {(statement.reason || "")
                                .replace(/_/g, " ")
                                .toLowerCase()}
                            </td>
                            <td>
                              {shortDate(statement.generatedOn)}
                              <div className="small text-muted">
                                by {statement.generatedBy}
                              </div>
                            </td>
                            <td className="text-end">
                              <Balance value={statement.closingBalance} />
                            </td>
                            <td>
                              {statement.fileName ? (
                                <Button
                                  size="sm"
                                  color="link"
                                  className="p-0"
                                  onClick={() => download(statement)}
                                >
                                  PDF
                                </Button>
                              ) : (
                                <span className="text-warning small">
                                  No document stored
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              {canIssue && (
                                <Button
                                  size="sm"
                                  color="success"
                                  onClick={() => setDelivering(statement)}
                                >
                                  Record delivery
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </TabPane>

              <TabPane tabId="annual">
                <Row className="mb-3 align-items-end">
                  <Col md={3}>
                    <FormGroup className="mb-0">
                      <Label>Year end</Label>
                      <Input
                        type="date"
                        value={yearEnd}
                        onChange={(e) => setYearEnd(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <div className="small text-muted">
                      Rule 52(1)(a) wants a statement as soon as practicable
                      after 30 June for every ledger that held money.
                    </div>
                  </Col>
                </Row>

                {outstanding.length === 0 ? (
                  <div className="alert alert-success mb-0">
                    Every ledger on this account has an annual statement covering{" "}
                    {shortDate(yearEnd)}.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table size="sm" className="align-middle table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Matter</th>
                          <th>Client</th>
                          <th>Description</th>
                          <th className="text-end">Balance at year end</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {outstanding.map((row) => (
                          <tr key={row.trustLedgerId}>
                            <td>{row.matterNumber || "-"}</td>
                            <td>{row.clientName}</td>
                            <td>{row.matterDescription || "-"}</td>
                            <td className="text-end">
                              <Balance value={row.closingBalance} />
                            </td>
                            <td className="text-end">
                              {canIssue && (
                                <Button
                                  size="sm"
                                  color="light"
                                  onClick={() =>
                                    setGenerating({
                                      trustLedgerId: row.trustLedgerId,
                                      reason: "ANNUAL",
                                      toDate: yearEnd,
                                    })
                                  }
                                >
                                  Produce
                                </Button>
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
          </Fragment>
        )}
      </TrustPage>

      {generating && (
        <GenerateForm
          preset={generating}
          ledgers={ledgers}
          onClose={() => setGenerating(null)}
          onSaved={() => {
            setGenerating(null);
            load();
          }}
        />
      )}

      {delivering && (
        <DeliveryForm
          statement={delivering}
          onClose={() => setDelivering(null)}
          onSaved={() => {
            setDelivering(null);
            load();
          }}
        />
      )}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

/**
 * The most recent 30 June, as yyyy-MM-dd.
 *
 * Rule 52(1)(a) is tied to 30 June, so defaulting to today's date would make
 * somebody change it every single time.
 */
function defaultYearEnd() {
  const now = new Date();
  const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;

  return toApiDate(new Date(year, 5, 30));
}

/** Producing a statement. */
const GenerateForm = ({ preset, ledgers, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    trustLedgerId: preset.trustLedgerId || "",
    reason: preset.reason || "ON_REQUEST",
    fromDate: preset.fromDate || "",
    toDate: preset.toDate || toApiDate(new Date()),
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();

    if (!form.trustLedgerId) {
      toast.error("Choose the ledger the statement is for.");
      return;
    }

    if (!form.fromDate || !form.toDate) {
      toast.error("A statement needs a period.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await generateTrustStatement({
        ...form,
        trustLedgerId: Number(form.trustLedgerId),
      });

      if (data.success) {
        toast.success(
          "Statement produced. It is not yet delivered - record that when it goes out."
        );
        onSaved();
      } else {
        toast.error(errorMessage(data, "The statement could not be produced."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The statement could not be produced.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" centered>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Produce a statement of account
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submit}>
          <FormGroup>
            <Label>Ledger</Label>
            <Input
              type="select"
              value={form.trustLedgerId}
              onChange={(e) => set("trustLedgerId", e.target.value)}
            >
              <option value="">Select a ledger...</option>
              {ledgers.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.clientName} - {ledger.matterNumber || ledger.id} -{" "}
                  {money(ledger.balance)}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Issued because</Label>
            <Input
              type="select"
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
            >
              <option value="ANNUAL">
                Annual statement after 30 June - Rule 52(1)(a)
              </option>
              <option value="MATTER_COMPLETED">
                The matter is complete - Rule 52(1)(b)
              </option>
              <option value="ON_REQUEST">
                The client asked for one - Rule 52(1)(c)
              </option>
              <option value="LEDGER_CLOSING">The ledger is being closed</option>
            </Input>
          </FormGroup>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>From</Label>
                <Input
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => set("fromDate", e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>To</Label>
                <Input
                  type="date"
                  value={form.toDate}
                  onChange={(e) => set("toDate", e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? "Producing..." : "Produce"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

/** Recording that a statement was given to the client - Rule 52(1). */
const DeliveryForm = ({ statement, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    deliveredDate: toApiDate(new Date()),
    deliveryMethod: "EMAIL",
    deliveredTo: "",
    notes: "",
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();

    if (!form.deliveredTo.trim()) {
      toast.error("Record who the statement was given to.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await recordTrustStatementDelivery(statement.id, form);

      if (data.success) {
        toast.success("Delivery recorded.");
        onSaved();
      } else {
        toast.error(errorMessage(data, "The delivery could not be recorded."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The delivery could not be recorded.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" centered>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Record delivery
      </ModalHeader>
      <ModalBody>
        <p className="small text-muted">
          All three of the date, the method and the recipient are needed - a date
          on its own does not evidence delivery to anybody. Once recorded, this
          cannot be changed: if the statement goes out again, that is a second
          statement.
        </p>
        <Form onSubmit={submit}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Date given to the client</Label>
                <Input
                  type="date"
                  value={form.deliveredDate}
                  onChange={(e) => set("deliveredDate", e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Method</Label>
                <Input
                  type="select"
                  value={form.deliveryMethod}
                  onChange={(e) => set("deliveryMethod", e.target.value)}
                >
                  <option value="EMAIL">Email</option>
                  <option value="POST">Post</option>
                  <option value="COLLECTED">Collected in person</option>
                  <option value="PORTAL">Client portal</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <Label>Given to</Label>
            <Input
              value={form.deliveredTo}
              onChange={(e) => set("deliveredTo", e.target.value)}
              placeholder="Email address, postal address, or who collected it"
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
              {saving ? "Recording..." : "Record delivery"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default TrustStatementsPage;
