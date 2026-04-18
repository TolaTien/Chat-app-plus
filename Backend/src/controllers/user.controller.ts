import { Request, Response } from "express";
import { Users } from "../models/user.model";
import bcrypt from 'bcrypt';
import { generateRefreshToken, generateToken, verifyToken } from "../services/jwt";
import { uploadStream } from "../services/upload";
import { friendRequests } from "../models/friendRequest.model";
import { getSocketId, io } from "../config/socket";
import { Types } from "mongoose";



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

    // Check trạng thái
    async checkAuth(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;

            const user = await Users.findById(userId).select("-password");

            return res.status(200).json(user);
        } catch (err) {
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Update profile
    async updateProfile(req: Request, res: Response) {
        try {

            const userId = req.user?.userId;
            const user = await Users.findById(userId);
            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

            const { email, phone, fullName } = req.body;

            const update: any = {};
            if (email && email !== user.email) { 
                const existingUser = await Users.findOne({ email, _id: { $ne: userId } });
                if (existingUser) {
                    return res.status(400).json({ message: "Email này đã được sử dụng bởi người khác" });
                }
                update.email = email;
            }
            if (phone) update.phone = phone;
            if (fullName) update.fullName = fullName;

            if (req.file) {
                if (!req.file.mimetype.startsWith("image")) {
                    return res.status(400).json({
                        message: "Vui lòng chỉ tải lên ảnh!"
                    });
                }
        
                const upload = await uploadStream(req.file.buffer);
                update.avt = upload.secure_url;
            }

            if (Object.keys(update).length === 0) {
                return res.status(400).json({ message: "Không có thông tin nào được yêu cầu cập nhật!" });
            }

            const updateUser = await Users.findByIdAndUpdate(userId, update, { new: true }).select("-password");
            
            return res.status(200).json({ message: "Cập nhật thông tin thành công!", data: updateUser 
            });

        } catch (err: any) {
            console.log("Cập nhật thông tin thất bại:", err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Tìm kiếm bạn bè
    async searchUser(req: Request, res: Response){
        try{
            const { fullName } = req.query;
            const myId = req.user?.userId;
            const users = await Users.find({ _id: { $ne: myId }, fullName: { $regex: fullName as string, $options: "i" }}).select("-password");
            if( users.length === 0){
                return res.status(400).json({ message: "Không tìm thấy người dùng"});
            }

            return res.status(200).json({ message: "Tìm kiếm người dùng thành công", data: users });
        }catch(err: any){
            console.log(err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Gửi kết bạn
    async sendFriendRequest(req: Request, res: Response){
        try{
            const myId = req.user?.userId;
            const { friendId } = req.body;

            const user = await Users.findById(myId);
            const friend = await Users.findById( friendId );

            if( !user || !friend){
                return res.status(400).json({ message: "Người dùng không tồn tại"});
            }
            if( user.friendList.includes(friendId)){
                return res.status(400).json({ message: "Hai người đã là bạn bè"});
            }
            const existRequest = await friendRequests.findOne({
                senderId: myId, receiverId: friendId,
                status: "pending"
            });

            if(existRequest){
                return res.status(400).json({ message: "Bạn đã gửi lời mời kết bạn trước đó" })
            }

            const newRequest = await friendRequests.create({
                senderId: myId,
                receiverId: friendId,
                status: "pending"
            });

            const friendIdSocket = getSocketId(friendId);
            if(friendIdSocket){
                io.to(Array.from(friendIdSocket)).emit("newFriendRequest", user)
            }
            return  res.status(201).json({ message: "Đã gửi lời mời kết bạn", data: newRequest});

        }catch(err: any){
            console.log(err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Chấp nhận kết bạn
    async acceptRequest(req: Request, res: Response){
        try{
            const myId = req.user?.userId;
            if (!myId) {
                return res.status(401).json({ message: "Vui lòng đăng nhập" });
            }
            const { friendId } = req.body;

            const user = await Users.findById(myId);
            const friend = await Users.findById( friendId );

            if( !user || !friend){
                return res.status(400).json({ message: "Người dùng không tồn tại"});
            }

            const request = await friendRequests.findOneAndUpdate({senderId: friendId, receiverId: myId, status: "pending"}, {status: "accepted"}, { returnDocument: 'after'})
            if(!request){
                return res.status(400).json({ message: "Yêu cầu không tồn tại"});
            }
            if( user.friendList.includes(friendId)){
                return res.status(400).json({ message: "Hai người đã là bạn bè"});
            }

            user.friendList.push(friendId);
            friend.friendList.push(new Types.ObjectId(myId));

            await user.save();
            await friend.save();

            const myIdSocket = getSocketId(friendId);
            if(myIdSocket){
                io.to(Array.from(myIdSocket)).emit("friendRequestAccepted", user)
            }

            return res.status(200).json({ message: "Kết bạn thành công" });
        }catch(err: any){
            console.log(err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Từ chối kết bạn
    async rejectRequest(req: Request, res: Response){
        try{
            const myId = req.user?.userId;
            const { friendId } = req.body;

            const user = await Users.findById(myId);
            const friend = await Users.findById( friendId );

            if( !user || !friend){
                return res.status(400).json({ message: "Người dùng không tồn tại"});
            }

            const request = await friendRequests.findOneAndUpdate({senderId: friendId, receiverId: myId, status: "pending"}, {status: "rejected"}, { returnDocument: 'after'})
            if(!request){
                return res.status(400).json({ message: "Yêu cầu không tồn tại"});
            }

            return res.status(200).json({ message: "Đã từ chối lời mời" });           
        }catch(err: any){
            console.log(err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Xóa kết bạn 
    async unfriend(req: Request, res: Response){
        try{
            const myId = req.user?.userId;
            const { friendId } = req.body;

            const user = await Users.findById(myId);
            const friend = await Users.findById( friendId );
            if( !user || !friend){
                return res.status(400).json({ message: "Người dùng không tồn tại"});
            }

            user.friendList = user.friendList.filter(id => id.toString() !== friendId);
            friend.friendList = friend.friendList.filter(id => id.toString() !== myId);
            await user.save();
            await friend.save();
            return res.status(200).json({ message: "Xóa kết bạn thành công" });           

        }catch(err: any){
            console.log(err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Lấy danh sách lời mời kết bạn
    async getFriendRequests(req: Request, res: Response) {
        try {
            const myId = req.user?.userId;

            const requests = await friendRequests.find({ receiverId: myId, status: "pending"}).populate("senderId", "fullName avt");
            
            if (requests.length === 0) return res.status(200).json({ message: "Bạn không có lời mời kết bạn nào mới", data: [] });

            return res.status(200).json({ message: "Lấy danh sách lời mời thành công" , data: requests });
        } catch (err: any) {
            console.log("Lấy danh sách lời mời thất bại", err.message);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

    // Lấy danh sách bạn bè
    async getFriends(req: Request, res: Response) {
        try {
            const myId = req.user?.userId;
            const user = await Users.findById(myId).populate("friendList", "fullName userName avt _id");

            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

            return res.status(200).json(user.friendList);
        } catch (err: any) {
            console.log(err.message);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }


}

export default new User();