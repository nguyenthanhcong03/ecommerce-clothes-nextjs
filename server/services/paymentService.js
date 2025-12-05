import axios from "axios";
import { Buffer } from "buffer";
import crypto from "crypto";
import dayjs from "dayjs";
import querystring from "qs";
import { vnpayConfig } from "../config/payment.js";
import AppError from "../utils/AppError.js";

/**
 * Tạo URL thanh toán VNPay
 */
const createVnpayPaymentUrl = (order) => {
  try {
    const date = new Date();
    const createDate = dayjs(date).format("YYYYMMDDHHmmss");
    const orderId = order.orderId || `ORDER-${Date.now()}`;
    const amount = parseInt(order.amount) * 100; // VNPay yêu cầu amount * 100
    const orderDescription = order.orderInfo || `Thanh toan don hang ${orderId}`;

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = vnpayConfig.vnp_TmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderDescription;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount;
    vnp_Params["vnp_ReturnUrl"] = vnpayConfig.returnUrl;
    vnp_Params["vnp_IpAddr"] = "127.0.0.1";
    vnp_Params["vnp_CreateDate"] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    const paymentUrl = vnpayConfig.vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

    return paymentUrl;
  } catch (error) {
    console.error("Lỗi khi tạo liên kết thanh toán VNPay:", error);
    throw new Error("Lỗi khi tạo liên kết thanh toán VNPay");
  }
};

/**
 * Xác minh kết quả thanh toán VNPay
 */
const verifyVnpayReturn = (vnpayParams) => {
  try {
    let vnp_Params = { ...vnpayParams };
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    const isValid = secureHash === signed;

    return {
      isValid,
      orderId: vnpayParams.vnp_TxnRef,
      amount: parseInt(vnpayParams.vnp_Amount) / 100, // Chia cho 100
      transactionNo: vnpayParams.vnp_TransactionNo,
      responseCode: vnpayParams.vnp_ResponseCode,
      transactionStatus: vnpayParams.vnp_TransactionStatus,
      payDate: vnpayParams.vnp_PayDate,
      bankCode: vnpayParams.vnp_BankCode,
    };
  } catch (error) {
    console.error("Lỗi khi xác minh kết quả thanh toán VNPay:", error);
    throw new Error("Lỗi khi xác minh kết quả thanh toán VNPay");
  }
};

/**
 * Tạo yêu cầu hoàn tiền VNPay
 */
const createVnpayRefund = async (refundData) => {
  try {
    const { orderId, transactionNo, amount, refundAmount, reason, refundOrderId, transactionDate, createBy } =
      refundData;

    const date = new Date();
    const createDate = dayjs(date).format("YYYYMMDDHHmmss");
    const requestId = dayjs(date).format("HHmmss");
    const refundAmountInVND = parseInt(refundAmount) * 100;
    const transactionType = refundAmount === amount ? "02" : "03"; // 02: Hoàn tiền toàn phần, 03: Hoàn tiền một phần

    // Đảm bảo transactionDate có giá trị, nếu không thì dùng createDate
    const vnpTransactionDate = transactionDate || createDate;

    // Tạo chuỗi dữ liệu để tạo secure hash theo format của VNPay
    const data = `${requestId}|2.1.0|refund|${
      vnpayConfig.vnp_TmnCode
    }|${transactionType}|${orderId}|${refundAmountInVND}|${transactionNo || "0"}|${vnpTransactionDate}|${
      createBy || "System"
    }|${createDate}|127.0.0.1|${reason || `Hoan tien GD ma:${orderId}`}`;

    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const vnp_SecureHash = hmac.update(Buffer.from(data, "utf-8")).digest("hex");

    const dataObj = {
      vnp_RequestId: requestId,
      vnp_Version: "2.1.0",
      vnp_Command: "refund",
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_TransactionType: transactionType,
      vnp_TxnRef: orderId,
      vnp_Amount: refundAmountInVND,
      vnp_TransactionNo: transactionNo || "0",
      vnp_CreateBy: createBy || "System",
      vnp_OrderInfo: reason || `Hoan tien GD ma:${orderId}`,
      vnp_TransactionDate: vnpTransactionDate,
      vnp_CreateDate: createDate,
      vnp_IpAddr: "127.0.0.1",
      vnp_SecureHash: vnp_SecureHash,
    };

    // Gửi yêu cầu hoàn tiền đến VNPay
    const refundUrl = vnpayConfig.vnp_RefundUrl || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

    const response = await axios.post(refundUrl, dataObj, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      success: response.data.vnp_ResponseCode === "00",
      responseCode: response.data.vnp_ResponseCode,
      message: getRefundResponseMessage(response.data.vnp_ResponseCode),
      requestId: requestId,
      transactionNo: response.data.vnp_TransactionNo,
      refundAmount: refundAmount,
      data: response.data,
    };
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu hoàn tiền VNPay:", error);
    throw new AppError(500, "Không thể tạo yêu cầu hoàn tiền VNPay");
  }
};

/**
 * Lấy thông báo
 */
const getRefundResponseMessage = (responseCode) => {
  const messages = {
    "00": "Giao dịch thành công",
    "01": "Đơn hàng không tồn tại",
    "02": "Merchant không hợp lệ",
    "03": "Dữ liệu gửi sang không đúng định dạng",
    "04": "Số tiền không hợp lệ",
    "05": "Giao dịch không thành công",
    "06": "Giao dịch không tồn tại",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ",
    "08": "Giao dịch đã được xử lý",
    "09": "Giao dịch không thành công",
    10: "Giao dịch không thành công",
    11: "Đã hết hạn chờ thanh toán",
    12: "Thẻ/Tài khoản bị khóa",
    13: "Mật khẩu OTP không đúng",
    24: "Giao dịch bị hủy",
    51: "Tài khoản không đủ số dư",
    65: "Vượt quá hạn mức giao dịch",
    75: "Ngân hàng đang bảo trì",
    79: "Nhập sai mật khẩu quá số lần quy định",
    91: "Không tìm thấy giao dịch yêu cầu",
    93: "Đã hoàn tiền một phần",
    94: "Yêu cầu hoàn tiền bị từ chối",
    95: "Giao dịch đã được hoàn tiền",
    97: "Chữ ký không hợp lệ",
    98: "Timeout",
    99: "Lỗi không xác định",
  };

  return messages[responseCode] || "Lỗi không xác định";
};

/**
 * Hàm tiện ích để sắp xếp đối tượng theo khóa
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

export default { createVnpayPaymentUrl, verifyVnpayReturn, createVnpayRefund };
