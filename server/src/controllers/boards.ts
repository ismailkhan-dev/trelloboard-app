import { Response, NextFunction } from "express";
import BoardModel from "../models/board";
import { ExpressRequestInterface } from "../types/expressRequest.interface";

export const getBoards = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }

        const boards = await BoardModel.find({ userId: req.user.id });
        console.log("boards", boards);

        res.send(boards);
    } catch (err) {
        next(err);
    }
};
