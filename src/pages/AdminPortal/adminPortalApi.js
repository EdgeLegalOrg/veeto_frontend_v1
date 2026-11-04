import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Same convention as pages/Edge/apis.js: empty means "the origin that served the page".
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "";

// The portal keeps its own token, in its own key, and its own axios instance.
// Nothing here reads or writes the application's userJWT cookie, so signing in
// to the portal never signs anyone in to the application, and an application
// session never opens the portal. sessionStorage rather than a cookie: the
// token ends with the tab and is never sent to the server by the browser on its
// own.
const STATE_KEY = "veetoSystemAdminSession";

export const PORTAL_BASE = "/admin-portal";

const portal = axios.create({ baseURL: API_BASE_URL });

/** A failure the server reported in its ResponseData envelope. */
export class PortalError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "PortalError";
    this.code = code;
  }
}

export const readSession = () => {
  try {
    const raw = window.sessionStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state.token || jwtDecode(state.token).exp * 1000 <= Date.now()) {
      window.sessionStorage.removeItem(STATE_KEY);
      return null;
    }
    return state;
  } catch (e) {
    window.sessionStorage.removeItem(STATE_KEY);
    return null;
  }
};

export const writeSession = (signIn) => {
  window.sessionStorage.setItem(
    STATE_KEY,
    JSON.stringify({
      token: signIn.token,
      admin: signIn.admin,
      mustChangePassword: signIn.mustChangePassword,
    })
  );
};

export const clearSession = () => window.sessionStorage.removeItem(STATE_KEY);

portal.interceptors.request.use((config) => {
  const session = readSession();
  if (session) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

portal.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response && error.response.status;
    const isSignIn = error.config && error.config.url && error.config.url.endsWith("/auth/signin");
    if (status === 401 && !isSignIn) {
      // Expired, locked or removed while signed in.
      clearSession();
      if (!window.location.pathname.startsWith(`${PORTAL_BASE}/login`)) {
        window.location.assign(`${PORTAL_BASE}/login`);
      }
    }
    return Promise.reject(error);
  }
);

/** Unwraps the ResponseData envelope, turning a reported failure into a PortalError. */
const call = async (request) => {
  let response;
  try {
    response = await request;
  } catch (error) {
    if (error instanceof PortalError) throw error;
    if (error.response && error.response.status === 403) {
      throw new PortalError("You do not have access to that.", 403);
    }
    throw new PortalError("The server could not be reached. Please try again.");
  }
  const body = response.data;
  if (!body || body.success === false) {
    const err = body && body.error;
    throw new PortalError((err && err.message) || "Something went wrong.", err && err.code);
  }
  return body;
};

const data = async (request) => (await call(request)).data;

const A = "/api/system-admin";

// ---- sign in and own account
export const signIn = (username, password) => data(portal.post(`${A}/auth/signin`, { username, password }));
export const getMe = () => data(portal.get(`${A}/auth/me`));
export const changeOwnPassword = (currentPassword, newPassword) =>
  data(portal.post(`${A}/auth/password`, { currentPassword, newPassword }));

// ---- system admins
export const listAdmins = () => data(portal.get(`${A}/admins`));
export const createAdmin = (body) => data(portal.post(`${A}/admins`, body));
export const updateAdmin = (id, body) => data(portal.put(`${A}/admins/${id}`, body));
export const setAdminLocked = (id, locked) => data(portal.post(`${A}/admins/${id}/lock`, null, { params: { locked } }));
export const resetAdminPassword = (id) => data(portal.post(`${A}/admins/${id}/reset-password`));
export const deleteAdmin = (id) => data(portal.delete(`${A}/admins/${id}`));

