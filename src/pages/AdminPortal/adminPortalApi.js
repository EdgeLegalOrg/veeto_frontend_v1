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
export const listAudit = async (page, pageSize) => {
  const body = await call(portal.get(`${A}/audit`, { params: { page, pageSize } }));
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
