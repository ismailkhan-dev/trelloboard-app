import { Response, NextFunction } from "express";
import BoardModel from "../models/board";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Server, Socket } from "socket.io";

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
        console.log("get all boards", boards);

        res.send(boards);
    } catch (err) {
        next(err);
    }
};

export const getBoard = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }

        const board = await BoardModel.findById(req.params.boardId);
        // console.log("get single board", board);

        res.send(board);
    } catch (err) {
        next(err);
    }
};

export const createBoard = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }

        const newBoard = new BoardModel({
            title: req.body.title,
            userId: req.user.id,
        });

        const savedBoard = await newBoard.save();

        console.log("create a board", savedBoard);

        res.send(savedBoard);
    } catch (err) {
        next(err);
    }
};

export const joinBoard = (
    io: Server,
    socket: Socket,
    data: { boardId: string }
) => {
    console.log("joinBoard server socket.io join", data.boardId);
    socket.join(data.boardId);
};

export const leaveBoard = (
    io: Server,
    socket: Socket,
    data: { boardId: string }
) => {
    console.log("leaveBoard server socket.io leave", data.boardId);
    socket.leave(data.boardId);
};
