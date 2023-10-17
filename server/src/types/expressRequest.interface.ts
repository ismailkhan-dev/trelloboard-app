import { Request } from "express";
import { userDocument } from "./user.interface";

export interface expressRequestInterface extends Request {
    user?: userDocument;
}
