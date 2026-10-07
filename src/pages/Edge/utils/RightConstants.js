export const VIEWACCOUNTINGTAB = "ViewAccountingTab";
export const VIEWACCOUNTINGPANEL = "ViewAccountingPanel";
export const VIEWADMINTAB = "ViewAdminTab";
export const VIEWXEROADMINTAB = "ViewXeroAdminTab";
export const CREATEINVOICE = "CreateInvoice";
export const CREATEPAYMENT = "CreatePayment";
export const CREATESERVICELINEITEM = "CreateServiceLineItem";
export const CREATEINVOICETEMPLATE = "CreateInvoiceTemplate";
export const UPDATEMATTER = "UpdateMatter";
export const ARCHIVEUNARCHIVEMATTER = "ArchiveUnarchiveMatter";
export const UNARCHIVEMATTER = "UnarchiveMatter";
export const UPDATECONTACT = "UpdateContact";
export const UPDATESERVICELINEITEM = "UpdateServiceLineItem";
export const UPDATEINVOICETEMPLATE = "UpdateInvoiceTemplate";
export const DELETEMATTERATTACHMENT = "DeleteMatterAttachment";
export const DELETEINVOICE = "DeleteInvoice";
export const DELETEPAYMENT = "DeletePayment";
export const DELETESERVICELINEITEM = "DeleteServiceLineItem";
export const DELETEINVOICETEMPLATE = "DeleteInvoiceTemplate";
export const DELETEBANKDEPOSITSLIP = "DeleteBankDepositSlip";
export const EXPORTTOXERO = "ExportToXero";
export const UNDOFINALINVOICE = "UndoFinalInvoice";
export const OUTSTANDINGINVOICEREPORT = "OutstandingInvoiceReport";
export const EDITARCHIVEDMATTER = "EditArchivedMatter";
// Gates the Log All Users Off button on Admin -> Logged In Users. Must match the
// rightName seeded by 2026-09-11-logoff-all-users-right.sql, and the constant
// the server checks in UserSessionController.
export const LOGOFFALLUSERS = "LogoffAllUsers";
// Gates Admin -> Feedback Review. Responses carry the respondent's name, so
// this is not a right to hand out by default. Must match the rightName seeded
// by 2026-09-14-user-feedback.sql and the constant FeedbackController checks.
export const VIEWFEEDBACKREVIEW = "ViewFeedbackReview";

// ---------------------------------------------------------------------------
// Trust Accounting. Each must match the rightName seeded by
// 2026-09-30-trust-accounting-core.sql and the constant the matching controller
// checks - they are compared as strings on the server, so a typo here fails
// open-looking (the UI hides the control) rather than closed, which is the
// safer direction but still wrong.
// ---------------------------------------------------------------------------
export const VIEWTRUSTACCOUNTING = "ViewTrustAccounting";
export const CREATETRUSTRECEIPT = "CreateTrustReceipt";
export const PREPARETRUSTPAYMENT = "PrepareTrustPayment";
// The authorised signatory right. Holding it is NOT enough on the server: the
// user must also be a current signatory on that particular account, and must
// not be the person who prepared the payment. Hiding the button for people
// without the right is a convenience, not the control.
export const AUTHORISETRUSTPAYMENT = "AuthoriseTrustPayment";
export const MANAGETRUSTACCOUNT = "ManageTrustAccount";
export const GENERATETRUSTMONTHEND = "GenerateTrustMonthEnd";
