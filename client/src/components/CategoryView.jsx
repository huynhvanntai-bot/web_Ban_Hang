import React, { useState, useMemo } from "react";
import ProductCard from "./ProductCard.jsx";
import {
  CATEGORIES,
  CATEGORY_FILTER_CONFIGS,
  PRODUCTS,
  getCategoryBySlug,
  getBestSellers,
  getSaleProducts,
  getNewProducts,
} from "../data/products.js";

export default function CategoryView({
  categorySlug,
  initialSubcategory,
  allProducts,
  onOpenProductDetail,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  onNavigateHome,
  onNavigateCategory,
}) {
  const cleanSlug = String(categorySlug || "").toLowerCase().trim();

  const isSpecialSale = cleanSlug === "khuyen-mai" || cleanSlug === "giam-gia";
  const isSpecialBestSeller = cleanSlug === "san-pham-ban-chay" || cleanSlug === "ban-chay";
  const isSpecialNew = cleanSlug === "san-pham-moi";

  const categoryMeta = useMemo(() => {
    if (isSpecialSale) {
      return {
        id: "cat-sale",
        name: "Sản Phẩm Khuyến Mãi",
        slug: "khuyen-mai",
        icon: "🏷️",
        banner: "/images/banners/banner-set-diy.jpg",
        description: "Các sản phẩm len sợi, set kit DIY và phụ kiện đan móc đang có chương trình giảm giá sốc tới 30% tại Sene Handmade.",
        subcategories: [],
      };
    }
    if (isSpecialBestSeller) {
      return {
        id: "cat-bestseller",
        name: "Sản Phẩm Bán Chạy",
        slug: "san-pham-ban-chay",
        icon: "🔥",
        banner: "/images/banners/banner-san-pham-ban-chay.jpg",
        description: "Những cuộn len Milk Cotton, thú bông Amigurumi và set kit tự móc được cộng đồng người đan móc yêu thích và đặt nhiều nhất.",
        subcategories: [],
      };
    }
    if (isSpecialNew) {
      return {
        id: "cat-new",
        name: "Sản Phẩm Mới Về",
        slug: "san-pham-moi",
        icon: "✨",
        banner: "/images/banners/banner-khuyen-mai.jpg",
        description: "Các mẫu len mới cập bến, bảng màu mới toanh và những set kit DIY vừa ra lò tại tiệm Sene Handmade.",
        subcategories: [],
      };
    }

    const found = getCategoryBySlug(cleanSlug);
    if (found) return found;

    // Fallback if not directly in predefined list
    const humanName = cleanSlug
      ? cleanSlug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : "Tất Cả Sản Phẩm";

    return {
      id: `cat-${cleanSlug || "all"}`,
      name: humanName,
      slug: cleanSlug,
      icon: "🧶",
      banner: "/images/banners/banner-len-soi.jpg",
      description: "Thế giới đan móc len sợi thủ công Sene Handmade.",
      subcategories: [],
    };
  }, [cleanSlug, isSpecialSale, isSpecialBestSeller, isSpecialNew]);

  // Filter state
  const [selectedSubcat, setSelectedSubcat] = useState(initialSubcategory || "");
  const [priceRange, setPriceRange] = useState("all");
  const [customFilterKey, setCustomFilterKey] = useState("");
  const [customFilterVal, setCustomFilterVal] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const activeFilterCount =
    (selectedSubcat ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (customFilterVal ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  // Retrieve category filter configurations safely
  const filterConfigRaw = CATEGORY_FILTER_CONFIGS[cleanSlug] || null;
  const filterGroups = Array.isArray(filterConfigRaw)
    ? filterConfigRaw
    : filterConfigRaw && typeof filterConfigRaw === "object"
    ? [filterConfigRaw]
    : [];

  // Filter logic - robust & null-safe
  const filteredProducts = useMemo(() => {
    const rawList = Array.isArray(allProducts) && allProducts.length > 0 ? allProducts : PRODUCTS;
    let prods = [];

    if (isSpecialSale) {
      prods = getSaleProducts(50);
    } else if (isSpecialBestSeller) {
      prods = getBestSellers(50);
    } else if (isSpecialNew) {
      prods = getNewProducts(50);
    } else if (cleanSlug) {
      prods = rawList.filter((p) => {
        if (!p) return false;
        const pCatSlug = p.category?.slug || (typeof p.category === "string" ? p.category : "") || "";
        const pCatName = p.category?.name || "";
        const metaName = categoryMeta?.name || "";

        // Exact slug matches
        if (pCatSlug === cleanSlug) return true;

        // Alias matches
        if (
          (cleanSlug === "phu-kien-handmade" || cleanSlug === "phu-kien") &&
          (pCatSlug === "phu-kien" || pCatSlug === "phu-kien-handmade")
        )
          return true;
        if (
          (cleanSlug === "san-pham-ban-chay" || cleanSlug === "ban-chay") &&
          (pCatSlug === "ban-chay" || pCatSlug === "san-pham-ban-chay" || p.featured)
        )
          return true;
        if (
          (cleanSlug === "thu-len-handmade" || cleanSlug === "thu-len") &&
          (pCatSlug === "thu-len-handmade" || pCatSlug === "thu-len")
        )
          return true;
        if (
          (cleanSlug === "kim-moc-dung-cu" || cleanSlug === "kim-moc") &&
          (pCatSlug === "kim-moc-dung-cu" || pCatSlug === "kim-moc" || pCatSlug === "dung-cu")
        )
          return true;
        if (
          (cleanSlug === "combo-nguyen-lieu" || cleanSlug === "combo") &&
          (pCatSlug === "combo-nguyen-lieu" || pCatSlug === "combo")
        )
          return true;

        // Name and tag fallback matches
        if (pCatName && metaName && pCatName.toLowerCase().includes(metaName.toLowerCase()))
          return true;
        if (
          p.tags &&
          Array.isArray(p.tags) &&
          p.tags.some((t) => typeof t === "string" && t.toLowerCase().includes(cleanSlug.replace(/-/g, " ")))
        )
          return true;

        return false;
      });
    } else {
      prods = rawList;
    }

    // Subcategory filter
    if (selectedSubcat) {
      const subLower = selectedSubcat.toLowerCase();
      prods = prods.filter((p) => {
        if (!p) return false;
        const matchSubCategory =
          typeof p.subCategory === "string" && p.subCategory.toLowerCase().includes(subLower);
        const matchSubcategoriesArray =
          Array.isArray(p.subcategories) &&
          p.subcategories.some((s) => typeof s === "string" && s.toLowerCase().includes(subLower));
        const matchTag =
          Array.isArray(p.tags) &&
          p.tags.some((t) => typeof t === "string" && t.toLowerCase().includes(subLower));
        const matchName =
          typeof p.name === "string" && p.name.toLowerCase().includes(subLower);

        return matchSubCategory || matchSubcategoriesArray || matchTag || matchName;
      });
    }

    // Price range filter
    if (priceRange === "<50k") prods = prods.filter((p) => (p.price || 0) < 50000);
    else if (priceRange === "50k-150k")
      prods = prods.filter((p) => (p.price || 0) >= 50000 && (p.price || 0) <= 150000);
    else if (priceRange === "150k-300k")
      prods = prods.filter((p) => (p.price || 0) > 150000 && (p.price || 0) <= 300000);
    else if (priceRange === ">300k") prods = prods.filter((p) => (p.price || 0) > 300000);

    // Dynamic Category-Specific Filter
    if (customFilterKey && customFilterVal) {
      const valLower = customFilterVal.toLowerCase();
      prods = prods.filter((p) => {
        if (!p) return false;
        if (p.specs && p.specs[customFilterKey]) {
          if (String(p.specs[customFilterKey]).toLowerCase().includes(valLower)) return true;
        }
        if (customFilterKey === "subCategory" && p.subCategory) {
          if (String(p.subCategory).toLowerCase().includes(valLower)) return true;
        }
        if (p.tags && Array.isArray(p.tags) && p.tags.some((t) => String(t).toLowerCase().includes(valLower))) {
          return true;
        }
        if (p.name && String(p.name).toLowerCase().includes(valLower)) return true;
        return false;
      });
    }

    // In-stock toggle
    if (inStockOnly) {
      prods = prods.filter((p) => (p.stock || 0) > 0);
    }

    // Sorting
    const sorted = [...prods];
    if (sortBy === "price-asc") sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-desc") sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === "bestseller") sorted.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    else if (sortBy === "rating") sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === "name-asc")
      sorted.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "vi"));

    return sorted;
  }, [
    allProducts,
    cleanSlug,
    categoryMeta,
    isSpecialSale,
    isSpecialBestSeller,
    isSpecialNew,
    selectedSubcat,
    priceRange,
    customFilterKey,
    customFilterVal,
    inStockOnly,
    sortBy,
  ]);

  function resetFilters() {
    setSelectedSubcat("");
    setPriceRange("all");
    setCustomFilterKey("");
    setCustomFilterVal("");
    setInStockOnly(false);
    setSortBy("default");
  }

  const hasActiveFilters =
    Boolean(selectedSubcat) || priceRange !== "all" || Boolean(customFilterVal) || inStockOnly;

  return (
    <div className="category-page-wrapper">
      {/* BREADCRUMB */}
      <nav className="category-breadcrumbs" aria-label="Breadcrumb">
        <div className="breadcrumb-inner">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
          >
            Trang chủ
          </a>
          <span className="crumb-sep">/</span>
          <span className="crumb-folder">Danh mục</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{categoryMeta.name}</span>
          {selectedSubcat && (
            <>
              <span className="crumb-sep">/</span>
              <span className="crumb-sub">{selectedSubcat}</span>
            </>
          )}
        </div>
      </nav>

      {/* CATEGORY HERO BANNER */}
      <section className="category-hero-banner">
        <div
          className="cat-banner-bg"
          style={{ backgroundImage: `url(${categoryMeta.banner})` }}
        >
          <div className="cat-banner-overlay" />
        </div>
        <div className="cat-banner-content">
          <div className="cat-banner-icon">{categoryMeta.icon}</div>
          <h1 className="cat-banner-title">{categoryMeta.name}</h1>
          <p className="cat-banner-desc">{categoryMeta.description}</p>
          <div className="cat-banner-stats">
            <span>✨ {filteredProducts.length} sản phẩm tuyển chọn</span>
            <span>🚚 Giao hỏa tốc 2H Cần Thơ</span>
            <span>⭐ Đánh giá 4.9/5 sao</span>
          </div>
        </div>
      </section>

      {/* MOBILE QUICK FILTER & SORT BAR (<= 1024px) */}
      <div className="category-mobile-filter-bar mobile-only">
        <button
          type="button"
          className={`mobile-filter-trigger-btn ${hasActiveFilters ? "has-active" : ""}`}
          onClick={() => setMobileFilterOpen(true)}
        >
          <span className="filter-icon">⚡</span>
          <span>Bộ lọc {hasActiveFilters ? `(${activeFilterCount})` : ""}</span>
        </button>

        <div className="mobile-sort-select-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mobile-sort-select"
            aria-label="Sắp xếp sản phẩm"
          >
            <option value="default">Sắp xếp: Mặc định</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
            <option value="bestseller">Bán chạy nhất</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="category-layout-container">
        {/* SIDEBAR FILTERS (DESKTOP ONLY) */}
        <aside className="category-sidebar desktop-sidebar-only" aria-label="Bộ lọc sản phẩm">
          <div className="sidebar-header">
            <span className="sidebar-title">
              <span className="sidebar-icon">⚙️</span> Bộ Lọc Tìm Kiếm
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filters-btn"
                onClick={resetFilters}
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* ALL CATEGORIES QUICK NAVIGATION */}
          <div className="filter-group">
            <h4 className="filter-group-title">Danh Mục Chính</h4>
            <ul className="cat-list-filter">
              {CATEGORIES.map((c) => {
                const isSelectedCat =
                  c.slug === cleanSlug ||
                  (cleanSlug === "phu-kien" && c.slug === "phu-kien-handmade") ||
                  (cleanSlug === "ban-chay" && c.slug === "san-pham-ban-chay");
                return (
                  <li key={c.slug}>
                    <button
                      type="button"
                      className={`cat-filter-btn ${isSelectedCat ? "active" : ""}`}
                      onClick={() => {
                        resetFilters();
                        onNavigateCategory(c.slug);
                      }}
                    >
                      <span>
                        {c.icon} {c.name}
                      </span>
                      <span className="cat-btn-count">›</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* SUBCATEGORIES FILTER (CHIPS) */}
          {categoryMeta.subcategories && categoryMeta.subcategories.length > 0 && (
            <div className="filter-group">
              <h4 className="filter-group-title">Nhóm Sản Phẩm</h4>
              <div className="filter-chips-list">
                <button
                  type="button"
                  className={`filter-chip ${!selectedSubcat ? "active" : ""}`}
                  onClick={() => setSelectedSubcat("")}
                >
                  Tất cả nhóm
                </button>
                {categoryMeta.subcategories.map((sub) => (
                  <button
                    key={sub.slug}
                    type="button"
                    className={`filter-chip ${selectedSubcat === sub.slug ? "active" : ""}`}
                    onClick={() =>
                      setSelectedSubcat(selectedSubcat === sub.slug ? "" : sub.slug)
                    }
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ATTRIBUTE FILTER GROUPS (SAFELY HANDLED) */}
          {filterGroups.map((group) => {
            if (!group || !Array.isArray(group.options)) return null;
            return (
              <div key={group.key} className="filter-group">
                <h4 className="filter-group-title">{group.label || group.title}</h4>
                <div className="filter-chips-list">
                  {group.options.map((opt) => {
                    const isSelected =
                      customFilterKey === group.key && customFilterVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`filter-chip ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          if (isSelected) {
                            setCustomFilterKey("");
                            setCustomFilterVal("");
                          } else {
                            setCustomFilterKey(group.key);
                            setCustomFilterVal(opt.value);
                          }
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* PRICE RANGE FILTER */}
          <div className="filter-group">
            <h4 className="filter-group-title">Khoảng Giá</h4>
            <div className="filter-radio-list">
              {[
                { id: "all", label: "Tất cả mức giá" },
                { id: "<50k", label: "Dưới 50.000₫" },
                { id: "50k-150k", label: "50.000₫ - 150.000₫" },
                { id: "150k-300k", label: "150.000₫ - 300.000₫" },
                { id: ">300k", label: "Trên 300.000₫" },
              ].map((p) => (
                <label key={p.id} className="filter-radio-item">
                  <input
                    type="radio"
                    name="category-price-filter"
                    checked={priceRange === p.id}
                    onChange={() => setPriceRange(p.id)}
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* IN STOCK ONLY TOGGLE */}
          <div className="filter-group">
            <label className="filter-toggle-label">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>Chỉ hiện sản phẩm còn hàng</span>
            </label>
          </div>
        </aside>

        {/* MAIN PRODUCT CATALOG */}
        <main className="category-main-content">
          {/* CATALOG TOOLBAR */}
          <div className="category-toolbar">
            <div className="toolbar-left">
              <span className="products-count-badge">
                Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm
              </span>

              {/* ACTIVE FILTER TAGS */}
              {hasActiveFilters && (
                <div className="active-filter-chips">
                  {selectedSubcat && (
                    <span className="active-tag">
                      Nhóm: {selectedSubcat}
                      <button onClick={() => setSelectedSubcat("")}>×</button>
                    </span>
                  )}
                  {priceRange !== "all" && (
                    <span className="active-tag">
                      Giá: {priceRange}
                      <button onClick={() => setPriceRange("all")}>×</button>
                    </span>
                  )}
                  {customFilterVal && (
                    <span className="active-tag">
                      Lọc: {customFilterVal}
                      <button
                        onClick={() => {
                          setCustomFilterKey("");
                          setCustomFilterVal("");
                        }}
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {inStockOnly && (
                    <span className="active-tag">
                      Còn hàng
                      <button onClick={() => setInStockOnly(false)}>×</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* SORT SELECTOR */}
            <div className="toolbar-right">
              <label htmlFor="cat-sort-select" className="sort-label">
                Sắp xếp theo:
              </label>
              <select
                id="cat-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cat-sort-dropdown"
              >
                <option value="default">Gợi ý hàng đầu</option>
                <option value="bestseller">Bán chạy nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="name-asc">Tên: A đến Z</option>
              </select>
            </div>
          </div>

          {/* PRODUCT GRID OR BEAUTIFUL EMPTY STATE */}
          {filteredProducts.length > 0 ? (
            <div className="category-products-grid">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id || prod._id || prod.slug}
                  product={prod}
                  onOpenDetail={onOpenProductDetail}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                  isWishlisted={typeof isWishlisted === "function" ? isWishlisted(prod.id || prod._id) : false}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          ) : (
            /* REQUIREMENT 3: DEDICATED EMPTY STATE */
            <div className="category-empty-state">
              <div className="empty-icon">🧶</div>
              <h2 className="empty-title">Chưa có sản phẩm</h2>
              <p className="empty-description">
                Hiện danh mục này chưa có sản phẩm.
                <br />
                Vui lòng quay lại sau hoặc khám phá các sản phẩm khác.
              </p>
              <div className="empty-actions">
                <button
                  type="button"
                  className="empty-btn empty-btn-primary"
                  onClick={() => {
                    resetFilters();
                    onNavigateCategory("len-soi");
                  }}
                >
                  Xem sản phẩm khác
                </button>
                <button
                  type="button"
                  className="empty-btn empty-btn-secondary"
                  onClick={onNavigateHome}
                >
                  Quay về trang chủ
                </button>
              </div>
            </div>
          )}

          {/* SEO CONTENT FOOTER BLOCK */}
          <article className="category-seo-article">
            <h2>Cẩm Nang & Kinh Nghiệm Chọn Mua {categoryMeta.name} Tại Sene Handmade</h2>
            <p>
              Chào mừng bạn đến với chuyên mục <strong>{categoryMeta.name}</strong> của Tiệm Len Sene Handmade.
              Tất cả sản phẩm tại tiệm đều được kiểm định chất lượng nghiêm ngặt về độ mềm mại, độ se sợi chắc chắn,
              không tưa xơ và an toàn tuyệt đối cho người sử dụng, đặc biệt là trẻ sơ sinh và làn da nhạy cảm.
            </p>
            <div className="seo-features-grid">
              <div className="seo-feature-card">
                <h4>🧶 Len Sợi Tiêu Chuẩn</h4>
                <p>Chất len mịn màng, độ đàn hồi tự nhiên cao giúp mũi móc đứng phom và không bị bai nhão khi giặt.</p>
              </div>
              <div className="seo-feature-card">
                <h4>🚚 Giao Hàng Toàn Quốc</h4>
                <p>Hỏa tốc 2H tại nội ô TP. Cần Thơ, giao COD an toàn tận nhà toàn quốc chỉ 2-3 ngày làm việc.</p>
              </div>
              <div className="seo-feature-card">
                <h4>🎁 Hỗ Trợ Đan Móc 24/7</h4>
                <p>Đội ngũ Sene Handmade luôn sẵn sàng hướng dẫn đọc chart và giải đáp mọi thắc mắc của bạn qua Zalo.</p>
              </div>
            </div>
          </article>
        </main>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET / DRAWER */}
      {mobileFilterOpen && (
        <div
          className="mobile-filter-drawer-backdrop"
          onClick={() => setMobileFilterOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Bộ lọc sản phẩm di động"
        >
          <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="drawer-title">
                <span className="drawer-icon">⚡</span> Bộ Lọc Sản Phẩm
              </span>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Đóng bộ lọc"
              >
                ×
              </button>
            </div>

            <div className="drawer-body">
              {/* SUBCATEGORIES */}
              {categoryMeta.subcategories && categoryMeta.subcategories.length > 0 && (
                <div className="drawer-filter-section">
                  <h4 className="drawer-section-title">Nhóm sản phẩm</h4>
                  <div className="drawer-chips-wrap">
                    <button
                      type="button"
                      className={`drawer-chip ${!selectedSubcat ? "active" : ""}`}
                      onClick={() => setSelectedSubcat("")}
                    >
                      Tất cả nhóm
                    </button>
                    {categoryMeta.subcategories.map((sub) => (
                      <button
                        key={sub.slug}
                        type="button"
                        className={`drawer-chip ${selectedSubcat === sub.slug ? "active" : ""}`}
                        onClick={() =>
                          setSelectedSubcat(selectedSubcat === sub.slug ? "" : sub.slug)
                        }
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PRICE RANGES */}
              <div className="drawer-filter-section">
                <h4 className="drawer-section-title">Mức giá</h4>
                <div className="drawer-chips-wrap">
                  {[
                    { id: "all", label: "Tất cả mức giá" },
                    { id: "<50k", label: "Dưới 50.000₫" },
                    { id: "50k-150k", label: "50k - 150k" },
                    { id: "150k-300k", label: "150k - 300k" },
                    { id: ">300k", label: "Trên 300k" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`drawer-chip ${priceRange === p.id ? "active" : ""}`}
                      onClick={() => setPriceRange(p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* IN STOCK ONLY TOGGLE */}
              <div className="drawer-filter-section">
                <label className="drawer-toggle-row">
                  <span>Chỉ hiện sản phẩm còn hàng</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="drawer-toggle-checkbox"
                  />
                </label>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                className="drawer-reset-btn"
                onClick={() => {
                  resetFilters();
                }}
              >
                Xóa bộ lọc
              </button>
              <button
                type="button"
                className="drawer-apply-btn"
                onClick={() => setMobileFilterOpen(false)}
              >
                Xem {filteredProducts.length} sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
