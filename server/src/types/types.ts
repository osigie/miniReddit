import { Request, Response, Express } from "express";
import { Session } from "express-session";
import {Redis} from "ioredis"
export type MyContext = {
  res: Response;
  req: Request & { session?: Session & { userId?: number } };
  redis:Redis
};
