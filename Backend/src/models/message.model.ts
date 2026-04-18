import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    text: {
        type: String,
    },
    image: {
        type: String
    },
    seenBy: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }

}, { timestamps: true })

export const Messages = mongoose.model("Message", messageSchema);