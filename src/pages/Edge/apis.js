import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { v1 as uuidv1 } from "uuid";

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const XERO_APP_CONNECTION_URL =
  process.env.REACT_APP_XERO_APP_CONNECTION_URL;

const API = axios.create({
  baseURL: API_BASE_URL,
});

const cleaningFunc = () => {
  Cookies.remove("userJWT");
  window.localStorage.clear();
  window.location.href = "/";
};

API.interceptors.request.use((req) => {
  if (Cookies.get("userJWT") && !req.url.includes("signin")) {
    if (jwtDecode(Cookies.get("userJWT")).exp > Date.now() / 1000) {
      req.headers["Authorization"] = `Bearer ${Cookies.get("userJWT")}`;
      return req;
    } else {
      let isLoggedOut = window.sessionStorage.getItem("alreadyLoggedOut");
      if (isLoggedOut) {
        cleaningFunc();
      } else {
        toast.error("Session Expired");
        window.sessionStorage.setItem("alreadyLoggedOut", true);
        cleaningFunc();
      }
    }
  } else {
    return req;
  }
});

const config = {
  headers: {
    "content-type": "multipart/form-data",
  },
};

// APIS

let initialFilters = {
  name: "",
  sortOn: "",
  sortType: "",
  pageNo: 0,
  pageSize: 25,
};

export const loginUser = (loginData) => API.post(`/api/auth/signin`, loginData);
export const userProfile = () => API.get(`/api/user/${Cookies.get("userId")}`);
export const changePassword = (formData) =>
  API.post(`/api/user/password`, {
    requestId: uuidv1(),
    data: {
      ...formData,
      userId: Cookies.get("userId"),
    },
  });

export const fetchMetaData = () =>
  API.get(`/api/metadata/?requestId=${uuidv1()}`);

export const fetchMetaTab = () =>
  API.get(`/api/metadata/matter_type/tab_details?requestId=${uuidv1()}`);

export const fetchEnums = () =>
  API.get(`/api/metadata/enum?requestId=${uuidv1()}`);

export const fetchMatterRole = () =>
  API.get(`/api/metadata/matter_type?requestId=${uuidv1()}`);

export const fetchPaymentTypes = () =>
  API.get(`/api/metadata/payment_type?requestId=${uuidv1()}`);

export const fetchCountryAndStates = () =>
  API.get(`/api/dropdown/countries?requestId=${uuidv1()}`);

export const fetchSuburbAndPostcode = () =>
  API.get(`/api/postcode?requestId=${uuidv1()}`);

export const siteChange = (data) => API.post("/api/user/switch-site", data);
export const generatePrecedentApi = (obj) =>
  API.get(
    `/api/document/generatePrecedentDocument?precedentId=${
      obj.docId
    }&matterId=${obj.matterId}&basePrecedentId=${
      obj.basePrecedentId
    }&requestId=${uuidv1()}`,
    {
      responseType: "blob",
    }
  );

// Admin section update preferred (BankAccount, Address, and TaxDisclaimer)
export const updatePreferred = (formData) =>
  API.patch("/api/siteinfo", {
    requestId: uuidv1(),
    data: {
      preferredBankAccountId: formData.preferredBankAccountId
        ? formData.preferredBankAccountId
        : null,
      preferredAddressId: formData.preferredAddressId
        ? formData.preferredAddressId
        : null,
      preferredDisclaimerId: formData.preferredDisclaimerId
        ? formData.preferredDisclaimerId
        : null,
    },
  });

// Matters
export const getMattersList = (filters) =>
  API.get(
    `/api/matter?requestId=${uuidv1()}&page=${filters.pageNo || ""}&pageSize=${
      filters.pageSize || ""
    }&number=${
      filters.archived
        ? filters.archiveNumber || ""
        : filters.matterNumber || ""
    }&status=${filters.status ? filters.status : ""}&type=${
      filters.type ? filters.type : ""
    }&instructionDate=${
      filters.instructionDate ? filters.instructionDate : ""
    }&completionDate=${
      filters.completionDate ? filters.completionDate : ""
    }&archived=${filters.archived}&myMatters=${filters.myMatters}&subType=${
      filters.subType ? filters.subType : ""
    }&contacts=${filters.contacts ? filters.contacts : ""}&letterSubject=${
      filters.letterSubject ? filters.letterSubject : ""
    }&sortOn=${filters.sortOn ? filters.sortOn : ""}&sortType=${
      filters.sortType ? filters.sortType : ""
    }`
  );

