import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./error.middleware";

type AuthTokenPayLoad = {
    sub: string;
    email : string;
}

export type AuthenticatedUser = {
    id: string;
    email: string;
} 

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, _res:Response, next: NextFunction) {
    
        const authHeader = req.header("Authorization");
        
        if(!authHeader?.startsWith("Bearer ")){
            next(new AppError("Missing or invalid authorization header",401))
            return;
        }

        const token = authHeader.replace("Bearer ","");

        try{
            const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayLoad;

            req.user = {
                id: payload.sub,
                email: payload.email,
            };
            next();
        }
        
        catch (error) {
            next(error);
        }
}