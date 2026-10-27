import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Spinner } from "reactstrap";
import { v1 as uuidv1 } from "uuid";
import { siteChange, userProfile } from "../../apis";
import { recordHref } from "../../../../Components/Common/globalSearch";

// The same metadata initialised by AppStarter, plus the cached site storage/provider connection.
// Keep session tracking, recent-search history and user preferences intact when changing office.
const SITE_CACHE_KEYS = [
  "companyInfo", "enumList", "matterContactRole", "matterStatus", "matterTabs",
  "matterTypeList", "metaData", "paymentTypeList", "rightList", "roleList",
  "edge-storage-type", "xeroSession",
];

/** Validates the target office before mounting any site-scoped record page, including new-tab links. */
const SearchResultOpen = () => {
  const { search } = useLocation();
  const [error, setError] = useState("");
  const term = new URLSearchParams(search).get("q") || "";

  useEffect(() => {
    let current = true;
    setError("");
    const open = async () => {
      try {
        const params = new URLSearchParams(search);
        const result = {
          section: params.get("section"), id: Number(params.get("id")),
          siteId: Number(params.get("siteId")), recordType: params.get("recordType"),
        };
        if (!["MATTERS", "CONTACTS", "SAFE_CUSTODY"].includes(result.section)
          || !Number.isSafeInteger(result.id) || result.id <= 0
          || !Number.isSafeInteger(result.siteId) || result.siteId <= 0
          || (result.section === "CONTACTS" && !["PERSON", "ORGANISATION"].includes(result.recordType))) {
          throw new Error("This search result link is invalid.");
        }
        // Always ask the server, even when localStorage says this is already the active site.
        // Its switch endpoint rechecks current access and organisation ownership.
        const response = await siteChange({ requestId: uuidv1(), data: { siteId: result.siteId } });
        if (!current) return;
        if (response.data?.success !== true) {
          throw new Error(response.data?.error?.message || "This office is no longer accessible.");
        }
        SITE_CACHE_KEYS.forEach((key) => window.localStorage.removeItem(key));
        window.localStorage.removeItem("userDetails");
        const profile = await userProfile();
        if (!current) return;
        if (!profile.data?.siteId) throw new Error("Unable to load office details. Refresh the page and retry.");
        window.localStorage.setItem("userDetails", JSON.stringify(profile.data));
        if (Number(profile.data.siteId) !== result.siteId) {
          throw new Error("Unable to open this result in its office. Please refresh your search and retry.");
        }
        // Reload before the destination mounts so navigation, permissions and metadata
        // all initialise in the validated office. Destination paths are fixed by section.
        window.location.replace(recordHref(result, params.get("q")));
      } catch (err) {
        if (current) setError(err.response?.data?.error?.message || err.message || "Unable to open this search result.");
      }
    };
    open();
    return () => { current = false; };
  }, [search]);

  return <main className="container py-5 text-center" aria-busy={!error}>
    {error ? <>
      <p className="text-danger" role="alert">{error}</p>
      <Link className="btn btn-primary" to={`/search?q=${encodeURIComponent(term)}`}>Back to Search</Link>
    </> : <div role="status"><Spinner color="primary" /><p className="mt-3">Opening search result...</p></div>}
  </main>;
};

export default SearchResultOpen;
