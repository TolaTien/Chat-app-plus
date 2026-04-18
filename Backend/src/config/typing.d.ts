import { Request } from 'express';
import { Payload } from '../services/jwt.ts';

declare global {
  namespace Express {
    interface Request {
      user?: Payload
    }
  }
}
