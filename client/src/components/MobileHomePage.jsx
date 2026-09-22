import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard.jsx";

const MOBILE_SHORTCUTS = [
  { id: "len-soi", label: "Len sợi", icon: "🧶", slug: "len-soi" },
  { id: "thu-len", label: "Thú len", icon: "🧸", slug: "thu-len-handmade" },
  { id: "hoa-len", label: "Hoa len", icon: "🌸", slug: "hoa-len" },
  { id: "set-diy", label: "Kit DIY", icon: "🎁", slug: "set-diy" },
  { id: "hot", label: "Bán chạy", icon: "🔥", action: "hot" },
  { id: "kim-moc", label: "Kim móc", icon: "🪡", slug: "kim-moc-dung-cu" },
  { id: "bang-mau", label: "Bảng màu", icon: "🎨", action: "palette" },
  { id: "combo", label: "Combo", icon: "📦", slug: "combo-nguyen-lieu" },
  { id: "phu-kien", label: "Phụ kiện", icon: "🎀", slug: "phu-kien-handmade" },
  { id: "dat-moc", label: "Đặt móc", icon: "🧵", action: "custom-order" },
];

const MOBILE_BANNERS = [
  {
    id: 1,
    tag: "GIỜ VÀNG SENE",
    title: "Len Milk Cotton 50g",
    sub: "Mềm mịn – 80+ mã màu pastel chỉ từ 12.000đ",
    btnText: "Xem bảng màu",
    action: "len-soi",
    bgGradient: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fed7aa 100%)",
    accentColor: "#db2777",
    img: "/images/products/len-soi/len-milk-cotton-50g-01.jpg",
  },
  {
    id: 2,
    tag: "KÈM VIDEO A-Z",
    title: "Set Kit DIY Tự Làm",
    sub: "Đầy đủ kim móc + len + video hướng dẫn cho người mới",
    btnText: "Xem ngay",
    action: "set-diy",
    bgGradient: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fbcfe8 100%)",
    accentColor: "#e11d48",
    img: "/images/products/set-diy/kit-moc-hoa-tulip-01.jpg",
  },
  {
    id: 3,
    tag: "FREESHIP TOÀN QUỐC",
    title: "Ưu Đãi Đơn Từ 300K",
    sub: "Giao hỏa tốc 2H Cần Thơ & miễn phí ship toàn quốc",
    btnText: "Khám phá",
    action: "hot",
    bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbcfe8 100%)",
    accentColor: "#b45309",
    img: "/images/products/thu-len-handmade/be-tho-len-nhung-01.jpg",
  },
];

