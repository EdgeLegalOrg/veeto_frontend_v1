import { v1 as uuidv1 } from "uuid";

import { API } from "./apis";

// ---------------------------------------------------------------------------
// Trust Accounting API calls.
//
// Its own module rather than another 200 lines on the end of apis.js, which is
// already 1,300 lines covering every other part of the application. The trust
// module is one bounded thing with one set of rules, and keeping its calls
// together means a reader can see the whole surface at once.
//
// Everything here is enveloped in ResponseData, so callers read data.success
// and data.data - except the two download calls, which return the PDF itself,
// because a browser asking for a PDF wants a PDF.
//
// requestId is sent on every call, matching the rest of the application: the
// server logs it, so a user reporting "it failed at 3pm" can be found in the
// log.
// ---------------------------------------------------------------------------

// --- accounts and signatories ---

export const fetchTrustAccounts = () =>
  API.get(`/api/trust/account?requestId=${uuidv1()}`);

export const fetchTrustAccount = (id) =>
  API.get(`/api/trust/account/${id}?requestId=${uuidv1()}`);

export const createTrustAccount = (formData) =>
  API.post(`/api/trust/account`, { requestId: uuidv1(), data: formData });

export const updateTrustAccount = (formData) =>
  API.put(`/api/trust/account`, { requestId: uuidv1(), data: formData });

export const closeTrustAccount = (id) =>
  API.put(`/api/trust/account/${id}/close?requestId=${uuidv1()}`);

export const addTrustSignatory = (formData) =>
  API.post(`/api/trust/account/signatory`, {
    requestId: uuidv1(),
    data: formData,
  });

export const removeTrustSignatory = (signatoryId) =>
  API.delete(`/api/trust/account/signatory/${signatoryId}?requestId=${uuidv1()}`);

// --- ledgers ---

export const fetchTrustLedgers = (trustAccountId, includeClosed = false) =>
  API.get(
    `/api/trust/ledger?requestId=${uuidv1()}&trustAccountId=${trustAccountId}&includeClosed=${includeClosed}`
  );

export const fetchTrustLedger = (id) =>
  API.get(`/api/trust/ledger/${id}?requestId=${uuidv1()}`);

export const openTrustLedger = (formData) =>
  API.post(`/api/trust/ledger`, { requestId: uuidv1(), data: formData });

export const updateTrustLedger = (formData) =>
  API.put(`/api/trust/ledger`, { requestId: uuidv1(), data: formData });

export const closeTrustLedger = (id) =>
  API.put(`/api/trust/ledger/${id}/close?requestId=${uuidv1()}`);

// --- receipts ---

export const fetchTrustReceipts = (ledgerId) =>
  API.get(`/api/trust/receipt?requestId=${uuidv1()}&ledgerId=${ledgerId}`);

export const issueTrustReceipt = (formData) =>
  API.post(`/api/trust/receipt`, { requestId: uuidv1(), data: formData });

export const cancelTrustReceipt = (receiptId, cancellationReason) =>
  API.put(`/api/trust/receipt/${receiptId}/cancel`, {
    requestId: uuidv1(),
    data: { cancellationReason },
  });

// --- payments ---

export const fetchTrustPayments = (ledgerId) =>
  API.get(`/api/trust/payment?requestId=${uuidv1()}&ledgerId=${ledgerId}`);

export const fetchTrustPaymentsAwaiting = (trustAccountId) =>
  API.get(
    `/api/trust/payment/awaiting?requestId=${uuidv1()}&trustAccountId=${trustAccountId}`
  );

export const fetchTrustPayment = (id) =>
  API.get(`/api/trust/payment/${id}?requestId=${uuidv1()}`);

export const prepareTrustPayment = (formData) =>
  API.post(`/api/trust/payment`, { requestId: uuidv1(), data: formData });

// No body, deliberately. An authorisation that could vary what it authorises
// would not be an authorisation of what the preparer entered.
export const authoriseTrustPayment = (id) =>
  API.put(`/api/trust/payment/${id}/authorise?requestId=${uuidv1()}`);

