import express from "express";
import type { Request, Response } from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from 'cors';

import { app, server } from "./config/socket.js"
import { connectDB } from "./config/db.js";
import { Routers } from "./routes/index.routes.js";





const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(Routers)


app.get('/', (req: Request, res: Response) =>{
    res.send("Hello PTIT")
}) 

server.listen(PORT, "0.0.0.0", () =>{
    console.log(`Server is running in ${PORT}`);
    connectDB();
} )


