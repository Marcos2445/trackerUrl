import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    createdAt: { type: Date, required: true, default: Date.now}
})

export const UserModel = mongoose.model('users', UserSchema)
