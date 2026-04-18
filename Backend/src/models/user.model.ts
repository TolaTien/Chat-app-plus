import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    avt: {
        default: null,
        type: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    oauthProviders: [{
        provider:{ type: String, enum: ["google", "facebook"]},
        providerId: {
            type: String
        }
    }],
    friendList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}]


},
    { timestamps: true }
)

export const Users =  mongoose.model("User", userSchema);