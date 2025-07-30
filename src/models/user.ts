// Definimos y exportamos el tipo UserRole para poder usarlo en otros archivos.
export type UserRole = 'buyer' | 'seller' | 'admin' | 'pending_vendor';

// Interface para un item individual dentro del carrito
export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

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
  cart?: CartItem[]; // <-- Campo para el carrito de compras
}
