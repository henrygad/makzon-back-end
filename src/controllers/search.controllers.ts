import { NextFunction, Request, Response } from "express";
import createError from "../utils/error";
import Posts from "../models/post.model";
import Users from "../models/user.model";
import { decodeHtmlEntities } from "../utils/decode";
import postProps from "../types/post.type";
import userProps from "../types/user.type";
import { validationResult } from "express-validator";
import { Session } from "express-session";

interface CustomSession extends Session {
  searchHistory?: { _id: string, search: string }[]
}
interface CustomRequest extends Request {
  session: CustomSession;
}

// Search user and post controller
export const search = async (
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
      title,
      body,
      catigory,
      userName,
      skip = 0,
      limit = 0,
      updatedAt,
    } = req.query;

    const post = []; // Post array for search conditions logic
    if (title) post.push({ title: { $regex: title, $options: "i" } });
    if (body) post.push({ body: { $regex: body, $options: "i" } });
    if (catigory)
      post.push({ catigories: { $regex: catigory, $options: "i" } });

    const user = []; // User array for search conditions logic
    if (userName) user.push({ userName: { $regex: userName, $options: "i" } });

    const filterByTime = updatedAt === "1" ? 1 : -1;

    const posts: postProps[] = await Posts.find({
      $or: post,
      status: "published",
    })
      .skip(skip ? Number(skip) : 0)
      .limit(limit ? Number(limit) : 0)
      .sort({ updatedAt: filterByTime });

    const users: userProps[] = await Users.find({ $or: user })
      .skip(skip ? Number(skip) : 0)
      .limit(limit ? Number(limit) : 0)
      .sort({ updatedAt: filterByTime })
      .select(
        "-password -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v"
      );
    if (!posts.length && !users.length)
      createError({ statusCode: 404, message: "No search results found" });

    res.status(200).json({
      message: "Search results found",
      data: {
        users,
        posts: posts.map((post) => ({
          ...post,
          _html: {
            title: decodeHtmlEntities(post._html.title),
            body: decodeHtmlEntities(post._html.body),
          },
        })),
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Get search history
export const getSearchHistoris = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { session } = req;
  if (session.searchHistory && session.searchHistory.length) {
    const { searchHistory } = session;

    res.status(200).json({
      message: "Search history retrieved successfully",
      data: searchHistory,
      success: true,
    });
  } else {
    next(createError({ statusCode: 404, message: "No search history found" }));
  }
};
// Add new search history
export const addSearchHistory = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty())
    next(createError({ message: errors.array()[0].msg, statusCode: 422 }));

  const { searched } = req.body;

  if (typeof req.session.searchHistory !== "object") {
    req.session.searchHistory = [{ _id: "", search: "" }];
  }
  const { searchHistory } = req.session;

  if (!searchHistory?.find((history) => history.search === searched)) {
    searchHistory.push({
      _id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
      search: searched,
    });
    req.session.save();
  }

  res.status(201).json({
    message: "Search history updated",
    data: searchHistory.find((history) => history.search === searched),
    success: true,
  });
};
// Delete search history
export const deleteSearchHistory = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { id } = req.params;
    const { searchHistory } = req.session;

    if (!searchHistory?.find((history) => history._id === id))
      createError({
        statusCode: 404,
        message: "Search history item not found",
      });
    req.session.searchHistory = searchHistory?.filter(
      (history) => history._id !== id
    );
    req.session.save();

    res.status(200).json({
      message: "Search history item deleted",
      data: { _id: id },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
