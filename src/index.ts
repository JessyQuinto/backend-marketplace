import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Importar todas las rutas
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import buyerRoutes from './routes/buyerRoutes';
import sellerRoutes from './routes/sellerRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes'; // <-- Nueva ruta importada

// Importar middlewares
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './middlewares/logger';
import { unknownEndpoint } from './middlewares/unknownEndpoint';

// Inicializar Firebase
import './config/firebase';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares de seguridad y utilidad
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Posible alternativa
    'http://localhost:5000'   // Posible puerto alternativo
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());
app.use(logger);

// Rate Limiting
const limiter = rateLimit({
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

// --- Registro de Rutas ---
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes); // <-- Nueva ruta registrada

// Middlewares de manejo de errores (al final)
app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
