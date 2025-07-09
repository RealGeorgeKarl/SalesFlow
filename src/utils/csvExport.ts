import { Sale, Customer, Product } from '../types';
import { formatCurrency } from './formatters';

interface CSVExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

// Generic CSV export utility
export const exportToCSV = (data: any[], headers: string[], filename: string = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Sales CSV export
export const exportSalesToCSV = (sales: Sale[], options: CSVExportOptions = {}) => {
  const headers = [
    'id',
    'customer_name',
    'customer_email',
    'seller_name',
    'total_amount',
    'amount_paid',
    'remaining_balance',
    'payment_type',
    'status',
    'created_at',
    'notes'
  ];

  const data = sales.map(sale => ({
    id: sale.id,
    customer_name: sale.customer ? `${sale.customer.first_name} ${sale.customer.last_name}` : 'N/A',
    customer_email: sale.customer?.email || 'N/A',
    seller_name: sale.seller_name || 'N/A',
    total_amount: formatCurrency(sale.total_amount),
    amount_paid: formatCurrency(sale.amount_paid),
    remaining_balance: formatCurrency(sale.remaining_balance),
    payment_type: sale.payment_type,
    status: sale.status,
    created_at: new Date(sale.created_at).toLocaleDateString(),
    notes: sale.notes || ''
  }));

  const filename = options.filename || `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, headers, filename);
};

// Customers CSV export
export const exportCustomersToCSV = (customers: Customer[], options: CSVExportOptions = {}) => {
  const headers = [
    'id',
    'first_name',
    'middle_name',
    'last_name',
    'email',
    'phone',
    'address',
    'birth',
    'total_sales',
    'active_sales',
    'created_at',
    'other_info'
  ];

  const data = customers.map(customer => ({
    id: customer.id,
    first_name: customer.first_name,
    middle_name: customer.middle_name || '',
    last_name: customer.last_name,
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    birth: customer.birth ? new Date(customer.birth).toLocaleDateString() : '',
    total_sales: formatCurrency(customer.total_sales || 0),
    active_sales: customer.active_sales || 0,
    created_at: new Date(customer.created_at).toLocaleDateString(),
    other_info: customer.other_info || ''
  }));

  const filename = options.filename || `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, headers, filename);
};

// Products CSV export
export const exportProductsToCSV = (products: Product[], options: CSVExportOptions = {}) => {
  const headers = [
    'id',
    'name',
    'description',
    'price',
    'quantity',
    'category_id',
    'is_active',
    'created_at'
  ];

  const data = products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: formatCurrency(product.price),
    quantity: product.quantity,
    category_id: product.category_id || '',
    is_active: product.is_active ? 'Yes' : 'No',
    created_at: new Date(product.created_at).toLocaleDateString()
  }));

  const filename = options.filename || `products-export-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, headers, filename);
};

// Analytics data CSV export
export const exportAnalyticsToCSV = (analyticsData: any, type: 'sales' | 'customers' | 'products', options: CSVExportOptions = {}) => {
  let headers: string[] = [];
  let data: any[] = [];
  let filename = '';

  switch (type) {
    case 'sales':
      headers = ['period', 'total_sales', 'sales_count', 'average_sale_value'];
      data = analyticsData.salesTrends || [];
      filename = `sales-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      break;
    case 'customers':
      headers = ['period', 'new_customers', 'total_customers'];
      data = analyticsData.customerGrowth || [];
      filename = `customer-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      break;
    case 'products':
      headers = ['product_name', 'total_sold', 'revenue', 'stock_remaining'];
      data = analyticsData.productPerformance || [];
      filename = `product-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      break;
  }

  exportToCSV(data, headers, options.filename || filename);
};