import mongoose, { Schema, Document, Model} from "mongoose";
import postProps from "../types/post.type";

export interface IDraft extends postProps, Document<Schema.Types.ObjectId> {
};

const DraftSchema = new Schema({
    publishedId: {
        type: mongoose.Schema.Types.ObjectId || undefined,
        default: undefined
        
    },
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
    status: String,
}, { timestamps: true });

const Drafts: Model<IDraft> = mongoose.models.drafts ||
    mongoose.model<IDraft>("drafts", DraftSchema);


export default Drafts;

