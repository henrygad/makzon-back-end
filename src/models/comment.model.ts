import mongoose, { Schema, Document, Model } from "mongoose";
import commentProps from "../types/comment.type";

export interface IComment extends commentProps, Document<Schema.Types.ObjectId> {
};

const commentSchema = new Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        require: [true, "Please provide a comment id"]
    },
    replyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
        default: null
    },
    author: {
        type: String,
        require: [true, "Please provide an author username"],
    },
    body: { _html: String, text: String },
    url_leading_to_comment_parent: {
        type: String,
        require: [true, "Please provide comment url"],
    },    
    replingTo: {
        type: [String],
        require: [true, "Please provide a reply to"]
    },
    likes: [String],
}, { timestamps: true });

const Comments: Model<IComment> = mongoose.models.comments ||
    mongoose.model<IComment>("comments", commentSchema);


export default Comments;

