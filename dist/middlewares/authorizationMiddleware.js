"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
/**
 * Middleware para verificar roles y estado de aprobación de un usuario.
 * @param allowedRoles - Un array de roles permitidos para acceder al recurso.
 * @param options - Opciones adicionales como requerir que la cuenta esté aprobada.
 */
const authorize = (allowedRoles, options = {}) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Autenticación requerida. Inicie sesión para continuar.',
                code: 'UNAUTHENTICATED'
            });
        }
        // 1. Validar Rol
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. No tienes permiso para realizar esta acción.',
                code: 'FORBIDDEN_ROLE'
            });
        }
        // 2. Validar si el vendedor está aprobado (si es requerido)
        if (options.requireApproved && user.role === 'vendedor' && !user.isApproved) {
            return res.status(403).json({
                success: false,
                error: 'Tu cuenta de vendedor está pendiente de aprobación. No puedes acceder a este recurso todavía.',
                code: 'SELLER_NOT_APPROVED'
            });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=authorizationMiddleware.js.map