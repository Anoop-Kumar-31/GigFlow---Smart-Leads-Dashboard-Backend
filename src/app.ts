import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Leads API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Centralized error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
  });
};

startServer();

export default app;
