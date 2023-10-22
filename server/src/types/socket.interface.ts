import { Socket as SocketIoSocket } from "socket.io";
import { userDocument } from "./user.interface";

export interface Socket extends SocketIoSocket {
    user?: userDocument;
}
