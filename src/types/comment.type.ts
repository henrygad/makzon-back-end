import mongoose from "mongoose";

type commentProps = {
    _id: mongoose.Schema.Types.ObjectId,
    author: string,
    body: { _html: string, text: string },
    postId: mongoose.Schema.Types.ObjectId,
    commentParentId: mongoose.Schema.Types.ObjectId,
    urlIds: string, 
    replingTo: string[],
    likes: string[],    
};

export default commentProps;