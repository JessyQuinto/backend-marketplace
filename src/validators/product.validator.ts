import Joi from 'joi';

// --- Esquemas de Validación ---

// Esquema para la creación de un nuevo producto.
export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  category: Joi.string().required(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
});

// Esquema para la actualización de un producto. Todos los campos son opcionales.
export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().min(10).max(1000),
  price: Joi.number().positive(),
  stock: Joi.number().integer().min(0),
  category: Joi.string(),
  images: Joi.array().items(Joi.string().uri()).min(1),
}).min(1); // Requiere que al menos un campo esté presente para actualizar.


// --- Tipos Inferidos (DTOs) ---

export type CreateProductDto = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
};

export type UpdateProductDto = Partial<CreateProductDto>;
