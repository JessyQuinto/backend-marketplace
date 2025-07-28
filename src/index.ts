import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes directly
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import buyerRoutes from './routes/buyerRoutes';
import sellerRoutes from './routes/sellerRoutes';
import userRoutes from './routes/userRoutes';

// Import middlewares
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './middlewares/logger';
import { unknownEndpoint } from './middlewares/unknownEndpoint';

// Initialize Firebase. This file now handles its own initialization logic.
import './config/firebase';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(logger);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
