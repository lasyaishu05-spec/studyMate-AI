import apiClient from '../../lib/apiClient';

export const notebookApi = {
  list: () => apiClient.get('/notebooks').then((r) => r.data),
  create: (data) => apiClient.post('/notebooks', data).then((r) => r.data),
  update: (id, data) => apiClient.patch(`/notebooks/${id}`, data).then((r) => r.data),
  delete: (id) => apiClient.delete(`/notebooks/${id}`).then((r) => r.data),
};

export default notebookApi;
