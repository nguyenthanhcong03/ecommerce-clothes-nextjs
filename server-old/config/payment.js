// Cáº¥u hÃ¬nh VNPay
const vnpayConfig = {
  vnp_TmnCode: "3NNZLDO2", // MÃ£ website cá»§a merchant trÃªn há»‡ thá»‘ng cá»§a VNPay
  vnp_HashSecret: "T6GYXQSQFDA7L51ZWKZYTYGO8BX24KZG", // Chuá»—i bÃ­ máº­t Ä‘á»ƒ táº¡o chá»¯ kÃ½
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", // URL thanh toÃ¡n VNPay
  vnp_RefundUrl: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction", // URL hoÃ n tiá»n VNPay
  returnUrl: "http://localhost:5000/api/payment/vnpay/return", // URL nháº­n káº¿t quáº£ tráº£ vá» tá»« VNPay
};

// Cáº¥u hÃ¬nh client URL
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export { vnpayConfig, CLIENT_URL };