export const cancelTrustPayment = (id, cancellationReason) =>
  API.put(`/api/trust/payment/${id}/cancel`, {
    requestId: uuidv1(),
    data: { cancellationReason },
  });

export const markTrustChequeStale = (id, cancellationReason) =>
  API.put(`/api/trust/payment/${id}/stale`, {
    requestId: uuidv1(),
    data: { cancellationReason },
  });

// --- journal transfers ---

export const fetchTrustTransferJournal = (trustAccountId) =>
  API.get(
    `/api/trust/transfer?requestId=${uuidv1()}&trustAccountId=${trustAccountId}`
  );

export const fetchTrustTransfersAwaiting = (trustAccountId) =>
  API.get(
    `/api/trust/transfer/awaiting?requestId=${uuidv1()}&trustAccountId=${trustAccountId}`
  );

export const prepareTrustTransfer = (formData) =>
  API.post(`/api/trust/transfer`, { requestId: uuidv1(), data: formData });

export const authoriseTrustTransfer = (id) =>
  API.put(`/api/trust/transfer/${id}/authorise?requestId=${uuidv1()}`);

export const cancelTrustTransfer = (id, cancellationReason) =>
  API.put(`/api/trust/transfer/${id}/cancel`, {
    requestId: uuidv1(),
    data: { cancellationReason },
  });

// --- derived reports ---

export const fetchTrustReceiptsCashBook = (trustAccountId, fromDate, toDate) =>
  API.get(
    `/api/trust/report/receipts-cash-book?requestId=${uuidv1()}&trustAccountId=${trustAccountId}&fromDate=${fromDate}&toDate=${toDate}`
  );

export const fetchTrustPaymentsCashBook = (trustAccountId, fromDate, toDate) =>
  API.get(
    `/api/trust/report/payments-cash-book?requestId=${uuidv1()}&trustAccountId=${trustAccountId}&fromDate=${fromDate}&toDate=${toDate}`
  );

export const fetchTrustTrialBalance = (trustAccountId, asAt) =>
  API.get(
    `/api/trust/report/trial-balance?requestId=${uuidv1()}&trustAccountId=${trustAccountId}&asAt=${asAt}`
  );

export const fetchTrustDebitLedgers = (trustAccountId, asAt) =>
  API.get(
    `/api/trust/report/debit-ledgers?requestId=${uuidv1()}&trustAccountId=${trustAccountId}&asAt=${asAt}`
  );

// --- reconciliation ---

export const fetchTrustReconciliations = (trustAccountId) =>
  API.get(
    `/api/trust/reconciliation?requestId=${uuidv1()}&trustAccountId=${trustAccountId}`
  );

export const fetchTrustReconciliation = (id) =>
  API.get(`/api/trust/reconciliation/${id}?requestId=${uuidv1()}`);

export const createTrustReconciliation = (formData) =>
  API.post(`/api/trust/reconciliation`, {
    requestId: uuidv1(),
    data: formData,
  });

export const updateTrustReconciliation = (formData) =>
  API.put(`/api/trust/reconciliation`, { requestId: uuidv1(), data: formData });

export const addTrustReconciliationItem = (reconciliationId, formData) =>
  API.post(`/api/trust/reconciliation/${reconciliationId}/item`, {
    requestId: uuidv1(),
    data: formData,
  });

export const removeTrustReconciliationItem = (reconciliationId, itemId) =>
  API.delete(
    `/api/trust/reconciliation/${reconciliationId}/item/${itemId}?requestId=${uuidv1()}`
  );

export const completeTrustReconciliation = (id) =>
  API.put(`/api/trust/reconciliation/${id}/complete?requestId=${uuidv1()}`);

export const deleteTrustReconciliationDraft = (id) =>
  API.delete(`/api/trust/reconciliation/${id}?requestId=${uuidv1()}`);

// --- month-end packs ---

