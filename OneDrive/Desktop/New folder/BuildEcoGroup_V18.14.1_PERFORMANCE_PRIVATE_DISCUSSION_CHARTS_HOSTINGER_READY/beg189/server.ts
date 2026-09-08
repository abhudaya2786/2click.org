import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { authenticateSession } from './server/middleware/auth';
import { env, isDatabaseConfigured, assertProductionEnv, allowedOrigins } from './server/env';
import { securityHeaders } from './server/middleware/securityHeaders';
import { restoreRuntimeState, schedulePersist, flushPersistence, persistenceMode } from './server/persistence';

async function startServer() {
  const app = express();
  const portArgumentIndex = process.argv.indexOf('--port');
  const requestedPort = portArgumentIndex >= 0 ? Number(process.argv[portArgumentIndex + 1]) : undefined;
  const PORT = Number.isFinite(requestedPort) ? requestedPort : env.PORT || 3000;

  app.disable('x-powered-by');
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
  assertProductionEnv();
  app.use(securityHeaders);

  const corsOrigins = new Set(allowedOrigins());
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && corsOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(origin && !corsOrigins.has(origin) ? 403 : 204);
    next();
  });

  // JSON parsing and cookie parsing middleware
  // Site photographs are compressed in-browser and stored privately inside the
  // authorized case record. Keep a strict ceiling while allowing up to 3 images.
  app.use(express.json({ limit: '8mb' }));
  app.use(cookieParser());

  // Global session authenticator middleware (extracts HttpOnly session cookie or Bearer token)
  app.use(authenticateSession);

  let restored = false;
  try {
    restored = await restoreRuntimeState();
  } catch (error) {
    // A temporarily unavailable/misconfigured database must not take the public
    // website down. Keep serving and surface degraded persistence via /api/health.
    console.error('[BuildEcoGroup] PostgreSQL restore unavailable; continuing in degraded mode:', error);
  }
  console.log(`[BuildEcoGroup] Runtime persistence mode: ${persistenceMode()}${restored ? ' (state restored)' : ''}`);

  // Persist every successful mutating API request after response completion.
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      res.on('finish', () => { if (res.statusCode < 500) schedulePersist(); });
    }
    next();
  });

  // Mount API router FIRST before frontend assets
  app.use('/api', apiRouter);

  // Vite middleware for development or static serving for production
  if (env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        allowedHosts: ['terminal.local'],
        hmr: requestedPort ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      immutable: true,
      maxAge: '1y',
      index: false,
    }));
    app.use(express.static(distPath, {
      index: false,
      maxAge: '1h',
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BuildEcoGroup] Server active on port ${PORT} (0.0.0.0) [env: ${env.NODE_ENV}]`);
    console.log(`[BuildEcoGroup] Drizzle ORM initialized. PostgreSQL configured: ${isDatabaseConfigured()}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[BuildEcoGroup] ${signal} received; flushing persistence.`);
    try { await flushPersistence(); } catch (error) { console.error('[BuildEcoGroup] Persistence flush failed:', error); }
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
}

startServer().catch(error => { console.error('[BuildEcoGroup] Fatal startup error:', error); process.exit(1); });
