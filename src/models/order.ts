// Representa un solo artículo dentro de una orden.
export interface OrderItem {
  productId: string;
  sellerId: string; // Denormalizado para facilitar las consultas del vendedor
  name: string;      // Denormalizado para no tener que buscarlo después
  price: number;     // Precio al momento de la compra
  quantity: number;
  image: string;     // Una imagen principal para mostrar en el historial
  status?: OrderStatus; // Estado específico del item (para seguimiento del vendedor)
  trackingNumber?: string; // Número de seguimiento del envío
  updatedAt?: string; // Fecha de última actualización del item
}

// Representa el estado de una orden.
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Representa el documento completo de una orden.
export interface Order {
  id: string; // ID del documento de Firestore
  buyerId: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: string; // Placeholder, podría ser un objeto más complejo
  createdAt: string;
  updatedAt: string;
}
