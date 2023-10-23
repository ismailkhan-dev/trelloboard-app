import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import ColumnModel from "../models/column";
import { Server } from "socket.io";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";
import { Socket } from "../types/socket.interface";

export const getColumns = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }

        const columns = await ColumnModel.find({ boardId: req.params.boardId });
        console.log("get all columns", columns);

        res.send(columns);
    } catch (err) {
        next(err);
    }
};

export const createColumn = async (
    io: Server,
    socket: Socket,
    data: { boardId: string; title: string }
) => {
    try {
        if (!socket.user) {
            socket.emit(
                SocketEventsEnum.columnsCreateFailure,
                "User is not authorized"
            );
            return;
        }

        const newColumn = new ColumnModel({
            title: data.title,
            boardId: data.boardId,
            userId: socket.user.id,
        });
        const savedColumn = await newColumn.save();
        io.to(data.boardId).emit(
            SocketEventsEnum.columnsCreateSuccess,
            savedColumn
        );
        console.log("savedColumn", savedColumn);
    } catch (err) {
        socket.emit(
            SocketEventsEnum.columnsCreateFailure,
            getErrorMessage(err)
        );
    }
};