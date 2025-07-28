# 💻 Ejemplos de Código para el Backend

## 🚀 Implementación Rápida con Express.js

### 1. Configuración Inicial del Servidor

```javascript
// server.js o app.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
```

### 2. Middleware de Autenticación

```javascript
// middleware/auth.js
const admin = require('firebase-admin');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorización requerido',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar token con Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Agregar información del usuario al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware para verificar roles
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Obtener perfil del usuario desde la base de datos
      const userProfile = await getUserProfileFromDB(req.user.uid);
      
      if (!userProfile) {
        return res.status(404).json({
          success: false,
          error: 'Perfil de usuario no encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      if (!roles.includes(userProfile.role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para esta acción',
          code: 'FORBIDDEN'
        });
      }

      // Para sellers, verificar que esté aprobado
      if (userProfile.role === 'seller' && !userProfile.isApproved) {
        return res.status(403).json({
          success: false,
          error: 'Tu cuenta de vendedor está pendiente de aprobación',
          code: 'SELLER_NOT_APPROVED'
        });
      }

      req.userProfile = userProfile;
      next();
    } catch (error) {
      console.error('Error verificando rol:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

module.exports = { verifyFirebaseToken, requireRole };
```

### 3. Rutas de Autenticación

```javascript
// routes/auth.js
const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/verify-token
router.post('/verify-token', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email } = req.user;
    
    // Buscar o crear perfil del usuario
    let userProfile = await getUserProfileFromDB(uid);
    
    if (!userProfile) {
      // Crear perfil por primera vez
      userProfile = await createUserProfile({
        id: uid,
        email: email,
        name: email.split('@')[0], // Nombre temporal
        role: 'buyer', // Rol por defecto
        isApproved: true, // Buyers se aprueban automáticamente
        createdAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: userProfile,
      message: 'Token verificado exitosamente'
    });
  } catch (error) {
    console.error('Error en verify-token:', error);
    res.status(500).json({
      success: false,
      error: 'Error verificando token',
      code: 'VERIFICATION_ERROR'
    });
  }
});

module.exports = router;
```

### 4. Rutas de Productos

```javascript
// routes/products.js
const express = require('express');
const { verifyFirebaseToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET /api/products (público)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let products = await getAllProductsFromDB();
    
    // Filtrar solo productos activos
    products = products.filter(p => p.isActive);
    
    // Aplicar filtros
    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos'
    });
  }
});

// GET /api/products/:id (público)
router.get('/:id', async (req, res) => {
  try {
    const product = await getProductByIdFromDB(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo producto'
    });
  }
});

module.exports = router;
```

### 5. Rutas de Vendedor

```javascript
// routes/seller.js
const express = require('express');
const { verifyFirebaseToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Todos los endpoints requieren ser seller aprobado
router.use(verifyFirebaseToken);
router.use(requireRole(['seller']));

// GET /api/seller/products
router.get('/products', async (req, res) => {
  try {
    const products = await getProductsBySellerFromDB(req.userProfile.id);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error obteniendo productos del vendedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos'
    });
  }
});

// POST /api/seller/products
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, stock, category, images } = req.body;
    
    // Validaciones
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    if (price <= 0 || stock < 0) {
      return res.status(400).json({
        success: false,
        error: 'Precio y stock deben ser valores válidos'
      });
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      images: images || [],
      sellerId: req.userProfile.id,
      sellerName: req.userProfile.name,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const newProduct = await createProductInDB(productData);

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando producto'
    });
  }
});

// PUT /api/seller/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    
    // Verificar que el producto pertenece al vendedor
    const existingProduct = await getProductByIdFromDB(productId);
    
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    if (existingProduct.sellerId !== req.userProfile.id) {
      return res.status(403).json({
        success: false,
        error: 'No puedes editar este producto'
      });
    }

    // Aplicar actualizaciones
    const updatedProduct = await updateProductInDB(productId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando producto'
    });
  }
});

module.exports = router;
```

### 6. Rutas de Comprador

```javascript
// routes/buyer.js
const express = require('express');
const { verifyFirebaseToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Todos los endpoints requieren ser buyer
router.use(verifyFirebaseToken);
router.use(requireRole(['buyer']));

// POST /api/buyer/cart/add
router.post('/cart/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Producto y cantidad son requeridos'
      });
    }

    // Verificar que el producto existe y tiene stock
    const product = await getProductByIdFromDB(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Producto no disponible'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Stock insuficiente'
      });
    }

    // Agregar al carrito (implementar lógica según tu sistema)
    await addToCartInDB(req.userProfile.id, productId, quantity);

    res.json({
      success: true,
      message: 'Producto agregado al carrito'
    });
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    res.status(500).json({
      success: false,
      error: 'Error agregando al carrito'
    });
  }
});

// POST /api/buyer/checkout
router.post('/checkout', async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Dirección de envío requerida'
      });
    }

    // Obtener items del carrito
    const cartItems = await getCartItemsFromDB(req.userProfile.id);
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Carrito vacío'
      });
    }

    // Verificar stock y calcular total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await getProductByIdFromDB(item.productId);
      
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente para ${product?.name || 'producto'}`
        });
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        sellerId: product.sellerId
      });
    }

    // Crear orden
    const order = await createOrderInDB({
      buyerId: req.userProfile.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // Reducir stock de productos
    for (const item of cartItems) {
      await updateProductStockInDB(item.productId, -item.quantity);
    }

    // Limpiar carrito
    await clearCartInDB(req.userProfile.id);

    res.json({
      success: true,
      data: order,
      message: 'Compra procesada exitosamente'
    });
  } catch (error) {
    console.error('Error en checkout:', error);
    res.status(500).json({
      success: false,
      error: 'Error procesando compra'
    });
  }
});

module.exports = router;
```

### 7. Configuración de Rutas Principal

```javascript
// En tu archivo principal (app.js o server.js)

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const sellerRoutes = require('./routes/seller');
const buyerRoutes = require('./routes/buyer');
const adminRoutes = require('./routes/admin');

// Configurar rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    code: 'NOT_FOUND'
  });
});
```

### 8. Funciones de Base de Datos (Ejemplo con MongoDB/Mongoose)

```javascript
// models/User.js - Ejemplo con Mongoose
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  isApproved: { type: Boolean, default: false },
  phone: String,
  address: String,
  businessName: String,
  bio: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('User', userSchema);

// services/userService.js
const User = require('../models/User');

const getUserProfileFromDB = async (uid) => {
  return await User.findOne({ id: uid });
};

const createUserProfile = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

module.exports = {
  getUserProfileFromDB,
  createUserProfile
};
```

## 🧪 Testing de Endpoints

```bash
# Verificar que el servidor funciona
curl http://localhost:3000/api/health

# Obtener productos (público)
curl http://localhost:3000/api/products

# Verificar token (autenticado)
curl -X POST \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/auth/verify-token
```

Este código proporciona una base sólida para implementar el backend que el frontend está esperando. ¡Adapta según tu stack tecnológico específico!
