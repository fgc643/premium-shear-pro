import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  category: string;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string;
};

export type Booking = {
  id: string;
  user_id: string | null;
  service_id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: string | null;
  notes: string | null;
  created_at: string;
  services?: Service;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export type UserRole = {
  id: string;
  user_id: string;
  role: 'admin' | 'customer';
};
