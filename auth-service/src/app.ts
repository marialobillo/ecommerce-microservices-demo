import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { config } from './config/config'

const app = express()

// Security middleware
app.use(helmet())
app.use(cors(config.cors))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindow,
  max: config.security.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// Logging
app.use(morgan('combined'))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API routes placeholder
app.get('/api/auth/status', (req, res) => {
  res.json({
    message: 'Auth service is running',
    keycloak: {
      url: config.keycloak.url,
      realm: config.keycloak.realm,
      status: 'configured'
    }
  })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    error: 'Something went wrong!',
    message: config.nodeEnv === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  })
})

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Auth service running on port ${config.port}`);
  console.log(`📍 Health check: http://localhost:${config.port}/health`);
  console.log(`🔐 Keycloak URL: ${config.keycloak.url}`);
});

export default app


 