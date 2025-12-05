import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold mb-4">OUTFITORY</h3>
            <p className="text-gray-400 text-sm">Điểm đến tin cậy cho thời trang chất lượng cao</p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Đổi trả
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Công ty</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  Tin tức
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>1900-1234</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <span>info@outfitory.com</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>123 Đường ABC, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          © {currentYear} Outfitory. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
