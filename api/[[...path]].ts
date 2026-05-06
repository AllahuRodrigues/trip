import type { VercelRequest, VercelResponse } from '@vercel/node';
import { join } from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const serverlessPath = join(process.cwd(), 'dist', 'serverless.js');
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Nest output lives in dist/ at runtime
  const { getExpressApp } = require(serverlessPath) as {
    getExpressApp: () => Promise<import('express').Express>;
  };
  const app = await getExpressApp();
  app(req as never, res as never);
}
