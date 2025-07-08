import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Sale } from '../types';

interface UseSalesReturn {
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
}

export const useSales = (): UseSalesReturn => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_sales_details_by_user');
      console.log('raw data from rpc: ',data);
      if (error) throw error;

      // The RPC function returns an array with a single object containing the sales array
      // Add robust checks to ensure we always have an array to map over
      let salesData = [];
      if (data && Array.isArray(data)) {
        const firstResult = data[0];
        if (firstResult && firstResult.get_sales_details_by_user) {
          salesData = Array.isArray(firstResult.get_sales_details_by_user) 
            ? firstResult.get_sales_details_by_user 
            : [];
        }
      }
      console.log('salesData:', salesData);
      const formattedSales: Sale[] = (salesData || []).map((sale: any) => ({
        id: sale.id,
        customer_id: sale.customer?.customer_id,
        customer: sale.customer ? {
          id: sale.customer.customer_id,
          first_name: sale.customer.first_name,
          last_name: sale.customer.last_name,
          email: sale.customer.email,
          phone: sale.customer.phone,
          created_at: sale.customer.created_at,
        } : undefined,
        seller_name: sale.seller_name,
        total_amount: parseFloat(sale.total_amount || '0'),
        amount_paid: parseFloat(sale.amount_paid || '0'),
        remaining_balance: parseFloat(sale.remaining_balance || '0'),
        payment_type: sale.payment_type,
        status: sale.status,
        notes: sale.notes,
        created_at: sale.created_at,
        items: sale.items || [],
        schedule: sale.schedule || [],
        payment_history: sale.payment_history || [],
      }));

      console.log('formattedSales',formattedSales);
      setSales(formattedSales);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    isLoading,
    error,
    fetchSales,
  };
};