// useBusiness - reusable hook for business-scoped data
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useBusinessId() {
  const { getBusinessId } = useAuthStore();
  return getBusinessId();
}

export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { run(); }, deps);

  return { data, loading, error, refetch: run };
}
