import { useState, useEffect } from 'react';
import BackEndService from '../../services/BackEnd';

export const useCustomerList = (): { customers: any[], error: string | null } => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async ():Promise<void> => {
      try {
        const data = await BackEndService.Instance.fetchCustomers<any[]>();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      }
    };

    fetchCustomers();
  }, []);

  return { customers, error };
};
