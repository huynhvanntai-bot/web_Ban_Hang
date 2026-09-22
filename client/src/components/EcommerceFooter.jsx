import React from "react";

export default function EcommerceFooter({ onNavigateCategory, onScrollToSection }) {
  return (
    <footer className="ecommerce-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-grid">
          {/* CỘT 1: SENE HANDMADE */}
          <div className="footer-col footer-col-brand">
            <a className="footer-brand" href="/">
              <span className="brand-icon">🧶</span>
              <div className="brand-text">
                <span className="brand-name">SENE <span className="brand-accent">HANDMADE</span></span>
                <small className="brand-tagline">Tiệm Len Sợi & Sản Phẩm DIY</small>
              </div>
            </a>
            <p className="footer-brand-desc">
              Len sợi handmade và sản phẩm DIY tuyển chọn cao cấp. Chuyên cung cấp sỉ & lẻ len Milk Cotton,
              len nhung đũa, kim móc công thái học êm tay cùng các set kit tự móc kèm video hướng dẫn chi tiết A-Z.
            </p>
            <div className="footer-social-wrapper">
              <span className="social-label">Kết nối với Sene:</span>
              <div className="footer-social-buttons">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-pill facebook"
                  title="Theo dõi Fanpage Facebook"
                >
                  Facebook
                </a>
                <a
                  href="https://zalo.me/0942901124"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-pill zalo"
                  title="Chat tư vấn Zalo 24/7"
                >
                  Zalo
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-pill instagram"
                  title="Kênh hình ảnh Instagram"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* CỘT 2: DANH MỤC */}
          <div className="footer-col">
            <h4 className="footer-col-heading">DANH MỤC</h4>
            <ul className="footer-menu-links">
              <li>
                <a
                  href="/danh-muc/len-soi"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateCategory("len-soi");
                  }}
                >
                  Len sợi
                </a>
              </li>
              <li>
                <a
                  href="/danh-muc/kim-moc-dung-cu"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateCategory("kim-moc-dung-cu");
                  }}
                >
                  Kim móc & dụng cụ
                </a>
              </li>
              <li>
                <a
                  href="/danh-muc/set-diy"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateCategory("set-diy");
                  }}
                >
                  Set DIY
                </a>
              </li>
              <li>
                <a
                  href="/danh-muc/hoa-len"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateCategory("hoa-len");
                  }}
                >
                  Hoa len
                </a>
              </li>
              <li>
                <a
                  href="/danh-muc/thu-len-handmade"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateCategory("thu-len-handmade");
                  }}
                >
                  Thú len handmade
                </a>
              </li>
              <li>
                <a
                  href="/danh-muc/combo-nguyen-lieu"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateCategory("combo-nguyen-lieu");
                  }}
                >
                  Combo nguyên liệu
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 3: HỖ TRỢ */}
          <div className="footer-col">
            <h4 className="footer-col-heading">HỖ TRỢ</h4>
            <ul className="footer-menu-links">
              <li>
                <a
                  href="#guides"
                  onClick={(e) => {
                    e.preventDefault();
                    onScrollToSection("guides");
                  }}
                >
                  Hướng dẫn đặt hàng
                </a>
              </li>
              <li>
                <a
                  href="#guides"
                  onClick={(e) => {
                    e.preventDefault();
                    onScrollToSection("guides");
                  }}
                >
                  Chính sách giao hàng
                </a>
              </li>
              <li>
                <a
                  href="#guides"
                  onClick={(e) => {
                    e.preventDefault();
                    onScrollToSection("guides");
                  }}
                >
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a
                  href="#orders"
                  onClick={(e) => {
                    e.preventDefault();
                    onScrollToSection("orders");
                  }}
                >
                  Kiểm tra đơn hàng
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  className="footer-admin-tag"
                >
                  Trang quản trị (Admin)
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 4: LIÊN HỆ */}
          <div className="footer-col footer-col-contact">
            <h4 className="footer-col-heading">LIÊN HỆ</h4>
            <ul className="footer-contact-list">
              <li>
                <span className="contact-label">Hotline / Zalo:</span>
                <a href="tel:0942901124" className="contact-highlight">
                  0942.901.124
                </a>
              </li>
              <li>
                <span className="contact-label">Email hỗ trợ:</span>
                <a href="mailto:huynhvanntai@gmail.com" className="contact-val">
                  huynhvanntai@gmail.com
                </a>
              </li>
              <li>
                <span className="contact-label">Địa chỉ cửa hàng:</span>
                <span className="contact-val">
                  124 Đường 30 Tháng 4, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ
                </span>
              </li>
              <li>
                <span className="contact-label">Giờ làm việc:</span>
                <span className="contact-val">8:00 - 21:30 (Mở cửa cả tuần)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* DÒNG BẢN QUYỀN VÀ ĐIỀU KHOẢN DƯỚI CÙNG */}
        <div className="footer-bottom-bar">
          <p className="copyright-notice">
            © 2026 Sene Handmade. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <a
              href="#guides"
              onClick={(e) => {
                e.preventDefault();
                onScrollToSection("guides");
              }}
            >
              Chính sách bảo mật
            </a>
            <span className="legal-sep">|</span>
            <a
              href="#guides"
              onClick={(e) => {
                e.preventDefault();
                onScrollToSection("guides");
              }}
            >
              Điều khoản sử dụng
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
