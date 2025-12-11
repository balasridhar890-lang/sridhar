import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { testConnection } from './database';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (_req: Request, res: Response) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: config.nodeEnv,
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Server is running',
    version: '1.0.0',
  });
});

const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export { app, server };
