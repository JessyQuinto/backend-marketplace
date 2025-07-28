"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Import routes directly
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const buyerRoutes_1 = __importDefault(require("./routes/buyerRoutes"));
const sellerRoutes_1 = __importDefault(require("./routes/sellerRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// Import middlewares
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = require("./middlewares/logger");
const unknownEndpoint_1 = require("./middlewares/unknownEndpoint");
// Initialize Firebase. This file now handles its own initialization logic.
require("./config/firebase");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middlewares
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(logger_1.logger);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Routes
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/buyer', buyerRoutes_1.default);
app.use('/api/seller', sellerRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
// Error handling
app.use(unknownEndpoint_1.unknownEndpoint);
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map