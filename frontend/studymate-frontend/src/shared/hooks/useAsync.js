import { useState } from 'react';

export function useAsync(fn) {
  const [state, setState] = useState({ loading: false, error: null, data: null });
  const run = async (...args) => {
    setState({ loading: true, error: null, data: null });
    try {
      const data = await fn(...args);
      setState({ loading: false, error: null, data });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      setState({ loading: false, error: msg, data: null });
      throw err;
    }
  };
  return { ...state, run };
}

export default useAsync;
