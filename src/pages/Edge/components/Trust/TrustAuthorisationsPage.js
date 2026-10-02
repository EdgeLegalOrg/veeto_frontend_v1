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
import {
  AUTHORISETRUSTPAYMENT,
  PREPARETRUSTPAYMENT,
} from "../../utils/RightConstants";
import {
  authoriseTrustPayment,
  authoriseTrustTransfer,
  cancelTrustPayment,
  cancelTrustTransfer,
  fetchTrustAccounts,
  fetchTrustLedgers,
  fetchTrustPaymentsAwaiting,
  fetchTrustTransferJournal,
  fetchTrustTransfersAwaiting,
  prepareTrustTransfer,
} from "../../trustApis";
import {
  EmptyState,
  StatusBadge,
  TrustPage,
  errorMessage,
  money,
  shortDate,
  toApiDate,
} from "./TrustShared";

/**
 * The authorisation queue and the transfer journal - Rules 43 and 46.
 *
 * Both halves of the two-person rule in one place, because they are the same
 * job: somebody with the signatory right works through what other people have
 * prepared. Making them hunt through ledgers for prepared payments is how
 * things sit unreleased for a week.
 *
 * The journal is here rather than on the ledger screen because Rule 46(4)
 * numbers entries consecutively, and an examiner reads them in reference order
 * to confirm there are no gaps - which a per-ledger view cannot show.
 */
