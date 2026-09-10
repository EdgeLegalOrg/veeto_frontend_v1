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
    const siteList = companyDetails.siteInfoList || userDetails.siteInfoList || [];

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
          Number(site.siteId) === Number(siteId) || Number(site.id) === Number(siteId)
            ? { ...site, ...updatedSite, siteId: site.siteId || site.id }
            : site
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
