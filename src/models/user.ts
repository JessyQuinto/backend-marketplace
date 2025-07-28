// Definimos y exportamos el tipo UserRole para poder usarlo en otros archivos.
export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole; // Usamos el tipo UserRole aquí
  isApproved: boolean;
  phone?: string;
  address?: string;
  businessName?: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
  suspended?: boolean;
}
