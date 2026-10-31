// Shared report options use the matter type codes the backend stores.
// The list below is only what shows if the matter types have not been loaded; normally
// getReportMatterTypeOptions() builds it from the matter types the system admin maintains.
export const REPORT_MATTER_TYPE_OPTIONS = [
  { value: null, label: "All Types" },
  { value: "CONVEYANCING", label: "Conveyancing" },
  { value: "FAMILY_LAW", label: "Family Law" },
  { value: "ESTATES", label: "Estates" },
  { value: "LEASES", label: "Leases" },
  { value: "BUSINESS_SALE_PURCHASE", label: "Business Sale/Purchase" },
  { value: "COMPANIES_TRUST_AND_PARTNERSHIP", label: "Companies, Trusts & Partnerships" },
  { value: "LITIGATION_GENERALLY", label: "Litigation Generally" },
  { value: "INSOLVENCY_LIQUIDATION", label: "Insolvency/Liquidation" },
  { value: "WILLS_POWER_OF_ATTORNEYS_AND_ENDURING_GUARDIANS", label: "Wills, POA & Enduring Guardians" },
  { value: "PERSONAL_INJURY", label: "Personal Injury" },
  { value: "GENERAL", label: "General" },
  { value: "NOTARY", label: "Notary" },
  { value: "REVENUE_NSW", label: "Revenue NSW" },
  { value: "VOI_CLIENT_AUTHORITIES", label: "VOI & Client Authorities" },
  { value: "SEPCIALIST_AREAS", label: "Specialist Areas" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" },
];

/**
 * The matter type filter for a report: "all", then every matter type the backend
 * knows (cached with the other enums when the app starts), by name. Falls back to the
 * fixed list when they have not loaded.
 */
export const getReportMatterTypeOptions = (allLabel = "All Types") => {
  let types = [];
  try {
    const enumList = JSON.parse(window.localStorage.getItem("enumList"));
    types = (enumList && enumList["MatterType"]) || [];
  } catch (e) {
    types = [];
  }
  if (types.length === 0) {
    return [{ value: null, label: allLabel }, ...REPORT_MATTER_TYPE_OPTIONS.slice(1)];
  }
  return [
    { value: null, label: allLabel },
    ...[...types]
      .sort((a, b) => a.display.localeCompare(b.display))
      .map((t) => ({ value: t.value, label: t.display })),
  ];
};
