export interface CustomerUser {
  _id?: string;
  id?: string;
  phone: string;
  email?: string;
  name?: string;
  isPhoneVerified: boolean;
}

export interface AuthState {
  user: CustomerUser | null;
  loading: boolean;
  error: string | null;
}
