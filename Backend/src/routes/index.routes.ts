import { Router } from "express";
import { userRouters } from "./user.routes.js";
import { messageRouters } from "./message.routes.js";

export const Routers: Router = Router();

Routers.use('/user' ,userRouters);
Routers.use('/message', messageRouters);