const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Trust Render's proxy for rate limiter IP detection
app.set('trust proxy', 1);

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Enable CORS — supports comma-separated origins + Vercel preview deployments
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

const previewPattern = /^https:\/\/after-bell-[a-z0-9]+-meetunaiop-3287s-projects\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || previewPattern.test(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
}));

// Mount routers
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/progress', require('./routes/progress'));
app.use('/api/v1/parent', require('./routes/parent'));
app.use('/api/v1/skilldomains', require('./routes/skillDomains'));
app.use('/api/v1/skilldomains/:skillDomainId/lessons', require('./routes/lessons'));
app.use('/api/v1/lessons', require('./routes/lessons'));
app.use('/api/v1/partners', require('./routes/partners'));
app.use('/api/v1/skills', require('./routes/skills'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/ai', require('./routes/ai'));
app.use('/api/v1/gamification', require('./routes/gamification'));
app.use('/api/v1/notifications', require('./routes/notifications'));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
