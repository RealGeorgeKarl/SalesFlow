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
  stock_quantity: number;
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
  interest_rate: number;
  is_active: boolean;
  created_at: string;
}

export interface Sale {
  id: string;
  customer_id: string;
  customer?: Customer;
  seller_name?: string;
  total_amount: number;
  amount_paid: number;
  remaining_balance: number;
  payment_type: 'Full Payment' | 'Down Payment + Installments' | 'Installment Only';
  down_payment_amount?: number;
  installment_plan_id?: string;
  installment_plan?: InstallmentPlan;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Terminated';
  notes?: string;
  created_at: string;
  created_by: string;
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