// src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    console.log(
      `[REQ] ${req.method} ${req.originalUrl} at ${new Date().toISOString()}`,
    );
    console.log('Body:', req.body);

    // Listen for when the response is finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[RES] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`,
      );
    });

    next();
  }
}
