import chatbotService from "../services/chatbotService.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// Lấy thông tin trạng thái chatbot
const getChatbotStatus = catchAsync(async (req, res) => {
  const isGeminiConfigured = !!process.env.GEMINI_API_KEY;

  res.status(200).json({
    status: "success",
    data: {
      available: isGeminiConfigured,
      features: {
        naturalLanguageSearch: isGeminiConfigured,
        productRecommendation: true,
        multilingual: isGeminiConfigured,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

// Xử lý chat với AI
const processChat = catchAsync(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    throw new AppError(400, "Tin nhắn không được để trống");
  }

  if (message.trim().length > 500) {
    throw new AppError(400, "Tin nhắn quá dài (tối đa 500 ký tự)");
  }

  const result = await chatbotService.processChat(message.trim());

  res.status(200).json({
    status: "success",
    data: {
      response: result.message,
      products: result.products,
      totalProducts: result.products.length,
      analysis: result.analysis,
      timestamp: new Date().toISOString(),
    },
  });
});

// Lấy gợi ý sản phẩm nổi bật và câu hỏi mẫu
const getChatSuggestions = catchAsync(async (req, res) => {
  const suggestions = await chatbotService.getFeaturedSuggestions();

  res.status(200).json({
    status: "success",
    data: {
      featuredProducts: suggestions.products,
      sampleQuestions: suggestions.suggestions,
      timestamp: new Date().toISOString(),
    },
  });
});

export default {
  processChat,
  getChatSuggestions,
  getChatbotStatus,
};
