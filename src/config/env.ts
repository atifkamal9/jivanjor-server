import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/jivanjor',
  JWT_SECRET: process.env.JWT_SECRET || 'jivanjor_development_secret_key_987654321_abc_xyz',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

// Simple validation
if (!process.env.DATABASE_URL && env.NODE_ENV === 'production') {
  console.warn('WARNING: DATABASE_URL is not set. Using default connection string.');
}
