import apiClient from '../../lib/apiClient';

export const authApi = {
  signup: (data) => apiClient.post('/auth/signup', data).then((r) => r.data),
  login: (data) => apiClient.post('/auth/login', data).then((r) => r.data),
};

export default authApi;
