import { Request } from "express";
import { userDocument } from "./user.interface";

export interface ExpressRequestInterface extends Request {
    user?: userDocument;
}
