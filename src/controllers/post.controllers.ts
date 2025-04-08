import { NextFunction, Request, Response } from "express";
import Posts from "../models/post.model";
import createError from "../utils/error";
import postProps from "../types/post.type";
import { validationResult } from "express-validator";
import { decodeHtmlEntities } from "../utils/decode";

// Get posts controller
export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const {
      status = "published",
      author,
      catigory,
      updatedAt = "-1",
      skip = 0,
      limit = 0,
    } = req.query as unknown as {
      status: string;
      author: string;
      catigory: string,
      updatedAt: string;
      skip: number;
      limit: number;
    };
    const filterBytime = updatedAt === "1" ? 1 : -1;

    const fillterPostBy = ({
      status,
      author,
    }: {
      status: string;
      author: string;
    }) => {
      if (status && author && catigory) return { status, author, catigories: { $in: [catigory] } };
      else if (status && author) return { status, author };
      else if (status && catigory) return { status, catigories: { $in: [catigory] } };
      else if (author && catigory) return { author, catigories: { $in: [catigory] } };
      else if (author) return { author, catigories: { $in: [catigory] } };
      else if (status) return { status, catigories: { $in: [catigory] } };
      else if (catigory) return { author, catigories: { $in: [catigory] } };
      else return {};
    };

    const posts: postProps[] = await Posts.find(
      fillterPostBy({ status, author })
    )
      .sort({ updatedAt: filterBytime })
      .skip(Number(skip))
      .limit(Number(limit));
    if (!posts)
      createError({ message: "Posts not found", statusCode: 404 });

    res.status(200).json({
      data: posts.map((post) => ({
        ...post,
        _html: {
          title: decodeHtmlEntities(post._html.title),
          body: decodeHtmlEntities(post._html.body),
        },
      })),
      message: "Posts fetched successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Get treading posts controller
export const getTrendingPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { skip = 0, limit = 0 } = req.query;

    const posts: postProps[] = await Posts.find({ status: "published" })
      .sort({ views: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    if (!posts)
      createError({ message: "Posts not found", statusCode: 404 });

    res.status(200).json({
      data: posts.map((post) => ({
        ...post,
        _html: {
          title: decodeHtmlEntities(post._html.title),
          body: decodeHtmlEntities(post._html.body),
        },
      })),
      message: "Trending posts fetched successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Get timeline posts controller
export const getTimelinePosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { skip = 0, limit = 0 } = req.query;
    const { timeline, userName } = req.session.user!;

    const posts: postProps[] = await Posts.find({
      author: { $in: [...timeline, userName] },
      status: "published",
    })
      .sort({ updatedAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    if (!posts)
      createError({ message: "Posts not found", statusCode: 404 });

    res.status(200).json({
      data: posts.map((post) => ({
        ...post,
        _html: {
          title: decodeHtmlEntities(post._html.title),
          body: decodeHtmlEntities(post._html.body),
        },
      })),
      message: "Timeline posts fetched successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Stream timeline posts controller
export const streamTimelinePosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { timeline } = req.session.user!;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders(); // flush the headers to establish SSE with client

    const pipeline = [{ $match: { operationType: { $in: ["insert", "update", "delete"] } } }];
    const watchPost = Posts.watch(pipeline); // watch for changes in posts collection

    watchPost.on("change", async (change) => {
      // Listen for changes and send updated posts to client
      const eventType = change.operationType;
      const post: postProps = change.fullDocument as postProps;

      if (eventType === "delete") {
        // send post id to client when post is deleted
        const _id = change.documentKey._id;
        res.write(`data: ${JSON.stringify({ eventType, post: { _id } })}\n\n`);
      } else {
        // send post to client when post is inserted or updated
        if (timeline.includes(post.author) && post.status === "published") {
          res.write(
            `data: ${JSON.stringify({
              eventType,
              post: {
                ...post,
                _html: {
                  title: decodeHtmlEntities(post._html.title),
                  body: decodeHtmlEntities(post._html.body),
                },
              },
            })}\n\n`
          );
        }
      }
    });

    watchPost.on("error", (error) => {
      // listen for errors in posts collection
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    });

    req.on("close", () => {
      // End the stream when client closes connection
      watchPost.close();
      res.end();
    });
  } catch (error) {
    next(error);
  }
};
// Get save posts controller
export const getSavePosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { skip = 0, limit = 0 } = req.query;
    const { saves } = req.session.user!;

    if (!saves.length) createError({ message: "No saves yet", statusCode: 404 });
    
    const posts: postProps[] = await Posts.find({
      _id: { $in: saves },
      status: "published",
    })
      .sort({ updatedAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    if (!posts)
      createError({ message: "Posts not found", statusCode: 404 });

    res.status(200).json({
      data: posts.map((post) => ({
        ...post,
        _html: {
          title: decodeHtmlEntities(post._html.title),
          body: decodeHtmlEntities(post._html.body),
        },
      })),
      message: "Save posts fetched successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Get single post controller
export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { id } = req.params;

    const post: postProps | null = await Posts.findById(id, {
      status: "published",
    });
    if (!post) createError({ message: "Post not found", statusCode: 404 });

    res.status(200).json({
      data: {
        ...post,
        _html: {
          title: decodeHtmlEntities(post?._html.title || ""),
          body: decodeHtmlEntities(post?._html.body || ""),
        },
      },
      message: "Post fetched successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Add Publish posts controller
export const addPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { userName } = req.session.user!;

    const image_from_multer = req.file?.filename;
    const { image, title, body, _html, slug, catigories, mentions }: postProps =
      req.body;
    const filteredSlug = slug.toLocaleLowerCase().replace(/\//g, "");

    let post = new Posts({
      title,
      body,
      _html,
      slug: filteredSlug,
      catigories,
      mentions,
      author: userName,
      image: image_from_multer || image,
      url: userName + "/" + filteredSlug,
      status: "published",
    });
    post = await post.save();
    if (!post) createError({ message: "Post not added", statusCode: 400 });

    res.status(201).json({
      data: {
        ...post,
        _html: {
          title: decodeHtmlEntities(post._html.title),
          body: decodeHtmlEntities(post._html.body),
        },
      },
      message: "Post added successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Edit posts controller
export const editPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { id } = req.params;
    const image_from_multer = req.file?.filename;
    const {
      image,
      title,
      body,
      _html,
      catigories,
      mentions,
      likes,
      views,
      shares,
      status,
    }: postProps = req.body;

    const post: postProps | null = await Posts.findByIdAndUpdate(
      id,
      {
        image: image_from_multer || image,
        title,
        body,
        _html,
        catigories,
        mentions,
        likes,
        views,
        shares,
        status,
      },
      { new: true }
    );
    if (!post) createError({ message: "Post not found", statusCode: 404 });

    res.status(200).json({
      data: {
        ...post,
        _html: {
          title: decodeHtmlEntities(post?._html.title || ""),
          body: decodeHtmlEntities(post?._html.body || ""),
        },
      },
      message: "Post updated successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Delete posts controller
export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { id } = req.params;
    const post = await Posts.findByIdAndDelete(id);
    if (!post) createError({ message: "Post not found", statusCode: 404 });

    res.status(200).json({
      data: post,
      message: "Post deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
