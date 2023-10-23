import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import TaskModel from "../models/task";
import { Server } from "socket.io";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { getErrorMessage } from "../helpers";
import { Socket } from "../types/socket.interface";

export const getTasks = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }

        const tasks = await TaskModel.find({ boardId: req.params.boardId });
        console.log("get all tasks", tasks);

        res.send(tasks);
    } catch (err) {
        next(err);
    }
};

export const createTask = async (
    io: Server,
    socket: Socket,
    data: { boardId: string; title: string; columnId: string }
) => {
    try {
        if (!socket.user) {
            socket.emit(
                SocketEventsEnum.tasksCreateFailure,
                "User is not authorized"
            );
            return;
        }

        const newTask = new TaskModel({
            title: data.title,
            boardId: data.boardId,
            userId: socket.user.id,
            columnId: data.columnId,
        });
        const savedTask = await newTask.save();
        io.to(data.boardId).emit(
            SocketEventsEnum.tasksCreateSuccess,
            savedTask
        );
        console.log("savedColumn", savedTask);
    } catch (err) {
        socket.emit(SocketEventsEnum.tasksCreateFailure, getErrorMessage(err));
    }
};
