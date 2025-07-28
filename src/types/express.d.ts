import { Request } from 'express';
import { UserProfile } from '../models/user'; // Asegúrate que la ruta a tu modelo es correcta

// Extiende la interfaz Request de Express para incluir la propiedad 'user'
declare global {
  namespace Express {
    export interface Request {
      user?: UserProfile;
    }
  }
}

// Crea un tipo específico para usar en los controladores y middleware
export interface AuthenticatedRequest extends Request {
  user: UserProfile; // Hacemos 'user' no opcional porque se usará después de un middleware que lo garantiza
}
