import express from "express";
const router = express.Router();
import chatbotController from "../controllers/chatbotController.js";

// POST /api/chatbot/chat - Xá»­ lÃ½ tin nháº¯n chat
router.post("/chat", chatbotController.processChat);

// GET /api/chatbot/suggestions - Láº¥y gá»£i Ã½ sáº£n pháº©m vÃ  cÃ¢u há»i máº«u
router.get("/suggestions", chatbotController.getChatSuggestions);

// GET /api/chatbot/status - Kiá»ƒm tra tráº¡ng thÃ¡i chatbot
router.get("/status", chatbotController.getChatbotStatus);

export default router;
