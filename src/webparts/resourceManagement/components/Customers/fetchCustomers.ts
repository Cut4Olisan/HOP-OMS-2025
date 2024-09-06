import { useState, useEffect } from 'react';
import BackEndService from '../../services/BackEnd';

interface Customer {
  id: string;
  name: string;
}

export const useCustomerList = (): { customers: Customer[] } => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async (): Promise<void> => {
      try {
        const data = await BackEndService.Instance.fetchCustomers<Customer[]>();
        setCustomers(data);
      } catch (err) {console.error(err)}
    };

    fetchCustomers().catch(e => console.error(e))
  }, []);

  return { customers };
};