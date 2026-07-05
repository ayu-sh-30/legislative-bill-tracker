import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "../middleware/error.middleware";
import { prisma } from "../config/prisma";


const PASSWORD_SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = "7d" as const;

export type SignupInput = {
    name? : string;
    email : string;
    password : string;
};

export type LoginInput = {
    email : string;
    password : string;
};

function createToken(user: { id: string; email: string }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

function toSafeUser(user : {id : string, name : string | null, email: string, createdAt : Date}) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt : user.createdAt,
    };
}

export async function signup(input : SignupInput) {
    const existingUser = await prisma.user.findUnique({
        where : {
            email: input.email,
        },
    });

    if(existingUser){
        throw new AppError("User already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

    const user = await prisma.user.create({
        data : {
            name : input.name,
            email : input.email,
            passwordHash,
        }
    });

    const token =  createToken(user);

    return {
        user : toSafeUser(user),
        token,
    };
}

export async function login(input : LoginInput) {
    const user = await prisma.user.findUnique({
        where : {
            email : input.email,
        }
    });

    if(!user){
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if(!isPasswordValid){
        throw new AppError("Invalid email or password", 401);
    }

    const token = createToken(user);
    return {
        user : toSafeUser(user),
        token,
    };
}

export async function getCurrentUser(userId : string) {
    const user = await prisma.user.findUnique({
        where : {
            id : userId,
        },
        select : {
            id: true,
            name: true,
            email: true,
            createdAt : true,
            updatedAt : true,
        },
    });

    if(!user){
        throw new AppError("Authenticated User no longer exist", 401);
    }

    return user;
}