// ---- audit and catalogue
export const listAudit = async (page, pageSize, filter = {}) => {
  const params = { page, pageSize };
  if (filter.q) params.q = filter.q;
  if (filter.from) params.from = filter.from;
  if (filter.to) params.to = filter.to;
  const body = await call(portal.get(`${A}/audit`, { params }));
  return { rows: body.data, page: body.metadata && body.metadata.page };
};
export const listFunctions = () => data(portal.get(`${A}/functions`));
export const listRights = () => data(portal.get(`${A}/rights`));

// ---- companies
export const listCompanies = () => data(portal.get(`${A}/companies`));
export const getCompany = (id) => data(portal.get(`${A}/companies/${id}`));
export const createCompany = (body) => data(portal.post(`${A}/companies`, body));
export const updateCompany = (id, body) => data(portal.put(`${A}/companies/${id}`, body));
export const createSite = (id, body) => data(portal.post(`${A}/companies/${id}/sites`, body));
export const updateSite = (id, siteId, body) => data(portal.put(`${A}/companies/${id}/sites/${siteId}`, body));
export const createRole = (id, body) => data(portal.post(`${A}/companies/${id}/roles`, body));
export const updateRole = (id, roleId, body) => data(portal.put(`${A}/companies/${id}/roles/${roleId}`, body));
export const deleteRole = (id, roleId) => data(portal.delete(`${A}/companies/${id}/roles/${roleId}`));
export const createCompanyUser = (id, body) => data(portal.post(`${A}/companies/${id}/users`, body));
export const updateCompanyUser = (id, userId, body) => data(portal.put(`${A}/companies/${id}/users/${userId}`, body));
export const resetCompanyUserPassword = (id, userId) =>
  data(portal.post(`${A}/companies/${id}/users/${userId}/reset-password`));

// ---- matter types and sub types (shared by every company)
export const getMatterCatalog = () => data(portal.get(`${A}/matter-types`));
export const createMatterType = (body) => data(portal.post(`${A}/matter-types`, body));
export const updateMatterType = (code, body) => data(portal.put(`${A}/matter-types/${encodeURIComponent(code)}`, body));
export const deleteMatterType = (code) => data(portal.delete(`${A}/matter-types/${encodeURIComponent(code)}`));
export const createMatterSubType = (body) => data(portal.post(`${A}/matter-sub-types`, body));
export const updateMatterSubType = (code, body) =>
  data(portal.put(`${A}/matter-sub-types/${encodeURIComponent(code)}`, body));
export const deleteMatterSubType = (code) => data(portal.delete(`${A}/matter-sub-types/${encodeURIComponent(code)}`));

// ---- billing: per-user rates, role tiers and monthly cost records
export const getBillingRates = (companyId) => data(portal.get(`${A}/companies/${companyId}/billing-rates`));
export const setBillingRates = (companyId, body) => data(portal.put(`${A}/companies/${companyId}/billing-rates`, body));
export const setRoleTier = (companyId, roleId, tier) =>
  data(portal.put(`${A}/companies/${companyId}/roles/${roleId}/tier`, { tier }));
export const listCompanyBillingRecords = (companyId) => data(portal.get(`${A}/companies/${companyId}/billing-records`));
export const generateBillingRecord = (companyId, year, month) =>
  data(portal.post(`${A}/companies/${companyId}/billing-records`, { year, month }));
export const getBillingPeriod = (year, month) => data(portal.get(`${A}/billing-records`, { params: { year, month } }));
export const generateAllBilling = (year, month) => data(portal.post(`${A}/billing-records/generate-all`, { year, month }));
export const getBillingRecord = (id) => data(portal.get(`${A}/billing-records/${id}`));
export const finaliseBillingRecord = (id) => data(portal.post(`${A}/billing-records/${id}/finalise`));
export const deleteBillingRecord = (id) => data(portal.delete(`${A}/billing-records/${id}`));