export default function MobileHomePage({
  products = [],
  onOpenProductDetail,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  onNavigateCategory,
  onOpenCustomOrder,
  STORE_VOUCHERS = [],
  onClaimVoucher,
  copiedVoucherCode,
  formatPrice,
}) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [flashCountdown, setFlashCountdown] = useState({ hours: 2, minutes: 45, seconds: 18 });

  // Countdown timer for Flash Sale
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto banner rotation
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % MOBILE_BANNERS.length);
    }, 4500);
    return () => clearInterval(bannerInterval);
  }, []);

  // Curated product slices
  const flashSaleList = products.filter((p) => p.featured || p.isSale).slice(0, 4);
  const bestSellers = products
    .filter((p) => p.soldCount && p.soldCount >= 100)
    .concat(products.slice(0, 6))
    .slice(0, 6);
  const kitProducts = products
    .filter((p) => p.category?.slug === "set-diy" || p.category?.slug === "combo-nguyen-lieu")
    .slice(0, 6);
  const yarnProducts = products
    .filter((p) => p.category?.slug === "len-soi")
    .slice(0, 6);
  const handmadeGifts = products
    .filter((p) => p.category?.slug === "hoa-len" || p.category?.slug === "thu-len-handmade")
    .slice(0, 6);

  const handleShortcutClick = (sc) => {
    if (sc.slug) {
      onNavigateCategory(sc.slug);
    } else if (sc.action === "custom-order") {
      onOpenCustomOrder();
    } else if (sc.action === "hot") {
      const el = document.getElementById("mobile-bestsellers-section");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (sc.action === "palette") {
      onNavigateCategory("len-soi");
    }
  };

  const handleBannerClick = (banner) => {
    if (banner.action === "len-soi" || banner.action === "set-diy") {
      onNavigateCategory(banner.action);
    } else {
      const el = document.getElementById("mobile-flash-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="mobile-home-container">
      {/* 1. QUICK CATEGORY SHORTCUTS (Shopee style) */}
      <section className="mobile-quick-shortcuts" aria-label="Lối tắt danh mục">
        <div className="mobile-shortcuts-grid">
          {MOBILE_SHORTCUTS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              className="mobile-shortcut-btn"
              onClick={() => handleShortcutClick(sc)}
            >
              <div className="mobile-shortcut-icon-wrap">
                <span className="mobile-shortcut-icon">{sc.icon}</span>
              </div>
              <span className="mobile-shortcut-label">{sc.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. COMPACT PROMO BANNER CAROUSEL */}
      <section className="mobile-banner-carousel" aria-label="Khuyến mãi nổi bật">
        <div
          className="mobile-banner-card"
          style={{ background: MOBILE_BANNERS[currentBanner].bgGradient }}
          onClick={() => handleBannerClick(MOBILE_BANNERS[currentBanner])}
        >
          <div className="mobile-banner-text">
            <span
              className="mobile-banner-badge"
              style={{ color: MOBILE_BANNERS[currentBanner].accentColor }}
            >
              {MOBILE_BANNERS[currentBanner].tag}
            </span>
            <h2 className="mobile-banner-heading">{MOBILE_BANNERS[currentBanner].title}</h2>
            <p className="mobile-banner-sub">{MOBILE_BANNERS[currentBanner].sub}</p>
            <span
              className="mobile-banner-action-link"
              style={{ backgroundColor: MOBILE_BANNERS[currentBanner].accentColor }}
            >
              {MOBILE_BANNERS[currentBanner].btnText} →
            </span>
          </div>
          <div className="mobile-banner-img-box">
            <img
              src={MOBILE_BANNERS[currentBanner].img}
              alt={MOBILE_BANNERS[currentBanner].title}
              className="mobile-banner-thumb"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80";
              }}
            />
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="mobile-banner-dots">
          {MOBILE_BANNERS.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              type="button"
              className={`mobile-dot ${idx === currentBanner ? "active" : ""}`}
              onClick={() => setCurrentBanner(idx)}
              aria-label={`Chuyển tới banner ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 3. VOUCHER QUICK STRIP */}
      {STORE_VOUCHERS && STORE_VOUCHERS.length > 0 && (
        <section className="mobile-vouchers-strip" aria-label="Mã giảm giá hot">
          <div className="mobile-vouchers-scroll">
            {STORE_VOUCHERS.map((v) => {
              const isCopied = copiedVoucherCode === v.code;
              return (
                <div key={v.code} className="mobile-voucher-pill">
                  <div className="mobile-voucher-left">
                    <span className="mobile-voucher-badge">{v.badge}</span>
                  </div>
                  <div className="mobile-voucher-mid">
                    <strong className="mobile-voucher-title">{v.title}</strong>
                    <span className="mobile-voucher-code">Mã: {v.code}</span>
                  </div>
                  <button
                    type="button"
                    className={`mobile-voucher-btn ${isCopied ? "claimed" : ""}`}
                    onClick={() => onClaimVoucher && onClaimVoucher(v)}
                  >
                    {isCopied ? "✓" : "Lưu"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. FLASH SALE / DEAL CHỚP NHOÁNG */}
      {flashSaleList.length > 0 && (
        <section className="mobile-section" id="mobile-flash-section">
          <div className="mobile-section-header flash-header">
            <div className="mobile-section-title-wrap">
              <span className="mobile-flash-tag">⚡ DEAL CHỚP NHOÁNG</span>
              <div className="mobile-flash-clock">
                <span className="clock-box">{String(flashCountdown.hours).padStart(2, "0")}</span>
                <span className="clock-sep">:</span>
                <span className="clock-box">{String(flashCountdown.minutes).padStart(2, "0")}</span>
                <span className="clock-sep">:</span>
                <span className="clock-box">{String(flashCountdown.seconds).padStart(2, "0")}</span>
              </div>
            </div>
            <button
              type="button"
              className="mobile-section-more-btn"
              onClick={() => onNavigateCategory("len-soi")}
            >
              Xem tất cả &gt;
            </button>
          </div>

          <div className="mobile-products-grid">
            {flashSaleList.map((product) => (
              <ProductCard
                key={`flash-${product._id || product.id}`}
                product={product}
                onOpenDetail={onOpenProductDetail}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                isWishlisted={isWishlisted(product._id || product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. SẢN PHẨM BÁN CHẠY NHẤT */}
      {bestSellers.length > 0 && (
        <section className="mobile-section" id="mobile-bestsellers-section">
          <div className="mobile-section-header">
            <div className="mobile-section-title-wrap">
              <span className="section-icon">🔥</span>
              <h3 className="mobile-section-title">Sản Phẩm Bán Chạy Nhất</h3>
            </div>
            <button
              type="button"
              className="mobile-section-more-btn"
              onClick={() => onNavigateCategory("san-pham-ban-chay")}
            >
              Xem tất cả &gt;
            </button>
          </div>

          <div className="mobile-products-grid">
            {bestSellers.map((product) => (
              <ProductCard
                key={`hot-${product._id || product.id}`}
                product={product}
                onOpenDetail={onOpenProductDetail}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                isWishlisted={isWishlisted(product._id || product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. SET DIY & COMBO NGUYÊN LIỆU */}
      {kitProducts.length > 0 && (
        <section className="mobile-section">
          <div className="mobile-section-header">
            <div className="mobile-section-title-wrap">
              <span className="section-icon">🎁</span>
              <h3 className="mobile-section-title">Set Kit DIY Kèm Video A-Z</h3>
            </div>
            <button
              type="button"
              className="mobile-section-more-btn"
              onClick={() => onNavigateCategory("set-diy")}
            >
              Xem tất cả &gt;
            </button>
          </div>

          <div className="mobile-products-grid">
            {kitProducts.map((product) => (
              <ProductCard
                key={`kit-${product._id || product.id}`}
                product={product}
                onOpenDetail={onOpenProductDetail}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                isWishlisted={isWishlisted(product._id || product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. LEN SỢI BÁN LẺ (80+ MÃ MÀU) */}
      {yarnProducts.length > 0 && (
        <section className="mobile-section">
          <div className="mobile-section-header">
            <div className="mobile-section-title-wrap">
              <span className="section-icon">🧶</span>
              <h3 className="mobile-section-title">Len Sợi Bán Lẻ Từ 1 Cuộn</h3>
            </div>
            <button
              type="button"
              className="mobile-section-more-btn"
              onClick={() => onNavigateCategory("len-soi")}
            >
              Xem tất cả &gt;
            </button>
          </div>

          <div className="mobile-products-grid">
            {yarnProducts.map((product) => (
              <ProductCard
                key={`yarn-${product._id || product.id}`}
                product={product}
                onOpenDetail={onOpenProductDetail}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                isWishlisted={isWishlisted(product._id || product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. HOA LEN & THÚ BÔNG HANDMADE */}
      {handmadeGifts.length > 0 && (
        <section className="mobile-section">
          <div className="mobile-section-header">
            <div className="mobile-section-title-wrap">
              <span className="section-icon">🌸</span>
              <h3 className="mobile-section-title">Hoa Len &amp; Thú Bông Móc Tay</h3>
            </div>
            <button
              type="button"
              className="mobile-section-more-btn"
              onClick={() => onNavigateCategory("hoa-len")}
            >
              Xem tất cả &gt;
            </button>
          </div>

          <div className="mobile-products-grid">
            {handmadeGifts.map((product) => (
              <ProductCard
                key={`handmade-${product._id || product.id}`}
                product={product}
                onOpenDetail={onOpenProductDetail}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                isWishlisted={isWishlisted(product._id || product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* 9. GỢI Ý HÔM NAY (Tất cả sản phẩm - Lưới 2 cột liên tục) */}
      <section className="mobile-section mobile-recommend-section" id="mobile-all-products">
        <div className="mobile-recommend-header">
          <span className="recommend-sparkle">✨</span>
          <h3 className="recommend-title">GỢI Ý HÔM NAY CHO BẠN</h3>
          <span className="recommend-sparkle">✨</span>
        </div>

        <div className="mobile-products-grid">
          {products.map((product) => (
            <ProductCard
              key={`all-${product._id || product.id}`}
              product={product}
              onOpenDetail={onOpenProductDetail}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              isWishlisted={isWishlisted(product._id || product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
