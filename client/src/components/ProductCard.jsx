import React from "react";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);
}

export default function ProductCard({
  product,
  onOpenDetail,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
}) {
  if (!product) return null;

  const currentPrice = product.price || 0;
  const oldPrice = product.oldPrice || (product.isSale ? Math.round((currentPrice * 1.25) / 1000) * 1000 : null);
  const discountPercent = product.discount || (oldPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0);

  const mainImg = product.images?.[0] || "/images/products/len-soi/len-milk-cotton-50g-01.jpg";
  const hoverImg = product.images?.[1] || null;

  return (
    <article className="standard-product-card" id={`product-${product.slug || product._id}`}>
      {/* CARD MEDIA */}
      <div className="card-media-wrapper">
        <a
          href={`/san-pham/${product.slug}`}
          className="card-media-link"
          onClick={(e) => {
            e.preventDefault();
            onOpenDetail(product);
          }}
          aria-label={`Xem chi tiết ${product.name}`}
        >
          <img
            src={mainImg}
            alt={product.name}
            className="card-img card-primary-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80";
            }}
          />
          {hoverImg && (
            <img
              src={hoverImg}
              alt={`${product.name} - góc nhìn khác`}
              className="card-img card-hover-img"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </a>

        {/* BADGES */}
        <div className="card-badges">
          {discountPercent > 0 && (
            <span className="card-badge badge-sale">-{discountPercent}%</span>
          )}
          {product.featured && (
            <span className="card-badge badge-bestseller">Bán chạy ★</span>
          )}
          {product.videos?.length > 0 && (
            <span
              className="card-badge badge-video"
              title="Xem video thực tế"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(product, "video");
              }}
            >
              ▶ Video
            </span>
          )}
        </div>

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          className={`card-wish-btn ${isWishlisted ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product, e);
          }}
          title={isWishlisted ? "Bỏ yêu thích" : "Lưu vào yêu thích"}
          aria-label="Yêu thích"
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
      </div>

      {/* CARD CONTENT */}
      <div className="card-content">
        {/* CATEGORY & SWATCHES */}
        <div className="card-top-row">
          <span className="card-cat-name">
            {product.category?.name || "Handmade Sene"}
          </span>
          {product.colors && product.colors.length > 0 && (
            <div className="card-color-swatches" title={`${product.colors.length} mã màu`}>
              {product.colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="card-swatch-dot"
                  style={{ backgroundColor: c.hex || "#ffc0cb" }}
                />
              ))}
              {product.colors.length > 4 && (
                <small className="card-swatch-more">+{product.colors.length - 4}</small>
              )}
            </div>
          )}
        </div>

        {/* TITLE */}
        <h3 className="card-title">
          <a
            href={`/san-pham/${product.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onOpenDetail(product);
            }}
            title={product.name}
          >
            {product.name}
          </a>
        </h3>

        {/* RATING & SOLD */}
        <div className="card-rating-row">
          <span className="stars">★★★★★</span>
          <span className="rating-score">{product.rating || "4.9"}</span>
          <span className="card-sold-count">
            • Đã bán {product.soldCount || 120}+
          </span>
        </div>

        {/* PRICE ROW */}
        <div className="card-price-row">
          <div className="price-box">
            <span className="current-price">{formatPrice(currentPrice)}</span>
            {oldPrice && oldPrice > currentPrice && (
              <span className="old-price">{formatPrice(oldPrice)}</span>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="card-actions-row">
          <button
            type="button"
            className="card-btn-buynow"
            onClick={() => onBuyNow(product, 1)}
            title="Mua ngay hỏa tốc"
          >
            ⚡ Mua ngay
          </button>
          <button
            type="button"
            className="card-btn-addcart"
            onClick={() => onAddToCart(product, 1)}
            title="Thêm vào giỏ hàng"
            aria-label={`Thêm ${product.name} vào giỏ`}
          >
            + Giỏ
          </button>
        </div>
      </div>
    </article>
  );
}
