// mongoose schema for room model

import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";
import { userInfo } from "os";

export interface userRoom extends Document {
    roomId: string | null;
    language: string;
    username: string;
    createdAt: Date;
}

const roomSchema: Schema<userRoom> = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        language: {
            type: String,
            required: true,
        },
        roomId: {
            type: String,
            sparse: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
)

const Room: Model<userRoom> = mongoose.model<userRoom>("Room", roomSchema)
export default Room