import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/product.js";
import Category from "../models/category.js";

// Khá»Ÿi táº¡o Google Generative AI vÃ  model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// PhÃ¢n tÃ­ch Ã½ Ä‘á»‹nh vÃ  thÃ´ng tin tá»« tin nháº¯n cá»§a ngÆ°á»i dÃ¹ng
async function analyzeUserIntent(message) {
  try {
    const prompt = `
      Báº¡n lÃ  má»™t AI assistant chuyÃªn phÃ¢n tÃ­ch yÃªu cáº§u tÃ¬m kiáº¿m sáº£n pháº©m cá»§a khÃ¡ch hÃ ng trong cá»­a hÃ ng thá»i trang.
      
      HÃ£y phÃ¢n tÃ­ch tin nháº¯n sau vÃ  trÃ­ch xuáº¥t thÃ´ng tin tÃ¬m kiáº¿m theo Ä‘á»‹nh dáº¡ng JSON:
      
      Tin nháº¯n: "${message}"
      
      HÃ£y tráº£ vá» JSON vá»›i cáº¥u trÃºc sau:
      {
        "intent": "search_product" | "get_info" | "other",
        "searchParams": {
          "keywords": ["keyword1", "keyword2"],
          "category": "tÃªn danh má»¥c hoáº·c null",
          "brand": "tÃªn thÆ°Æ¡ng hiá»‡u hoáº·c null",
          "priceRange": {
            "min": sá»‘ hoáº·c null,
            "max": sá»‘ hoáº·c null
          },
          "color": "mÃ u sáº¯c hoáº·c null",
          "size": "kÃ­ch thÆ°á»›c hoáº·c null",
        },
        "question": "cÃ¢u há»i cá»¥ thá»ƒ náº¿u cÃ³"
      }
      
      LÆ°u Ã½:
      - Náº¿u khÃ´ng cÃ³ thÃ´ng tin cá»¥ thá»ƒ nÃ o, Ä‘á»ƒ null
      - Keywords nÃªn chá»©a cÃ¡c tá»« khÃ³a chÃ­nh liÃªn quan Ä‘áº¿n sáº£n pháº©m
      - Category cÃ³ thá»ƒ lÃ : "Ão nam", "Ão ná»¯", "Quáº§n nam", "Quáº§n ná»¯"
      - Chá»‰ tráº£ vá» JSON, khÃ´ng cÃ³ text khÃ¡c
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    console.log("content", content);

    // LÃ m sáº¡ch response Ä‘á»ƒ chá»‰ láº¥y JSON
    let jsonString = content;
    if (content.includes("```json")) {
      jsonString = content.split("```json")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      jsonString = content.split("```")[1].trim();
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analyzing user intent:", error);
    return {
      intent: "search_product",
      searchParams: {
        keywords: message.split(" ").filter((word) => word.length > 2),
        category: null,
        brand: null,
        priceRange: { min: null, max: null },
        color: null,
        size: null,
      },
      question: null,
    };
  }
}

