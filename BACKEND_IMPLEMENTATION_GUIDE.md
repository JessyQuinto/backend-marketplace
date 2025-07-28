# Instrucciones de Implementación para el Backend

## 📋 Configuraciones Requeridas

### 1. Configuración de CORS

El backend debe permitir solicitudes desde el frontend. Agregar la configuración de CORS:

```javascript
// En el archivo principal del servidor (app.js, server.js, index.js)
const cors = require('cors');

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
```

### 2. Middleware de Autenticación Firebase

Implementar middleware para verificar tokens de Firebase:

```javascript
// middleware/auth.js
const admin = require('firebase-admin');

// Inicializar Firebase Admin (usar las credenciales del proyecto)
const serviceAccount = require('../path/to/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'chocomarketlogin' // Tu project ID de Firebase
});

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorización requerido',
        code: 'UNAUTHORIZED'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name
    };
    
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = { verifyToken };
```

### 3. Formato de Respuestas Consistente

Todas las respuestas deben seguir este formato:

```javascript
// Respuesta exitosa
res.status(200).json({
  success: true,
  data: resultado,
  message: "Operación exitosa" // opcional
});

// Respuesta de error
res.status(400).json({
  success: false,
  error: "Mensaje de error claro",
  code: "CODIGO_ERROR_UNICO"
});
```

## 🔐 Endpoints Requeridos

### Autenticación

#### `POST /api/auth/verify-token`
**Propósito**: Verificar token y obtener/crear perfil del usuario

```javascript
// routes/auth.js
app.post('/api/auth/verify-token', verifyToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    
    // Buscar usuario en la base de datos
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      // Crear nuevo usuario si no existe
      user = await User.create({
        firebaseUid: uid,
        email: email,
        name: name,
        role: 'buyer', // rol por defecto
        isApproved: true, // buyers se aprueban automáticamente
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error verificando usuario',
      code: 'USER_VERIFICATION_ERROR'
    });
  }
});
```

### Gestión de Usuario

#### `GET /api/users/profile`
```javascript
app.get('/api/users/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo perfil',
      code: 'PROFILE_FETCH_ERROR'
    });
  }
});
```

#### `PUT /api/users/profile`
```javascript
app.put('/api/users/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, address, businessName, bio } = req.body;
    
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { 
        name,
        phone,
        address,
        businessName,
        bio,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      data: user,
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error actualizando perfil',
      code: 'PROFILE_UPDATE_ERROR'
    });
  }
});
```

#### `POST /api/users/register-seller`
```javascript
app.post('/api/users/register-seller', verifyToken, async (req, res) => {
  try {
    const { businessName, bio, phone } = req.body;
    
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid, role: 'buyer' },
      {
        role: 'seller',
        businessName,
        bio,
        phone,
        isApproved: false, // Requiere aprobación del admin
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Solo los compradores pueden solicitar ser vendedores',
        code: 'INVALID_ROLE_CHANGE'
      });
    }
    
    res.json({
      success: true,
      message: 'Solicitud de vendedor enviada. Pendiente de aprobación.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error procesando solicitud',
      code: 'SELLER_REGISTRATION_ERROR'
    });
  }
});
```

### Productos Públicos

#### `GET /api/products`
```javascript
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .populate('sellerId', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Agregar sellerName para compatibilidad con frontend
    const productsWithSellerName = products.map(product => ({
      ...product.toObject(),
      sellerName: product.sellerId.businessName || product.sellerId.name
    }));
    
    res.json({
      success: true,
      data: productsWithSellerName
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos',
      code: 'PRODUCTS_FETCH_ERROR'
    });
  }
});
```

#### `GET /api/products/:id`
```javascript
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name businessName');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado',
        code: 'PRODUCT_NOT_FOUND'
      });
    }
    
    const productWithSellerName = {
      ...product.toObject(),
      sellerName: product.sellerId.businessName || product.sellerId.name
    };
    
    res.json({
      success: true,
      data: productWithSellerName
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo producto',
      code: 'PRODUCT_FETCH_ERROR'
    });
  }
});
```

## 🛡️ Middleware de Autorización

Crear middleware para verificar roles:

```javascript
// middleware/authorize.js
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ firebaseUid: req.user.uid });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        });
      }
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para esta acción',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }
      
      if (user.role === 'seller' && !user.isApproved) {
        return res.status(403).json({
          success: false,
          error: 'Cuenta de vendedor pendiente de aprobación',
          code: 'SELLER_NOT_APPROVED'
        });
      }
      
      req.userProfile = user;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error verificando permisos',
        code: 'AUTHORIZATION_ERROR'
      });
    }
  };
};

// Uso:
app.get('/api/seller/products', verifyToken, requireRole(['seller']), async (req, res) => {
  // Solo vendedores aprobados pueden acceder
});
```

## 📊 Modelos de Base de Datos

### Modelo de Usuario
```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['buyer', 'seller', 'admin'], 
    default: 'buyer' 
  },
  isApproved: { type: Boolean, default: true },
  phone: String,
  address: String,
  businessName: String, // Para vendedores
  bio: String, // Para vendedores
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Modelo de Producto
```javascript
// models/Product.js
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  images: [{ type: String }],
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Modelo de Orden
```javascript
// models/Order.js
const orderSchema = new mongoose.Schema({
  buyerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    productName: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    sellerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

## 🚀 Variables de Entorno

Crear archivo `.env` en el backend:

```bash
# Puerto del servidor
PORT=3000

# Base de datos
MONGODB_URI=mongodb://localhost:27017/tesoros-choc

# Firebase Admin
FIREBASE_PROJECT_ID=chocomarketlogin
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json

# CORS
FRONTEND_URL=http://localhost:5173

# JWT (si se usa como alternativa)
JWT_SECRET=tu-secret-key-muy-segura
```

## 📦 Dependencias Necesarias

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "cors": "^2.8.5",
    "firebase-admin": "^11.0.0",
    "dotenv": "^16.0.0",
    "helmet": "^6.0.0",
    "express-rate-limit": "^6.0.0"
  }
}
```

## 🔍 Testing

Probar endpoints con estas herramientas:

### Postman Collection
```json
{
  "info": { "name": "Tesoros Chocó API" },
  "auth": {
    "type": "bearer",
    "bearer": [
      { "key": "token", "value": "{{firebase_token}}" }
    ]
  }
}
```

### Ejemplo de solicitud con curl:
```bash
# Obtener productos (público)
curl -X GET http://localhost:3000/api/products

# Verificar token (autenticado)
curl -X POST http://localhost:3000/api/auth/verify-token \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json"
```

## 🔧 Implementación Paso a Paso

1. **Instalar dependencias**
2. **Configurar Firebase Admin**
3. **Implementar middleware de autenticación**
4. **Crear modelos de base de datos**
5. **Implementar endpoints básicos**
6. **Probar integración con frontend**
7. **Agregar endpoints avanzados**

## 🐛 Manejo de Errores

Implementar manejo global de errores:

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_SERVER_ERROR'
  });
};

// Usar al final de todas las rutas
app.use(errorHandler);
```

---

## 📞 Contacto

Si tienes dudas sobre la implementación, revisa:
1. La documentación de Firebase Admin SDK
2. Los ejemplos de código en este archivo
3. Los logs del servidor para errores específicos

¡La integración con el frontend ya está lista y esperando estos endpoints! 🚀
