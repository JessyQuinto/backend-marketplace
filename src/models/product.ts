export interface Product {
  id: string; // ID del documento de Firestore
  sellerId: string; // ID del usuario vendedor que lo posee
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[]; // Array de URLs de las imágenes
  sellerName?: string; // Nombre del vendedor (opcional)
  isActive: boolean; // Indica si el producto está activo/disponible
  createdAt: string;
  updatedAt: string;
}