const TrustAuthorisationsPage = () => {
  document.title = "Trust authorisations | Veeto";

  const canAuthorise = checkHasPermission(AUTHORISETRUSTPAYMENT);
  const canPrepare = checkHasPermission(PREPARETRUSTPAYMENT);

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [journal, setJournal] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [transferring, setTransferring] = useState(false);

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
      setPayments([]);
      setTransfers([]);
      setJournal([]);
      setLedgers([]);
      return;
    }

    setLoading(true);

    try {
      const [awaitingPayments, awaitingTransfers, journalResponse, ledgerResponse] =
        await Promise.all([
          fetchTrustPaymentsAwaiting(accountId),
          fetchTrustTransfersAwaiting(accountId),
          fetchTrustTransferJournal(accountId),
          fetchTrustLedgers(accountId, false),
        ]);

      if (awaitingPayments.data.success) {
        setPayments(awaitingPayments.data.data || []);
      }

      if (awaitingTransfers.data.success) {
        setTransfers(awaitingTransfers.data.data || []);
      }

      if (journalResponse.data.success) {
        setJournal(journalResponse.data.data || []);
      }

      if (ledgerResponse.data.success) {
        setLedgers(ledgerResponse.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("The authorisation queue could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (call, successMessage, failureMessage) => {
    setLoading(true);

    try {
      const { data } = await call();

      if (data.success) {
        toast.success(successMessage);
        load();
      } else {
        toast.error(errorMessage(data, failureMessage));
      }
    } catch (error) {
      console.error(error);
      toast.error(failureMessage);
    } finally {
      setLoading(false);
    }
  };

  const authorisePayment = (payment) => {
    if (
      !window.confirm(
        `Authorise ${money(payment.amount)} to ${
          payment.payeeName
        }? The money leaves the trust account when you do.`
      )
    ) {
      return;
    }

    act(
      () => authoriseTrustPayment(payment.id),
      "Payment authorised.",
      "The payment could not be authorised."
    );
  };

  const rejectPayment = (payment) => {
    const reason = window.prompt("Why is this payment being rejected?");

    if (!reason || !reason.trim()) {
      return;
    }

    act(
      () => cancelTrustPayment(payment.id, reason.trim()),
      "Payment cancelled.",
      "The payment could not be cancelled."
    );
  };

  const authoriseTransfer = (transfer) => {
    if (
      !window.confirm(
        `Authorise this journal transfer of ${money(transfer.amount)}? Both halves are written when you do.`
      )
    ) {
      return;
    }

    act(
      () => authoriseTrustTransfer(transfer.id),
      "Transfer authorised.",
      "The transfer could not be authorised."
    );
  };

  const rejectTransfer = (transfer) => {
    const reason = window.prompt("Why is this transfer being rejected?");

    if (!reason || !reason.trim()) {
      return;
    }

    act(
      () => cancelTrustTransfer(transfer.id, reason.trim()),
      "Transfer cancelled. Its journal number is kept.",
      "The transfer could not be cancelled."
    );
  };

  const waiting = payments.length + transfers.length;

  return (
    <Fragment>
      <TrustPage
        title="Authorisations and transfer journal"
        accounts={accounts}
        accountId={accountId}
        onAccountChange={setAccountId}
        note="A payment or journal transfer must be authorised by somebody other than the person who prepared it, and by a current signatory on this account. Holding the right is not enough on its own."
        actions={
          canPrepare &&
          accountId && (
            <Button color="success" onClick={() => setTransferring(true)}>
              <span className="plusdiv">+</span> Prepare transfer
            </Button>
          )
        }
      >
        {!accountId ? (
          <EmptyState>Choose a trust account.</EmptyState>
        ) : (
          <Fragment>
            <h6 className="mb-2">
              Awaiting authorisation
              {waiting > 0 && <span className="text-danger"> ({waiting})</span>}
            </h6>

            {payments.length === 0 && transfers.length === 0 ? (
              <EmptyState>Nothing is waiting on a second person.</EmptyState>
            ) : (
              <div className="table-responsive mb-4">
                <Table className="align-middle table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Prepared</th>
                      <th>By</th>
                      <th>Detail</th>
                      <th className="text-end">Amount</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={`p-${payment.id}`}>
                        <td>Payment</td>
                        <td>{shortDate(payment.preparedOn)}</td>
                        <td>{payment.preparedBy}</td>
                        <td>
                          <div>{payment.payeeName}</div>
                          <small className="text-muted">
                            {payment.reason}
                            {payment.withdrawalBasis &&
                              payment.withdrawalBasis !== "NOT_COSTS" &&
                              ` - costs, ${payment.withdrawalBasis
                                .replace(/_/g, " ")
                                .toLowerCase()}`}
                          </small>
                        </td>
                        <td className="text-end">{money(payment.amount)}</td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            {canAuthorise && (
                              <Button
                                size="sm"
                                color="success"
                                onClick={() => authorisePayment(payment)}
                              >
                                Authorise
                              </Button>
                            )}
                            {(canAuthorise || canPrepare) && (
                              <Button
                                size="sm"
                                color="light"
                                onClick={() => rejectPayment(payment)}
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {transfers.map((transfer) => (
                      <tr key={`t-${transfer.id}`}>
                        <td>Journal {transfer.journalReference}</td>
                        <td>{shortDate(transfer.preparedOn)}</td>
                        <td>{transfer.preparedBy}</td>
                        <td>
                          <small className="text-muted">{transfer.reason}</small>
                        </td>
                        <td className="text-end">{money(transfer.amount)}</td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            {canAuthorise && (
                              <Button
                                size="sm"
                                color="success"
                                onClick={() => authoriseTransfer(transfer)}
                              >
                                Authorise
                              </Button>
                            )}
                            {(canAuthorise || canPrepare) && (
                              <Button
                                size="sm"
                                color="light"
                                onClick={() => rejectTransfer(transfer)}
                              >
                                Reject
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

            <h6 className="mb-2 border-top pt-3">
              Transfer journal - Rule 46
            </h6>

            {journal.length === 0 ? (
              <EmptyState>No journal entries on this account.</EmptyState>
            ) : (
              <div className="table-responsive">
                <Table size="sm" className="align-middle table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Journal</th>
                      <th>Date</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journal.map((transfer) => (
                      <tr key={transfer.id}>
                        <td>{transfer.journalReference}</td>
                        <td>{shortDate(transfer.transferDate)}</td>
                        <td>{transfer.fromClientName || transfer.fromTrustLedgerId}</td>
                        <td>{transfer.toClientName || transfer.toTrustLedgerId}</td>
                        <td>{transfer.reason}</td>
                        <td>
                          <StatusBadge status={transfer.status} />
                          {transfer.authorisedBy && (
                            <div className="small text-muted">
                              {transfer.authorisedBy}
                            </div>
                          )}
                        </td>
                        <td className="text-end">{money(transfer.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <small className="text-muted">
                  Journal numbers run consecutively and a cancelled entry keeps
                  its number, so there should be no gaps in this column.
                </small>
              </div>
            )}
          </Fragment>
        )}
      </TrustPage>

      {transferring && (
        <PrepareTransferForm
          trustAccountId={accountId}
          ledgers={ledgers}
          onClose={() => setTransferring(false)}
          onSaved={() => {
            setTransferring(false);
            load();
          }}
        />
      )}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

/** Preparing a journal transfer - Rule 46. */
const PrepareTransferForm = ({ trustAccountId, ledgers, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fromTrustLedgerId: "",
    toTrustLedgerId: "",
    amount: "",
    transferDate: toApiDate(new Date()),
    reason: "",
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const from = ledgers.find(
    (l) => Number(l.id) === Number(form.fromTrustLedgerId)
  );

  const submit = async (e) => {
    e.preventDefault();

    if (!form.fromTrustLedgerId || !form.toTrustLedgerId) {
      toast.error("Choose the ledger the money comes from and the one it goes to.");
      return;
    }

    if (form.fromTrustLedgerId === form.toTrustLedgerId) {
      toast.error("A transfer needs two different ledgers.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("A transfer must be for a positive amount.");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Rule 46(3)(e) requires the reason for the transfer.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await prepareTrustTransfer({
        ...form,
        trustAccountId,
        fromTrustLedgerId: Number(form.fromTrustLedgerId),
        toTrustLedgerId: Number(form.toTrustLedgerId),
        amount: Number(form.amount),
      });

      if (data.success) {
        toast.success(
          `Journal ${data.data.journalReference} prepared. A second person has to authorise it.`
        );
        onSaved();
      } else {
        toast.error(errorMessage(data, "The transfer could not be prepared."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The transfer could not be prepared.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" size="lg" centered>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Prepare a journal transfer
      </ModalHeader>
      <ModalBody>
        <p className="small text-muted">
          A journal transfer moves money between two ledgers on the same trust
          account without the bank being involved. To move money to a different
          trust account, make a payment out of one and a receipt into the other
          - both cash books have to show it.
        </p>
        <Form onSubmit={submit}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>From</Label>
                <Input
                  type="select"
                  value={form.fromTrustLedgerId}
                  onChange={(e) => set("fromTrustLedgerId", e.target.value)}
                >
                  <option value="">Select a ledger...</option>
                  {ledgers.map((ledger) => (
                    <option key={ledger.id} value={ledger.id}>
                      {ledger.clientName} - {money(ledger.balance)}
                    </option>
                  ))}
                </Input>
                {from && (
                  <small className="text-muted">
                    Available: {money(from.balance)}
                  </small>
                )}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>To</Label>
                <Input
                  type="select"
                  value={form.toTrustLedgerId}
                  onChange={(e) => set("toTrustLedgerId", e.target.value)}
                >
                  <option value="">Select a ledger...</option>
                  {ledgers
                    .filter(
                      (ledger) =>
                        Number(ledger.id) !== Number(form.fromTrustLedgerId)
                    )
                    .map((ledger) => (
                      <option key={ledger.id} value={ledger.id}>
                        {ledger.clientName} - {money(ledger.balance)}
                      </option>
                    ))}
                </Input>
              </FormGroup>
            </Col>
          </Row>
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
                <Label>Transfer date</Label>
                <Input
                  type="date"
                  value={form.transferDate}
                  onChange={(e) => set("transferDate", e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <Label>Reason for the transfer</Label>
            <Input
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
              placeholder="e.g. settlement funds to the purchaser's ledger"
            />
          </FormGroup>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? "Preparing..." : "Prepare transfer"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default TrustAuthorisationsPage;
