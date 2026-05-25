import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { AppError, HttpCode } from './utils/errors';

// Import routers
import authRouter from './routes/auth.routes';
import categoryRouter from './routes/category.routes';
import materialRouter from './routes/material.routes';
import productRouter from './routes/product.routes';
import useCaseRouter from './routes/useCase.routes';
import issueRouter from './routes/issue.routes';
import blogRouter from './routes/blog.routes';
import seoRouter from './routes/seo.routes';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Jivanjor Backend API is healthy and running',
    timestamp: new Date().toISOString(),
  });
});

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/materials', materialRouter);
app.use('/api/products', productRouter);
app.use('/api/use-cases', useCaseRouter);
app.use('/api/issues', issueRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/seo', seoRouter);

// Fallback for unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server.`, HttpCode.NOT_FOUND));
});

// Global Error Handling Middleware
app.use(errorHandler);

export default app;
