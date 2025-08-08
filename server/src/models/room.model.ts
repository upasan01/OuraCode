// mongoose schema for room model

import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";

export interface userRoom extends Document {
    roomId: string | null;
    language: string;
    username: string;
    users: ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const roomSchema: Schema<userRoom> = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },
        language: {
            type: String,
            required: true,
        },
        roomId: {
            type: String,
            sparse: true,
        },
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: "User" 
            }
        ]
    },
    {
        timestamps: true
    }
)

roomSchema.index({ roomId: 1, username: 1 }, { unique: true })
const Room: Model<userRoom> = mongoose.model<userRoom>("Room", roomSchema)
export default Room