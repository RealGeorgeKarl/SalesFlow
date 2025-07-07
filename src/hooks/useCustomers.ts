import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Customer, SocialMedia, RpcResult } from '../types';

interface UseCustomersReturn {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customerData: Omit<Customer, 'id' | 'created_at' | 'total_sales' | 'active_sales'>) => Promise<boolean>;
  editCustomer: (id: number, customerData: Partial<Omit<Customer, 'id' | 'created_at' | 'total_sales' | 'active_sales'>>) => Promise<boolean>;
  deleteCustomer: (id: number) => Promise<boolean>;
}

export const useCustomers = (): UseCustomersReturn => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_user_customers_with_stats');

      if (error) throw error;

      const formattedCustomers: Customer[] = data.map((customer: any) => ({
        id: customer.id,
        first_name: customer.first_name,
        middle_name: customer.middle_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        social_media: customer.social_media || [],
        birth: customer.birth,
        other_info: customer.other_info,
        total_sales: parseFloat(customer.total_sales || '0'),
        active_sales: customer.active_sales || 0,
        created_at: customer.created_at,
      }));

      setCustomers(formattedCustomers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'created_at' | 'total_sales' | 'active_sales'>): Promise<boolean> => {
    setError(null);

    try {
      const { data, error } = await supabase.rpc('add_new_customer', {
        p_first_name: customerData.first_name,
        p_middle_name: customerData.middle_name || null,
        p_last_name: customerData.last_name,
        p_email: customerData.email || null,
        p_phone: customerData.phone || null,
        p_address: customerData.address || null,
        p_social_media: customerData.social_media || null,
        p_birth: customerData.birth || null,
        p_other_info: customerData.other_info || null,
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      // Refresh customers list
      await fetchCustomers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer');
      return false;
    }
  }, [fetchCustomers]);

  const editCustomer = useCallback(async (id: number, customerData: Partial<Omit<Customer, 'id' | 'created_at' | 'total_sales' | 'active_sales'>>): Promise<boolean> => {
    setError(null);

    try {
      const { data, error } = await supabase.rpc('edit_customer', {
        p_customer_id: id,
        p_first_name: customerData.first_name || null,
        p_middle_name: customerData.middle_name || null,
        p_last_name: customerData.last_name || null,
        p_email: customerData.email || null,
        p_phone: customerData.phone || null,
        p_address: customerData.address || null,
        p_social_media: customerData.social_media || null,
        p_birth: customerData.birth || null,
        p_other_info: customerData.other_info || null,
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      // Refresh customers list
      await fetchCustomers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit customer');
      return false;
    }
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (id: number): Promise<boolean> => {
    setError(null);

    try {
      const { data, error } = await supabase.rpc('delete_customer', {
        p_customer_id: id,
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      // Refresh customers list
      await fetchCustomers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      return false;
    }
  }, [fetchCustomers]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    isLoading,
    error,
    fetchCustomers,
    addCustomer,
    editCustomer,
    deleteCustomer,
  };
};