import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    title: {
        type: String,
        default: null
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    lastMessage: {
        type: String,
        default: ""
    },
    avt: {
        type: String,
        default: "https://res.cloudinary.com/dxj7syipc/image/upload/v1776430366/group-profile-avatar-icon-default_ercfbm.jpg"
    }

}, { timestamps: true });

export const Conversation = mongoose.model("Conversation", conversationSchema)
