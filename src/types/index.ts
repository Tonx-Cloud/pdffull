export interface Profile {
  id: string;
  email: string;
  name: string | null;
  plan: "free" | "pro";
  conversions_this_month: number;
  conversions_reset_at: string;
  mp_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversion {
  id: string;
  user_id: string;
  filename: string;
  pdf_url: string | null;
  pages: number;
  size_bytes: number;
  shared: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  mp_subscription_id: string;
  plan: "pro";
  status: "active" | "cancelled" | "pending";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

export interface ConversionLimit {
  used: number;
  max: number;
  canConvert: boolean;
  plan: "free" | "pro";
}
