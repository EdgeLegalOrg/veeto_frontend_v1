export const STORAGE_TYPE_OPTIONS = {
  ONEDRIVE: "ONEDRIVE",
  GDRIVE: "GDRIVE",
  SERVER: "SERVER",
};

export const STORAGE_OPTIONS = [
  {
    value: STORAGE_TYPE_OPTIONS.ONEDRIVE,
    label: "OneDrive",
    icon: "ri-microsoft-fill",
    description: "Store files in OneDrive / SharePoint via Microsoft Graph.",
  },
  {
    value: STORAGE_TYPE_OPTIONS.GDRIVE,
    label: "Google Drive",
    icon: "ri-google-fill",
    description: "Store files in Google Drive via service account.",
  },
  {
    value: STORAGE_TYPE_OPTIONS.SERVER,
    label: "Server Storage",
    icon: "ri-server-fill",
    description: "Store files on a local or network server.",
  }
];

export const STORAGE_CATEGORY_OPTIONS = [
  { value: "GENERAL", label: "General" },
  { value: "SPECIFIC", label: "Specific" },
];

/**
 * Provider-specific credential fields rendered inside the config modal.
 * Each entry: { name, label, type, placeholder, required }
 */
export const STORAGE_CONFIG_FIELDS = {
  [STORAGE_TYPE_OPTIONS.ONEDRIVE]: [
    {
      name: "organizationFolder",
      label: "Organization Folder",
      type: "text",
      placeholder: "e.g. LPDM Documents",
      required: true,
    },
    {
      name: "tenantId",
      label: "Tenant ID",
      type: "text",
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      required: true,
    },
    {
      name: "clientId",
      label: "Client ID",
      type: "text",
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      required: true,
    },
    {
      name: "clientSecret",
      label: "Client Secret",
      type: "password",
      placeholder: "Enter client secret",
      required: true,
    },
    {
      name: "sharePointSiteId",
      label: "SharePoint Site ID",
      type: "text",
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      required: true,
    },
  ],
  [STORAGE_TYPE_OPTIONS.GDRIVE]: [
    {
      name: "organizationFolder",
      label: "Organization Folder",
      type: "text",
      placeholder: "e.g. LPDM Documents",
      required: true,
    },
    {
      name: "clientId",
      label: "Client ID",
      type: "text",
      placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      required: true,
    },
    {
      name: "clientSecret",
      label: "Client Secret",
      type: "password",
      placeholder: "Enter client secret",
      required: true,
    },
  ]
};

export const getUploadModeFromStorage = (storageType) => {
  switch (storageType) {
    case STORAGE_TYPE_OPTIONS.GDRIVE:
      return "google";
    case STORAGE_TYPE_OPTIONS.ONEDRIVE:
      return "onedrive";
    default:
      return "device";
  }
};

export const getStorageTypeForUpload = (storageType) => {
  switch (storageType) {
    case STORAGE_TYPE_OPTIONS.GDRIVE:
      return "GDRIVE";
    case STORAGE_TYPE_OPTIONS.ONEDRIVE:
      return "ONEDRIVE";
    default:
      return null;
  }
};

