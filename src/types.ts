import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response, Express } from "express";
import { Session } from "express-session";
export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  res: Response;
  req: Request & { session?: Session & { userId?: number } };
};
