import React, { useState } from "react";
import ProductCard from "./ProductCard.jsx";
import { getRelatedProducts, getFrequentlyBoughtTogether } from "../data/products.js";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);
}

export default function ProductDetailView({
  product,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  onNavigateHome,
  onNavigateCategory,
  onOpenProductDetail,
}) {
  if (!product) return null;

  const [activeMedia, setActiveMedia] = useState({ type: "image", index: 0 });
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : "Tiêu chuẩn"
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specs"); // 'specs' | 'guide' | 'reviews'

  const currentPrice = product.price || 0;
  const oldPrice = product.oldPrice || (product.isSale ? Math.round((currentPrice * 1.25) / 1000) * 1000 : null);
  const discountPercent = product.discount || (oldPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0);

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"];

  const videos = product.videos || [];
  const relatedProducts = getRelatedProducts(product.id, product.category?.slug, 4);
  const frequentlyBought = getFrequentlyBoughtTogether(product);

  const comboTotalPrice = currentPrice + frequentlyBought.reduce((sum, item) => sum + item.price, 0);

  function handleAddCombo() {
    onAddToCart(product, quantity);
    frequentlyBought.forEach((item) => onAddToCart(item, 1));
  }

  return (
    <div className="product-detail-view-container">
      {/* BREADCRUMBS & MOBILE BACK */}
      <nav className="detail-breadcrumbs" aria-label="Breadcrumbs">
        <div className="breadcrumb-inner">
          <button
            type="button"
            className="detail-mobile-back-btn mobile-only"
            onClick={(e) => {
              e.preventDefault();
              if (product.category?.slug) onNavigateCategory(product.category.slug);
              else onNavigateHome();
            }}
          >
            ← Quay lại
          </button>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="desktop-only"
          >
            Trang chủ
          </a>
          <span className="crumb-sep">›</span>
          <a
            href={`/danh-muc/${product.category?.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigateCategory(product.category?.slug);
            }}
          >
            {product.category?.name || "Danh mục"}
          </a>
          <span className="crumb-sep">›</span>
          <span className="crumb-current">{product.name}</span>
        </div>
      </nav>

      {/* MAIN TWO-COLUMN DETAIL HERO */}
      <section className="product-detail-hero">
        {/* LEFT MEDIA GALLERY */}
        <div className="product-gallery-col">
          <div className="main-media-display">
            {activeMedia.type === "video" && videos.length > 0 ? (
              <div className="video-player-box">
                <video
                  key={videos[activeMedia.index]}
                  src={videos[activeMedia.index]}
                  poster={product.videoPoster || images[0]}
                  controls
                  autoPlay
                  playsInline
                  className="main-display-video"
                />
              </div>
            ) : (
              <div className="main-image-box">
                <img
                  src={images[activeMedia.index] || images[0]}
                  alt={product.name}
                  className="main-display-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                {discountPercent > 0 && (
                  <span className="gallery-badge-sale">-{discountPercent}%</span>
                )}
              </div>
            )}
          </div>

          {/* THUMBNAIL STRIP */}
          <div className="gallery-thumb-strip">
            {images.map((img, idx) => (
              <button
                key={`img-thumb-${idx}`}
                type="button"
                className={`thumb-btn ${activeMedia.type === "image" && activeMedia.index === idx ? "active" : ""}`}
                onClick={() => setActiveMedia({ type: "image", index: idx })}
                aria-label={`Ảnh ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onError={(e) => {
                    e.currentTarget.style.opacity = "0.5";
                  }}
                />
              </button>
            ))}

            {videos.map((vid, vIdx) => (
              <button
                key={`vid-thumb-${vIdx}`}
                type="button"
                className={`thumb-btn thumb-btn-video ${activeMedia.type === "video" && activeMedia.index === vIdx ? "active" : ""}`}
                onClick={() => setActiveMedia({ type: "video", index: vIdx })}
                aria-label={`Video thực tế ${vIdx + 1}`}
              >
                <img
                  src={product.videoPoster || images[0]}
                  alt="Video thumbnail"
                />
                <span className="thumb-video-icon">▶</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PRODUCT INFO */}
        <div className="product-info-col">
          {/* CATEGORY & BRAND BADGES */}
          <div className="info-top-badges">
            <span className="info-category-pill">{product.category?.name || "Handmade Sene"}</span>
            <span className="info-brand-pill">Thương hiệu: <strong>{product.brand || "Sene Handmade"}</strong></span>
            <span className="info-stock-status">✓ Còn hàng</span>
          </div>

          {/* H1 PRODUCT TITLE */}
          <h1 className="product-detail-title">{product.name}</h1>

          {/* RATING & SOCIAL PROOF */}
          <div className="product-social-metrics">
            <div className="metric-item">
              <span className="stars-gold">★★★★★</span>
              <strong className="metric-val">{product.rating || "4.9"}</strong>
            </div>
            <span className="metric-sep">|</span>
            <div className="metric-item">
              <span className="metric-label">{product.reviewCount || 120} Đánh giá</span>
            </div>
            <span className="metric-sep">|</span>
            <div className="metric-item">
              <span className="metric-label">Đã bán {product.soldCount || 150}+</span>
            </div>
          </div>

          {/* PRICING PANEL */}
          <div className="product-price-panel">
            <div className="price-main-display">
              <span className="detail-current-price">{formatPrice(currentPrice)}</span>
              {oldPrice && oldPrice > currentPrice && (
                <span className="detail-old-price">{formatPrice(oldPrice)}</span>
              )}
              {discountPercent > 0 && (
                <span className="detail-discount-tag">Giảm {discountPercent}%</span>
              )}
            </div>
            <div className="price-extra-note">
              <span>⚡ Tiết kiệm hơn khi mua combo hoặc áp mã voucher FREESHIP đơn từ 200.000₫</span>
            </div>
          </div>

          {/* COLOR / VARIANT SELECTION */}
          {product.colors && product.colors.length > 0 && (
            <div className="detail-option-group">
              <div className="option-label-row">
                <span className="option-label">Màu sắc / Phân loại:</span>
                <strong className="option-selected-val">{selectedColor}</strong>
              </div>
              <div className="color-swatches-grid">
                {product.colors.map((c, i) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`color-swatch-item ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedColor(c.name)}
                      title={`${c.name} (Mã: ${c.code || i + 1})`}
                    >
                      <span
                        className="color-dot"
                        style={{ backgroundColor: c.hex || "#f472b6" }}
                      />
                      <span className="color-name">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUANTITY SELECTOR */}
          <div className="detail-option-group">
            <div className="option-label-row">
              <span className="option-label">Số lượng:</span>
            </div>
            <div className="quantity-counter-box">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Giảm số lượng"
              >
                -
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                aria-label="Tăng số lượng"
              >
                +
              </button>
              <span className="qty-stock-hint">
                ({product.stock || 50} sản phẩm có sẵn)
              </span>
            </div>
          </div>

          {/* CTA BUTTONS */}
          <div className="detail-actions-group">
            <button
              type="button"
              className="btn-add-to-cart"
              onClick={() => onAddToCart(product, quantity)}
            >
              <span className="btn-icon">🛒</span>
              <span>Thêm Vào Giỏ Hàng</span>
            </button>

            <button
              type="button"
              className="btn-buy-now-flash"
              onClick={() => onBuyNow(product, quantity)}
            >
              <span className="btn-icon">⚡</span>
              <span>Mua Ngay Hỏa Tốc</span>
            </button>

            <button
              type="button"
              className={`btn-detail-wishlist ${isWishlisted(product.id) ? "active" : ""}`}
              onClick={(e) => onToggleWishlist(product, e)}
              title={isWishlisted(product.id) ? "Đã lưu yêu thích" : "Lưu vào yêu thích"}
              aria-label="Yêu thích"
            >
              {isWishlisted(product.id) ? "❤️" : "♡"}
            </button>
          </div>

          {/* ASSURANCE PERKS BANNER */}
          <div className="detail-assurance-box">
            <div className="assurance-item">
              <span className="assurance-icon">🚚</span>
              <div>
                <strong>FREESHIP toàn quốc</strong>
                <p>Miễn phí vận chuyển cho đơn hàng từ 200.000₫</p>
              </div>
            </div>
            <div className="assurance-item">
              <span className="assurance-icon">⚡</span>
              <div>
                <strong>Giao hỏa tốc 2H Cần Thơ</strong>
                <p>Nhận hàng ngay trong ngày tại nội ô TP. Cần Thơ</p>
              </div>
            </div>
            <div className="assurance-item">
              <span className="assurance-icon">🔄</span>
              <div>
                <strong>Đổi trả 7 ngày linh hoạt</strong>
                <p>Bảo hành và hỗ trợ đổi trả nếu len lỗi hoặc sai màu</p>
              </div>
            </div>
            <div className="assurance-item">
              <span className="assurance-icon">🎁</span>
              <div>
                <strong>Hỗ trợ kỹ thuật 24/7</strong>
                <p>Đội ngũ Sene hỗ trợ đọc chart & hướng dẫn móc qua Zalo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BELOW-FOLD TABBED SPECIFICATIONS & CONTENT */}
      <section className="product-tabbed-section">
        <div className="tabs-header-nav">
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === "specs" ? "active" : ""}`}
            onClick={() => setActiveTab("specs")}
          >
            📋 Thông Số Kỹ Thuật
          </button>
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === "guide" ? "active" : ""}`}
            onClick={() => setActiveTab("guide")}
          >
            🧶 Hướng Dẫn & Bảo Quản
          </button>
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            ⭐ Đánh Giá Khách Hàng ({product.reviewCount || 120})
          </button>
        </div>

        <div className="tab-content-container">
          {/* TAB 1: SPECS & DETAILS */}
          {activeTab === "specs" && (
            <div className="tab-pane-specs">
              <div className="specs-table-wrapper">
                <table className="specs-table">
                  <tbody>
                    <tr>
                      <th>Thương hiệu</th>
                      <td>{product.brand || "Sene Handmade"}</td>
                    </tr>
                    <tr>
                      <th>Danh mục</th>
                      <td>{product.category?.name || "Len Sợi"}</td>
                    </tr>
                    {product.specs && (
                      <>
                        {product.specs.material && (
                          <tr>
                            <th>Chất liệu</th>
                            <td>{product.specs.material}</td>
                          </tr>
                        )}
                        {product.specs.weight && (
                          <tr>
                            <th>Trọng lượng</th>
                            <td>{product.specs.weight}</td>
                          </tr>
                        )}
                        {product.specs.diameter && (
                          <tr>
                            <th>Kích thước sợi</th>
                            <td>{product.specs.diameter}</td>
                          </tr>
                        )}
                        {product.specs.hookSize && (
                          <tr>
                            <th>Kim móc gợi ý</th>
                            <td>{product.specs.hookSize}</td>
                          </tr>
                        )}
                        {product.specs.needleSize && (
                          <tr>
                            <th>Kim đan gợi ý</th>
                            <td>{product.specs.needleSize}</td>
                          </tr>
                        )}
                        {product.specs.origin && (
                          <tr>
                            <th>Xuất xứ</th>
                            <td>{product.specs.origin}</td>
                          </tr>
                        )}
                        {product.specs.usage && (
                          <tr>
                            <th>Ứng dụng phù hợp</th>
                            <td>{product.specs.usage}</td>
                          </tr>
                        )}
                        {product.specs.difficulty && (
                          <tr>
                            <th>Độ khó</th>
                            <td>{product.specs.difficulty}</td>
                          </tr>
                        )}
                        {product.specs.videoGuide && (
                          <tr>
                            <th>Video hướng dẫn</th>
                            <td>{product.specs.videoGuide}</td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="product-description-prose">
                <h3>Mô Tả Chi Tiết Sản Phẩm</h3>
                <p>{product.description}</p>
              </div>
            </div>
          )}

          {/* TAB 2: USAGE & CARE GUIDE */}
          {activeTab === "guide" && (
            <div className="tab-pane-guide">
              <div className="guide-card-box">
                <h4>✨ {product.guide?.title || "Hướng dẫn sử dụng & mẹo đan móc"}</h4>
                <p className="guide-content-text">
                  {product.guide?.content ||
                    "Đối với len sợi và thú bông handmade, bạn nên giặt tay nhẹ nhàng với dầu gội hoặc sữa tắm, không vắt xoắn mạnh, phơi phẳng trên bề mặt thoáng gió tránh ánh nắng gắt trực tiếp."}
                </p>

                <div className="care-steps-grid">
                  <div className="care-step">
                    <span className="step-num">1</span>
                    <strong>Giặt tay êm dịu</strong>
                    <p>Hòa tan dung dịch giặt dịu nhẹ với nước mát 25-30°C trước khi cho sản phẩm vào ngâm 5-10 phút.</p>
                  </div>
                  <div className="care-step">
                    <span className="step-num">2</span>
                    <strong>Bóp nhẹ ráo nước</strong>
                    <p>Dùng khăn tắm sạch cuộn tròn sản phẩm và ép nhẹ để thấm hút bớt nước, tuyệt đối không vặn xoắn.</p>
                  </div>
                  <div className="care-step">
                    <span className="step-num">3</span>
                    <strong>Phơi phẳng trong bóng râm</strong>
                    <p>Trải phẳng trên giá phơi hoặc mặt lưới thoáng, tránh treo móc trực tiếp vì sẽ làm dão mũi đan.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER REVIEWS */}
          {activeTab === "reviews" && (
            <div className="tab-pane-reviews">
              <div className="reviews-summary-card">
                <div className="summary-score-col">
                  <span className="big-rating">{product.rating || "4.9"}</span>
                  <div className="stars-gold">★★★★★</div>
                  <span className="summary-total">{product.reviewCount || 120} đánh giá chân thực</span>
                </div>
                <div className="summary-bars-col">
                  <div className="bar-row"><span>5 sao</span><div className="bar-track"><div className="bar-fill" style={{ width: "95%" }}></div></div><span>95%</span></div>
                  <div className="bar-row"><span>4 sao</span><div className="bar-track"><div className="bar-fill" style={{ width: "4%" }}></div></div><span>4%</span></div>
                  <div className="bar-row"><span>3 sao</span><div className="bar-track"><div className="bar-fill" style={{ width: "1%" }}></div></div><span>1%</span></div>
                </div>
              </div>

              {/* SAMPLE VERIFIED REVIEWS */}
              <div className="reviews-feedback-list">
                <div className="feedback-item">
                  <div className="feedback-avatar">🌸</div>
                  <div className="feedback-body">
                    <div className="feedback-header">
                      <strong>Thanh Ngân (TP. Cần Thơ)</strong>
                      <span className="verified-badge">✓ Đã mua hàng</span>
                      <span className="feedback-date">2 ngày trước</span>
                    </div>
                    <div className="stars-gold">★★★★★</div>
                    <p className="feedback-text">
                      Len nhận được màu rất xinh, giống y hệt hình mẫu! Sợi len se chắc chắn, không bị tưa khi móc, cầm rất êm tay. Shop đóng gói cẩn thận có tặng kèm ghim định vị xinh xắn nữa. Ship Cần Thơ siêu nhanh!
                    </p>
                  </div>
                </div>

                <div className="feedback-item">
                  <div className="feedback-avatar">🧸</div>
                  <div className="feedback-body">
                    <div className="feedback-header">
                      <strong>Minh Thư (Hà Nội)</strong>
                      <span className="verified-badge">✓ Đã mua hàng</span>
                      <span className="feedback-date">1 tuần trước</span>
                    </div>
                    <div className="stars-gold">★★★★★</div>
                    <p className="feedback-text">
                      Mình là người mới tập móc lần đầu mà xem video hướng dẫn của Sene làm theo rất dễ hiểu. Móc xong bé gấu ai cũng khen xinh. Sẽ tiếp tục ủng hộ tiệm dài dài ạ!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FREQUENTLY BOUGHT TOGETHER */}
      {frequentlyBought.length > 0 && (
        <section className="frequently-bought-section">
          <div className="section-head">
            <h3>🛍️ Thường Được Mua Cùng Nhau</h3>
            <p>Gợi ý kết hợp nguyên liệu hoàn hảo để hoàn thiện tác phẩm của bạn</p>
          </div>

          <div className="combo-bundle-wrapper">
            <div className="bundle-items-flow">
              <div className="bundle-item-card main-item">
                <img src={images[0]} alt={product.name} />
                <div className="bundle-item-info">
                  <span className="bundle-tag">Sản phẩm chính</span>
                  <strong>{product.name}</strong>
                  <span className="bundle-price">{formatPrice(currentPrice)}</span>
                </div>
              </div>

              {frequentlyBought.map((item) => (
                <React.Fragment key={item.id}>
                  <span className="bundle-plus">+</span>
                  <div className="bundle-item-card">
                    <img src={item.images?.[0]} alt={item.name} />
                    <div className="bundle-item-info">
                      <span className="bundle-tag">{item.category?.name}</span>
                      <strong>{item.name}</strong>
                      <span className="bundle-price">{formatPrice(item.price)}</span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="bundle-checkout-card">
              <div className="bundle-total-line">
                <span>Tổng giá combo:</span>
                <strong className="bundle-total-val">{formatPrice(comboTotalPrice)}</strong>
              </div>
              <button
                type="button"
                className="btn-add-combo"
                onClick={handleAddCombo}
              >
                + Mua Trọn Bộ Combo
              </button>
            </div>
          </div>
        </section>
      )}

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="section-head">
            <h3>Sản Phẩm Tương Tự Bạn Có Thể Thích</h3>
            <p>Khám phá thêm các sản phẩm cùng danh mục {product.category?.name}</p>
          </div>
          <div className="related-grid">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenDetail={onOpenProductDetail}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                isWishlisted={isWishlisted(p.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* MOBILE STICKY PURCHASE BAR (<= 768px) - FIXED ABOVE BOTTOM NAV */}
      <div className="mobile-sticky-buy-bar mobile-only">
        <div className="sticky-price-box">
          <small className="sticky-price-label">Giá ưu đãi</small>
          <strong className="sticky-price-val">{formatPrice(currentPrice)}</strong>
        </div>
        <div className="sticky-actions-box">
          <button
            type="button"
            className="sticky-add-cart-btn"
            onClick={() => onAddToCart(product, quantity)}
            aria-label="Thêm vào giỏ"
            title="Thêm vào giỏ"
          >
            🛒 +Giỏ
          </button>
          <button
            type="button"
            className="sticky-buy-now-btn"
            onClick={() => onBuyNow(product, quantity)}
          >
            ⚡ Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}
