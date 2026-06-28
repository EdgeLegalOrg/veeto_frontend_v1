export const STORAGE_TYPE_OPTIONS = {
  SERVER: "SERVER",
  GDRIVE: "GDRIVE",
  ONEDRIVE: "ONEDRIVE",
};

export const STORAGE_OPTIONS = [
  {
    value: STORAGE_TYPE_OPTIONS.SERVER,
    label: "Server (Local)",
    description: "Store files on the local Windows file server.",
  },
  {
    value: STORAGE_TYPE_OPTIONS.GDRIVE,
    label: "Google Drive",
    description: "Store files in Google Drive via service account.",
  },
  {
    value: STORAGE_TYPE_OPTIONS.ONEDRIVE,
    label: "OneDrive",
    description: "Store files in OneDrive via Microsoft Graph.",
  },
];

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
      return "GOOGLE_DRIVE";
    case STORAGE_TYPE_OPTIONS.ONEDRIVE:
      return "ONEDRIVE";
    default:
      return null;
  }
};
