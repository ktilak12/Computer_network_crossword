import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { apiRouter } from './routes.js';
import { setupSocketHandlers } from './socketHandler.js';
import { getDatabase } from './db.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve static frontend build if present
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidateDists = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../../../../client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
];
const clientDist = candidateDists.find((d) => fs.existsSync(d)) || candidateDists[0];

if (fs.existsSync(clientDist)) {
  console.log(`📦 Serving static client bundle from: ${clientDist}`);
}

app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

setupSocketHandlers(io);

// Start Server
async function startServer() {
  // Initialize Database connection
  await getDatabase();

  const HOST = process.env.HOST || '0.0.0.0';
  server.listen(Number(PORT), HOST, () => {
    console.log(`🚀 NetCrossword Live Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
