import dayjs from "dayjs";
import Order from "../models/order.js";
import paymentService from "../services/paymentService.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { responseSuccess } from "../utils/responseHandler.js";

/**
 * Tạo yêu cầu thanh toán VNPay
 */
const createVnpayPayment = catchAsync(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new AppError(404, "Đơn hàng không tồn tại");

  // Táº¡o URL thanh toÃ¡n
  const paymentUrl = paymentService.createVnpayPaymentUrl({
    amount: order.totalPrice,
    orderId: orderId,
    orderInfo: `Thanh toán đơn hàng: ${orderId}`,
  });

  responseSuccess(res, 200, "Tạo liên kết thanh toán VNPay thành công", paymentUrl);
});

/**
 * Xử lý kết quả trả về từ VNPay
 */
const vnpayReturn = catchAsync(async (req, res) => {
  // Lấy tham số trả về từ VNPay
  const vnpayParams = req.query;

  // Xác minh tính hợp lệ của dữ liệu trả về
  const verificationResult = paymentService.verifyVnpayReturn(vnpayParams);
  const orderId = vnpayParams.vnp_TxnRef;

  // Kiểm tra xem thanh toán thành công hay thất bại
  if (verificationResult.isValid && verificationResult.responseCode === "00") {
    // Thanh toán thành công - cập nhật trạng thái đơn hàng
    await Order.findOneAndUpdate(
      { _id: orderId },
      {
        status: "Pending",
        payment: {
          method: "VNPay",
          status: "Paid",
          paidAt: new Date(),
          transactionNo: verificationResult.transactionNo,
        },
      }
    );
    const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-success?orderId=${
      verificationResult.orderId
    }&amount=${verificationResult.amount}&paymentMethod=VNPay&transactionNo=${verificationResult.transactionNo}`;
    return res.redirect(redirectUrl);
  } else {
    // Thanh toán thất bại - xác định lý do
    let failureReason = "Lỗi không xác định";

    // Ánh xạ mã lỗi trả về từ VNPay sang lý do cụ thể
    const responseCodeMap = {
      "01": "Giao dịch chưa hoàn tất",
      "02": "Giao dịch bị lỗi",
      "04": "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)",
      "05": "VNPAY đang xử lý giao dịch này (GD có thể thành công hoặc thất bại)",
      "06": "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng",
      "07": "Giao dịch bị nghi ngờ gian lận",
      "09": "GD Hoàn trả bị từ chối",
      10: "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      11: "Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch",
      12: "Thẻ/Tài khoản của khách hàng bị khóa",
      13: "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
      24: "Khách hàng hủy giao dịch",
      51: "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
      65: "Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      75: "Ngân hàng thanh toán đang bảo trì",
      79: "KH nhập sai mật khẩu thanh toán quá số lần quy định",
      99: "Các lỗi khác",
    };

    if (responseCodeMap[verificationResult.responseCode]) {
      failureReason = responseCodeMap[verificationResult.responseCode];
    }

    // Chuyển hướng đến trang thất bại với thông tin lỗi
    const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-failed?orderId=${
      verificationResult.orderId
    }&reason=${encodeURIComponent(failureReason)}&paymentMethod=VNPay`;
    return res.redirect(redirectUrl);
  }
});

const vnpayRefund = catchAsync(async (req, res) => {
  const { orderId, reason } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  if (!orderId) throw new AppError(400, "Mã đơn hàng là bắt buộc");

  let query = { _id: orderId };

  // Nếu người dùng không phải là admin, chỉ hoàn tiền đơn hàng của họ
  if (userRole !== "admin") {
    query.userId = userId;
  }

  const order = await Order.findOne(query);
  if (!order) throw new AppError(404, "Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập");

  // Kiểm tra điều kiện hoàn tiền
  if (order.payment.status !== "Paid") {
    throw new AppError(400, "Đơn hàng chưa được thanh toán, không thể hoàn tiền");
  }

  if (order.payment.status === "Refunded") {
    throw new AppError(400, "Đơn hàng đã được hoàn tiền trước đó");
  }

  let refundInfo = null;

  try {
    if (order.payment.method === "VNPay") {
      // Kiểm tra transactionNo cho VNPay
      if (!order.payment.transactionNo) {
        throw new AppError(400, "Không tìm thấy thông tin giao dịch VNPay, không thể hoàn tiền");
      }

      // Tạo yêu cầu hoàn tiền VNPay
      const refundData = {
        orderId: orderId,
        transactionNo: order.payment.transactionNo,
        amount: order.totalPrice,
        refundAmount: order.totalPrice,
        reason: reason || `Hoàn tiền đơn hàng: ${orderId}`,
        transactionDate: order.payment.paidAt ? dayjs(order.payment.paidAt).format("YYYYMMDDHHmmss") : null,
        createBy: req.user.username || "System",
      };

      const refundResult = await paymentService.createVnpayRefund(refundData);

      if (!refundResult.success) {
        throw new AppError(400, `Hoàn tiền VNPay thất bại: ${refundResult.message}`);
      }

      // Chỉ cập nhật trạng thái khi hoàn tiền thành công
      order.payment.status = "Refunded";
      order.payment.refundedAt = new Date();
      order.payment.refundRequestId = refundResult.requestId;
      order.payment.refundTransactionNo = refundResult.transactionNo;

      await order.save();

      refundInfo = {
        method: "VNPay",
        amount: order.totalPrice,
        requestId: refundResult.requestId,
        transactionNo: refundResult.transactionNo,
        refundedAt: order.payment.refundedAt,
        responseCode: refundResult.responseCode,
        message: refundResult.message,
      };
    } else if (order.payment.method === "COD") {
      // Đối với COD, chỉ cập nhật trạng thái (hoàn tiền thủ công)
      order.payment.status = "Refunded";
      order.payment.refundedAt = new Date();
      await order.save();

      refundInfo = {
        method: "COD",
        amount: order.totalPrice,
        note: "Hoàn tiền thủ công cho đơn hàng COD",
        refundedAt: order.payment.refundedAt,
      };
    } else {
      throw new AppError(400, "Phương thức thanh toán không hỗ trợ hoàn tiền tự động");
    }

    responseSuccess(res, 200, "Hoàn tiền thành công", { orderId: orderId, refund: refundInfo, order: order });
  } catch (error) {
    console.error("Lỗi khi hoàn tiền:", error);
    throw new AppError(500, `Lỗi hệ thống khi hoàn tiền: ${error.message}`);
  }
});

export default {
  createVnpayPayment,
  vnpayReturn,
  vnpayRefund,
};
