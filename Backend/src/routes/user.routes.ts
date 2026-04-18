import { Router } from "express";

import User from '../controllers/user.controller';
import { authUser } from "../middlewares/auth.middlewares.js";
import upload from "../middlewares/upload.middlewares.js";

export const userRouters: Router = Router();

userRouters.post("/register", User.register);
userRouters.post("/login", User.login);
userRouters.post("/logout", User.logout);
userRouters.post("/refresh-token", User.refreshToken);
userRouters.get("/check", authUser ,User.checkAuth);
userRouters.put("/update-profile", authUser, upload.single('media') , User.updateProfile);

userRouters.get('/search', authUser, User.searchUser);
userRouters.post("/sendRequest", authUser, User.sendFriendRequest);
userRouters.post('/acceptRequest', authUser, User.acceptRequest);
userRouters.post('/rejectRequest', authUser, User.rejectRequest);
userRouters.delete('/unfriend', authUser, User.unfriend);

userRouters.get('/getFriendRequests', authUser, User.getFriendRequests);
userRouters.get('/getFriendList', authUser, User.getFriends);
