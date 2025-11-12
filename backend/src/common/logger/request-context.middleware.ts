// src/common/logger/request-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { getNamespace, createNamespace } from 'cls-hooked';

const NAMESPACE = 'request'; // name of your context

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly namespace = createNamespace(NAMESPACE);

  use(req: Request, res: Response, next: NextFunction) {
    this.namespace.run(() => {
      const requestId = (req.headers['x-request-id'] as string) || uuidv4();
      this.namespace.set('requestId', requestId);
      this.namespace.set('method', req.method);
      this.namespace.set('url', req.url);

      // You may also store user id, correlation id, etc.

      // Add header so client & logs can see it
      res.setHeader('X-Request-Id', requestId);

      next();
    });
  }
}

// helper to get context values
export function getRequestContext<T = any>(key: string): T | undefined {
  const ns = getNamespace(NAMESPACE);
  return ns ? ns.get(key) : undefined;
}
