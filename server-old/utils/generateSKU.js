const removeVietnameseTones = (str) => {
  const vietnameseToASCII = {
    Ã : "a",
    Ã¡: "a",
    áº¡: "a",
    áº£: "a",
    Ã£: "a",
    Ã¢: "a",
    áº§: "a",
    áº¥: "a",
    áº­: "a",
    áº©: "a",
    áº«: "a",
    Äƒ: "a",
    áº±: "a",
    áº¯: "a",
    áº·: "a",
    áº³: "a",
    áºµ: "a",
    Ã¨: "e",
    Ã©: "e",
    áº¹: "e",
    áº»: "e",
    áº½: "e",
    Ãª: "e",
    á»: "e",
    áº¿: "e",
    á»‡: "e",
    á»ƒ: "e",
    á»…: "e",
    Ã¬: "i",
    Ã­: "i",
    á»‹: "i",
    á»‰: "i",
    Ä©: "i",
    Ã²: "o",
    Ã³: "o",
    á»: "o",
    á»: "o",
    Ãµ: "o",
    Ã´: "o",
    á»“: "o",
    á»‘: "o",
    á»™: "o",
    á»•: "o",
    á»—: "o",
    Æ¡: "o",
    á»: "o",
    á»›: "o",
    á»£: "o",
    á»Ÿ: "o",
    á»¡: "o",
    Ã¹: "u",
    Ãº: "u",
    á»¥: "u",
    á»§: "u",
    Å©: "u",
    Æ°: "u",
    á»«: "u",
    á»©: "u",
    á»±: "u",
    á»­: "u",
    á»¯: "u",
    á»³: "y",
    Ã½: "y",
    á»µ: "y",
    á»·: "y",
    á»¹: "y",
    Ä‘: "d",
    Ã€: "A",
    Ã: "A",
    áº : "A",
    áº¢: "A",
    Ãƒ: "A",
    Ã‚: "A",
    áº¦: "A",
    áº¤: "A",
    áº¬: "A",
    áº¨: "A",
    áºª: "A",
    Ä‚: "A",
    áº°: "A",
    áº®: "A",
    áº¶: "A",
    áº²: "A",
    áº´: "A",
    Ãˆ: "E",
    Ã‰: "E",
    áº¸: "E",
    áºº: "E",
    áº¼: "E",
    ÃŠ: "E",
    á»€: "E",
    áº¾: "E",
    á»†: "E",
    á»‚: "E",
    á»„: "E",
    ÃŒ: "I",
    Ã: "I",
    á»Š: "I",
    á»ˆ: "I",
    Ä¨: "I",
    Ã’: "O",
    Ã“: "O",
    á»Œ: "O",
    á»Ž: "O",
    Ã•: "O",
    Ã”: "O",
    á»’: "O",
    á»: "O",
    á»˜: "O",
    á»”: "O",
    á»–: "O",
    Æ : "O",
    á»œ: "O",
    á»š: "O",
    á»¢: "O",
    á»ž: "O",
    á» : "O",
    Ã™: "U",
    Ãš: "U",
    á»¤: "U",
    á»¦: "U",
    Å¨: "U",
    Æ¯: "U",
    á»ª: "U",
    á»¨: "U",
    á»°: "U",
    á»¬: "U",
    á»®: "U",
    á»²: "Y",
    Ã: "Y",
    á»´: "Y",
    á»¶: "Y",
    á»¸: "Y",
    Ä: "D",
  };

  return str.replace(
    /[Ã Ã¡áº¡áº£Ã£Ã¢áº§áº¥áº­áº©áº«Äƒáº±áº¯áº·áº³áºµÃ¨Ã©áº¹áº»áº½Ãªá»áº¿á»‡á»ƒá»…Ã¬Ã­á»‹á»‰Ä©Ã²Ã³á»á»ÃµÃ´á»“á»‘á»™á»•á»—Æ¡á»á»›á»£á»Ÿá»¡Ã¹Ãºá»¥á»§Å©Æ°á»«á»©á»±á»­á»¯á»³Ã½á»µá»·á»¹Ä‘Ã€Ãáº áº¢ÃƒÃ‚áº¦áº¤áº¬áº¨áºªÄ‚áº°áº®áº¶áº²áº´ÃˆÃ‰áº¸áººáº¼ÃŠá»€áº¾á»†á»‚á»„ÃŒÃá»Šá»ˆÄ¨Ã’Ã“á»Œá»ŽÃ•Ã”á»’á»á»˜á»”á»–Æ á»œá»šá»¢á»žá» Ã™Ãšá»¤á»¦Å¨Æ¯á»ªá»¨á»°á»¬á»®á»²Ãá»´á»¶á»¸Ä]/g,
    (char) => vietnameseToASCII[char] || char
  );
};

/**
 * Táº¡o SKU tá»± Ä‘á»™ng cho biáº¿n thá»ƒ sáº£n pháº©m
 * @param {String} productType - Loáº¡i sáº£n pháº©m (Ã¡o, quáº§n)
 * @param {String} productName - TÃªn sáº£n pháº©m
 * @param {String} brand - ThÆ°Æ¡ng hiá»‡u
 * @param {String} size - KÃ­ch thÆ°á»›c
 * @param {String} color - MÃ u sáº¯c
 * @returns {String} SKU Ä‘Æ°á»£c táº¡o
 */
const generateSKU = (productType, productName, brand, size, color) => {
  try {
    // XÃ¡c Ä‘á»‹nh loáº¡i sáº£n pháº©m (Ã¡o hoáº·c quáº§n)
    let typeCode = "SP"; // Máº·c Ä‘á»‹nh lÃ  sáº£n pháº©m

    if (productType) {
      if (productType.toLowerCase().includes("Ã¡o")) {
        typeCode = "AO";
      } else if (productType.toLowerCase().includes("quáº§n")) {
        typeCode = "QU";
      }
    }

    // Táº¡o mÃ£ thÆ°Æ¡ng hiá»‡u (3 kÃ½ tá»± Ä‘áº§u)
    const brandCode = removeVietnameseTones(brand.trim().toUpperCase()).slice(0, 3);

    // Táº¡o mÃ£ sáº£n pháº©m tá»« chá»¯ cÃ¡i Ä‘áº§u cá»§a má»—i tá»«
    const productCode = removeVietnameseTones(productName.trim().toUpperCase())
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 5);

    // Táº¡o mÃ£ size
    const sizeCode = size.toUpperCase();

    // Táº¡o mÃ£ mÃ u (loáº¡i bá» dáº¥u vÃ  khoáº£ng tráº¯ng)
    const colorCode = removeVietnameseTones(color.trim().toUpperCase()).replace(/\s+/g, "");

    // Táº¡o timestamp Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh duy nháº¥t
    const timestamp = Date.now().toString().slice(-4);

    // Format: TYPE-BRAND-NAME-SIZE-COLOR-TIMESTAMP
    return `${typeCode}-${brandCode}-${productCode}-${sizeCode}-${colorCode}-${timestamp}`.toUpperCase();
  } catch (error) {
    console.error("Error generating SKU:", error);
    return `SP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  }
};

export { generateSKU };

