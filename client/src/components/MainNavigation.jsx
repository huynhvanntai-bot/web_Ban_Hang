import React, { useState } from "react";

export default function MainNavigation({
  activeCategorySlug,
  onSelectCategory,
  onSelectSubcategory,
  onOpenCustomOrder,
  onScrollToSection,
}) {
  const [hoveredCat, setHoveredCat] = useState(null);

  // 10 core e-commerce categories - clean icon + name only
  const mainNavItems = [
    {
      slug: "len-soi",
      name: "Len sợi",
      icon: "🧶",
      subcategories: [
        { slug: "milk-cotton", name: "Len Milk Cotton 50g" },
        { slug: "len-nhung", name: "Len nhung đũa khổng lồ" },
        { slug: "len-pastel", name: "Len sắc độ pastel" },
        { slug: "len-cotton", name: "Len cotton chải kỹ" },
        { slug: "soi-det", name: "Sợi dệt móc túi xách" },
      ],
    },
    {
      slug: "kim-moc-dung-cu",
      name: "Kim móc & dụng cụ",
      icon: "🪡",
      subcategories: [
        { slug: "kim-moc", name: "Kim móc cán dẻo công thái học" },
        { slug: "keo", name: "Kéo cắt chỉ vintage" },
        { slug: "kim-khau-len", name: "Kim khâu len & ghim định vị" },
        { slug: "dung-cu-danh-dau", name: "Dụng cụ đánh dấu mũi móc" },
        { slug: "phu-kien-dan-moc", name: "Bông gòn bi hạt đậu" },
      ],
    },
    {
      slug: "set-diy",
      name: "Set DIY",
      icon: "🎁",
      subcategories: [
        { slug: "set-diy-thu-len", name: "Set DIY móc thú bông" },
        { slug: "set-diy-hoa", name: "Set DIY móc hoa len" },
        { slug: "set-diy-moc-khoa", name: "Set DIY móc khóa mini" },
        { slug: "set-diy-cho-nguoi-moi", name: "Set DIY cho người mới bắt đầu" },
        { slug: "set-diy-co-video", name: "Set DIY video hướng dẫn A-Z" },
      ],
    },
    {
      slug: "hoa-len",
      name: "Hoa len",
      icon: "🌸",
      subcategories: [
        { slug: "hoa-hong", name: "Hoa hồng len nhung" },
        { slug: "hoa-tulip", name: "Bó hoa tulip pastel" },
        { slug: "bo-hoa-len", name: "Bó hoa len phối sẵn" },
        { slug: "hoa-len-mini", name: "Chậu hoa mini để bàn" },
      ],
    },
    {
      slug: "thu-len-handmade",
      name: "Thú len handmade",
      icon: "🧸",
      subcategories: [
        { slug: "thu-bong-amigurumi", name: "Thú bông Amigurumi" },
        { slug: "moc-khoa-thu", name: "Móc khóa thú bông mini" },
        { slug: "meo-cun-con", name: "Mèo con & Cún con" },
        { slug: "gau-bong-len", name: "Gấu bông len" },
      ],
    },
    {
      slug: "phu-kien-handmade",
      name: "Phụ kiện handmade",
      icon: "🎀",
      subcategories: [
        { slug: "mat-mui-thu", name: "Mắt mũi thú chốt an toàn" },
        { slug: "moc-khoa", name: "Móc khóa len xinh xắn" },
        { slug: "tui-len", name: "Dây xích & phụ kiện túi" },
        { slug: "charm", name: "Charm & chuông lục lạc" },
      ],
    },
    {
      slug: "combo-nguyen-lieu",
      name: "Combo nguyên liệu",
      icon: "📦",
      subcategories: [
        { slug: "combo-nguoi-moi", name: "Combo tập móc cho người mới" },
        { slug: "combo-10-hoa", name: "Combo 10 đóa hoa vĩnh cửu" },
        { slug: "combo-len-kim", name: "Combo len + kim móc SKC" },
        { slug: "combo-theo-mau", name: "Combo theo món dự án" },
      ],
    },
    {
      slug: "san-pham-ban-chay",
      name: "Sản phẩm bán chạy",
      icon: "🔥",
      subcategories: [],
    },
    {
      slug: "san-pham-moi",
      name: "Sản phẩm mới",
      icon: "✨",
      subcategories: [],
    },
    {
      slug: "khuyen-mai",
      name: "Khuyến mãi",
      icon: "🏷️",
      subcategories: [],
      highlight: true,
    },
  ];

  // Secondary utility items grouped into a clean dropdown
  const utilitySubItems = [
    { id: "yarn-palette", name: "Bảng màu len 80+ mã", icon: "🎨", action: () => onScrollToSection("yarn-palette") },
    { id: "beginner-corner", name: "Góc người mới tập móc", icon: "🌱", action: () => onScrollToSection("beginner-corner") },
    { id: "guides", name: "Cẩm nang & Mẹo đan móc", icon: "📖", action: () => onScrollToSection("guides") },
    { id: "custom-order", name: "Đặt móc theo mẫu yêu cầu", icon: "✂️", action: onOpenCustomOrder },
    { id: "orders", name: "Tra cứu đơn hàng", icon: "📦", action: () => onScrollToSection("orders") },
  ];

  return (
    <>
      {/* 1. DESKTOP NAVIGATION CONTAINER (>= 769px) */}
      <nav className="site-main-nav-container desktop-nav-only" aria-label="Danh mục thương mại">
        <div className="nav-primary-menu">
          <div className="nav-items-track">
            {mainNavItems.map((item) => {
              const isActive =
                activeCategorySlug === item.slug ||
                (item.slug === "phu-kien-handmade" && activeCategorySlug === "phu-kien") ||
                (item.slug === "san-pham-ban-chay" && activeCategorySlug === "ban-chay");
              const hasSub = item.subcategories && item.subcategories.length > 0;
              const isMenuOpen = hoveredCat === item.slug;

              return (
                <div
                  key={item.slug}
                  className={`nav-category-item ${isActive ? "active" : ""} ${item.highlight ? "nav-highlight" : ""} ${hasSub ? "has-dropdown" : ""}`}
                  onMouseEnter={() => hasSub && setHoveredCat(item.slug)}
                  onMouseLeave={() => setHoveredCat(null)}
                >
                  <a
                    href={`/danh-muc/${item.slug}`}
                    className="nav-category-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setHoveredCat(null);
                      onSelectCategory(item.slug);
                    }}
                    title={item.name}
                  >
                    <span className="nav-cat-icon">{item.icon}</span>
                    <span className="nav-cat-text">{item.name}</span>
                    {hasSub && <span className="nav-cat-arrow">▾</span>}
                  </a>

                  {/* TREE-STYLE COMPACT SUBCATEGORY DROPDOWN */}
                  {hasSub && isMenuOpen && (
                    <div className="nav-sub-dropdown" role="menu">
                      <div className="sub-dropdown-header">
                        <strong className="sub-header-title">{item.name}</strong>
                      </div>
                      <ul className="sub-dropdown-list">
                        {item.subcategories.map((sub) => (
                          <li key={sub.slug} className="sub-dropdown-item">
                            <a
                              href={`/danh-muc/${item.slug}?sub=${sub.slug}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setHoveredCat(null);
                                onSelectCategory(item.slug, sub.slug);
                              }}
                            >
                              <span className="tree-branch">├</span>
                              <span className="sub-item-text">{sub.name}</span>
                            </a>
                          </li>
                        ))}
                        <li className="sub-dropdown-item view-all-item">
                          <a
                            href={`/danh-muc/${item.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setHoveredCat(null);
                              onSelectCategory(item.slug);
                            }}
                          >
                            <span className="tree-branch">└</span>
                            <span className="sub-item-text view-all-text">Xem tất cả →</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}

            {/* MENU PHỤ: TIỆN ÍCH & CẨM NANG */}
            <div
              className="nav-category-item nav-utility-dropdown-item"
              onMouseEnter={() => setHoveredCat("tien-ich")}
              onMouseLeave={() => setHoveredCat(null)}
            >
              <button
                type="button"
                className="nav-category-link nav-utility-trigger"
                onClick={() => setHoveredCat(hoveredCat === "tien-ich" ? null : "tien-ich")}
              >
                <span className="nav-cat-icon">💡</span>
                <span className="nav-cat-text">Tiện ích</span>
                <span className="nav-cat-arrow">▾</span>
              </button>

              {hoveredCat === "tien-ich" && (
                <div className="nav-sub-dropdown nav-utility-sub-dropdown" role="menu">
                  <div className="sub-dropdown-header">
                    <strong className="sub-header-title">Tiện ích & Cẩm nang</strong>
                  </div>
                  <ul className="sub-dropdown-list">
                    {utilitySubItems.map((u, idx) => {
                      const isLast = idx === utilitySubItems.length - 1;
                      return (
                        <li key={u.id} className="sub-dropdown-item">
                          <a
                            href={`#${u.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setHoveredCat(null);
                              u.action();
                            }}
                          >
                            <span className="tree-branch">{isLast ? "└" : "├"}</span>
                            <span className="utility-menu-icon">{u.icon}</span>
                            <span className="sub-item-text">{u.name}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. DEDICATED MOBILE CATEGORY STRIP (<= 768px) - HORIZONTALLY SCROLLABLE CHIPS */}
      <div className="mobile-category-strip mobile-only" aria-label="Danh mục sản phẩm di động">
        <div className="mobile-category-track">
          {mainNavItems.map((item) => {
            const isActive =
              activeCategorySlug === item.slug ||
              (item.slug === "phu-kien-handmade" && activeCategorySlug === "phu-kien") ||
              (item.slug === "san-pham-ban-chay" && activeCategorySlug === "ban-chay");

            return (
              <button
                key={`mob-cat-${item.slug}`}
                type="button"
                className={`mobile-cat-chip ${isActive ? "active" : ""} ${item.highlight ? "chip-highlight" : ""}`}
                onClick={() => onSelectCategory(item.slug)}
              >
                <span className="chip-icon">{item.icon}</span>
                <span className="chip-text">{item.name}</span>
              </button>
            );
          })}
          <button
            type="button"
            className="mobile-cat-chip chip-utility"
            onClick={onOpenCustomOrder}
          >
            <span className="chip-icon">✂️</span>
            <span className="chip-text">Đặt móc mẫu</span>
          </button>
          <button
            type="button"
            className="mobile-cat-chip chip-utility"
            onClick={() => onScrollToSection("yarn-palette")}
          >
            <span className="chip-icon">🎨</span>
            <span className="chip-text">Bảng màu</span>
          </button>
        </div>
      </div>
    </>
  );
}
