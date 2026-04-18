import { Request, Response } from "express";
import { Messages } from "../models/message.model";
import { Conversation } from "../models/conversation.model";
import { Types } from "mongoose";
import { uploadStream } from "../services/upload";
import { io } from "../config/socket";
import { Users } from "../models/user.model";


class Message{

    // Lấy tin nhắn từ 1 cuộc hội thoại
    async getMessages(req: Request, res: Response){
        try{
            const { conversationId } = req.params;
            const messages = await Messages.find({conversationId});

            return res.status(200).json({ message: "Lấy  tin nhắn thành công", data: messages })

        }catch(err: any){
            console.log(err)
            return res.status(500).json({ message: "Lỗi khi lấy tin nhắn", err });
        }
    }

    // Lấy các nhóm đang join
    async getGroup(req: Request, res: Response){
        try{
            const myId = req.user?.userId;
            const myGroup = await Conversation.find({
                participants: { $in: [new Types.ObjectId(myId)]}
            }).populate("participants", "fullName avt")
            return res.status(200).json({ message: "Lấy các nhóm thành công", data: myGroup });

        }catch(err: any){
            console.log(err)
            return res.status(500).json({ message: "Lỗi khi lấy nhóm", err });
        }
    }

    // Tạo nhóm
    async createGroup(req: Request, res: Response){
        try{
            const adminId = req.user?.userId;
            const { friendId, title } = req.body;

            let newConversation =  await Conversation.create({
                    isGroup: true,
                    title,
                    groupAdmin: adminId,
                    participants: Array.from(new Set([adminId, ...friendId]))
            });

            newConversation = await newConversation.populate("participants", "fullName avt");

            return res.status(201).json({ message: "Tạo nhóm thành công", data: newConversation});
            
        }catch(err: any){
            console.log(err);
            return res.status(500).json({ message: "Lỗi khi Tạo nhóm", err });
        }
    }

    // Gửi tin nhắn
    async sendMessage(req: Request, res: Response){
        try{
            const myId = req.user?.userId;
            const { friendId, text, conversationId } = req.body;

            let conversation;
            if(conversationId){
                conversation =await Conversation.findById(conversationId);
            }

            if(!conversation){
                conversation = await Conversation.create({
                    participants: Array.from(new Set([myId, ...friendId]))
                })
            }

            let image;
            if(req.file){
                const upload = await uploadStream(req.file.buffer);
                image = upload.secure_url;
            };

            if(!text && !image){
                return res.status(400).json({ message: "Tin nhắn không được để trống"});
            }

            const newMessage = await Messages.create({
                senderId: myId,
                conversationId: conversation._id,
                text,
                image,
                seenBy: [new Types.ObjectId(myId)]
            })

            conversation.lastMessage = text || "Hình ảnh";

            await conversation.save();

            const targetRooms = [
                conversation._id.toString(),
                ...conversation.participants.map((p: any) => p.toString())
            ];

            // Socket.io sẽ tự động gộp socketId trong mảng trên
            io.to(targetRooms).emit("newMessage", newMessage);

            return res.status(201).json({ message: "Gửi tin nhắn thành công", data: newMessage});

        }catch(err: any){
            console.log(err);
            return res.status(500).json({ message: "Lỗi khi gửi tin nhắn", err });
        }
    }

    // Tính năng đánh dấu đã đọc
    async markAsSeen(req: Request, res: Response){
        try{
            const myId = req.user?.userId;
            const { conversationId } = req.body;
            const user = await Users.findById(myId);
            const myAvt = user?.avt;

            
            const update = await Messages.updateMany({ 
                conversationId,
                seenBy: { $ne: new Types.ObjectId(myId)} 
            }, {
                $addToSet: { seenBy: new Types.ObjectId(myId)}
            } )

            io.to(conversationId).emit("messageSeen", { conversationId, myId, myAvt});

            return res.status(200).json({ message: "Đánh dấu đã đọc thành công", data: update});
        }catch(err: any){
            console.log(err);
            return res.status(500).json({ message: "Lỗi khi đánh dấu", err});
        }
    }
}

export default new Message();