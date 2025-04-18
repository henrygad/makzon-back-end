import mongoose from "mongoose";

type commentProps = {
    _id: mongoose.Schema.Types.ObjectId,
    postId: mongoose.Schema.Types.ObjectId,
    replyId: mongoose.Schema.Types.ObjectId | null,
    children: commentProps[],
    author: string,
    body: { _html: string, text: string },
    url_leading_to_comment_parent: string, 
    replyingTo: string[],
    likes: string[],    
};

export default commentProps;