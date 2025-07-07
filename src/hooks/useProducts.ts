import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Category, Product, RpcResult } from '../types';

interface UseProductsReturn {
  categories: Category[];
  products: Product[];
  selectedCategoryId: number | null;
  isLoading: boolean;
  error: string | null;
  setSelectedCategoryId: (id: number | null) => void;
  fetchProductsAndCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<boolean>;
  editCategory: (id: number, name: string) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
  addProduct: (categoryId: number, name: string, description: string, price: number, quantity: number) => Promise<boolean>;
  editProduct: (id: number, name: string, description: string, price: number, quantity: number) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
}

export const useProducts = (): UseProductsReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsAndCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_user_products_by_category');

      if (error) throw error;

      const categoriesData: Category[] = [];
      const productsData: Product[] = [];

      data.forEach((categoryData: any) => {
        // Add category
        const category: Category = {
          id: categoryData.category_id,
          name: categoryData.category_name,
          created_at: new Date().toISOString(), // Placeholder since not provided
        };
        categoriesData.push(category);

        // Add products for this category
        if (categoryData.products && Array.isArray(categoryData.products)) {
          categoryData.products.forEach((productData: any) => {
            const product: Product = {
              id: productData.id,
              name: productData.name,
              description: productData.description,
              price: parseFloat(productData.price || '0'),
              stock_quantity: productData.stock_quantity || 0,
              category_id: categoryData.category_id,
              category: category,
              is_active: productData.is_active !== false,
              created_at: productData.created_at || new Date().toISOString(),
            };
            productsData.push(product);
          });
        }
      });

      setCategories(categoriesData);
      setProducts(productsData);

      // Auto-select first category if none selected
      if (!selectedCategoryId && categoriesData.length > 0) {
        setSelectedCategoryId(categoriesData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products and categories');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategoryId]);

  const addCategory = useCallback(async (name: string): Promise<boolean> => {
    setError(null);

    try {
      const { data, error } = await supabase.rpc('create_user_category', {
        p_name: name.trim(),
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      await fetchProductsAndCategories();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
      return false;
    }
  }, [fetchProductsAndCategories]);

  const editCategory = useCallback(async (id: number, name: string): Promise<boolean> => {
    setError(null);

    try {
      const { data, error } = await supabase.rpc('update_user_category', {
        p_category_id: id,
        p_new_name: name.trim(),
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      await fetchProductsAndCategories();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit category');
      return false;
    }
  }, [fetchProductsAndCategories]);

  const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
    setError(null);

    try {
      const { data, error } = await supabase.rpc('delete_user_category', {
        p_category_id: id,
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      // Clear selected category if it was deleted
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }

      await fetchProductsAndCategories();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      return false;
    }
  }, [fetchProductsAndCategories, selectedCategoryId]);

  const addProduct = useCallback(async (categoryId: number, name: string, description: string, price: number, quantity: number): Promise<boolean> => {
    setError(null);

    try {
      const { data, error } = await supabase.rpc('create_user_product', {
        p_category_id: categoryId,
        p_name: name.trim(),
        p_description: description.trim(),
        p_price: price,
        p_quantity: quantity,
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      await fetchProductsAndCategories();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      return false;
    }
  }, [fetchProductsAndCategories]);

  const editProduct = useCallback(async (id: number, name: string, description: string, price: number, quantity: number): Promise<boolean> => {
    setError(null);

    try {
      const { data, error } = await supabase.rpc('update_user_product', {
        p_product_id: id,
        p_new_name: name.trim(),
        p_new_description: description.trim(),
        p_new_price: price,
        p_new_quantity: quantity,
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      await fetchProductsAndCategories();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit product');
      return false;
    }
  }, [fetchProductsAndCategories]);

  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    setError(null);

    try {
      const { data, error } = await supabase.rpc('delete_user_product', {
        p_product_id: id,
      });

      if (error) throw error;

      const result: RpcResult = data[0];
      if (!result.success) {
        throw new Error(result.message);
      }

      await fetchProductsAndCategories();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      return false;
    }
  }, [fetchProductsAndCategories]);

  useEffect(() => {
    fetchProductsAndCategories();
  }, [fetchProductsAndCategories]);

  return {
    categories,
    products,
    selectedCategoryId,
    isLoading,
    error,
    setSelectedCategoryId,
    fetchProductsAndCategories,
    addCategory,
    editCategory,
    deleteCategory,
    addProduct,
    editProduct,
    deleteProduct,
  };
};