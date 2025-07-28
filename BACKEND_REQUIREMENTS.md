# 🔄 Actualizaciones Requeridas en el Backend

## 📋 Resumen

El frontend ha sido completamente integrado y está preparado para comunicarse con el backend. Sin embargo, hay algunas actualizaciones y configuraciones que el equipo de backend debe implementar para que la integración funcione correctamente.

---

## ⚠️ CONFIGURACIONES CRÍTICAS REQUERIDAS

### 1. 🌐 Configuración de CORS

El backend **DEBE** permitir requests desde el frontend. Agregar en la configuración principal:

```javascript
// Express.js ejemplo
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',     // Desarrollo (Vite)
    'http://localhost:3000',     // Desarrollo alternativo
    'https://tu-dominio.com'     // Producción
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2. 🔐 Verificación de Firebase Token

El frontend envía el token de Firebase en **TODAS** las requests autenticadas. El backend debe verificar este token:

**Header esperado:**
```
Authorization: Bearer <firebase-id-token>
```

**Middleware de verificación requerido:**
```javascript
// Ejemplo de middleware para verificar tokens de Firebase
const admin = require('firebase-admin');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorización requerido'
      });
    }

    // Verificar token con Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // uid, email, etc.
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};
```

### 3. 📊 Formato de Respuesta Estandarizado

**TODAS** las respuestas del backend deben seguir este formato:

#### Respuesta Exitosa:
```json
{
  "success": true,
  "data": { /* datos solicitados */ },
  "message": "Operación exitosa" // opcional
}
```

#### Respuesta de Error:
```json
{
  "success": false,
  "error": "Mensaje descriptivo del error",
  "code": "CODIGO_ERROR_UNICO" // opcional
}
```

---

## 🛣️ ENDPOINTS QUE EL FRONTEND ESTÁ LLAMANDO

### Endpoints Públicos (sin autenticación)
```
GET /api/products
GET /api/products/:id
```

### Endpoints Autenticados (requieren Firebase token)

#### Autenticación:
```
POST /api/auth/verify-token
```
**Función:** Verificar token y devolver perfil completo del usuario
**Response esperada:**
```json
{
  "success": true,
  "data": {
    "id": "firebase-uid",
    "email": "user@example.com",
    "name": "Nombre Usuario",
    "role": "buyer|seller|admin",
    "isApproved": true,
    "phone": "123456789",
    "businessName": "Mi Negocio", // solo para sellers
    "bio": "Descripción", // solo para sellers
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Gestión de Usuario:
```
GET /api/users/profile
PUT /api/users/profile
POST /api/users/register-seller
```

#### Comprador:
```
POST /api/buyer/cart/add
POST /api/buyer/checkout  
GET /api/buyer/orders
```

#### Vendedor:
```
GET /api/seller/products
POST /api/seller/products
PUT /api/seller/products/:id
GET /api/seller/orders
```

#### Administrador:
```
GET /api/admin/users
PUT /api/admin/users/:id/approve
PUT /api/admin/users/:id/reject
PUT /api/admin/users/:id/suspend
PUT /api/admin/users/:id/reactivate
```

---

## 📝 ESTRUCTURA DE DATOS ESPERADA

### Usuario (UserProfile)
```typescript
interface UserProfile {
  id: string;           // Firebase UID
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  isApproved: boolean;  // Para sellers
  phone?: string;
  address?: string;
  businessName?: string; // Para sellers
  bio?: string;          // Para sellers
  createdAt: string;     // ISO date
  updatedAt?: string;    // ISO date
}
```

### Producto (Product)
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];      // Array de URLs
  sellerId: string;      // Firebase UID del vendedor
  sellerName?: string;   // Nombre del vendedor (opcional)
  isActive: boolean;
  createdAt: string;     // ISO date
  updatedAt?: string;    // ISO date
}
```

### Orden (Order)
```typescript
interface Order {
  id: string;
  buyerId: string;       // Firebase UID
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;     // ISO date
  updatedAt?: string;    // ISO date
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;         // Precio al momento de la compra
  sellerId: string;
}
```

---

## 🔧 CONFIGURACIONES ADICIONALES REQUERIDAS

### 1. Variables de Entorno del Backend
```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=chocomarketlogin
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@chocomarketlogin.iam.gserviceaccount.com"

# Base de datos
DATABASE_URL=postgresql://...

# Puerto del servidor
PORT=3000
```

### 2. Firebase Admin SDK Initialization
```javascript
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});
```

### 3. Middleware de Logging (Recomendado)
```javascript
// Para debugging y monitoreo
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.headers.authorization) {
    console.log('🔐 Request autenticada');
  }
  next();
});
```

---

## 🧪 ENDPOINTS PARA TESTING

### Verificar que el servidor está funcionando:
```bash
curl http://localhost:3000/api/products
```

### Verificar autenticación (con token válido):
```bash
curl -H "Authorization: Bearer <firebase-token>" \
     http://localhost:3000/api/auth/verify-token
```

---

## ⚡ FUNCIONALIDADES CRÍTICAS POR IMPLEMENTAR

### 1. Sistema de Roles y Permisos
- ✅ **buyer**: Puede comprar productos
- ✅ **seller**: Puede vender (solo si `isApproved: true`)
- ✅ **admin**: Puede gestionar usuarios y sistema

### 2. Validaciones de Negocio
- Un **buyer** no puede acceder a endpoints de seller
- Un **seller** no aprobado no puede crear productos
- Solo **admin** puede aprobar/rechazar sellers

### 3. Gestión de Stock
- Verificar stock disponible antes de agregar al carrito
- Reducir stock automáticamente después del checkout

### 4. Búsqueda y Filtrado
- Búsqueda por nombre de producto
- Filtrado por categoría
- Paginación (recomendado para performance)

---

## 🚨 ERRORES COMUNES A EVITAR

### 1. **CORS no configurado**
```
Error: Access to fetch at 'http://localhost:3000/api/products' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### 2. **Token no verificado**
```json
{
  "success": false,
  "error": "Token inválido"
}
```

### 3. **Formato de respuesta incorrecto**
```javascript
// ❌ INCORRECTO
res.json({ products: [...] });

// ✅ CORRECTO  
res.json({ 
  success: true, 
  data: products 
});
```

---

## 📞 CONTACTO Y SOPORTE

Si el equipo de backend tiene dudas sobre alguna implementación:

1. **Revisar la documentación** de endpoints en este archivo
2. **Verificar logs** del frontend en la consola del navegador
3. **Usar herramientas** como Postman para testing
4. **Consultar** los tipos TypeScript en `/src/types/` del frontend

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] CORS configurado correctamente
- [ ] Firebase Admin SDK inicializado
- [ ] Middleware de verificación de tokens implementado
- [ ] Formato de respuesta estandarizado
- [ ] Todos los endpoints requeridos implementados
- [ ] Validaciones de roles y permisos
- [ ] Manejo de errores consistente
- [ ] Testing de endpoints básicos
- [ ] Variables de entorno configuradas
- [ ] Logs para debugging habilitados

---

**🎯 Una vez que estos puntos estén implementados, la integración frontend-backend estará completamente funcional.**
