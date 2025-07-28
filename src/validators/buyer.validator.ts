import Joi from 'joi';

// Esquema para añadir un item al carrito
export const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

// DTO para el item del carrito
export type AddToCartDto = {
  productId: string;
  quantity: number;
};
