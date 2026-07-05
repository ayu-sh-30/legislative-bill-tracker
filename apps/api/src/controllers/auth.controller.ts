import { Request, Response, NextFunction } from "express";
import {z} from "zod";
import { AppError } from "../middleware/error.middleware";
import { signup, login, getCurrentUser } from "../services/auth.service";

const signupSchema = z.object({
    name : z.string().trim().min(1).optional(),
    email : z.string().trim().email(),
    password : z.string().min(8,"Password must be at least 8 characters long"),
});

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1,"Password is required"),
});

export async function signupController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = signupSchema.safeParse(req.body);
        
        if(!parsed.success){
            throw new AppError("Invalid Sign-up Inpur",400);
        }

        const result = await signup(parsed.data);

        res.status(201).json({
            data : result,
        });

    } catch (error) {
        next(error);
    }
}

export async function loginController(req: Request, res:Response, next: NextFunction) {
    try {
        const parsed = loginSchema.safeParse(req.body);

        if(!parsed.success){
            throw new AppError("Invalid login Input", 400);
        }

        const result = await login(parsed.data);

        res.status(200).json({
            data: result,
        });

    } catch (error) {
        next(error);
    }
}

export async function getMyController(req: Request, res:Response, next: NextFunction) {
    try {
        if(!req.user){
            throw new AppError("Authentication Required", 401);
        }
        const user = await getCurrentUser(req.user.id);
        res.status(200).json({
            data : user,
        });
        
    } catch (error) {
        next(error);
    }
}
