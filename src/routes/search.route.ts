import { Router } from "express";
import { addSearchHistory, deleteSearchHistory, getSearchHistoris, search } from "../controllers/search.controllers";
import { searchHistoryValidator_param, searchHistoryValidator_query, searchValidator } from "../validators/search.validator";

const router = Router();

router.get("/", searchValidator, search);
router.get("/history", getSearchHistoris);
router.post("/", searchHistoryValidator_query, addSearchHistory);
router.delete("/", searchHistoryValidator_param, deleteSearchHistory);

export default router;
