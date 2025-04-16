import mongoose, { Schema, Document, Model } from "mongoose";
import postProps from "../types/post.type";

export interface IPost extends postProps, Document<Schema.Types.ObjectId> {
};

const PostSchema = new Schema({
    image: String,
    author: {
        type: String,
        require: [true, "Please provide an author username"],
    },
    title: String,
    body: String,
    _html: { title: String, body: String },
    catigories: [String],
    mentions: [String],
    slug: {
        type: String,
        require: [true, "Please provide post slug"],
        unique: [true, "There is a post with this slug name"],
    },
    url: {
        type: String,
        require: [true, "Please provide post url"],
        unique: [true, "There is a post with this url"],
    },
    likes: [String],
    views: [String],
    shares: [String],
    status: String,
}, { timestamps: true });


PostSchema.set("toJSON", {
    versionKey: false,
    transform: (_, ret) => {
        delete ret.__v;
        return ret;
    },
});

const Posts: Model<IPost> = mongoose.models.posts ||
    mongoose.model<IPost>("posts", PostSchema);


export default Posts;

