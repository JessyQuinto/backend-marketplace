import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

/**
 * Middleware de validación que usa un esquema de Joi para validar req.body.
 * Si la validación es exitosa, el req.body se reemplaza por el valor validado (sanitizado).
 * @param schema - El esquema de Joi a usar para la validación.
 */
export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Reportar todos los errores, no solo el primero
      stripUnknown: true, // Eliminar campos no definidos en el esquema
      convert: true, // Intentar convertir tipos (e.g., string a número)
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: `Error de validación: ${errors}`,
        code: 'VALIDATION_ERROR',
      });
    }

    req.body = value; // Reemplazar el body con el valor validado y sanitizado
    next();
  };
};
