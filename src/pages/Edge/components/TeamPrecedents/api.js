import { API } from "../../apis";
import { documentFoldersApi } from "../Matters/Attachments/documentFoldersApi";

/** Company-scoped master-file endpoints; matter use always supplies its own matter ID. */
export const teamPrecedentsApi = (companyId) => {
  const base = `/api/team-precedents/companies/${companyId}/files`;
  return {
    ...documentFoldersApi("TEAM_PRECEDENT", companyId),
    download: (id, versionId) => API.get(`${base}/${id}${versionId ? `/versions/${versionId}` : ""}/download`, { responseType: "blob" }),
    history: (id) => API.get(`${base}/${id}/versions`),
    classify: (file, fields) => API.put(`${base}/${file.id}/classification`, { version: file.version, ...fields }),
    replace: (file, replacement) => {
      const body = new FormData(); body.append("version", file.version); body.append("file", replacement);
      return API.put(`${base}/${file.id}/content`, body);
    },
  };
};
export const teamPrecedentsConfiguration = (siteId) => API.get("/api/team-precedents/configuration", { params: siteId ? { siteId } : {} });
export const useTeamPrecedent = (matterId, file, options) => API.post(
  `/api/team-precedents/matters/${matterId}/files/${file.id}/use`, { version: file.version, ...options }, { responseType: "blob" },
);

// Honour the server filename, including historical versions with a different extension.
export const downloadName = (response, fallback) => {
  const disposition = response.headers?.["content-disposition"] || "";
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encoded) { try { return decodeURIComponent(encoded[1]); } catch {} }
  return disposition.match(/filename="([^"]+)"/i)?.[1] || fallback;
};
export const precedentError = async (error) => {
  let body = error.response?.data;
  if (body instanceof Blob) { try { body = JSON.parse(await body.text()); } catch { body = null; } }
  return body?.message || body?.error?.message || "Team Precedents operation failed. Refresh before retrying.";
};