// TÃ¬m kiáº¿m sáº£n pháº©m dá»±a trÃªn thÃ´ng tin Ä‘Ã£ phÃ¢n tÃ­ch
async function searchProducts(searchParams, limit = 10) {
  try {
    let query = {};
    let sort = {};

    // TÃ¬m kiáº¿m theo keywords
    if (searchParams.keywords && searchParams.keywords.length > 0) {
      console.log("search_product", searchParams);
      const keywordRegex = searchParams.keywords.map((keyword) => new RegExp(keyword, "i"));
      query.$or = [
        { name: { $in: keywordRegex } },
        { description: { $in: keywordRegex } },
        { tags: { $in: keywordRegex } },
        { brand: { $in: keywordRegex } },
      ];
    }

    // TÃ¬m kiáº¿m theo category
    if (searchParams.category) {
      const category = await Category.findOne({
        name: new RegExp(searchParams.category, "i"),
      });
      if (category) {
        query.categoryId = category._id;
      }
    }

    // TÃ¬m kiáº¿m theo brand
    if (searchParams.brand) {
      query.brand = new RegExp(searchParams.brand, "i");
    }

    // TÃ¬m kiáº¿m theo giÃ¡
    if (searchParams.priceRange && (searchParams.priceRange.min || searchParams.priceRange.max)) {
      let priceQuery = {};
      if (searchParams.priceRange.min) {
        priceQuery.$gte = searchParams.priceRange.min;
      }
      if (searchParams.priceRange.max) {
        priceQuery.$lte = searchParams.priceRange.max;
      }
      query["variants.price"] = priceQuery;
    }

    // TÃ¬m kiáº¿m theo mÃ u sáº¯c
    if (searchParams.color) {
      query["variants.color"] = new RegExp(searchParams.color, "i");
    }

    // TÃ¬m kiáº¿m theo size
    if (searchParams.size) {
      query["variants.size"] = new RegExp(searchParams.size, "i");
    }

    // Sáº¯p xáº¿p theo Ä‘á»™ liÃªn quan vÃ  rating
    sort = { averageRating: -1, salesCount: -1, createdAt: -1 };

    const products = await Product.find(query).populate("categoryId", "name").sort(sort).limit(limit);

    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
}

// Táº¡o response thÃ´ng minh cho ngÆ°á»i dÃ¹ng
async function generateResponse(userMessage, searchResults, searchParams) {
  try {
    const productSummary = searchResults
      .map((product) => ({
        name: product.name,
        brand: product.brand,
        category: product.categoryId?.name || "KhÃ´ng xÃ¡c Ä‘á»‹nh",
        priceRange: {
          min: Math.min(...product.variants.map((v) => v.price)),
          max: Math.max(...product.variants.map((v) => v.price)),
        },
        rating: product.averageRating,
        available: product.variants.some((v) => v.stock > 0),
      }))
      .slice(0, 5); // Chá»‰ láº¥y 5 sáº£n pháº©m Ä‘áº§u

    const prompt = `
      Báº¡n lÃ  má»™t AI sales assistant thÃ¢n thiá»‡n vÃ  chuyÃªn nghiá»‡p cá»§a cá»­a hÃ ng thá»i trang.
      
      KhÃ¡ch hÃ ng vá»«a há»i: "${userMessage}"
      
      Káº¿t quáº£ tÃ¬m kiáº¿m (${searchResults.length} sáº£n pháº©m):
      ${JSON.stringify(productSummary, null, 2)}
      
      HÃ£y táº¡o má»™t pháº£n há»“i thÃ¢n thiá»‡n, há»¯u Ã­ch vÃ  chuyÃªn nghiá»‡p:
      1. XÃ¡c nháº­n hiá»ƒu Ä‘Æ°á»£c yÃªu cáº§u cá»§a khÃ¡ch
      2. Giá»›i thiá»‡u ngáº¯n gá»n cÃ¡c sáº£n pháº©m phÃ¹ há»£p
      3. ÄÆ°a ra gá»£i Ã½ hoáº·c cÃ¢u há»i Ä‘á»ƒ há»— trá»£ thÃªm
      4. Giá»¯ giá»ng Ä‘iá»‡u thÃ¢n thiá»‡n, khÃ´ng quÃ¡ dÃ i dÃ²ng
      5. Tráº£ lá»i báº±ng tiáº¿ng Viá»‡t
      
      ${
        searchResults.length === 0
          ? "LÆ°u Ã½: KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m phÃ¹ há»£p, hÃ£y gá»£i Ã½ khÃ¡ch tÃ¬m kiáº¿m khÃ¡c hoáº·c xem sáº£n pháº©m tÆ°Æ¡ng tá»±."
          : "LÆ°u Ã½: CÃ³ tÃ¬m tháº¥y sáº£n pháº©m phÃ¹ há»£p, hÃ£y giá»›i thiá»‡u vÃ  hÆ°á»›ng dáº«n khÃ¡ch xem chi tiáº¿t."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating response:", error);

    // Fallback response
    if (searchResults.length > 0) {
      return `TÃ´i Ä‘Ã£ tÃ¬m tháº¥y ${searchResults.length} sáº£n pháº©m phÃ¹ há»£p vá»›i yÃªu cáº§u cá»§a báº¡n! HÃ£y xem danh sÃ¡ch bÃªn dÆ°á»›i Ä‘á»ƒ tÃ¬m sáº£n pháº©m Æ°ng Ã½ nhÃ©.`;
    } else {
      return `Xin lá»—i, tÃ´i khÃ´ng tÃ¬m tháº¥y sáº£n pháº©m nÃ o phÃ¹ há»£p vá»›i yÃªu cáº§u "${userMessage}". Báº¡n cÃ³ thá»ƒ thá»­ tÃ¬m kiáº¿m vá»›i tá»« khÃ³a khÃ¡c hoáº·c xem cÃ¡c sáº£n pháº©m ná»•i báº­t cá»§a chÃºng tÃ´i.`;
    }
  }
}

// Xá»­ lÃ½ chat chÃ­nh
async function processChat(userMessage) {
  try {
    // 1. PhÃ¢n tÃ­ch Ã½ Ä‘á»‹nh ngÆ°á»i dÃ¹ng
    const analysis = await analyzeUserIntent(userMessage);

    // 2. TÃ¬m kiáº¿m sáº£n pháº©m náº¿u lÃ  intent search_product
    let searchResults = [];
    if (analysis.intent === "search_product") {
      searchResults = await searchProducts(analysis.searchParams);
    }

    // 3. Táº¡o response thÃ´ng minh
    const response = await generateResponse(userMessage, searchResults, analysis.searchParams);

    return {
      message: response,
      products: searchResults,
      analysis: analysis,
      success: true,
    };
  } catch (error) {
    console.error("Error processing chat:", error);
    return {
      message: "Xin lá»—i, tÃ´i gáº·p sá»± cá»‘ khi xá»­ lÃ½ yÃªu cáº§u cá»§a báº¡n. Vui lÃ²ng thá»­ láº¡i sau.",
      products: [],
      analysis: null,
      success: false,
      error: error.message,
    };
  }
}

// Láº¥y gá»£i Ã½ sáº£n pháº©m ná»•i báº­t
async function getFeaturedSuggestions() {
  try {
    const featuredProducts = await Product.find({ featured: true })
      .populate("categoryId", "name")
      .sort({ averageRating: -1, salesCount: -1 })
      .limit(6);

    const suggestions = [
      "TÃ¬m Ã¡o sÆ¡ mi nam cÃ´ng sá»Ÿ",
      // "VÃ¡y dá»± tiá»‡c ná»¯ giÃ¡ dÆ°á»›i 500k",
      // "Quáº§n jean nam skinny",
      // "Ão khoÃ¡c ná»¯ mÃ¹a Ä‘Ã´ng",
      // "GiÃ y sneaker unisex",
      // "Phá»¥ kiá»‡n thá»i trang trending",
    ];

    return {
      products: featuredProducts,
      suggestions: suggestions,
    };
  } catch (error) {
    console.error("Error getting featured suggestions:", error);
    return {
      products: [],
      suggestions: [],
    };
  }
}

export default { analyzeUserIntent, searchProducts, generateResponse, processChat, getFeaturedSuggestions };
