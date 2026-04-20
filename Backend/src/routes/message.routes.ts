import { Router } from "express";
import { authUser } from "../middlewares/auth.middlewares";
import  Message  from '../controllers/message.controller';
import upload from "../middlewares/upload.middlewares";
export const messageRouters: Router = Router();

messageRouters.post('/createGroup', authUser, Message.createGroup);
messageRouters.post('/addMember', authUser, Message.addMember);
messageRouters.get('/getGroup', authUser, Message.getGroup);
messageRouters.get('/:conversationId', authUser, Message.getMessages);
messageRouters.post('/send', authUser, upload.single("media"), Message.sendMessage);
messageRouters.post('/markSeen', authUser, Message.markAsSeen);