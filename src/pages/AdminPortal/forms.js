import React, { useMemo } from "react";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";

/** Shared field groups, used by both the create-company page and the company detail page. */

export const DEFAULT_TIME_ZONE = "Australia/Sydney";

export const EMPTY_COMPANY = {
  companyName: "",
  title: "",
  address1: "",
  address2: "",
  address3: "",
  city: "",
  state: "",
  country: "",
  postCode: "",
  email1: "",
  email2: "",
  phoneNumber1: "",
  phoneNumber2: "",
  faxNumber: "",
  website: "",
  dxNumber: "",
  dxCity: "",
  disclaimer: "",
};

export const EMPTY_SITE = {
  siteName: "",
  siteCode: "",
  abn: "",
  email1: "",
  email2: "",
  website: "",
  timeZone: DEFAULT_TIME_ZONE,
  gstRate: "",
  financialYearStartDay: "",
  financialYearStartMonth: "",
  active: true,
};

const timeZones = () => {
  try {
    if (typeof Intl.supportedValuesOf === "function") return Intl.supportedValuesOf("timeZone");
  } catch (e) {
    // fall through to the short list
  }
  return [
    "Australia/Sydney",
    "Australia/Melbourne",
    "Australia/Brisbane",
    "Australia/Adelaide",
    "Australia/Perth",
    "Australia/Hobart",
    "Australia/Darwin",
    "Pacific/Auckland",
  ];
};

/** Sends empty strings as null and numbers as numbers, the way the server expects. */
export const siteForRequest = (site) => ({
  ...site,
  gstRate: site.gstRate === "" || site.gstRate === null ? null : Number(site.gstRate),
  financialYearStartDay: site.financialYearStartDay === "" ? null : Number(site.financialYearStartDay),
  financialYearStartMonth: site.financialYearStartMonth === "" ? null : Number(site.financialYearStartMonth),
});

export const siteFromView = (view) => ({
  ...EMPTY_SITE,
  ...view,
  siteCode: view.siteCode || "",
  abn: view.abn || "",
  email1: view.email1 || "",
  email2: view.email2 || "",
  website: view.website || "",
  gstRate: view.gstRate === null || view.gstRate === undefined ? "" : String(view.gstRate),
  financialYearStartDay: view.financialYearStartDay ?? "",
  financialYearStartMonth: view.financialYearStartMonth ?? "",
});

/** Problems with a site that can be spotted without asking the server. */
export const siteProblem = (site) => {
  if (!site.siteName.trim()) return "Each site needs a name.";
  const gst = site.gstRate;
  if (gst !== "" && (Number.isNaN(Number(gst)) || Number(gst) < 0 || Number(gst) > 100)) {
    return `GST rate for ${site.siteName} must be between 0 and 100.`;
  }
  const hasDay = site.financialYearStartDay !== "";
  const hasMonth = site.financialYearStartMonth !== "";
  if (hasDay !== hasMonth) return `Give both a financial year start day and month for ${site.siteName}, or leave both blank.`;
  return null;
};

