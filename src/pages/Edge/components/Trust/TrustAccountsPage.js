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
import { MANAGETRUSTACCOUNT } from "../../utils/RightConstants";
import { getAllUsers, getBankAccountList } from "../../apis";
import {
  addTrustSignatory,
  closeTrustAccount,
  createTrustAccount,
  fetchTrustAccounts,
  removeTrustSignatory,
  updateTrustAccount,
} from "../../trustApis";
import {
  Balance,
  EmptyState,
  TrustPage,
  errorMessage,
  shortDate,
} from "./TrustShared";

/**
 * Trust accounts, their offices and their signatories - Rules 35 and 37A.
 *
 * The ADI details are NOT entered here. An account points at an existing bank
 * account record and reads the bank name, BSB and number through it, so the
 * same account cannot end up described two different ways in two places.
 *
 * Offices are a many-to-many assignment, and it decides exactly one thing:
 * where a ledger may be opened. Once a ledger exists it follows the account,
 * so the question never arises again.
 */
const TrustAccountsPage = () => {
  document.title = "Trust accounts | Veeto";

  const canManage = checkHasPermission(MANAGETRUSTACCOUNT);

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);

  const [editing, setEditing] = useState(null);
  const [signatoryFor, setSignatoryFor] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await fetchTrustAccounts();

      if (data.success) {
        setAccounts(data.data || []);
      } else {
        toast.error(errorMessage(data, "The trust accounts could not be loaded."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The trust accounts could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The lookups the account form needs. Failures are logged rather than
  // blocking the listing: being unable to add an account is better than being
  // unable to look at the ones that exist.
  //
  // The office list comes from companyInfo in localStorage, the way the Xero
  // screens and the header read it - there is no endpoint that lists every
  // office, and the sites a user can see is the right scope for deciding which
  // offices they may assign an account to.
  useEffect(() => {
    const loadLookups = async () => {
      try {
        // companyInfo is written at app start from getCompanyInfo(). Falls back
        // to userDetails the way Header.js does: a session that started before
        // this screen existed, or one where the company fetch failed, can have
        // one and not the other, and an empty office list silently disables
        // the whole account form.
        const companyInfo = JSON.parse(
          window.localStorage.getItem("companyInfo") || "{}"
        );
        const userDetails = JSON.parse(
          window.localStorage.getItem("userDetails") || "{}"
        );

        setSites(companyInfo?.siteInfoList || userDetails?.siteInfoList || []);
      } catch (error) {
        console.error(error);
        setSites([]);
      }

      try {
        const { data } = await getBankAccountList({ sortOn: "", sortType: "" });

        setBankAccounts(data?.data?.bankAccountInfoDetailsList || []);
      } catch (error) {
        console.error(error);
      }

      try {
        // Users, not staff. A signatory is recorded by USER id - it is who may
        // log in and authorise a withdrawal - and the staff list carries a
        // staff id, which is a different thing entirely.
        const { data } = await getAllUsers({ pageNo: 0, pageSize: 500 });

        setUsers(data?.data?.userLoginList || []);
      } catch (error) {
        console.error(error);
      }
    };

    if (canManage) {
      loadLookups();
    }
  }, [canManage]);

  const close = async (account) => {
    // A trust account cannot be closed while it holds money or has open
    // ledgers; the server refuses both. Asking first means the refusal is not
    // the way the user discovers that.
    if (
      !window.confirm(
        `Close ${account.name}? This cannot be undone. The account must hold nothing and have no open ledgers.`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await closeTrustAccount(account.id);

      if (data.success) {
        toast.success(`${account.name} closed.`);
        load();
      } else {
        toast.error(errorMessage(data, "The account could not be closed."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The account could not be closed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <TrustPage
        title="Trust accounts"
        note="A trust account belongs to the practice and can be used by one or more offices. The office assignment decides where a trust ledger may be opened; once a ledger exists it stays on this account for the life of the matter."
        actions={
          canManage && (
            <Button color="success" onClick={() => setEditing({})}>
              <span className="plusdiv">+</span> New trust account
            </Button>
          )
        }
      >
        {accounts.length === 0 && !loading ? (
          <EmptyState>
            No trust accounts yet.
            {canManage
              ? " Create one before opening any trust ledgers."
              : " Somebody with the Manage Trust Account right needs to create one."}
          </EmptyState>
        ) : (
          <div className="table-responsive">
            <Table className="align-middle table-nowrap mb-0">
              <thead className="table-light">
                <tr>
                  <th>Account</th>
                  <th>ADI</th>
                  <th>BSB / number</th>
                  <th>Offices</th>
                  <th>Signatories</th>
                  <th className="text-end">Balance</th>
                  <th>Opened</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <div className="fw-semibold">{account.name}</div>
                      {account.closedDate && (
                        <small className="text-muted">
                          Closed {shortDate(account.closedDate)}
                        </small>
                      )}
                      {account.statutoryDepositReference && (
                        <small className="d-block text-muted">
                          Statutory deposit: {account.statutoryDepositReference}
                        </small>
                      )}
                    </td>
                    <td>{account.bankName || "-"}</td>
                    <td>
                      {account.bankBSB || "-"} / {account.accountNumber || "-"}
                    </td>
                    <td>
                      {(account.siteList || []).length === 0 ? (
                        <span className="text-danger">
                          None - no ledgers can be opened
                        </span>
                      ) : (
                        (account.siteList || [])
                          .map(
                            (site) =>
                              `${site.siteName || site.siteId}${
                                site.defaultForSite ? " (default)" : ""
                              }`
                          )
                          .join(", ")
                      )}
                    </td>
                    <td>
                      {(account.signatoryList || []).filter((s) => !s.ceasedDate)
                        .length || (
                        <span className="text-danger">None</span>
                      )}
                    </td>
                    <td className="text-end">
                      <Balance value={account.balance} />
                    </td>
                    <td>{shortDate(account.openedDate)}</td>
                    <td className="text-end">
                      {canManage && (
                        <div className="d-flex gap-1 justify-content-end">
                          <Button
                            size="sm"
                            color="light"
                            onClick={() => setEditing(account)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="light"
                            onClick={() => setSignatoryFor(account)}
                          >
                            Signatories
                          </Button>
                          {!account.closedDate && (
                            <Button
                              size="sm"
                              color="light"
                              onClick={() => close(account)}
                            >
                              Close
                            </Button>
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
      </TrustPage>

      {editing && (
        <AccountForm
          account={editing}
          bankAccounts={bankAccounts}
          sites={sites}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {signatoryFor && (
        <SignatoryForm
          account={signatoryFor}
          users={users}
          onClose={() => setSignatoryFor(null)}
          onSaved={load}
        />
      )}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

/**
 * Create or edit an account.
 *
 * The ADI cannot be changed after creation - the server refuses it - because
 * every receipt already issued names the account the money went into. The
 * field is therefore disabled rather than hidden, so it is clear what the
 * account points at.
 */
const AccountForm = ({ account, bankAccounts, sites, onClose, onSaved }) => {
  const isNew = !account.id;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: account.id,
    checksum: account.checksum,
    name: account.name || "",
    bankAccountInfoId: account.bankAccountInfoId || "",
    statutoryDepositReference: account.statutoryDepositReference || "",
    siteList: (account.siteList || []).map((site) => ({
      siteId: site.siteId,
      defaultForSite: !!site.defaultForSite,
    })),
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSite = (siteId) => {
    setForm((prev) => {
      const existing = prev.siteList.find((s) => Number(s.siteId) === Number(siteId));

      return {
        ...prev,
        siteList: existing
          ? prev.siteList.filter((s) => Number(s.siteId) !== Number(siteId))
          : [...prev.siteList, { siteId, defaultForSite: false }],
      };
    });
  };

  const setDefaultSite = (siteId, isDefault) => {
    setForm((prev) => ({
      ...prev,
      siteList: prev.siteList.map((s) =>
        Number(s.siteId) === Number(siteId)
          ? { ...s, defaultForSite: isDefault }
          : s
      ),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("The account needs a name.");
      return;
    }

    if (!form.bankAccountInfoId) {
      toast.error("Choose the bank account this trust account is held in.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        bankAccountInfoId: Number(form.bankAccountInfoId),
        siteList: form.siteList.map((s) => ({
          siteId: Number(s.siteId),
          defaultForSite: !!s.defaultForSite,
        })),
      };

      const { data } = isNew
        ? await createTrustAccount(payload)
        : await updateTrustAccount(payload);

      if (data.success) {
        toast.success(isNew ? "Trust account created." : "Trust account updated.");
        onSaved();
      } else {
        toast.error(errorMessage(data, "The account could not be saved."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The account could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen toggle={onClose} backdrop="static" size="lg" centered scrollable>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        {isNew ? "New trust account" : `Edit ${account.name}`}
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submit}>
          <Row>
            <Col md={7}>
              <FormGroup>
                <Label>Account name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. General Trust Account - Sydney"
                />
              </FormGroup>
            </Col>
            <Col md={5}>
              <FormGroup>
                <Label>Statutory deposit reference</Label>
                <Input
                  value={form.statutoryDepositReference}
                  onChange={(e) => set("statutoryDepositReference", e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>Bank account (ADI)</Label>
            <Input
              type="select"
              value={form.bankAccountInfoId}
              onChange={(e) => set("bankAccountInfoId", e.target.value)}
              disabled={!isNew}
            >
              <option value="">Select the bank account...</option>
              {(bankAccounts || []).map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bankName} - {bank.bankBSB} {bank.accountNumber}
                </option>
              ))}
            </Input>
            <small className="text-muted">
              {isNew
                ? "The bank name, BSB and account number are read from this record rather than retyped here."
                : "The bank account cannot be changed: every receipt already issued names the account the money went into."}
            </small>
          </FormGroup>

          <FormGroup>
            <Label>Offices that may use this account</Label>
            <div className="border rounded p-2">
              {(sites || []).length === 0 && (
                <small className="text-muted">
                  No offices were found for your login. Sign out and in again to
                  refresh them; if they are still missing, the account can be
                  saved without offices and they can be ticked later — but no
                  trust ledger can be opened until at least one is assigned.
                </small>
              )}
              {(sites || []).map((site) => {
                // siteId, not id. SiteInfoDetails has no `id` field at all, and
                // reading one gave every checkbox the same undefined value:
                // Number(undefined) === Number(undefined) is NaN === NaN, so
                // `checked` could never become true, and every input shared the
                // DOM id "site-undefined" so one label toggled them all. The
                // offices listed but none could be selected.
                const assigned = form.siteList.find(
                  (s) => Number(s.siteId) === Number(site.siteId)
                );

                return (
                  <div
                    key={site.siteId}
                    className="d-flex align-items-center justify-content-between py-1"
                  >
                    <FormGroup check className="mb-0">
                      <Input
                        type="checkbox"
                        checked={!!assigned}
                        onChange={() => toggleSite(site.siteId)}
                        id={`site-${site.siteId}`}
                      />
                      <Label check for={`site-${site.siteId}`} className="mb-0">
                        {site.siteName || `Office ${site.siteId}`}
                      </Label>
                    </FormGroup>
                    {assigned && (
                      <FormGroup check className="mb-0">
                        <Input
                          type="checkbox"
                          checked={!!assigned.defaultForSite}
                          onChange={(e) =>
                            setDefaultSite(site.siteId, e.target.checked)
                          }
                          id={`default-${site.siteId}`}
                        />
                        <Label
                          check
                          for={`default-${site.siteId}`}
                          className="mb-0 small text-muted"
                        >
                          Default for this office
                        </Label>
                      </FormGroup>
                    )}
                  </div>
                );
              })}
            </div>
            <small className="text-muted">
              An office can have only one default trust account. Leaving every
              office unassigned means no ledgers can be opened on this account.
            </small>
          </FormGroup>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button color="light" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

/**
 * Signatories - Rules 37A to 37C.
 *
 * A signatory is not removed, it CEASES. The server sets a ceased date and
 * keeps the row, because who was entitled to authorise a withdrawal on a given
 * day is exactly what an examination asks about - and a deleted row cannot
 * answer it.
 */
const SignatoryForm = ({ account, users, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [signatories, setSignatories] = useState(account.signatoryList || []);
  const [form, setForm] = useState({
    userId: "",
    appointedDate: "",
    lawSocietyNotifiedDate: "",
  });

  const add = async (e) => {
    e.preventDefault();

    if (!form.userId) {
      toast.error("Choose who is being appointed.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await addTrustSignatory({
        trustAccountId: account.id,
        userId: Number(form.userId),
        appointedDate: form.appointedDate || null,
        lawSocietyNotifiedDate: form.lawSocietyNotifiedDate || null,
      });

      if (data.success) {
        toast.success("Signatory appointed.");
        setSignatories((prev) => [...prev, data.data]);
        setForm({ userId: "", appointedDate: "", lawSocietyNotifiedDate: "" });
        onSaved();
      } else {
        toast.error(errorMessage(data, "The signatory could not be appointed."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The signatory could not be appointed.");
    } finally {
      setSaving(false);
    }
  };

  const cease = async (signatory) => {
    if (
      !window.confirm(
        `Record that ${
          signatory.userName || "this signatory"
        } has ceased? The record of their appointment is kept.`
      )
    ) {
      return;
    }

    setSaving(true);

    try {
      const { data } = await removeTrustSignatory(signatory.id);

      if (data.success) {
        toast.success("Signatory ceased.");
        setSignatories((prev) =>
          prev.map((s) =>
            s.id === signatory.id ? { ...s, ceasedDate: new Date().toISOString() } : s
          )
        );
        onSaved();
      } else {
        toast.error(errorMessage(data, "The signatory could not be ceased."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The signatory could not be ceased.");
    } finally {
      setSaving(false);
    }
  };

  const current = signatories.filter((s) => !s.ceasedDate);
  const past = signatories.filter((s) => s.ceasedDate);

  return (
    <Modal isOpen toggle={onClose} backdrop="static" size="lg" centered scrollable>
      <ModalHeader toggle={onClose} className="bg-light p-3">
        Signatories - {account.name}
      </ModalHeader>
      <ModalBody>
        <p className="small text-muted">
          Only a current signatory on this account can authorise a payment from
          it, and holding the Authorise Trust Payment right is not enough on its
          own. A signatory who leaves is recorded as ceased, never removed.
        </p>

        <Table size="sm" className="align-middle mb-3">
          <thead className="table-light">
            <tr>
              <th>Signatory</th>
              <th>Appointed</th>
              <th>Law Society notified</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {current.length === 0 && (
              <tr>
                <td colSpan={4} className="text-danger">
                  No current signatories. No payment can be authorised from this
                  account.
                </td>
              </tr>
            )}
            {current.map((signatory) => (
              <tr key={signatory.id}>
                <td>{signatory.userName || signatory.userId}</td>
                <td>{shortDate(signatory.appointedDate)}</td>
                <td>
                  {signatory.lawSocietyNotifiedDate ? (
                    shortDate(signatory.lawSocietyNotifiedDate)
                  ) : (
                    <span className="text-warning">Not recorded</span>
                  )}
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    color="light"
                    onClick={() => cease(signatory)}
                    disabled={saving}
                  >
                    Ceased
                  </Button>
                </td>
              </tr>
            ))}
            {past.map((signatory) => (
              <tr key={signatory.id} className="text-muted">
                <td>{signatory.userName || signatory.userId}</td>
                <td>{shortDate(signatory.appointedDate)}</td>
                <td colSpan={2}>Ceased {shortDate(signatory.ceasedDate)}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Form onSubmit={add} className="border-top pt-3">
          <Row>
            <Col md={5}>
              <FormGroup>
                <Label>Appoint</Label>
                <Input
                  type="select"
                  value={form.userId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, userId: e.target.value }))
                  }
                >
                  <option value="">Select a user...</option>
                  {(users || []).map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.firstName || person.lastName
                        ? `${person.firstName || ""} ${person.lastName || ""}`.trim()
                        : person.userName}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>Appointed</Label>
                <Input
                  type="date"
                  value={form.appointedDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, appointedDate: e.target.value }))
                  }
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Law Society notified</Label>
                <Input
                  type="date"
                  value={form.lawSocietyNotifiedDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      lawSocietyNotifiedDate: e.target.value,
                    }))
                  }
                />
              </FormGroup>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button color="success" type="submit" disabled={saving}>
              Appoint
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default TrustAccountsPage;
