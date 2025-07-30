"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Importar todas las rutas
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const buyerRoutes_1 = __importDefault(require("./routes/buyerRoutes"));
const sellerRoutes_1 = __importDefault(require("./routes/sellerRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes")); // <-- Nueva ruta importada
// Importar middlewares
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = require("./middlewares/logger");
const unknownEndpoint_1 = require("./middlewares/unknownEndpoint");
// Inicializar Firebase
require("./config/firebase");
const firebase_1 = require("./config/firebase"); // Importar db para la prueba
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middlewares de seguridad y utilidad
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173', // Vite dev server (puerto original)
        'http://localhost:5174', // Vite dev server (puerto alternativo)
        'http://localhost:5175', // Vite dev server (puerto alternativo)
        'http://localhost:3000', // Posible alternativa
        'http://localhost:5000' // Posible puerto alternativo
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(logger_1.logger);
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🛒 Backend Marketplace API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            public: [
                'GET /api/products',
                'GET /api/products/:id'
            ],
            authenticated: [
                'POST /api/auth/verify-token',
                'GET /api/users/profile',
                'PUT /api/users/profile',
                'POST /api/users/register-seller'
            ],
            buyer: [
                'POST /api/buyer/cart/add',
                'POST /api/buyer/checkout',
                'GET /api/buyer/orders'
            ],
            seller: [
                'GET /api/seller/products',
                'POST /api/seller/products',
                'PUT /api/seller/products/:id',
                'GET /api/seller/orders'
            ],
            admin: [
                'GET /api/admin/users',
                'PUT /api/admin/users/:id/approve',
                'PUT /api/admin/users/:id/reject',
                'PUT /api/admin/users/:id/suspend',
                'PUT /api/admin/users/:id/reactivate'
            ]
        }
    });
});
// Ruta de prueba para Firestore
app.get('/test-firestore', async (req, res) => {
    try {
        console.log('🧪 Testing Firestore connection...');
        if (!firebase_1.db) {
            return res.status(500).json({
                success: false,
                error: 'Firestore not initialized'
            });
        }
        // Intentar escribir un documento de prueba
        const testDoc = firebase_1.db.collection('test').doc('connection-test');
        await testDoc.set({
            timestamp: new Date().toISOString(),
            message: 'Connection test successful'
        });
        // Intentar leer el documento
        const doc = await testDoc.get();
        console.log('✅ Firestore test successful');
        res.json({
            success: true,
            message: 'Firestore connection successful',
            data: doc.data()
        });
    }
    catch (error) {
        console.error('❌ Firestore test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Firestore connection failed',
            details: error.message
        });
    }
});
// --- Registro de Rutas ---
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/buyer', buyerRoutes_1.default);
app.use('/api/seller', sellerRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/products', productRoutes_1.default); // <-- Nueva ruta registrada
// Middlewares de manejo de errores (al final)
app.use(unknownEndpoint_1.unknownEndpoint);
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
//# sourceMappingURL=index.js.map