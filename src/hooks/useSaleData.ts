import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Customer, Product, SocialMedia, RpcResult } from '../types';

interface SaleDataResponse {
  customers: Customer[];
  products: Product[];
}

interface UseSaleDataReturn {
  customers: Customer[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchSaleData: () => Promise<void>;
  addCustomer: (customerData: Omit<Customer, 'id' | 'created_at' | 'total_sales' | 'active_sales'>) => Promise<boolean>;
}

export const useSaleData = (): UseSaleDataReturn => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSaleData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_user_data');
        console.log(data.customers);

      if (error) throw error;

      if (data && data.length > 0) {
        
        
        // Format customers
        const formattedCustomers: Customer[] = data.customers.map((customer: any) => ({
          id: customer.id,
          first_name: customer.first_name,
          middle_name: customer.middle_name,
          last_name: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          social_media: [],
          birth: null,
          other_info: null,
          total_sales: 0,
          active_sales: 0,
          created_at: new Date().toISOString(),
        }));

        // Format products
        const formattedProducts: Product[] = data.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price || '0'),
          quantity: product.quantity || 0,
          category_id: product.category_id,
          is_active: true,
          created_at: new Date().toISOString(),
        }));

        setCustomers(formattedCustomers);
        setProducts(formattedProducts);
      } else {
        setCustomers([]);
        setProducts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sale data');
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

      // Refresh sale data
      await fetchSaleData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer');
      return false;
    }
  }, [fetchSaleData]);

  useEffect(() => {
    fetchSaleData();
  }, [fetchSaleData]);

  return {
    customers,
    products,
    isLoading,
    error,
    fetchSaleData,
    addCustomer,
  };
};