const Text = ({ label, value, onChange, md = 6, type = "text", hint }) => (
  <Col md={md}>
    <FormGroup>
      <Label>{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      {hint && <div className="ap-hint">{hint}</div>}
    </FormGroup>
  </Col>
);

export const CompanyFieldsForm = ({ value, onChange }) => {
  const set = (field) => (v) => onChange({ ...value, [field]: v });
  return (
    <Row>
      <Text label="Company name *" value={value.companyName} onChange={set("companyName")} />
      <Text label="Title" value={value.title} onChange={set("title")} />
      <Text label="Address" value={value.address1} onChange={set("address1")} />
      <Text label="Address line 2" value={value.address2} onChange={set("address2")} />
      <Text label="City" value={value.city} onChange={set("city")} md={3} />
      <Text label="State" value={value.state} onChange={set("state")} md={3} />
      <Text label="Post code" value={value.postCode} onChange={set("postCode")} md={3} />
      <Text label="Country" value={value.country} onChange={set("country")} md={3} />
      <Text label="Email" value={value.email1} onChange={set("email1")} type="email" />
      <Text label="Phone" value={value.phoneNumber1} onChange={set("phoneNumber1")} />
      <Text label="Website" value={value.website} onChange={set("website")} />
      <Text label="Fax" value={value.faxNumber} onChange={set("faxNumber")} />
      <Text label="DX number" value={value.dxNumber} onChange={set("dxNumber")} />
      <Text label="DX city" value={value.dxCity} onChange={set("dxCity")} />
    </Row>
  );
};

export const SiteFieldsForm = ({ value, onChange, activeLocked }) => {
  const set = (field) => (v) => onChange({ ...value, [field]: v });
  const zones = useMemo(timeZones, []);
  const listId = "ap-time-zones";
  return (
    <Row>
      <Text label="Site name *" value={value.siteName} onChange={set("siteName")} />
      <Text label="Site code" value={value.siteCode} onChange={set("siteCode")} md={3} />
      <Text label="ABN" value={value.abn} onChange={set("abn")} md={3} />
      <Text label="Email" value={value.email1} onChange={set("email1")} type="email" />
      <Text label="Website" value={value.website} onChange={set("website")} />
      <Col md={4}>
        <FormGroup>
          <Label>Time zone</Label>
          <Input list={listId} value={value.timeZone} onChange={(e) => set("timeZone")(e.target.value)} />
          <datalist id={listId}>
            {zones.map((z) => (
              <option key={z} value={z} />
            ))}
          </datalist>
        </FormGroup>
      </Col>
      <Text
        label="GST rate (%)"
        value={value.gstRate}
        onChange={set("gstRate")}
        md={2}
        type="number"
        hint="Leave blank and the company must set it."
      />
      <Text label="Financial year starts: day" value={value.financialYearStartDay} onChange={set("financialYearStartDay")} md={3} type="number" />
      <Text label="month (1–12)" value={value.financialYearStartMonth} onChange={set("financialYearStartMonth")} md={3} type="number" />
      <Col md={12}>
        <FormGroup check>
          <Input
            type="checkbox"
            id={`ap-active-${value.id || "new"}`}
            checked={value.active}
            disabled={activeLocked}
            onChange={(e) => set("active")(e.target.checked)}
          />
          <Label check for={`ap-active-${value.id || "new"}`}>
            Active {activeLocked && <span className="ap-hint">(the first site must be active)</span>}
          </Label>
        </FormGroup>
      </Col>
    </Row>
  );
};

/** Rights grouped by category, with a select-all per group. */
export const RightsPicker = ({ rights, selected, onChange }) => {
  const groups = useMemo(() => {
    const byCategory = {};
    (rights || []).forEach((r) => {
      const key = r.category || "Other";
      (byCategory[key] = byCategory[key] || []).push(r);
    });
    return Object.entries(byCategory);
  }, [rights]);

  const chosen = new Set(selected);
  const toggle = (id) => {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };
  const toggleGroup = (items) => {
    const next = new Set(chosen);
    const allOn = items.every((r) => next.has(r.id));
    items.forEach((r) => (allOn ? next.delete(r.id) : next.add(r.id)));
    onChange([...next]);
  };

  return (
    <div className="ap-rights">
      <div className="ap-hint" style={{ marginBottom: 4 }}>
        {chosen.size} of {(rights || []).length} rights selected
      </div>
      {groups.map(([category, items]) => (
        <div key={category}>
          <h4>
            {category}{" "}
            <button type="button" className="btn btn-link btn-sm p-0 ms-2" onClick={() => toggleGroup(items)}>
              toggle all
            </button>
          </h4>
          {items.map((r) => (
            <label key={r.id} title={r.description || ""}>
              <input type="checkbox" checked={chosen.has(r.id)} onChange={() => toggle(r.id)} /> {r.rightName}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
};
