import { Request, Response } from "express";
import { Users } from "../models/user.model";
import bcrypt from 'bcrypt';
import { generateRefreshToken, generateToken, verifyToken } from "../services/jwt";



class User {
    // Đăng ký
    async register(req: Request, res: Response){
        try{
            const { email, password, phone, fullName } = req.body;
            if( !email || !password || !phone || !fullName){
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin"});
            }

            if( password.length < 6){
                return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 kí tự"})
            }
            
            const user  = await Users.findOne({ email });
            if(user){
                return res.status(400).json({ message: "Tài khoản đã tồn tại"});
            }

            const salt  = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await Users.create({
                email,
                password: hashedPassword,
                phone, 
                fullName
            });

            const accessToken = generateToken({ userId: newUser.id });
            const refreshToken = generateRefreshToken({ userId: newUser.id});

            res.cookie("accessToken", accessToken, {
                maxAge: 1 * 60 * 60 * 1000, 
                httpOnly: true, 
                sameSite: "strict", 
            });

            res.cookie("refreshToken", refreshToken, {
                maxAge: 7 * 24 * 60 * 60 * 1000, 
                httpOnly: true, 
                sameSite: "strict",
            });
            
            return res.status(201).json({ message: "Tạo tài khoản thành công", data: {newUser, accessToken, refreshToken}})

        }catch(err: any){
            console.log(err);
            return res.status(500).json({ message: "Lỗi server khi đăng ký" });

        }
    }
    
    // Đăng nhập
    async login(req: Request, res: Response){
        try{
            const { email, password } = req.body;

            if( !email || !password){
                return res.status(400).json({ message: "Hãy nhập tài khoản mật khẩu của bạn" })
            }
            const user = await Users.findOne({email})
            if(!user || !user.password || (! await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không chính xác"});
            }

            const accessToken = generateToken({ userId: user.id })
            const refreshToken = generateRefreshToken({ userId: user.id})


            res.cookie("accessToken", accessToken, {
                maxAge: 1 * 60 * 60 * 1000, 
                httpOnly: true, 
                sameSite: "strict", 
            });

            res.cookie("refreshToken", refreshToken, {
                maxAge: 7 * 24 * 60 * 60 * 1000, 
                httpOnly: true, 
                sameSite: "strict",
            });

            return res.status(200).json({ message: "Đăng nhập thành công", accessToken, refreshToken, user });

        }catch(err: any){
            console.log(err);
            return res.status(500).json({ message: "Lỗi server ", err})     
        }
    }

    // Check Refresh Token
    async refreshToken(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ message: "Vui lòng đăng nhập" });
            }

            const decoded = verifyToken(refreshToken);
            if (!decoded) {
                return res.status(403).json({ message: "Token không hợp lệ" });
            }

            const newAccessToken = generateToken({ userId: decoded.userId });

            res.cookie("accessToken", newAccessToken, {
                maxAge: 1 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
            });

            return res.status(200).json({ accessToken: newAccessToken });
        } catch (err: any) {
            console.log(err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Đăng xuất
    async logout(req: Request, res: Response) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(200).json({ message: "Đăng xuất thành công" });
    }
}