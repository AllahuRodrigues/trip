import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';

let cachedApp: express.Express | undefined;

export async function getExpressApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }
  const instance = express();
  const adapter = new ExpressAdapter(instance);
  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn'],
    bodyParser: true,
  });
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CLIENT_ORIGIN?.split(',').map((s) => s.trim()) ?? true,
    credentials: true,
  });
  await app.init();
  cachedApp = instance;
  return cachedApp;
}
