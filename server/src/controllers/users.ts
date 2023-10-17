import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user";
import { userDocument } from "../types/user.interface";
import { Error } from "mongoose";
import jwt from "jsonwebtoken";
import { secret } from "../config";

const normalizeUser = (user: userDocument) => {
    const token = jwt.sign({ id: user, email: user.email }, secret);
    return {
        email: user.email,
        username: user.username,
        id: user._id,
        token,
    };
};

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const newUser = new UserModel({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
        });

        const savedUser = await newUser.save();
        res.send(normalizeUser(savedUser));
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            const messages = Object.values(err.errors).map(
                (err) => err.message
            );
            return res.status(422).json(messages);
        }
        next(err);
    }
};
