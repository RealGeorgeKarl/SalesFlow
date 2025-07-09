export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Persona {
  name: string;
  user_type: 'Admin' | 'Salesperson';
}

export interface SmsAccountResponse {
  id: number;
  sms_users: Persona[];
  sms_expiration_date: string;
  is_one_time: boolean;
}

export interface Customer {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  social_media?: SocialMedia[];
  birth?: string;
  other_info?: string;
  total_sales?: number;
  active_sales?: number;
  created_at: string;
}

export interface SocialMedia {
  platform: string;
  account: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category_id?: number;
  category?: Category;
  is_active: boolean;
  created_at: string;
}

export interface InstallmentPlan {
  id: string;
  name: string;
  description?: string;
  num_installments: number;
  interval_days: number;
  frequency_unit?: FrequencyUnit;
  frequency_interval?: number;
  interest_rate: number;
  is_active: boolean;
  created_at: string;
}

export type FrequencyUnit = 'day' | 'week' | 'month' | 'year';

export interface Sale {
  id: number;
  customer_id?: number;
  customer?: Customer;
  seller_name?: string;
  total_amount: number;
  amount_paid: number;
  remaining_balance: number;
  payment_type: 'Full Payment' | 'Down Payment' | 'Installment Only' | 'Down Payment + Installments';
  down_payment_amount?: number;
  installment_plan_id?: string;
  installment_plan?: InstallmentPlan;
  status: 'In Progress' | 'Completed' | 'Cancelled' | 'Terminated';
  notes?: string;
  created_at: string;
  created_by?: string;
  items?: SaleItem[];
  schedule?: PaymentScheduleItem[];
  payment_history?: PaymentHistoryItem[];
}

export interface SaleItem {
  quantity: number;
  product_id: number;
  unit_price: number;
  total_price: number;
  product_name: string;
}

export interface PaymentScheduleItem {
  status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  amount_due: number;
  schedule_id: number;
  due_date_time: string;
}

export interface PaymentHistoryItem {
  payment_id: number;
  amount_paid: number;
  payment_method: string;
  reference_code?: string;
  payment_datetime: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Installment {
  id: string;
  sale_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  created_at: string;
}

export interface Payment {
  id: string;
  sale_id: string;
  installment_id?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  persona_name: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  persona: Persona | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  retryDelay: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}

export interface PaymentSchedule {
  installment_number: number;
  amount: number;
  due_date: string;
}

export interface RpcResult {
  success: boolean;
  message: string;
}

export type PaymentMethodType = 'Cash' | 'Card' | 'Online Payment' | 'Other';

export type PaymentMethod = 
  // Cash methods
  | 'Exact Cash'
  | 'Cash (Needs Change)'
  // Card methods
  | 'Visa'
  | 'Mastercard'
  | 'Debit Card'
  | 'Credit Card'
  // Online payment methods
  | 'PayPal'
  | 'Bank Transfer'
  | 'Digital Wallet'
  // Other methods
  | 'Check'
  | 'Money Order'
  | 'Store Credit';

// src/types/index.ts

export interface DashboardKPIs {
  today_sales: number;
  active_sales_count: number;
  total_customers_count: number;
  overdue_payments_count: number;
}

export interface RecentSaleItem {
  status: string;
  sale_id: number;
  sale_date: string; // ISO 8601 string
  total_amount: number;
  customer_name: string;
}

export interface UpcomingPaymentItem {
  due_date: string; // ISO 8601 string
  amount_due: number;
  customer_name: string;
}

export interface DashboardLists {
  recent_sales: RecentSaleItem[];
  upcoming_payments: UpcomingPaymentItem[];
}

export interface DashboardPerformance {
  monthly_revenue: number;
  average_sale_time_days: number;
  sales_this_month_count: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  lists: DashboardLists;
  performance: DashboardPerformance;
}

// This interface represents the direct output of your RPC function
export interface GetUserDashboardDataRpcResponse {
  get_user_dashboard_data: DashboardData;
}
