import Joi from 'joi';
import { UserProfile } from '../models/user';

// --- Esquemas de Validación ---

// Esquema para actualizar el perfil de un usuario
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string().allow('').max(20),
  address: Joi.string().allow('').max(150),
  businessName: Joi.string().allow('').max(100),
  bio: Joi.string().allow('').max(500),
}).min(1); // Requiere que al menos un campo esté presente

// Esquema para la solicitud de registro como vendedor
export const registerSellerSchema = Joi.object({
  businessName: Joi.string().min(3).max(100).required(),
  bio: Joi.string().min(10).max(500).required(),
  phone: Joi.string().max(20).required(),
});


// --- Tipos Inferidos de los Esquemas ---

// Este tipo representa el DTO (Data Transfer Object) para actualizar el perfil.
// Es un subconjunto de UserProfile, pero con todos los campos opcionales.
export type UpdateProfileDto = {
  name?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  bio?: string;
};

// DTO para el registro de vendedor
export type RegisterSellerDto = {
  businessName: string;
  bio: string;
  phone: string;
};