// ---- oversight across companies: who is signed in, and feedback
const pagedParams = (page, pageSize, filter) => {
  const params = { page, pageSize };
  ["companyId", "siteId", "status", "q"].forEach((key) => {
    if (filter[key] !== null && filter[key] !== undefined && filter[key] !== "") params[key] = filter[key];
  });
  return params;
};
const paged = async (request) => {
  const body = await call(request);
  return { rows: body.data, page: body.metadata && body.metadata.page };
};
export const listSessions = (page, pageSize, filter = {}) =>
  paged(portal.get(`${A}/sessions`, { params: pagedParams(page, pageSize, filter) }));
export const listFeedback = (page, pageSize, filter = {}) =>
  paged(portal.get(`${A}/feedback`, { params: pagedParams(page, pageSize, filter) }));

// ---- a company's staff
export const listStaff = (companyId, page, pageSize, filter = {}) => {
  const params = { page, pageSize };
  if (filter.siteId) params.siteId = filter.siteId;
  if (filter.q) params.q = filter.q;
  if (filter.active === true || filter.active === false) params.active = filter.active;
  return paged(portal.get(`${A}/companies/${companyId}/staff`, { params }));
};
export const createStaff = (companyId, body) => data(portal.post(`${A}/companies/${companyId}/staff`, body));
export const updateStaff = (companyId, staffId, body) =>
  data(portal.put(`${A}/companies/${companyId}/staff/${staffId}`, body));

// ---- a site's number series and storage
export const getNumerals = (companyId, siteId) => data(portal.get(`${A}/companies/${companyId}/sites/${siteId}/numerals`));
export const saveNumerals = (companyId, siteId, body) =>
  data(portal.put(`${A}/companies/${companyId}/sites/${siteId}/numerals`, body));
export const getStorage = (companyId, siteId) => data(portal.get(`${A}/companies/${companyId}/sites/${siteId}/storage`));
export const saveStorage = (companyId, siteId, body) =>
  data(portal.put(`${A}/companies/${companyId}/sites/${siteId}/storage`, body));

// ---- a company's checklists: tasks, check lists, task groups and the link to matter types
const C = (companyId) => `${A}/companies/${companyId}/checklists`;
export const listChecklistTasks = (companyId) => data(portal.get(`${C(companyId)}/tasks`));
export const saveChecklistTask = (companyId, taskId, body) =>
  data(taskId ? portal.put(`${C(companyId)}/tasks/${taskId}`, body) : portal.post(`${C(companyId)}/tasks`, body));
export const deleteChecklistTasks = (companyId, ids) =>
  data(portal.delete(`${C(companyId)}/tasks`, { params: { ids: ids.join(",") } }));
export const listChecklistTemplates = (companyId) => data(portal.get(`${C(companyId)}/templates`));
export const saveChecklistTemplate = (companyId, templateId, body) =>
  data(
    templateId
      ? portal.put(`${C(companyId)}/templates/${templateId}`, body)
      : portal.post(`${C(companyId)}/templates`, body)
  );
export const deleteChecklistTemplates = (companyId, ids) =>
  data(portal.delete(`${C(companyId)}/templates`, { params: { ids: ids.join(",") } }));
export const syncChecklistTemplate = (companyId, templateId, scope, offset, limit) =>
  data(portal.post(`${C(companyId)}/templates/${templateId}/sync`, null, { params: { scope, offset, limit } }));
export const listChecklistGroups = (companyId) => data(portal.get(`${C(companyId)}/task-groups`));
export const saveChecklistGroup = (companyId, groupId, body) =>
  data(groupId ? portal.put(`${C(companyId)}/task-groups/${groupId}`, body) : portal.post(`${C(companyId)}/task-groups`, body));
export const deleteChecklistGroup = (companyId, groupId) => data(portal.delete(`${C(companyId)}/task-groups/${groupId}`));
export const listChecklistLinks = (companyId) => data(portal.get(`${C(companyId)}/matter-links`));
export const setChecklistLink = (companyId, matterTypeId, templateId) =>
  data(portal.put(`${C(companyId)}/matter-links/${matterTypeId}`, { templateId }));
