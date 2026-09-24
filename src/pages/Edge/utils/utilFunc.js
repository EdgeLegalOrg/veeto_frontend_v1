import Cookies from "js-cookie";
import { API_BASE_URL } from "../apis";
import moment from "moment";
import momentTimezone from "moment-timezone";
export const formatDateFunc = (date, format = "DD-MM-YYYY") => {
  if (!date) return null;
  const timeZone = getActiveSiteTimeZone();
  // Formats in site's local timezone
  return momentTimezone(date).tz
    ? momentTimezone(date).tz(timeZone).format(format)
    : momentTimezone(date).format(format);
};

export const formatDateTimeFunc = (date, format = "DD-MM-YYYY hh:mm A") => {
  if (!date) return null;
  const timeZone = getActiveSiteTimeZone();
  return momentTimezone(date).tz
    ? momentTimezone(date).tz(timeZone).format(format)
    : momentTimezone(date).format(format);
};

export const convertSubstring = (word, limit = 15) => {
  if (word) {
    if (word?.length > limit) {
      return `${word.substring(0, limit)}...`;
    } else {
      return word;
    }
  }
  return "";
};

export const findDisplayname = (from = [], val = "") => {
  if (val) {
    let data = from.find((d) => d.value === val);
    return data ? data.display : "";
  }
  return "";
};

export const roundToDigit = (num, precision = 2) => {
  num = num ? parseFloat(num) : 0;
  return num.toFixed(precision);
};

export const getQuery = () => {
  let query = {};
  let search = window.location.search;
  search = search?.split("?");
  if (search.length > 1) {
    search = search[1];
    search = search?.split("&");

    for (let i in search) {
      let item = search[i].split("=");
      query[item[0]] = item[1];
    }
  }

  return query;
};

export const removeAllStorage = () => {
  window.localStorage.clear();
};