export const getMatterDetail = (id) =>
  API.get(`/api/matter/${id}?requestId=${uuidv1()}`);

export const getPrecedents = (arg) => {
  let types =
    arg.length > 0 ? arg.join(",") : ["NORMAL", "LETTER", "FORM"].join(",");
  return API.get(
    `/api/metadata/precendents?requestId=${uuidv1()}&documentType=${types}`
  );
};

export const unlinkMatterContact = (formData) =>
  API.delete(`/api/matter/contact`, {
    data: {
      requestId: uuidv1(),
      data: formData,
    },
  });

export const linkMatterContact = (formData) =>
  API.post(`/api/matter/contact`, {
    requestId: uuidv1(),
    data: formData,
  });

export const addMatter = (formData) =>
  API.post(`/api/matter`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editMatter = (formData) =>
  API.put(`/api/matter`, {
    requestId: uuidv1(),
    data: formData,
  });

export const archiveMatter = (formData) =>
  API.put(`/api/matter/${formData.id}/archive`, {
    requestId: uuidv1(),
    data: formData,
  });

export const addFamilyLaw = (formData) =>
  API.post(`/api/matter/family-law`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editFamilyLaw = (formData) =>
  API.put(`/api/matter/family-law`, {
    requestId: uuidv1(),
    data: formData,
  });

export const addEstate = (formData) =>
  API.post(`/api/matter/estate`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editEstate = (formData) =>
  API.put(`/api/matter/estate`, {
    requestId: uuidv1(),
    data: formData,
  });

export const addLease = (formData) =>
  API.post(`/api/matter/lease`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editLease = (formData) =>
  API.put(`/api/matter/lease`, {
    requestId: uuidv1(),
    data: formData,
  });

export const addConveyance = (formData) =>
  API.post(`/api/matter/conveyance`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editConveyance = (formData) =>
  API.put(`/api/matter/conveyance`, {
    requestId: uuidv1(),
    data: formData,
  });

export const addBusiness = (formData) =>
  API.post(`/api/matter/business`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editBusiness = (formData) =>
  API.put(`/api/matter/business`, {
    requestId: uuidv1(),
    data: formData,
  });

export const addTimeBilling = (formData) =>
  API.post(`/api/matter/time-billing`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editTimeBilling = (formData) =>
  API.put(`/api/matter/time-billing`, {
    requestId: uuidv1(),
    data: formData,
  });

export const deleteTimeBilling = (ids) =>
  API.delete(`/api/matter/time-billing?timeBillIds=${ids}`);

export const getInvoiceofMatter = (id) =>
  API.get(`/api/invoice/matter/${id}?requestId=${uuidv1()}`);

export const getUnpaidInvoiceOfMatter = (id) =>
  API.get(`/api/invoice/matter/${id}/final-unpaid?requestId=${uuidv1()}`);

export const getInvoiceById = (id) =>
  API.get(`/api/invoice/${id}?requestId=${uuidv1()}`);

export const addOrPreviewInvoice = (formData, preview) =>
  API.post(`/api/invoice?preview=${preview}`, {
    requestId: uuidv1(),
    data: formData,
  });

export const addReceivedPayment = (formData) =>
  API.post(`/api/matter/payment`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editOrPreviewInvoice = (formData, preview) =>
  API.put(`/api/invoice?preview=${preview}`, {
    requestId: uuidv1(),
    data: formData,
  });

export const printMatterInvoice = (id) => API.get(`/api/invoice/${id}/print`);

export const linkMatterProperty = (formData) =>
  API.post(`/api/matter/property`, {
    requestId: uuidv1(),
    data: formData,
  });

export const unlinkMatterProp = (formData) =>
  API.delete(`/api/matter/property`, {
    data: {
      requestId: uuidv1(),
      data: formData,
    },
  });

export const uploadMatterAttach = (formData) =>
  API.post(`/api/matter/attachment?requestId=${uuidv1()}`, formData, config);
export const editMatterAttach = (formData) =>
  API.put(`/api/matter/attachment?requestId=${uuidv1()}`, formData, config);
export const downloadMatterAttach = (ids) =>
  API.get(`/api/matter/attachment?requestId=${uuidv1()}&attachmentIds=${ids}`, {
    responseType: "blob",
  });
export const deleteMatterAttach = (ids) =>
  API.delete(
    `/api/matter/attachment?requestId=${uuidv1()}&attachmentIds=${ids}`,
    config
  );

export const updateMatterChecklist = (formData) =>
  API.put(`/api/matter/checklist`, {
    requestId: uuidv1(),
    data: formData,
  });

// Contacts
export const allContacts = (filterData) =>
  API.get(
    `/api/contacts?requestId=${uuidv1()}&page=${filterData.pageNo}&pageSize=${
      filterData.pageSize
    }&contactType=${
      filterData.contactType ? filterData.contactType.toUpperCase() : ""
    }&role=${filterData.role}&firstName=${filterData.firstName}&organisation=${
      filterData.organisation
    }&lastName=${filterData.lastName}&emailAddress=${
      filterData.emailAddress
    }&telephoneNumber=${filterData.telephoneNumber}&sortOn=${
      filterData.sortField
    }&sortType=${filterData.sortOrder}`
  );

export const fetchAllContactsWithoutFilter = () =>
  API.get(`/api/contacts?requestId=${uuidv1()}&textField=&type=`);

export const fetchAllContactsFromDb = (type = "") =>
  API.get(`/api/contacts/absolute?contactType=${type}`);

export const getContactDetails = (id, type) =>
  API.get(`/api/contacts/${type}/${id}?requestId=${uuidv1()}`);

export const getContactRoles = () => API.get(`/api/contact-role`);

export const createContact = (formData) => API.post(`/api/contacts`, formData);

export const deleteContacts = (contactIds, contactTypes) =>
  API.delete(
    `/api/contacts/${contactIds}?requestId=${uuidv1()}&type=${contactTypes}`
  );
export const editContact = (formData) => API.put(`/api/contacts`, formData);

export const getCustodyListOfContact = (id, type) =>
  API.get(`/api/contacts/${type}/${id}/custody-packet?requestId=${uuidv1()}`);
export const getMatterListOfContact = (id, type) =>
  API.get(`/api/contacts/${type}/${id}/matter?requestId=${uuidv1()}`);

export const getSafeCustodyOfContact = (id, type) =>
  API.get(
    `/api/safecustody/contact/${id}?requestId=${uuidv1()}&contactType=${type}`
  );

export const getContactAttachments = (id, type) =>
  API.get(
    `/api/contacts/attachment/${id}?requestId=${uuidv1()}&contactType=${type}`
  );

export const downloadContactAttachment = (ids) =>
  API.get(
    `/api/contacts/attachment?requestId=${uuidv1()}&attachmentIds=${ids}`,
    {
      responseType: "blob",
    }
  );

export const deleteContactAttachment = (ids) =>
  API.delete(
    `/api/contacts/attachment?requestId=${uuidv1()}&attachmentIds=${ids}`
  );

export const uploadContactAttachment = (formData) =>
  API.post(`/api/contacts/attachment`, formData, config);

export const editContactAttachment = (formData) =>
  API.put(`/api/contacts/attachment`, formData, config);

export const checkPersonExist = (formData) =>
  API.get(
    `/api/contacts/person?requestId=${uuidv1()}&firstName=${
      formData.firstName
    }&lastName=${formData.lastName}&emailAddress=${
      formData.emailId1
    }&passportNumber=${formData.passportNumber}`
  );

// Safecustody
export const allSafecustody = (filterData) =>
  API.get(
    `/api/safecustody?requestId=${uuidv1()}&status=${
      filterData.status === ""
        ? filterData.safeCustodyStatus
        : filterData.status
    }&page=${filterData.pageNo}&pageSize=${filterData.pageSize}&siteName=${
      filterData.siteName
    }&companyName=${filterData.companyName}&packetNumber=${
      filterData.packetNumber
    }&comments=${filterData.comment}&sortOn=${
      filterData.sortField
    }&sortType=${filterData.sortOrder.toUpperCase()}`
  );

export const createSafecustody = (formData) =>
  API.post(`/api/safecustody`, formData);

export const editSafecustody = (formData) =>
  API.put(`/api/safecustody`, formData);

export const validateSafecustody = (id) =>
  API.get(`/api/safecustody/validate/${id}?requestId=${uuidv1()}`);

export const deleteSafecustody = (formData) =>
  API.delete(
    `/api/safecustody`,
    {
      data: {
        requestId: uuidv1(),
        ...formData,
      },
    },
    formData
  );

export const uploadCustodyAttachment = (formData) =>
  API.post(`/api/safecustody/attachment`, formData, config);

export const editContentAttachment = (formData) =>
  API.put(`/api/safecustody/attachment`, formData, config);

export const linkContactToSafecustody = (formData) =>
  API.post(`/api/safecustody/contact`, formData);

export const unlinkContactToSafecustody = (formData) =>
  API.delete(`/api/safecustody/contact`, {
    data: {
      ...formData,
    },
  });

export const fetchLinkedContacts = (id) =>
  API.get(`/api/safecustody/${id}?requestId=${uuidv1()}`);

export const setPrimaryContactForCustody = (formData) =>
  API.put(`/api/safecustody/contact`, formData);

export const prepareReceiptForCustody = (formData) =>
  API.post(`/api/safecustody/receipt`, formData);

export const getPreparedReceipt = (id) =>
  API.get(`/api/safecustody/receipt/${id}?requestId=${uuidv1()}`);

export const downloadContentAttachment = (selectedContent) =>
  API.get(
    `/api/safecustody/attachment?requestId=${uuidv1()}&attachmentIds=${selectedContent}`,
    {
      responseType: "blob",
    }
  );

export const downloadReceipt = (id) =>
  API.get(`/api/safecustody/receipt/download/${id}?requestId=${uuidv1()}`, {
    responseType: "blob",
  });

export const deleteContentAttachment = (selectedContent) =>
  API.delete(
    `/api/safecustody/attachment?requestId=${uuidv1()}&attachmentIds=${selectedContent}`
  );

// Properties

export const fetchPropertyList = (filterData) =>
  API.get(
    `/api/property?requestId=${uuidv1()}&page=${filterData.pageNo}&pageSize=${
      filterData.pageSize
    }&titleReference=${filterData.titleReferences}&address=${
      filterData.address
    }&sortOn=${filterData.sortField}&sortType=${filterData.sortOrder}`
  );

export const addNewProperty = (formData) => API.post(`/api/property`, formData);

export const editPropertyDetails = (formData) =>
  API.put(`/api/property`, formData);

export const fetchPropertyById = (id) =>
  API.get(`/api/property/${id}?requestId=${uuidv1()}`);

export const deletePropertyFromList = (ids) =>
  API.delete(`/api/property/delete/${ids}?requestId=${uuidv1()}`);

export const deleteRegisteredLot = (id) =>
  API.delete(`/api/property/deletereglot/${id}?requestId=${uuidv1()}`);

export const deleteUnregisteredLot = (id) =>
  API.delete(`/api/property/deleteunreglot/${id}?requestId=${uuidv1()}`);

export const deletePropertyById = (id) =>
  API.delete(`/api/property/${id}?requestId=${uuidv1()}`);

export const checkPropertyLinkedToMatter = (ids) =>
  API.get(`/api/property/islinked/${ids}?requestId=${uuidv1()}`);

// Document Section
export const getDocuments = (filterData) =>
  API.get(
    `/api/document?requestId=${uuidv1()}&page=${filterData.pageNo}&pageSize=${
      filterData.pageSize
    }`
  );

export const uploadDocumentAttach = (formData) =>
  API.post(`/api/document`, formData);

export const deleteDocAttach = (ids) =>
  API.delete(`/api/document?requestId=${uuidv1()}&documentIds=${ids}`);

export const downloadDocAttach = (ids) =>
  API.get(`/api/document/download?requestId=${uuidv1()}&documentIds=${ids}`, {
    responseType: "blob",
  });

export const getDocDetail = (id) =>
  API.get(`/api/document/${id}?requestId=${uuidv1()}`);

export const updateDocDetail = (formData) => API.put(`/api/document`, formData);

// Accounting

// Deposit Slips
export const getDepositList = (filters) =>
  API.get(
    `/api/bank-deposit-slip?requestId=${uuidv1()}&page=${
      filters.pageNo
    }&pageSize=${filters.pageSize}&createdDate=${
      filters.createdDate ? filters.createdDate : ""
    }&description=${filters.description || ""}&matterNumber=${
      filters.matterNumber || ""
    }&amount=${filters.amount || ""}&sortOn=${
      filters.sortOn ? filters.sortOn : ""
    }&sortType=${filters.sortType ? filters.sortType : ""}`
  );

export const addDepositSlip = (formData) =>
  API.post(`/api/bank-deposit-slip`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editDepositSlip = (formData) =>
  API.put(`/api/bank-deposit-slip`, {
    requestId: uuidv1(),
    data: formData,
  });

export const deleteDepositSlipById = (id) =>
  API.delete(`/api/bank-deposit-slip/${id}?requestId=${uuidv1()}`);

export const printDepositSlip = (id) =>
  API.get(`/api/bank-deposit-slip/${id}/print`);



export const allPaymentList = (filters = {}) =>
  API.get(
    `/api/matter/payment?paymentNumber=${
      filters?.paymentNumber || ""
    }&paymentType=${filters?.paymentType || ""}&paymentDate=${
      filters?.createdOn || ""
    }&matterNumber=${filters?.matterNumber || ""}&createdBy=${
      filters?.createdBy || ""
    }&amount=${filters?.amount || ""}&status=${filters?.status || ""}&sortOn=${
      filters?.sortOn || ""
    }&sortType=${filters?.sortType || ""}&page=${filters?.pageNo || 0}&pageSize=${
      filters?.pageSize || 25
    }&requestId=${uuidv1()}`
  );

export const allDSPaymentList = (filters = {}) =>
  API.get(`/api/matter/payment/deposit-slip?requestId=${uuidv1()}`);

// Service Line
export const getServiceLine = (filters = {}) =>
  API.get(
    `/api/serviceline?requestId=${uuidv1()}&page=${filters.pageNo || 0}&pageSize=${filters.pageSize || 25}&search=${filters.search || ""}`
  );

export const addServiceLine = (formData) =>
  API.post(`/api/serviceline`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editServiceDetails = (formData) =>
  API.put(`/api/serviceline`, {
    requestId: uuidv1(),
    data: formData,
  });

export const getServiceLineDetail = (id) =>
  API.get(`/api/serviceline/${id}?requestId=${uuidv1()}`);

export const deleteServiceLine = (id) =>
  API.delete(`/api/serviceline/${id}?requestId=${uuidv1()}`);

// Invoice List
export const getInvoiceList = (filters) =>
  API.get(
    `/api/invoice?invoiceNumber=${filters?.invoiceNumber || ""}&invoiceDate=${
      filters?.invoiceDate || ""
    }&invoiceDueDate=${filters?.invoiceDueDate || ""}&matterNumber=${
      filters?.matterNumber || ""
    }&createdBy=${filters?.createdBy || ""}&sortOn=${
      filters.sortOn || ""
    }&totalAmount=${
      filters.totalAmount || filters.totalAmount == 0 ? filters.totalAmount : ""
    }&sortType=${filters.sortType || ""}&page=${filters.pageNo || 0}&pageSize=${
      filters.pageSize || 25
    }&requestId=${uuidv1()}`
  );
export const deleteInvoiceById = (ids) =>
  API.delete(`/api/invoice?requestId=${uuidv1()}&invoiceIds=${ids}`);

// Invoice Templates
export const getInvoiceTemplate = () =>
  API.get(`/api/invoice/template?requestId=${uuidv1()}`);

export const createInvoiceTemplate = (formData) =>
  API.post(`/api/invoice/template`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editInvoiceTemplate = (formData) =>
  API.put(`/api/invoice/template`, {
    requestId: uuidv1(),
    data: formData,
  });

export const deleteInvoiceTemplate = (id) =>
  API.delete(`/api/invoice/template/${id}?requestId=${uuidv1()}`);

export const getInvoiceDetail = (id) =>
  API.get(`/api/invoice/template/${id}?requestId=${uuidv1()}`);

// Xero Settings
export const getXeroSetting = () => API.get(`/api/xero/settings`);

export const updateXeroSetting = (formData) =>
  API.put(`/api/xero/settings`, {
    requestId: uuidv1(),
    data: formData,
  });

export const getEligibleInvoice = () =>
  API.get(`/api/xero/invoice?requestId=${uuidv1()}`);

export const uploadInvoiceToXero = (formData) =>
  API.post(`/api/xero/invoice`, {
    requestId: uuidv1(),
    data: formData,
  });

// export const uploadInvoiceToXero = (ids) =>
//   API.get(`api/xero/invoice/upload?invoiceIds=${ids}`);

export const getEligiblePayments = () =>
  API.get(`/api/xero/payment?requestId=${uuidv1()}`);

export const uploadPaymentToXero = (formData) =>
  API.post(`/api/xero/payment`, {
    requestId: uuidv1(),
    data: formData,
  });

// export const uploadPaymentToXero = (ids) =>
//   API.post(`/api/xero/payment/upload?paymentIds=${ids}`);

// Payment Section
export const deletePaymentById = (ids) =>
  API.delete(`/api/matter/payment?requestId=${uuidv1()}&paymentIds=${ids}`);

// Admin Section

// Settings
export const fetchNumbering = () =>
  API.get(`/api/entityseries?requestId=${uuidv1()}`);

export const editNumbering = (formData) =>
  API.put(`/api/entityseries`, {
    requestId: uuidv1(),
    data: formData,
  });

// Manage Staff
export const allStaffMember = (filters) =>
  API.get(
    `/api/staff?requestId=${uuidv1()}&userName=${
      filters.userName ?? ""
    }&firstName=${filters.firstName ?? ""}&lastName=${
      filters.lastName ?? ""
    }&emailId1=${filters.emailId1 ?? ""}&roleName=${
      filters.roleName ?? ""
    }&phoneNumber1=${filters.phoneNumber1 ?? ""}&staffActive=${
      filters.staffActive === false ? false : filters.staffActive
    }&sortOn=${filters.sortOn ?? ""}&sortType=${filters.sortType ?? ""}`
  );

  export const allStaffMemberAndAccountInfoStaff = () =>
  API.get(
    `/api/staff/by-account-site?requestId=${uuidv1()}`
  );
  
export const editStaffDetails = (formData) =>
  API.put(`/api/staff`, {
    requestId: uuidv1(),
    data: formData,
  });

export const addStaff = (formData) =>
  API.post(`/api/staff`, {
    requestId: uuidv1(),
    data: formData,
  });

export const getMemberDetails = (id) => API.get(`/api/staff/${id}`);

export const getStaffNotLinked = () =>
  API.get(`/api/admin/staff/user?requestId=${uuidv1()}`);

export const uploadStaffAttach = (formData) =>
  API.post(`/api/staff/attachment?requestId=${uuidv1()}`, formData, config);

export const editStaffAttach = (formData) =>
  API.put(`/api/staff/attachment?requestId=${uuidv1()}`, formData, config);

export const deleteStaffAttach = (ids) =>
  API.delete(
    `/api/staff/attachment?requestId=${uuidv1()}&attachmentIds=${ids}`,
    config
  );

export const downloadStaffAttach = (ids) =>
  API.get(`/api/staff/attachment?requestId=${uuidv1()}&attachmentIds=${ids}`, {
    responseType: "blob",
  });

// Manage Roles
export const getRights = () =>
  API.get(`/api/application-rights?requestId=${uuidv1()}`);

export const getRoles = (filterData = initialFilters) =>
  API.get(
    `/api/application-role?requestId=${uuidv1()}&page=${
      filterData.pageNo
    }&pageSize=${filterData.pageSize}&roleName=${
      filterData.roleName ? filterData.roleName : ""
    }&description=${
      filterData.description ? filterData.description : ""
    }&sortOn=${filterData.sortOn}&sortType=${filterData.sortType}`
  );

export const particularRole = (id) =>
  API.get(`/api/application-role/${id}?requestId=${uuidv1()}`);

export const createRole = (formData) =>
  API.post(`/api/application-role`, {
    requestId: uuidv1(),
    data: formData,
  });

export const updateRole = (formData) =>
  API.put(`/api/application-role`, {
    requestId: uuidv1(),
    data: formData,
  });

export const deleteRole = (id) =>
  API.delete(`/api/application-role/${id}?requestId=${uuidv1()}`);

// Base Templates

export const getAllBaseTemplates = (filter = initialFilters) =>
  API.get(
    `/api/letterhead?requestId=${uuidv1()}&name=${
      filter.name
    }&uploadStartDate=${
      filter.uploadDate ? filter.uploadDate : ""
    }&uploadEndDate=${filter.uploadDate ? filter.uploadDate : ""}&uploadedBy=${
      filter.uploadedBy ? filter.uploadedBy : ""
    }&sortOn=${filter.sortOn}&sortType=${filter.sortType}&page=${
      filter.pageNo
    }&pageSize=${filter.pageSize}`
  );

export const deleteBaseTemplate = (ids) =>
  API.delete(`/api/letterhead?requestId=${uuidv1()}&templateIds=${ids}`);

export const downloadBaseTemplate = (id) =>
  API.get(`/api/letterhead/download?templateIds=${id}`, {
    responseType: "blob",
  });

export const uploadBaseTemplate = (formData) =>
  API.post(`/api/letterhead`, formData);

export const editBaseTemplate = (formData) =>
  API.put(`/api/letterhead`, formData);

// Manage Templates
export const getAllTemplates = (filter) =>
  API.get(
    `/api/precedents?requestId=${uuidv1()}&name=${filter.name}&documentType=${
      filter.documentType ?? ""
    }&type=${filter.type ?? ""}&uploadStartDate=${
      filter.uploadDate
    }&uploadEndDate=${filter.uploadDate}&uploadedBy=${
      filter.uploadedBy
    }&sortOn=${filter.sortOn}&sortType=${filter.sortType}&page=${
      filter.pageNo
    }&pageSize=${filter.pageSize}`
  );

export const downloadTemplate = (id) =>
  API.get(`/api/precedents/download?templateIds=${id}`, {
    responseType: "blob",
  });

export const deleteTemplate = (ids) =>
  API.delete(`/api/precedents?requestId=${uuidv1()}&templateIds=${ids}`);

export const uploadTemplate = (formData) =>
  API.post(`/api/precedents`, formData);

export const editTemplate = (formData) => API.put(`/api/precedents`, formData);

// Manage Users

// export const getAllUsers = (filterData) =>
//   API.get(
//     `/api/admin/user?requestId=${uuidv1()}&page=${filterData.pageNo}&pageSize=${
//       filterData.pageSize
//     }&firstName=${filterData.firstName}&lastName=${
//       filterData.lastName
//     }&userName=${filterData.userName}&sortOn=${filterData.sortOn}&sortType=${
//       filterData.sortType
//     }`
//   );

export const getAllUsers = (filterData) => {
  return API.get(
    `/api/admin/user?requestId=${uuidv1()}&page=${filterData.pageNo}&pageSize=${
      filterData.pageSize
    }&firstName=${filterData.firstName ? filterData.firstName : ""}&lastName=${
      filterData.lastName ? filterData.lastName : ""
    }&userName=${filterData.userName ? filterData.userName : ""}&locked=${
      filterData.locked === false ? false : filterData.locked
    }&sortOn=${filterData.sortOn ? filterData.sortOn : ""}&sortType=${
      filterData.sortType ? filterData.sortType : ""
    }`
  );
};
export const linkNewUser = (formData) =>
  API.post(`/api/admin/user`, {
    requestId: uuidv1(),
    data: formData,
  });

export const getUserDetail = (id) => API.get(`/api/user/${id}`);

export const userRoleDetails = (id) =>
  API.get(`api/admin/accountinfo/user/${id}?requestId=${uuidv1()}`);

export const updateUserInfo = (formData) =>
  API.put(`/api/admin/user`, {
    requestId: uuidv1(),
    data: formData,
  });

export const linkRoleToUser = (formData) =>
  API.post(`/api/admin/accountinfo`, {
    requestId: uuidv1(),
    data: formData,
  });

// Task List
export const addNewTask = (formData) =>
  API.post(`/api/checklist/task`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editTask = (formData) =>
  API.put(`/api/checklist/task`, {
    requestId: uuidv1(),
    data: formData,
  });

export const getTaskList = () =>
  API.get(`/api/checklist/task?requestId=${uuidv1()}&title=&description=`);

export const deleteTask = (ids) =>
  API.delete(`/api/checklist/task?requestId=${uuidv1()}&taskIds=${ids}`);

// Check list template
export const addNewChecklist = (formData) =>
  API.post(`/api/checklist/template`, {
    requestId: uuidv1(),
    data: formData,
  });

// Link checklist to MatterType
export const linkCheckListToMatterDefault = (formData) =>
  API.post(`/api/admin/matter/checklist`, {
    requestId: uuidv1(),
    data: formData,
  });

//Update Link checklist to MatterType
export const updateLinkCheckListToMatterDefault = (formData) =>
  API.put(`/api/admin/matter/checklist`, {
    requestId: uuidv1(),
    data: formData,
  });

export const fetchMatterDefaultChecklist = () =>
  API.get(`/api/admin/matter/checklist?requestId=${uuidv1()}`);

export const editCheckList = (formData) =>
  API.put(`/api/checklist/template`, {
    requestId: uuidv1(),
    data: formData,
  });

export const getCheckList = () =>
  API.get(`/api/checklist/template?requestId=${uuidv1()}&name=&description=`);

export const deleteCheckList = (ids) =>
  API.delete(
    `/api/checklist/template?requestId=${uuidv1()}&templateIds=${ids}`
  );

// Company Info
export const getCompanyInfo = () => API.get(`/api/companyinfo`);
export const updateCompanyInfo = (formData) =>
  API.put(`/api/companyinfo`, formData);

// Site info

export const getSiteInfo = () => API.get(`/api/siteinfo?requestId=${uuidv1()}`);
export const getSiteById = (id) =>
  API.get(`/api/siteinfo/${id}?requestId=${uuidv1()}`);

export const createNewSite = (formData) => API.post(`/api/siteinfo`, formData);

export const getBankAccountList = (filter) =>
  API.get(
    `/api/siteinfo/bankaccount?requestId=${uuidv1()}&sortOn=${
      filter.sortOn
    }&sortType=${filter.sortType}`
  );

export const getBankAccountDetails = (id) =>
  API.get(`/api/siteinfo/bankaccount/${id}?requestId=${uuidv1()}`);

export const updateSiteInfo = (formData) => API.put(`/api/siteinfo`, formData);

export const addNewDisclaimer = (formData) =>
  API.post(`/api/siteinfo/disclaimer`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editDisclaimer = (formData) =>
  API.put(`/api/siteinfo/disclaimer`, {
    requestId: uuidv1(),
    data: formData,
  });

export const deleteDisclaimer = (ids) =>
  API.delete(
    `/api/siteinfo/disclaimer?requestId=${uuidv1()}&disclaimerIds=${ids}`
  );

export const addNewBank = (formData) =>
  API.post(`/api/siteinfo/bankaccount`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editbankInfo = (formData) =>
  API.put(`/api/siteinfo/bankaccount`, {
    requestId: uuidv1(),
    data: formData,
  });

export const deleteBankAccount = (ids) =>
  API.delete(
    `/api/siteinfo/bankaccount?requestId=${uuidv1()}&accountIds=${ids}`
  );

export const addNewAddress = (formData) =>
  API.post(`/api/siteinfo/address`, {
    requestId: uuidv1(),
    data: formData,
  });

export const editAddressInfo = (formData) =>
  API.put(`/api/siteinfo/address`, {
    requestId: uuidv1(),
    data: formData,
  });

export const deleteAddress = (ids) =>
  API.delete(`/api/siteinfo/address?requestId=${uuidv1()}&addressIds=${ids}`);

export const checkContactsLinked = (contactIds, contactTypes) =>
  API.get(
    `/api/contacts/isLinked/${contactIds}?type=${contactTypes}&requestId=${uuidv1()}`
  );
