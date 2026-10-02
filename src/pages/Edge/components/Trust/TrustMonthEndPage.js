import React, { Fragment, useCallback, useEffect, useState } from "react";
import { Button, Col, FormGroup, Input, Label, Row, Table } from "reactstrap";
import { toast } from "react-toastify";

import LoadingPage from "../../utils/LoadingPage";
import { checkHasPermission } from "../../utils/utilFunc";
import { GENERATETRUSTMONTHEND } from "../../utils/RightConstants";
import {
  downloadTrustMonthEndPack,
  fetchTrustAccounts,
  fetchTrustMonthEndPacks,
  generateTrustMonthEndPack,
  verifyTrustMonthEndPack,
} from "../../trustApis";
import {
  Balance,
  EmptyState,
  TrustPage,
  errorMessage,
  money,
  monthEndOf,
  saveBlobAsFile,
  shortDate,
} from "./TrustShared";

/**
 * The month-end pack - Rule 38.
 *
 * The practice's external examiner has accepted a stored PDF with a recorded
 * hash as satisfying Rule 38(5). This screen is where that acceptance is made
 * useful: Verify re-reads the stored file, re-hashes it and says whether it
 * still matches, so "cannot be modified" is something anybody can test rather
 * than something the system asserts.
 *
 * A pack cannot be edited, regenerated or deleted. There is one chance per
 * month and the buttons here reflect that.
 */
const TrustMonthEndPage = () => {
  document.title = "Trust month end | Veeto";

  const canGenerate = checkHasPermission(GENERATETRUSTMONTHEND);

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [packs, setPacks] = useState([]);
  const [packDate, setPackDate] = useState(monthEndOf(new Date()));
  const [verified, setVerified] = useState({});

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
      setPacks([]);
      return;
    }

    setLoading(true);

    try {
      const { data } = await fetchTrustMonthEndPacks(accountId);

      if (data.success) {
        setPacks(data.data || []);
      } else {
        toast.error(errorMessage(data, "The month-end packs could not be loaded."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The month-end packs could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    load();
  }, [load]);

  const generate = async () => {
    if (!packDate) {
      toast.error("Choose the month end.");
      return;
    }

    if (
      !window.confirm(
        `Produce the month-end pack for ${shortDate(
          packDate
        )}? It is produced once and cannot be changed, regenerated or deleted afterwards - Rule 38(4).`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await generateTrustMonthEndPack(accountId, packDate);

      if (data.success) {
        toast.success("Month-end pack produced and hashed.");
        load();
      } else {
        // The common refusal is that the month's reconciliation is not
        // complete, and the server says so - which is more useful than
        // anything this screen could invent.
        toast.error(errorMessage(data, "The pack could not be produced."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The pack could not be produced.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (pack) => {
    setLoading(true);

    try {
      const { data } = await verifyTrustMonthEndPack(pack.id);

      if (data.success) {
        setVerified((prev) => ({ ...prev, [pack.id]: data.data }));

        if (data.data.hashVerified) {
          toast.success("The stored file still matches its recorded hash.");
        } else {
          toast.error(
            "The stored file does NOT match its recorded hash. This needs investigating."
          );
        }
      } else {
        toast.error(errorMessage(data, "The pack could not be verified."));
      }
    } catch (error) {
      console.error(error);
      toast.error("The pack could not be verified.");
    } finally {
      setLoading(false);
    }
  };

  const download = async (pack) => {
    setLoading(true);

    try {
      const response = await downloadTrustMonthEndPack(pack.id);

      saveBlobAsFile(response.data, pack.fileName || `trust-month-end-${pack.id}.pdf`);
    } catch (error) {
      console.error(error);
      toast.error("The pack could not be downloaded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <TrustPage
        title="Month-end packs"
        accounts={accounts}
        accountId={accountId}
        onAccountChange={setAccountId}
        note="The monthly trust records as a single PDF, hashed with SHA-256 when it is produced. The practice's external examiner has accepted a stored PDF with a recorded hash as satisfying Rule 38(5) - Verify is how that is checked."
      >
        {!accountId ? (
          <EmptyState>Choose a trust account.</EmptyState>
        ) : (
          <Fragment>
            {canGenerate && (
              <Row className="mb-3 align-items-end">
                <Col md={3}>
                  <FormGroup className="mb-0">
                    <Label>Month end</Label>
                    <Input
                      type="date"
                      value={packDate}
                      onChange={(e) => setPackDate(e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <Button color="success" onClick={generate}>
                    Produce the pack
                  </Button>
                  <div className="small text-muted mt-1">
                    The month&apos;s reconciliation has to be completed first.
                  </div>
                </Col>
              </Row>
            )}

            {packs.length === 0 && !loading ? (
              <EmptyState>
                No month-end packs on this account yet. Rule 38 wants the monthly
                records made within 15 working days of each month end.
              </EmptyState>
            ) : (
              <div className="table-responsive">
                <Table className="align-middle table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Month end</th>
                      <th className="text-end">Cash book</th>
                      <th className="text-end">Trial balance</th>
                      <th>Ledgers</th>
                      <th>Entries</th>
                      <th>Produced</th>
                      <th>Hash</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {packs.map((pack) => {
                      const check = verified[pack.id];

                      return (
                        <tr key={pack.id}>
                          <td className="fw-semibold">{shortDate(pack.packDate)}</td>
                          <td className="text-end">
                            <Balance value={pack.cashBookBalance} />
                          </td>
                          <td className="text-end">
                            <Balance value={pack.trialBalanceTotal} />
                          </td>
                          <td>
                            {pack.ledgerCount}
                            {pack.debitLedgerCount > 0 && (
                              <span className="text-danger">
                                {" "}
                                ({pack.debitLedgerCount} in debit)
                              </span>
                            )}
                          </td>
                          <td className="small">
                            {pack.receiptCount} receipts {money(pack.receiptsTotal)}
                            <br />
                            {pack.paymentCount} payments {money(pack.paymentsTotal)}
                            <br />
                            {pack.transferCount} transfers
                          </td>
                          <td>
                            {shortDate(pack.generatedOn)}
                            <div className="small text-muted">
                              by {pack.generatedBy}
                            </div>
                          </td>
                          <td style={{ maxWidth: "14rem" }}>
                            <div
                              className="small text-muted text-truncate"
                              title={pack.contentHash}
                            >
                              {pack.hashAlgorithm}: {pack.contentHash}
                            </div>
                            {check && (
                              <div
                                className={
                                  check.hashVerified
                                    ? "small text-success"
                                    : "small text-danger fw-bold"
                                }
                              >
                                {check.hashVerified
                                  ? "Verified intact"
                                  : "VERIFICATION FAILED"}
                              </div>
                            )}
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-1 justify-content-end">
                              <Button
                                size="sm"
                                color="light"
                                onClick={() => verify(pack)}
                              >
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                color="light"
                                onClick={() => download(pack)}
                              >
                                Download
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}

            {Object.values(verified).some((v) => v && !v.hashVerified) && (
              <div className="alert alert-danger mt-3">
                <strong>A stored pack no longer matches its recorded hash.</strong>{" "}
                {
                  Object.values(verified).find((v) => v && !v.hashVerified)
                    ?.verificationMessage
                }
              </div>
            )}
          </Fragment>
        )}
      </TrustPage>

      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default TrustMonthEndPage;
