export const matterTabName = {
  CONTACTS: "Contacts",
  TIME_BILLING: "Time Billing",
  PROPERTY: "Property",
  ATTACHMENTS: "Attachments",
  BASIC: "Matter Summary",
  BUSINESS_SALE_PURCHASE: "Business Sale/Purchase",
  INVOICES: "Invoices",
  ESTATE: "Estate",
  CONVEYANCE: "Conveyance",
  FAMILY_LAW: "Family Law",
  LEASE: "Lease",
  MARRIAGE_DEFACTO: "Marriage Defacto",
  CHECKLIST: "Workflow",
};

export const settlementApplicable = [
  "BUSINESS_SALE_PURCHASE",
  "CONVEYANCING",
  "ESTATES",
];

export const datesToShow = ["BUSINESS_SALE_PURCHASE", "CONVEYANCING"];

export const listMap = {
  CONTACTS: "matterContacts",
  ATTACHMENTS: "attachmentList",
  TIME_BILLING: "timeBillingList",
  PROPERTY: "propertyList",
  INVOICES: "invoiceList",
};

export const driveUpload = {
  GDRIVE: "GOOGLE_DRIVE",
  ONEDRIVE: "ONEDRIVE",
};

export const UPLOAD_CONFIG = {
  MAX_FILES: 15,
  initialData: {
    name: "",
    documentType: "",
    subTypes: [],
    storageType: null,
  },
};
export const AUSTRALIAN_TIMEZONES = [
  {
    label: "Sydney / Melbourne / Canberra (AEST/AEDT)",
    value: "Australia/Sydney",
  },
  { label: "Brisbane (AEST - No DST)", value: "Australia/Brisbane" },
  { label: "Adelaide (ACST/ACDT)", value: "Australia/Adelaide" },
  { label: "Darwin (ACST - No DST)", value: "Australia/Darwin" },
  { label: "Perth (AWST)", value: "Australia/Perth" },
  { label: "Hobart (AEST/AEDT)", value: "Australia/Hobart" },
];
