import { createServer } from "http";
import express from 'express';
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true,
        methods: ["PUT", "POST", "GET", "DELETE", "PATCH"],
    }
})

const onlineUsers = new Map<string, Set<string>>()

io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId as string;
    if(userId){
        if(!onlineUsers.has(userId)){
            onlineUsers.set(userId, new Set([socket.id]));
            console.log("A user connected: ", socket.id);
            socket.join(userId);
        }else{
            onlineUsers.get(userId)!.add(socket.id);
        }
    }
    socket.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${userId} joined room: ${conversationId}`);
    });


    socket.on("leaveConversation", (conversationId) => {
        socket.leave(conversationId);
        console.log(`User ${userId} left room: ${conversationId}`);
    });

    socket.on("disconnect", () => {
        if (userId) {
            onlineUsers.delete(userId);
            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()))
        }
        console.log("A user disconnected: ", socket.id)
    })


})

export {app, io, server};