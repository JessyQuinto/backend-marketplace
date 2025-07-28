# ✅ Checklist Rápido para el Backend

## 🚨 **URGENTE - Configuraciones Mínimas**

### 1. ⚡ Configuración CORS (CRÍTICO)
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true
}));
```

### 2. 🔐 Middleware de Autenticación (CRÍTICO)
```javascript
// Verificar token de Firebase en header Authorization
const token = req.headers.authorization?.replace('Bearer ', '');
const decodedToken = await admin.auth().verifyIdToken(token);
```

### 3. 📊 Formato de Respuesta (CRÍTICO)
```javascript
// ✅ CORRECTO
res.json({ success: true, data: productos });

// ❌ INCORRECTO  
res.json(productos);
```

---

## 🎯 **Testing Rápido**

### Paso 1: Servidor funcionando
```bash
curl http://localhost:3000/api/products
```
**Esperado:** Lista de productos o `{ success: true, data: [] }`

### Paso 2: CORS funcionando
- Abrir frontend en `http://localhost:5173`
- Ir a página de productos
- ¿Se cargan sin errores de CORS? ✅

### Paso 3: Autenticación funcionando
- Registrarse/loguearse en el frontend
- ¿Aparece el perfil del usuario? ✅

---

## 📋 **Checklist Completo**

### Configuración Base
- [ ] **Puerto 3000** configurado
- [ ] **CORS** habilitado para `http://localhost:5173`
- [ ] **Firebase Admin SDK** inicializado
- [ ] **Express.json()** middleware configurado

### Endpoints Mínimos (Para que funcione el frontend)
- [ ] `GET /api/products` (público)
- [ ] `GET /api/products/:id` (público)  
- [ ] `POST /api/auth/verify-token` (autenticado)

### Formato de Respuesta
- [ ] Todas las respuestas incluyen `{ success: true/false }`
- [ ] Datos en propiedad `data`
- [ ] Errores en propiedad `error`

### Autenticación
- [ ] Middleware verifica token de Firebase
- [ ] Header `Authorization: Bearer <token>` procesado
- [ ] Usuario agregado a `req.user` o `req.userProfile`

### Base de Datos
- [ ] Tabla/colección de usuarios creada
- [ ] Tabla/colección de productos creada
- [ ] IDs de Firebase (UID) como primary key para usuarios

---

## 🆘 **Si Algo No Funciona**

### Error de CORS
```
Access to fetch at 'http://localhost:3000/api/products' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solución:** Verificar configuración CORS del punto 1

### Error 401 Unauthorized
```json
{ "success": false, "error": "Token inválido" }
```
**Solución:** Verificar Firebase Admin SDK y middleware de auth

### Error de Formato
```
TypeError: Cannot read property 'data' of undefined
```
**Solución:** Todas las respuestas deben tener formato `{ success: true, data: ... }`

---

## 🚀 **Orden de Implementación Sugerido**

1. **Día 1:** Configurar CORS + Endpoints públicos de productos
2. **Día 2:** Firebase Auth + endpoint verify-token  
3. **Día 3:** Endpoints de usuario (profile)
4. **Día 4:** Endpoints de vendedor (products CRUD)
5. **Día 5:** Endpoints de comprador (cart/orders)
6. **Día 6:** Endpoints de admin
7. **Día 7:** Testing completo

---

## 📞 **Contacto**

Si necesitan ayuda con algún punto específico:
1. Revisar archivo `BACKEND_REQUIREMENTS.md` (documentación completa)
2. Revisar archivo `BACKEND_CODE_EXAMPLES.md` (ejemplos de código)
3. Usar herramientas como Postman para testing
4. Verificar logs de consola en frontend (F12 → Console)

**El frontend está 100% listo y esperando que el backend implemente estos endpoints.**
