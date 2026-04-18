import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/jwt";

export const authUser = async (req: Request, res: Response, next: NextFunction ) => {
    try{
        const token = req.cookies.accessToken;

        if(!token){
            return res.status(401).json({ message: "Vui lòng đăng nhập"});
        }
        const decode = verifyToken(token);
        if(!decode){
            return res.status(401).json({ message: "Token không hợp lệ"});
        }
        req.user = decode;
        return next();
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Lỗi xác thực người dùng" });
    }
}