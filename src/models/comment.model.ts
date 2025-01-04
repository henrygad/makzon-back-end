import mongoose, { Schema, Document, Model } from "mongoose";
import commentProps from "../types/comment.type";

export interface IComment extends commentProps, Document<Schema.Types.ObjectId> {
};

const commentSchema = new Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, require: [true, "Please provide a comment id"] },
    commentParentId: { type: mongoose.Schema.Types.ObjectId, ref: "comments", default: null },
    author: {
        type: String,
        require: [true, "Please provide an author username"],
    },
    body: { _html: String, text: String },
    url: {
        type: String,
        require: [true, "Please provide comment url"],
        unique: [true, "There is a comment with this url"],
    },
    replingTo: [String],
    likes: [String],
}, { timestamps: true });

const Comments: Model<IComment> = mongoose.models.comments ||
    mongoose.model<IComment>("comments", commentSchema);


export default Comments;

