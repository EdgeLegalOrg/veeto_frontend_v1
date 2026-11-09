import { API } from "../../../apis";

// Context-neutral endpoints; Matter Attachments is the first document-space consumer.
const base = (contextType, contextId) => `/api/document-spaces/${encodeURIComponent(contextType)}/${contextId}`;
export const documentFoldersApi = (contextType, contextId) => {
  const url = base(contextType, contextId);
  return {
    list: () => API.get(url),
    register: (fileIds, signal) => API.post(`${url}/registration`, { fileIds }, { signal }),
    root: (provider) => API.post(`${url}/roots`, { provider }),
    create: (parentId, name) => API.post(`${url}/folders`, { parentId, name }),
    rename: (folder, name) => API.patch(`${url}/folders/${folder.id}`, { name, version: folder.version }),
    remove: (id) => API.delete(`${url}/folders/${id}`),
    move: (fileId, folderId) => API.post(`${url}/files/${fileId}/move`, { folderId }),
    renameFile: (id, name) => API.patch(`${url}/files/${id}`, { name }),
    deleteFile: (id) => API.delete(`${url}/files/${id}`),
    deleteFiles: (fileIds) => API.delete(`${url}/files`, { data: { fileIds } }),
    deleteEmailGroup: (groupId) => API.delete(`${url}/email-groups/${encodeURIComponent(groupId)}`),
    upload: (folderId, file, name) => {
      const body = new FormData();
      body.append("folderId", folderId);
      body.append("file", file);
      body.append("name", name);
      return API.post(`${url}/files`, body);
    },
  };
};
