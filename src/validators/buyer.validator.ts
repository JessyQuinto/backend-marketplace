import Joi from 'joi';

// Esquema para añadir un item al carrito
export const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

// Esquema para el proceso de checkout
export const checkoutSchema = Joi.object({
  shippingAddress: Joi.string().min(10).max(200).required(),
});

// --- DTOs ---

export type AddToCartDto = {
  productId: string;
  quantity: number;
};

export type CheckoutDto = {
  shippingAddress: string;
};
