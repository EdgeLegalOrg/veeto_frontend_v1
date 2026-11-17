/** Decode structured errors even when a download request receives JSON as a Blob. */
export const templateErrorDetails = async (error) => {
  let body = error?.response?.data;
  if (body instanceof Blob) {
    try {
      body = JSON.parse(await body.text());
    } catch {
      return null;
    }
  }
  return body?.error?.code === "INVALID_TEMPLATE_PLACEHOLDERS" ? body.error : null;
};

export const templateErrorMessage = (details) =>
  [
    details.templateName ? `Template: ${details.templateName}` : "",
    details.message,
    ...(details.issues || [])
      .slice(0, 5)
      .map(
        (issue) => `${issue.location || "Merge field"}${issue.field ? ` — ${issue.field}` : ""}: ${issue.reason} ${issue.correction || ""}`,
      ),
    (details.issues || []).length > 5 ? "Additional issues were found. Review the template before retrying." : "",
  details.reference ? `Reference: ${details.reference}` : "",
  ]
    .filter(Boolean)
    .join("\n");
