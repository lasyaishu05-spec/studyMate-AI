import apiClient from '../../lib/apiClient';

export const noteApi = {
  list: (notebookId) => apiClient.get(`/notebooks/${notebookId}/notes`).then((r) => r.data),
  create: (notebookId, data) => apiClient.post(`/notebooks/${notebookId}/notes`, data).then((r) => r.data),
  update: (notebookId, id, data) => apiClient.patch(`/notebooks/${notebookId}/notes/${id}`, data).then((r) => r.data),
  delete: (notebookId, id) => apiClient.delete(`/notebooks/${notebookId}/notes/${id}`).then((r) => r.data),
  summarize: (notebookId, id) => apiClient.post(`/notebooks/${notebookId}/notes/${id}/summarize`).then((r) => r.data),
  quiz: (notebookId, id) => apiClient.post(`/notebooks/${notebookId}/notes/${id}/quiz`).then((r) => r.data),
};

export default noteApi;
