// Ai content generator routes.

import { Router } from "express";
import { Response, Request, NextFunction } from "express";
import axios from "axios";
import createError from "../utils/error";

const router = Router();

const AI_OR_KEY = process.env.AI_OR_KEY;

router.post("/", async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { topic } = req.body;
    try {
        
        if (!topic?.trim()) {
           return  createError({ statusCode: 422, message: "Topic is required" });
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "mistralai/mistral-7b-instruct",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful blog-writing assistant.",
                    },
                    {
                        role: "user",
                        content: `Write a blog post with title, introduction, and body about: ${topic}`,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${AI_OR_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.data;
        if (!data) {
            return createError({ statusCode: 404, message: "No content generated." });
        }

        const content = data.choices[0].message.content;

        res.json({ content });
    } catch (error) {
        next(error);
    }
});

export default router;

