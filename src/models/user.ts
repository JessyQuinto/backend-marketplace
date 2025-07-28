export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  isApproved: boolean;
  phone?: string;
  address?: string;
  businessName?: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
}