export const fetchTrustMonthEndPacks = (trustAccountId) =>
  API.get(
    `/api/trust/month-end?requestId=${uuidv1()}&trustAccountId=${trustAccountId}`
  );

export const generateTrustMonthEndPack = (trustAccountId, packDate) =>
  API.post(
    `/api/trust/month-end?requestId=${uuidv1()}&trustAccountId=${trustAccountId}&packDate=${packDate}`
  );

export const verifyTrustMonthEndPack = (id) =>
  API.get(`/api/trust/month-end/${id}/verify?requestId=${uuidv1()}`);

// Returns the PDF, not the ResponseData envelope.
export const downloadTrustMonthEndPack = (id) =>
  API.get(`/api/trust/month-end/${id}/download`, { responseType: "blob" });

// --- client statements ---

export const fetchTrustStatements = (trustLedgerId) =>
  API.get(
    `/api/trust/statement?requestId=${uuidv1()}&trustLedgerId=${trustLedgerId}`
  );

export const fetchTrustStatementsUndelivered = (trustAccountId) =>
  API.get(
    `/api/trust/statement/undelivered?requestId=${uuidv1()}&trustAccountId=${trustAccountId}`
  );

export const fetchTrustStatementsAnnualOutstanding = (trustAccountId, yearEnd) =>
  API.get(
    `/api/trust/statement/annual-outstanding?requestId=${uuidv1()}&trustAccountId=${trustAccountId}&yearEnd=${yearEnd}`
  );

export const fetchTrustStatement = (id) =>
  API.get(`/api/trust/statement/${id}?requestId=${uuidv1()}`);

export const generateTrustStatement = (formData) =>
  API.post(`/api/trust/statement`, { requestId: uuidv1(), data: formData });

export const recordTrustStatementDelivery = (id, formData) =>
  API.put(`/api/trust/statement/${id}/delivery`, {
    requestId: uuidv1(),
    data: formData,
  });

export const downloadTrustStatement = (id) =>
  API.get(`/api/trust/statement/${id}/download`, { responseType: "blob" });

// --- compliance: statutory deposit, deficiencies, stale cheques ---

export const deriveTrustDepositInputs = (trustAccountId, fromDate, toDate) =>
  API.get(
    `/api/trust/compliance/deposit/inputs?requestId=${uuidv1()}&fromDate=${fromDate}&toDate=${toDate}${
      trustAccountId ? `&trustAccountId=${trustAccountId}` : ""
    }`
  );

export const fetchTrustDeposits = () =>
  API.get(`/api/trust/compliance/deposit?requestId=${uuidv1()}`);

export const recordTrustDeposit = (formData) =>
  API.post(`/api/trust/compliance/deposit`, {
    requestId: uuidv1(),
    data: formData,
  });

export const fetchTrustDeficiencies = (trustAccountId) =>
  API.get(
    `/api/trust/compliance/deficiency?requestId=${uuidv1()}&trustAccountId=${trustAccountId}`
  );

export const recordTrustDeficiency = (formData) =>
  API.post(`/api/trust/compliance/deficiency`, {
    requestId: uuidv1(),
    data: formData,
  });

export const recordTrustDeficiencyReport = (id, formData) =>
  API.put(`/api/trust/compliance/deficiency/${id}/report`, {
    requestId: uuidv1(),
    data: formData,
  });

export const closeTrustDeficiency = (id, formData) =>
  API.put(`/api/trust/compliance/deficiency/${id}/close`, {
    requestId: uuidv1(),
    data: formData,
  });

export const fetchTrustUnrecordedDebits = (trustAccountId, asAt) =>
  API.get(
    `/api/trust/compliance/deficiency/unrecorded-debits?requestId=${uuidv1()}&trustAccountId=${trustAccountId}&asAt=${asAt}`
  );

export const fetchTrustStaleCheques = (trustAccountId, months) =>
  API.get(
    `/api/trust/compliance/stale-cheques?requestId=${uuidv1()}&trustAccountId=${trustAccountId}${
      months ? `&months=${months}` : ""
    }`
  );
