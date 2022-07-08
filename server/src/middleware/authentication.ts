import { Request, Response, NextFunction } from "express";
import { MyContext } from "src/types/types";
import { MiddlewareFn } from "type-graphql";

export const authentication: MiddlewareFn<MyContext> = async (
  { context },
  next: NextFunction
) => {
  if (!context.req.session.userId) {
    throw new Error("not authenticated");
  }
  return next();
};
