import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchBootstrap, BootstrapData } from '@/services/api';

type BootstrapContextType = {
  data: BootstrapData | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const BootstrapContext = createContext<BootstrapContextType>({
  data: null,
  loading: true,
  refresh: async () => {},
});

export function BootstrapProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setData(await fetchBootstrap());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <BootstrapContext.Provider value={{ data, loading, refresh }}>
      {children}
    </BootstrapContext.Provider>
  );
}

export const useBootstrap = () => useContext(BootstrapContext);
