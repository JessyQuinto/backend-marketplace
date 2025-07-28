"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const firebase_1 = require("../config/firebase"); // Import auth and db
// THIS IS THE CORRECTED HIGHER-ORDER FUNCTION PATTERN
const authMiddleware = (req, res, next) => {
    // Check if Firebase was initialized correctly
    if (!firebase_1.auth || !firebase_1.db) {
        return res.status(503).json({
            success: false,
            error: 'Servicio no disponible. La configuración de Firebase no está completa.',
            code: 'SERVICE_UNAVAILABLE'
        });
    }
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Token de autorización no encontrado.',
            code: 'UNAUTHORIZED'
        });
    }
    const token = authorization.split('Bearer ')[1];
    // The async logic is now properly contained
    (async () => {
        try {
            const decodedToken = await firebase_1.auth.verifyIdToken(token);
            const userDoc = await firebase_1.db.collection('users').doc(decodedToken.uid).get();
            if (!userDoc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado.',
                    code: 'USER_NOT_FOUND'
                });
            }
            const userProfile = {
                id: userDoc.id,
                ...userDoc.data()
            };
            req.user = userProfile;
            next();
        }
        catch (error) {
            console.error("Auth Middleware Error:", error);
            if (error.code === 'auth/id-token-expired') {
                return res.status(401).json({ success: false, error: 'Token expirado.', code: 'TOKEN_EXPIRED' });
            }
            return res.status(401).json({
                success: false,
                error: 'Token inválido.',
                code: 'INVALID_TOKEN'
            });
        }
    })();
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map