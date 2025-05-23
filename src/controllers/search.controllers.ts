import { NextFunction, Request, Response } from "express";
import createError from "../utils/error";
import Posts from "../models/post.model";
import Users from "../models/user.model";
import { decodeHtmlEntities } from "../utils/decode";
import { validationResult } from "express-validator";

// Search user and post controller
export const search = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

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

    const posts = await Posts.find({
      $or: post,
      status: "published",
    })
      .skip(skip ? Number(skip) : 0)
      .limit(limit ? Number(limit) : 0)
      .sort({ updatedAt: filterByTime });

    const users = await Users.find({ $or: user })
      .skip(skip ? Number(skip) : 0)
      .limit(limit ? Number(limit) : 0)
      .sort({ updatedAt: filterByTime })
      .select(
        "-password -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v"
      );
    if (!posts && !users)
      createError({ statusCode: 404, message: "No search results found" });

    const getPosts = posts.map(post => post.toObject());

    res.status(200).json({
      message: "Search results found",
      data: {
        users: users.map((user) => user.toObject()),
        posts: getPosts
          .map((post) => ({
            ...post,
            _html: {
              title: decodeHtmlEntities(post._html.title),
              body: decodeHtmlEntities(post._html.body),
            },
          }))
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Get search history
export const getSearchHistoris = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { session } = req;  

  if (!session.searchHistory) return next(createError({ statusCode: 404, message: "No search history found" }));
  
  res.status(200).json({
    message: "Search history retrieved successfully",
    data: session.searchHistory,
    success: true,
  });
};
// Add new search history
export const addSearchHistory = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty())
    next(createError({ message: errors.array()[0].msg, statusCode: 422 }));

  const { searched } = req.body;

  if (typeof req.session.searchHistory !== "object") {
    req.session.searchHistory = [];
  }
  const { searchHistory } = req.session;

  if (!searchHistory.find((history) => history.search === searched)) {
     req.session.searchHistory.push({
      _id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
      search: searched,
     });      
  }

  res.status(201).json({
    message: "Search history updated",
    data: searchHistory.find((history) => history.search === searched),
    success: true,
  });
};
// Delete search history
export const deleteSearchHistory = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // Validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(createError({ message: errors.array()[0].msg, statusCode: 422 }));

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
};

