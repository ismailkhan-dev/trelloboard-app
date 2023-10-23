import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Socket } from "./types/socket.interface";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import * as usersController from "./controllers/users";
import * as boardsController from "./controllers/boards";
import * as columnsController from "./controllers/columns";
import bodyParser from "body-parser";
import authMiddleware from "./middlewares/auth";
import cors from "cors";
import { SocketEventsEnum } from "./types/socketEvents.enum";
import { secret } from "./config";
import User from "./models/user";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.set("toJSON", {
    virtuals: true,
    transform: (_, converted) => {
        delete converted._id;
    },
});

/* 
    Routes
*/
app.get("/", (req, res) => {
    res.send("API is up and running");
});
app.post("/api/users", usersController.register);
app.post("/api/users/login", usersController.login);
app.get("/api/user", authMiddleware, usersController.currentUser);
app.get("/api/boards", authMiddleware, boardsController.getBoards);
app.get("/api/boards/:boardId", authMiddleware, boardsController.getBoard);
app.get(
    "/api/boards/:boardId/columns",
    authMiddleware,
    columnsController.getColumns
);
app.post("/api/boards", authMiddleware, boardsController.createBoard);

/* 
    Websocket.io
*/
io.use(async (socket: Socket, next) => {
    try {
        const token = (socket.handshake.auth.token as string) ?? "";

        const data = jwt.verify(token.split(" ")[1], secret) as {
            id: string;
            email: string;
        };

        const user = await User.findById(data.id);

        if (!user) {
            return next(new Error("Authentication error"));
        }
        socket.user = user;
        next();
    } catch (err) {
        next(new Error("Authentication error"));
        console.error(err);
    }
}).on("connection", (socket) => {
    console.log("socket.io initialization connection successful");

    socket.on(SocketEventsEnum.boardsJoin, (data) => {
        boardsController.joinBoard(io, socket, data);
    });

    socket.on(SocketEventsEnum.boardsLeave, (data) => {
        boardsController.leaveBoard(io, socket, data);
    });

    socket.on(SocketEventsEnum.columnsCreate, (data) => {
        columnsController.createColumn(io, socket, data);
    });
});

/* 
    Database
*/
mongoose
    .connect("mongodb://localhost:27017/trelloboardapp")
    .then(() => {
        let port = 4001;
        console.log("Connected to MongoDB - trelloboardapp on port 27017");

        httpServer.listen(port, () => {
            console.log(`API is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error(
            "Failed to connect to MongoDB. Please check that the Docker DB container is running."
        );
        console.error(err.message);
    });
