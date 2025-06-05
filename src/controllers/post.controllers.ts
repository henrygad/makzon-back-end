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
      status,
      author,
      updatedAt = "-1",
      skip = 0,
      limit = 0,
    } = req.query as unknown as {
      status: string;
      author: string;
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
      if (status && author) return { status, author };
      else if (author) return { author };
      else if (status) return { status };
      else return {};
    };

    const posts = await Posts.find(
      fillterPostBy({ status, author })
    )
      .sort({ updatedAt: filterBytime })
      .skip(Number(skip))
      .limit(Number(limit));
    if (!posts) createError({ message: "Posts not found", statusCode: 404 });
    const getPosts = posts.map(post => post.toObject());

    res.status(200).send({
      data: getPosts
        .map((post) => ({
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
// Get single post controller
export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { author, slug } = req.params;

    const post = await Posts.findOne({ author, slug: decodeHtmlEntities(slug) });
    if (!post) return createError({ message: "Post not found", statusCode: 404 });
    const getPost = post.toObject();

    res.status(200).json({
      data: {
        ...getPost,
        _html: {
          title: decodeHtmlEntities(getPost._html.title),
          body: decodeHtmlEntities(getPost._html.body),
        },
      },
      message: "Post fetched successfully",
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

    const posts = await Posts.find({ status: "published" })
      .sort({ views: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    if (!posts) return createError({ message: "Posts not found", statusCode: 404 });
    const getPosts = posts.map(post => post.toObject());

    res.status(200).json({
      data: getPosts.map((post) => ({
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

    const posts = await Posts.find({
      author: { $in: [...timeline, userName] },
      status: "published",
    })
      .sort({ updatedAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    if (!posts) createError({ message: "Posts not found", statusCode: 404 });
    const getPosts = posts.map(post => post.toObject());

    res.status(200).json({
      data: getPosts.map((post) => ({
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
    const { timeline, userName } = req.session.user!;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders(); // flush the headers to establish SSE with client

    const pipeline = [
      { $match: { operationType: { $in: ["insert", "update", "delete"] } } },
    ];
    const watchPost = Posts.watch(pipeline); // watch for changes in posts collection

    watchPost.on("change", async (change) => {
      // Listen for changes and send updated posts to client
      const eventType = change.operationType as string;
      const post = change.fullDocument as postProps;

      if (post) {
        if (eventType === "delete") {
          // send post id to client when post is deleted
          const _id = change.documentKey._id;
          res.write(`data: ${JSON.stringify({ eventType, post: { _id } })}\n\n`);
        } else {
          // send post to client when post is inserted or updated
          if ([userName, ...timeline].includes(post.author) && post.status === "published"
          ) {
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

    if (!saves.length)
      createError({ message: "No saves yet", statusCode: 404 });

    const posts = await Posts.find({
      _id: { $in: saves },
      status: "published",
    })
      .sort({ updatedAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    if (!posts) createError({ message: "Posts not found", statusCode: 404 });
    const getPosts = posts.map(post => post.toObject());

    res.status(200).json({
      data: getPosts.map((post) => ({
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

// Get posts controller
export const getUserPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const user = req.session.user!;
    const { skip = 0, limit = 0 } = req.query as unknown as { skip: number; limit: number };

    const posts = await Posts.find({ author: user.userName })
      .sort({ updatedAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    if (!posts) createError({ message: "No User posts was found", statusCode: 404 });
    const getPosts = posts.map(post => post.toObject());

    res.status(200).send({
      data: getPosts
        .map((post) => ({
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

    // Parse request body
    for (const key in req.body) {
      let value: string = req.body[key];
      try {
        value = JSON.parse(value);
      } catch {
        createError({ message: "Invalid JSON data. Please provide only json data", statusCode: 422 });
      }
      req.body[key] = value;
    }

    const image_from_multer = req.file?.filename;
    const { image, title, body, _html, slug, catigories, mentions }: postProps = req.body;
    const filteredSlug = slug.toLowerCase().replace(/\//g, "-");

    const post = await Posts.create({
      author: userName,
      title,
      image: image_from_multer || image,
      body,
      _html,
      slug: filteredSlug,
      catigories,
      mentions,
      url: userName + "/" + filteredSlug,
      status: "published",
      likes: [],
      views: [],
      shares: [],
    });
    if (!post) createError({ message: "Post not added", statusCode: 400 });
    const getPost = post.toObject();

    res.status(201).json({
      data: {
        ...getPost,
        _html: {
          title: decodeHtmlEntities(getPost._html.title),
          body: decodeHtmlEntities(getPost._html.body),
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

    // Parse request body
    for (const key in req.body) {
      let value: string = req.body[key];
      try {
        value = JSON.parse(value);
      } catch {
        createError({ message: "Invalid JSON data. Please provide only json data", statusCode: 422 });
      }
      req.body[key] = value;
    }

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

    const post = await Posts.findByIdAndUpdate(
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
    if (!post) return createError({ message: "Post not found", statusCode: 404 });
    const getPost = post.toObject();

    res.status(200).json({
      data: {
        ...getPost,
        _html: {
          title: decodeHtmlEntities(getPost._html.title),
          body: decodeHtmlEntities(getPost._html.body),
        },
      },
      message: "Post updated successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Partialy edit post
export const partialEditPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) return createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { id } = req.params;

    const {
      likes,
      views,
      shares,
      status,
    }: postProps = req.body;

    const post = await Posts.findByIdAndUpdate(
      id,
      {
        likes,
        views,
        shares,
        status,
      },
      { new: true }
    );
    if (!post) return createError({ message: "Post not found", statusCode: 404 });
    const getPost = post.toObject();

    res.status(200).json({
      data: {
        ...getPost,
        _html: {
          title: decodeHtmlEntities(getPost._html.title),
          body: decodeHtmlEntities(getPost._html.body),
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
