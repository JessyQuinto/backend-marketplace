"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.verifyToken = void 0;
const verifyToken = (req, res) => {
    // If the middleware passed, the user is authenticated.
    res.status(200).json({
        success: true,
        data: req.user
    });
};
exports.verifyToken = verifyToken;
const refreshToken = (req, res) => {
    // Firebase SDKs automatically handle token refresh.
    // This endpoint is for clients that need to manually refresh tokens.
    // The actual token refresh logic should be handled by the client-side Firebase SDK.
    res.status(200).json({
        success: true,
        message: 'El cliente debe refrescar el token usando el SDK de Firebase.'
    });
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=authController.js.map