export const formatCurrency = (amount) => {
  if (isNaN(amount)) {
    return "";
  }
  // Ensure it's a number and format the number with commas
  return "$" + roundToDigit(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const checkHasPermission = (key) => {
  const userDetails = JSON.parse(window.localStorage.getItem("userDetails"));

  const authorities = userDetails?.authorities || [];

  if (authorities.length) {
    return authorities.includes(key);
  }

  return false;
};

export const getActiveSiteTimeZone = () => {
  try {
    const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
    const companyDetails = JSON.parse(
      localStorage.getItem("companyInfo") || "{}",
    );

    const currentSiteId = userDetails.siteId;
    const siteList =
      companyDetails.siteInfoList || userDetails.siteInfoList || [];

    const currentSite = siteList.find(
      (site) =>
        Number(site.id) === Number(currentSiteId) ||
        Number(site.siteId) === Number(currentSiteId),
    );

    return currentSite?.timeZone || userDetails?.timeZone || "Australia/Sydney";
  } catch (error) {
    return "Australia/Sydney";
  }
};

export const updateLocalSiteInfo = (updatedSite) => {
  try {
    const siteId = updatedSite.siteId || updatedSite.id;
    if (!siteId) return;

    const companyInfoStr = localStorage.getItem("companyInfo");
    if (companyInfoStr) {
      const companyInfo = JSON.parse(companyInfoStr);
      if (companyInfo.siteInfoList && Array.isArray(companyInfo.siteInfoList)) {
        companyInfo.siteInfoList = companyInfo.siteInfoList.map((site) =>
          Number(site.siteId) === Number(siteId) ||
          Number(site.id) === Number(siteId)
            ? { ...site, ...updatedSite, siteId: site.siteId || site.id }
            : site,
        );
        localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
      }
    }

    const userDetailsStr = localStorage.getItem("userDetails");
    if (userDetailsStr) {
      const userDetails = JSON.parse(userDetailsStr);
      if (Number(userDetails.siteId) === Number(siteId) || Number(userDetails.id) === Number(siteId)) {
        userDetails.timeZone = updatedSite.timeZone || userDetails.timeZone;
        userDetails.siteName = updatedSite.siteName || userDetails.siteName;
      }
      if (userDetails.siteInfoList && Array.isArray(userDetails.siteInfoList)) {
        userDetails.siteInfoList = userDetails.siteInfoList.map((site) =>
          Number(site.siteId) === Number(siteId) || Number(site.id) === Number(siteId)
            ? { ...site, ...updatedSite, siteId: site.siteId || site.id }
            : site
        );
      }
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
    }

    window.dispatchEvent(new Event("siteChanged"));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Error updating local site info:", err);
  }
};

/**
 * Pulls the server's error message out of a failed blob request.
 *
 * A request made with `responseType: "blob"` gets a Blob back even when the
 * server answered with a JSON error, so `error.response.data.error.message`
 * is undefined and the caller can only ever show a generic message. This
 * reads the Blob and parses what is inside it.
 *
 * Returns null when there is nothing usable - no response at all, or a body
 * that is not the JSON error shape (a proxy's HTML error page, say). Callers
 * keep their own fallback text for that case rather than showing an empty
 * toast.
 */
export const readBlobErrorMessage = async (error) => {
  const data = error?.response?.data;

  if (!data) {
    return null;
  }

  try {
    // Blob when the request asked for one; already-parsed object otherwise.
    const body = typeof data.text === "function" ? await data.text() : data;
    const parsed = typeof body === "string" ? JSON.parse(body) : body;

    return parsed?.error?.message || null;
  } catch (parseError) {
    return null;
  }
};
/**
 * Maps file extension to standard MIME type for HTML5 drag-and-drop DownloadURL.
 */
export const getMimeType = (fileName = "", fileType = "") => {
  let ext = "";

  if (fileType) {
    ext = fileType.toLowerCase().replace(/^\./, "");
  } else if (fileName && fileName.includes(".")) {
    ext = fileName.split(".").pop().toLowerCase();
  }

  const mimeMap = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    svg: "image/svg+xml",
    txt: "text/plain",
    csv: "text/csv",
    rtf: "application/rtf",
    zip: "application/zip",
    msg: "application/vnd.ms-outlook",
    eml: "message/rfc822",
  };

  return mimeMap[ext] || "application/octet-stream";
};

/**
 * Builds an absolute download URL for native OS drag & drop.
 */
export const getAttachmentDragUrl = (
  attachmentId,
  endpointPath = "/api/matter/attachment",
) => {
  const token = Cookies.get("userJWT");

  // Always use current origin (http://localhost:3000 in dev with proxy, https://domain in prod)
  // to ensure same-origin referrer compliance with Chromium's strict security policy.
  const baseUrl = window.location.origin;

  const url = new URL(endpointPath, baseUrl);

  url.searchParams.set("attachmentIds", attachmentId);

  // Required because the native DownloadURL request does not
  // automatically include your application's Authorization header.
  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
};

/**
 * Enables native OS drag-out using Chromium's DownloadURL protocol.
 *
 * Supported targets include:
 * - macOS Desktop
 * - Finder folders
 * - Email compose windows
 */
export const handleAttachmentDragStart = (
  e,
  attachment,
  endpointPath = "/api/matter/attachment",
) => {
  if (!e?.dataTransfer || !attachment?.id) {
    return;
  }

  const rawName = attachment.name || "attachment";
  const fileType = attachment.type || "";

  let ext = "";

  if (fileType) {
    ext = fileType.toLowerCase().replace(/^\./, "");
  } else if (rawName.includes(".")) {
    ext = rawName.split(".").pop().toLowerCase();
  }

  // Ensure the filename has the correct extension.
  let finalFileName = rawName;

  if (ext && !finalFileName.toLowerCase().endsWith(`.${ext}`)) {
    finalFileName = `${finalFileName}.${ext}`;
  }

  // DownloadURL uses ":" as a separator, so sanitize
  // characters that can interfere with the protocol.
  finalFileName = finalFileName.replace(/[:\\/]/g, "_");

  const mimeType = getMimeType(finalFileName, fileType);

  const downloadUrl = getAttachmentDragUrl(attachment.id, endpointPath);

  /*
   * Chromium DownloadURL format:
   *
   * mimeType:fileName:url
   */
  const downloadUrlData = `${mimeType}:${finalFileName}:${downloadUrl}`;

  // IMPORTANT:
  // Only provide DownloadURL for native OS file drag-out.
  e.dataTransfer.setData("DownloadURL", downloadUrlData);

  e.dataTransfer.effectAllowed = "copy";
};
