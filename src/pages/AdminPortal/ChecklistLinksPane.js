import React, { useState } from "react";
import { Input } from "reactstrap";
import { toast } from "react-toastify";

import { listChecklistLinks, listChecklistTemplates, setChecklistLink } from "./adminPortalApi";
import { Pager, SearchBox, haystack, usePaging } from "./paging";
import { ErrorAlert, Loading, useLoad } from "./shared";

const matches = (r, needle) => haystack(r.typeName, r.subTypeName, r.templateName).includes(needle);

/**
 * Which check list a new matter of each type and sub type is given. Each choice is saved as it is
 * made, so there is no separate Save to forget.
 */
const ChecklistLinksPane = ({ companyId }) => {
  const links = useLoad(() => listChecklistLinks(companyId), [companyId]);
  const templates = useLoad(() => listChecklistTemplates(companyId), [companyId]);
  const [onlyUnlinked, setOnlyUnlinked] = useState(false);
  const [saving, setSaving] = useState(null);

  const rows = (links.data || []).filter((r) => !onlyUnlinked || !r.templateId);
  const paging = usePaging(rows, { filterFn: matches });

  const change = async (row, value) => {
    setSaving(row.matterTypeId);
    try {
      await setChecklistLink(companyId, row.matterTypeId, value ? Number(value) : null);
      toast.success(value ? "Linked" : "Link removed");
      links.reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div className="ap-toolbar">
        <SearchBox {...paging.searchProps} placeholder="Search matter types or check lists" />
        <label style={{ margin: 0 }}>
          <input type="checkbox" checked={onlyUnlinked} onChange={(e) => setOnlyUnlinked(e.target.checked)} /> Only those
          with no check list
        </label>
      </div>
      <ErrorAlert message={links.error || templates.error} />
      {links.loading && !links.data ? (
        <Loading />
      ) : (
        <table className="ap-table">
          <thead>
            <tr>
              <th>Matter type</th>
              <th>Sub type</th>
              <th>Check list</th>
            </tr>
          </thead>
          <tbody>
            {paging.pageRows.map((r) => (
              <tr key={r.matterTypeId}>
                <td>{r.typeName}</td>
                <td>{r.subTypeName}</td>
                <td>
                  <Input
                    bsSize="sm"
                    type="select"
                    style={{ maxWidth: 320 }}
                    aria-label={`Check list for ${r.typeName} ${r.subTypeName}`}
                    value={r.templateId || ""}
                    disabled={saving === r.matterTypeId}
                    onChange={(e) => change(r, e.target.value)}
                  >
                    <option value="">None</option>
                    {(templates.data || []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Input>
                </td>
              </tr>
            ))}
            {links.data && paging.totalRecords === 0 && (
              <tr>
                <td colSpan={3} className="ap-hint">
                  Nothing matches.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {links.data && <Pager {...paging.pagerProps} />}
      <p className="ap-hint" style={{ marginTop: 12 }}>
        A matter created from a type and sub type with a check list linked is given that check list. Existing matters
        are not changed until the check list is synced.
      </p>
    </div>
  );
};

export default ChecklistLinksPane;
