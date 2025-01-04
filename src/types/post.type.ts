import mongoose from "mongoose";

type postProps = {
    _id:  mongoose.Schema.Types.ObjectId,
    image: string,
    author: string,
    title:  string,
    body: string,
    _html: { title: string, body: string },
    catigories: string[],
    mentions: string[],
    slug: string,
    url: string,
    likes: string[],
    views: string[],
    shares: string[],
    status: string,
    updatedAt: Date,
    createdAt: Date,
};

export default postProps;