import { useEffect, useMemo, useState } from "react";
import "./App.css";
import AdminPage from "./AdminPage.jsx";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

const locationData = {
  "TP. Hồ Chí Minh": {
    "Quận 1": ["Phường Bến Nghé", "Phường Đa Kao"],
    "Quận 3": ["Phường Võ Thị Sáu", "Phường 7"],
    "Thành phố Thủ Đức": ["Phường Thảo Điền", "Phường Linh Chiểu"],
  },
  "Hà Nội": {
    "Quận Ba Đình": ["Phường Điện Biên", "Phường Ngọc Hà"],
    "Quận Hoàn Kiếm": ["Phường Hàng Bạc", "Phường Tràng Tiền"],
    "Quận Cầu Giấy": ["Phường Dịch Vọng", "Phường Yên Hòa"],
  },
  "Đà Nẵng": {
    "Quận Hải Châu": ["Phường Hải Châu", "Phường Thạch Thang"],
    "Quận Sơn Trà": ["Phường An Hải Bắc", "Phường Mân Thái"],
  },
};

function App() {
  if (window.location.pathname === "/admin") return <AdminPage />;
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("tai-shop-user") || "null"),
  );
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authMessage, setAuthMessage] = useState("");
  const [cartItems, setCartItems] = useState(() =>
    JSON.parse(localStorage.getItem("tai-shop-cart") || "[]"),
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    note: "",
    promoCode: "",
  });
  const [orderMessage, setOrderMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [toast, setToast] = useState("");
  const [activePromotions, setActivePromotions] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [locations, setLocations] = useState(locationData);

  useEffect(() => {
    localStorage.setItem("tai-shop-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const handleBack = () => setSelectedProduct(null);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setOrderHistory([]);
      return;
    }
    const token = localStorage.getItem("tai-shop-token");
    fetch(`${apiUrl}/orders/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : []))
      .then(setOrderHistory)
      .catch(() => setOrderHistory([]));
  }, [currentUser]);

  useEffect(() => {
    if (window.location.pathname === "/account" && currentUser) {
      setTimeout(
        () =>
          document
            .querySelector("#orders")
            ?.scrollIntoView({ behavior: "smooth" }),
        150,
      );
    }
  }, [currentUser]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((response) => (response.ok ? response.json() : []))
      .then((provinces) => {
        if (!provinces.length) return;
        const mapped = Object.fromEntries(
          provinces.map((province) => [
            province.name,
            Object.fromEntries(
              (province.districts || []).map((district) => [
                district.name,
                (district.wards || []).map((ward) => ward.name),
              ]),
            ),
          ]),
        );
        setLocations(mapped);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadStore() {
      try {
        const [categoryResponse, productResponse, promotionResponse] =
          await Promise.all([
            fetch(`${apiUrl}/categories`),
            fetch(`${apiUrl}/products?featured=true`),
            fetch(`${apiUrl}/promotions/active`),
          ]);
        if (!categoryResponse.ok || !productResponse.ok)
          throw new Error("API không phản hồi");
        setCategories(await categoryResponse.json());
        const loadedProducts = (await productResponse.json()).products;
        setProducts(loadedProducts);
        if (promotionResponse.ok)
          setActivePromotions(await promotionResponse.json());
        const detailSlug = window.location.pathname.startsWith("/san-pham/")
          ? window.location.pathname.replace("/san-pham/", "")
          : "";
        const directProduct = loadedProducts.find(
          (product) => product.slug === detailSlug,
        );
        if (directProduct) setSelectedProduct(directProduct);
      } catch (loadError) {
        setError("Chưa tải được sản phẩm. Hãy kiểm tra backend đang chạy.");
        console.error(loadError);
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, []);

  const visibleProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory =
          !activeCategory || product.category?.slug === activeCategory;
        const normalizedSearch = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !normalizedSearch ||
          `${product.name} ${product.brand} ${product.category?.name}`
            .toLowerCase()
            .includes(normalizedSearch);
        return matchesCategory && matchesSearch;
      }),
    [activeCategory, products, searchQuery],
  );

  async function submitAuth(event) {
    event.preventDefault();
    setAuthMessage("");
    try {
      const response = await fetch(`${apiUrl}/auth/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      localStorage.setItem("tai-shop-token", data.token);
      localStorage.setItem("tai-shop-user", JSON.stringify(data.user));
      setCurrentUser(data.user);
      setAuthMessage("Đăng nhập thành công.");
      setAuthForm({ name: "", email: "", password: "" });
    } catch (authError) {
      setAuthMessage(authError.message);
    }
  }

  function logout() {
    localStorage.removeItem("tai-shop-token");
    localStorage.removeItem("tai-shop-user");
    setCurrentUser(null);
    setAuthMessage("Bạn đã đăng xuất.");
  }

  function addToCart(product, quantity = 1) {
    setCartItems((items) => {
      const existing = items.find((item) => item.product === product._id);
      if (existing)
        return items.map((item) =>
          item.product === product._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, product.stock),
              }
            : item,
        );
      return [
        ...items,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
    setToast(`${product.name} đã được thêm vào giỏ hàng`);
    setTimeout(() => setToast(""), 2600);
  }

  function changeQuantity(productId, change) {
    setCartItems((items) =>
      items
        .map((item) =>
          item.product === productId
            ? {
                ...item,
                quantity: Math.min(
                  Math.max(item.quantity + change, 0),
                  item.stock,
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }
  function openProductDetail(product) {
    setSelectedProduct(product);
    setDetailQuantity(1);
    window.history.pushState({}, "", `/san-pham/${product.slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function closeProductDetail() {
    setSelectedProduct(null);
    if (window.location.pathname.startsWith("/san-pham/"))
      window.history.pushState({}, "", "/");
  }
  function buyNow(product, quantity) {
    addToCart(product, quantity);
    closeProductDetail();
    setCartOpen(false);
    setCheckoutOpen(true);
  }

  async function submitOrder(event) {
    event.preventDefault();
    try {
      const token = localStorage.getItem("tai-shop-token");
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...checkoutForm,
          address: [
            checkoutForm.address,
            checkoutForm.ward,
            checkoutForm.district,
            checkoutForm.province,
          ]
            .filter(Boolean)
            .join(", "),
          promoCode: checkoutForm.promoCode,
          paymentMethod,
          items: cartItems.map((item) => ({
            product: item.product,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setCartItems([]);
      setCheckoutForm({
        customerName: "",
        phone: "",
        address: "",
        province: "",
        district: "",
        ward: "",
        note: "",
        promoCode: "",
      });
      setCheckoutOpen(false);
      if (currentUser) setOrderHistory((orders) => [data.order, ...orders]);
      setOrderMessage(
        `Đặt hàng thành công. Mã đơn: ${data.order._id.slice(-6).toUpperCase()}`,
      );
    } catch (orderError) {
      setOrderMessage(orderError.message);
    }
  }

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const heroProducts = products.slice(0, 3);

  return (
    <main className="storefront">
      <div className="promo-bar">
        <strong>{activePromotions[0]?.title || "ƯU ĐÃI GÓC MÁY"}</strong>
        <span>
          {activePromotions[0]?.description ||
            "Giảm đến 20% cho phụ kiện máy tính trong tuần này"}
        </span>
        <b>
          {activePromotions[0]
            ? `Mã ${activePromotions[0].code}`
            : "Mua ngay →"}
        </b>
      </div>
      <header className="site-header">
        <div className="header-main">
          <a className="brand" href="/">
            TÀI <span>COMPUTER</span>
          </a>
          <button className="category-menu" type="button">
            ☰ <span>Danh mục</span>
          </button>
          <form
            className="search-box"
            onSubmit={(event) => {
              event.preventDefault();
              document
                .querySelector("#products")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm chuột, bàn phím, tai nghe..."
            />
            <button type="submit" aria-label="Tìm kiếm">
              ⌕
            </button>
          </form>
          <a className="header-link" href="#account">
            ♙ <span>{currentUser ? currentUser.name : "Đăng nhập"}</span>
          </a>
          {currentUser && (
            <a className="header-orders" href="#orders">
              Đơn đã đặt
            </a>
          )}
          <button
            className="header-cart"
            type="button"
            onClick={() => setCartOpen(true)}
          >
            ♧ <span>Giỏ hàng</span>
            <b>{cartCount}</b>
          </button>
        </div>
        <nav className="quick-nav">
          <a href="#products">Sản phẩm</a>
          {categories.slice(0, 6).map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => {
                setActiveCategory(category.slug);
                document
                  .querySelector("#products")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {category.name}
            </button>
          ))}
          <a href="#account">Chăm sóc khách hàng</a>
        </nav>
      </header>

      <section className="hero-banner">
        <div className="banner-copy">
          <p className="banner-kicker">TÀI COMPUTER SHOP</p>
          <h1>
            Nâng tầm
            <br />
            <em>góc máy.</em>
          </h1>
          <p>Thiết bị đẹp, giá dễ chịu và giao hàng tận nơi cho mọi setup.</p>
          <a className="banner-button" href="#products">
            Xem sản phẩm <span>→</span>
          </a>
        </div>
        <div className="banner-products">
          {heroProducts.map((product, index) => (
            <button
              key={product._id}
              type="button"
              className={`banner-product banner-product-${index + 1}`}
              onClick={() => openProductDetail(product)}
            >
              <img src={product.images?.[0]} alt={product.name} />
            </button>
          ))}
        </div>
        <div className="banner-sticker">
          NEW
          <br />
          <span>
            SETUP
            <br />
            READY
          </span>
        </div>
      </section>

      {activePromotions.length > 0 && (
        <section className="promo-showcase">
          <div>
            <p className="section-kicker">ƯU ĐÃI ĐANG ÁP DỤNG</p>
            <h2>Mã giảm giá dành cho bạn</h2>
          </div>
          <div className="promo-showcase-list">
            {activePromotions.map((promotion) => (
              <div className="promo-showcase-card" key={promotion._id}>
                <span>
                  <b>{promotion.title}</b>
                  <small>
                    {promotion.description ||
                      `Giảm ${promotion.type === "percent" ? `${promotion.value}%` : formatPrice(promotion.value)}`}
                  </small>
                </span>
                <strong>{promotion.code}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="service-row">
        <div>
          <b>🚚</b>
          <span>
            <strong>Giao hàng toàn quốc</strong>
            <small>Đóng gói cẩn thận</small>
          </span>
        </div>
        <div>
          <b>✓</b>
          <span>
            <strong>Hàng chính hãng</strong>
            <small>Kiểm tra trước khi nhận</small>
          </span>
        </div>
        <div>
          <b>↻</b>
          <span>
            <strong>Đổi trả dễ dàng</strong>
            <small>Hỗ trợ nhanh chóng</small>
          </span>
        </div>
        <div>
          <b>♧</b>
          <span>
            <strong>Thanh toán COD</strong>
            <small>Nhận hàng mới thanh toán</small>
          </span>
        </div>
      </section>

      <section className="catalog-section" id="products">
        <div className="catalog-heading">
          <div>
            <p className="section-kicker">GỢI Ý CHO BẠN</p>
            <h2>Sản phẩm nổi bật</h2>
          </div>
          <a href="#products">Xem tất cả sản phẩm →</a>
        </div>
        <div className="category-tabs">
          <button
            className={!activeCategory ? "active" : ""}
            onClick={() => setActiveCategory("")}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              className={activeCategory === category.slug ? "active" : ""}
              key={category._id}
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
        {loading && <p className="catalog-message">Đang tải sản phẩm...</p>}
        {error && <p className="catalog-message error-message">{error}</p>}
        {!loading && !error && visibleProducts.length === 0 && (
          <p className="catalog-message">Không tìm thấy sản phẩm phù hợp.</p>
        )}
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <article className="product-card" key={product._id}>
              <button
                className="product-image"
                type="button"
                onClick={() => openProductDetail(product)}
              >
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  loading="lazy"
                />
                {product.featured && (
                  <span className="product-badge">Nổi bật</span>
                )}
              </button>
              <div className="product-info">
                <p className="product-category">
                  {product.category?.name} · {product.brand}
                </p>
                <button
                  className="product-name"
                  type="button"
                  onClick={() => openProductDetail(product)}
                >
                  {product.name}
                </button>
                <div className="rating">
                  ★★★★★ <span>4.9</span>
                </div>
                <div className="product-footer">
                  <strong>{formatPrice(product.price)}</strong>
                  <div className="product-actions">
                    <button className="detail-button" type="button" onClick={() => openProductDetail(product)}>Xem chi tiết</button>
                    <button className="add-button" type="button" onClick={() => addToCart(product)} aria-label={`Thêm ${product.name}`}>+</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="account-section" id="account">
        <div>
          <p className="section-kicker">TÀI KHOẢN TÀI COMPUTER</p>
          <h2>
            {currentUser
              ? `Xin chào, ${currentUser.name}.`
              : "Mua sắm thật nhẹ nhàng."}
          </h2>
          <p>Lưu thông tin giao hàng và theo dõi đơn hàng dễ dàng hơn.</p>
          {currentUser && (
            <div className="account-actions">
              <button
                className="orders-button"
                type="button"
                onClick={() =>
                  document
                    .querySelector("#orders")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Xem đơn đã đặt ({orderHistory.length})
              </button>
              <button className="text-button" onClick={logout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
        {!currentUser && (
          <form className="auth-form" onSubmit={submitAuth}>
            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => setAuthMode("login")}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={authMode === "register" ? "active" : ""}
                onClick={() => setAuthMode("register")}
              >
                Đăng ký
              </button>
            </div>
            {authMode === "register" && (
              <input
                required
                placeholder="Họ và tên"
                value={authForm.name}
                onChange={(event) =>
                  setAuthForm({ ...authForm, name: event.target.value })
                }
              />
            )}
            <input
              required
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm({ ...authForm, email: event.target.value })
              }
            />
            <input
              required
              minLength="6"
              type="password"
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm({ ...authForm, password: event.target.value })
              }
            />
            <button className="banner-button auth-submit" type="submit">
              {authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}{" "}
              <span>→</span>
            </button>
            {authMessage && <p className="auth-message">{authMessage}</p>}
          </form>
        )}
      </section>

      {currentUser && (
        <section className="order-history" id="orders">
          <div className="history-heading">
            <div>
              <p className="section-kicker">TÀI KHOẢN CỦA BẠN</p>
              <h2>Lịch sử đơn hàng</h2>
            </div>
            <span>{orderHistory.length} đơn hàng</span>
          </div>
          {orderHistory.length === 0 ? (
            <p className="checkout-muted">
              Bạn chưa có đơn hàng nào gắn với tài khoản này.
            </p>
          ) : (
            <div className="history-list">
              {orderHistory.map((order) => (
                <article className="history-card" key={order._id}>
                  <div>
                    <b>#{order._id.slice(-6).toUpperCase()}</b>
                    <small>
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </small>
                  </div>
                  <span>
                    {order.items.length} sản phẩm<small>{order.address}</small>
                  </span>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                  <em className={`status-${order.status}`}>
                    {
                      {
                        pending: "Chờ xác nhận",
                        confirmed: "Đã xác nhận",
                        shipping: "Đang giao",
                        delivered: "Đã giao",
                        cancelled: "Đã hủy",
                      }[order.status]
                    }
                  </em>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <footer>
        <div>
          <a className="brand" href="/">
            TÀI <span>COMPUTER</span>
          </a>
          <p>Thiết bị công nghệ cho góc máy có cá tính.</p>
        </div>
        <span>© 2026 Tài Computer Shop · COD toàn quốc</span>
      </footer>

      {cartOpen && (
        <aside className="cart-panel">
          <div className="cart-panel-heading">
            <div>
              <p className="section-kicker">GIỎ HÀNG</p>
              <h2>
                {cartItems.length ? "Món bạn đã chọn" : "Giỏ hàng đang trống"}
              </h2>
            </div>
            <button
              className="close-cart"
              type="button"
              onClick={() => setCartOpen(false)}
            >
              ×
            </button>
          </div>
          {cartItems.map((item) => (
            <div className="cart-item" key={item.product}>
              <img src={item.image} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <strong>{formatPrice(item.price)}</strong>
                <div className="quantity">
                  <button
                    type="button"
                    onClick={() => changeQuantity(item.product, -1)}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(item.product, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cartItems.length > 0 && (
            <>
              <div className="cart-total">
                <span>Tạm tính</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <form className="checkout-form" onSubmit={submitOrder}>
                <p className="section-kicker">ĐẶT HÀNG COD</p>
                <input
                  required
                  placeholder="Họ và tên"
                  value={checkoutForm.customerName}
                  onChange={(event) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      customerName: event.target.value,
                    })
                  }
                />
                <input
                  required
                  placeholder="Số điện thoại"
                  value={checkoutForm.phone}
                  onChange={(event) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      phone: event.target.value,
                    })
                  }
                />
                <input
                  required
                  placeholder="Địa chỉ nhận hàng"
                  value={checkoutForm.address}
                  onChange={(event) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      address: event.target.value,
                    })
                  }
                />
                <textarea
                  placeholder="Ghi chú đơn hàng"
                  value={checkoutForm.note}
                  onChange={(event) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      note: event.target.value,
                    })
                  }
                />
                <button className="banner-button auth-submit" type="submit">
                  Đặt hàng COD <span>→</span>
                </button>
              </form>
            </>
          )}
          {orderMessage && <p className="auth-message">{orderMessage}</p>}
        </aside>
      )}

      {checkoutOpen && (
        <div className="checkout-page">
          <div className="checkout-inner">
            <div className="checkout-top">
              <button type="button" onClick={() => setCheckoutOpen(false)}>
                ← Tiếp tục mua sắm
              </button>
              <span>Thanh toán đơn hàng</span>
            </div>
            <div className="checkout-layout">
              <section className="checkout-main">
                <h1>Thông tin nhận hàng</h1>
                <p className="checkout-muted">
                  Vui lòng nhập chính xác để đơn hàng được giao đến bạn.
                </p>
                <form
                  className="checkout-form checkout-page-form"
                  onSubmit={submitOrder}
                >
                  <div className="checkout-fields">
                    <input
                      required
                      placeholder="Họ và tên *"
                      value={checkoutForm.customerName}
                      onChange={(event) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          customerName: event.target.value,
                        })
                      }
                    />
                    <input
                      required
                      placeholder="Số điện thoại *"
                      value={checkoutForm.phone}
                      onChange={(event) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          phone: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="address-fields">
                    <select
                      required
                      value={checkoutForm.province}
                      onChange={(event) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          province: event.target.value,
                          district: "",
                          ward: "",
                        })
                      }
                    >
                      <option value="">Chọn Tỉnh/Thành phố *</option>
                      {Object.keys(locations).map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    <select
                      required
                      disabled={!checkoutForm.province}
                      value={checkoutForm.district}
                      onChange={(event) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          district: event.target.value,
                          ward: "",
                        })
                      }
                    >
                      <option value="">Chọn Quận/Huyện *</option>
                      {Object.keys(locations[checkoutForm.province] || {}).map(
                        (district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ),
                      )}
                    </select>
                    <select
                      required
                      disabled={!checkoutForm.district}
                      value={checkoutForm.ward}
                      onChange={(event) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          ward: event.target.value,
                        })
                      }
                    >
                      <option value="">Chọn Phường/Xã *</option>
                      {(
                        locations[checkoutForm.province]?.[
                          checkoutForm.district
                        ] || []
                      ).map((ward) => (
                        <option key={ward} value={ward}>
                          {ward}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    required
                    placeholder="Số nhà, tên đường *"
                    value={checkoutForm.address}
                    onChange={(event) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        address: event.target.value,
                      })
                    }
                  />
                  <textarea
                    placeholder="Ghi chú cho người giao hàng"
                    value={checkoutForm.note}
                    onChange={(event) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        note: event.target.value,
                      })
                    }
                  />
                  <input
                    placeholder="Mã khuyến mãi (nếu có)"
                    value={checkoutForm.promoCode}
                    onChange={(event) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        promoCode: event.target.value.toUpperCase(),
                      })
                    }
                  />
                  <h2>Phương thức thanh toán</h2>
                  <label
                    className={`payment-option ${paymentMethod === "COD" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />
                    <span>
                      <b>Thanh toán khi nhận hàng</b>
                      <small>Kiểm tra hàng rồi thanh toán bằng tiền mặt</small>
                    </span>
                  </label>
                  <label
                    className={`payment-option ${paymentMethod === "BANK_TRANSFER" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={() => setPaymentMethod("BANK_TRANSFER")}
                    />
                    <span>
                      <b>Chuyển khoản ngân hàng</b>
                      <small>Chuyển khoản trước để xử lý đơn nhanh hơn</small>
                    </span>
                  </label>
                  {paymentMethod === "BANK_TRANSFER" && (
                    <div className="bank-info">
                      <b>Thông tin chuyển khoản</b>
                      <span>Ngân hàng: MB Bank</span>
                      <span>Số tài khoản: 0942901124</span>
                      <span>Chủ tài khoản: HUYNH VAN TAI</span>
                      <span>Nội dung: SĐT - Tên khách hàng</span>
                      <small>
                        Đơn hàng sẽ được xác nhận sau khi shop kiểm tra giao
                        dịch.
                      </small>
                    </div>
                  )}
                  <button
                    className="banner-button checkout-submit"
                    type="submit"
                  >
                    Đặt hàng <span>→</span>
                  </button>
                  {orderMessage && (
                    <p className="auth-message">{orderMessage}</p>
                  )}
                </form>
              </section>
              <aside className="checkout-summary">
                <p className="section-kicker">ĐƠN HÀNG CỦA BẠN</p>
                {cartItems.map((item) => (
                  <div className="summary-item" key={item.product}>
                    <img src={item.image} alt={item.name} />
                    <span>
                      {item.name}
                      <small>x {item.quantity}</small>
                    </span>
                    <b>{formatPrice(item.price * item.quantity)}</b>
                  </div>
                ))}
                <div className="summary-total">
                  <span>Tổng tiền</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>
                <p className="secure-note">🔒 Thông tin của bạn được bảo mật</p>
              </aside>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="detail-backdrop">
          <div className="detail-page">
            <div className="detail-breadcrumb">
              <button type="button" onClick={closeProductDetail}>
                ← Quay lại sản phẩm
              </button>
              <span>
                Trang chủ / {selectedProduct.category?.name} /{" "}
                {selectedProduct.name}
              </span>
            </div>
            <article className="detail-modal" role="main">
              <div className="detail-image">
                <img
                  src={selectedProduct.images?.[0]}
                  alt={selectedProduct.name}
                />
              </div>
              <div className="detail-content">
                <p className="product-category">
                  {selectedProduct.category?.name} · {selectedProduct.brand}
                </p>
                <h1>{selectedProduct.name}</h1>
                <div className="detail-rating">
                  ★★★★★ <span>4.9 · Đã bán nhiều</span>
                </div>
                <strong className="detail-price">
                  {formatPrice(selectedProduct.price)}
                </strong>
                <p className="detail-description">
                  {selectedProduct.description ||
                    "Sản phẩm chính hãng, phù hợp cho góc máy hiện đại."}
                </p>
                <div className="detail-rule" />
                <p className="stock-label">
                  ✓ Còn {selectedProduct.stock} sản phẩm trong kho
                </p>
                <p className="delivery-note">
                  🚚 Giao hàng toàn quốc · COD và chuyển khoản ngân hàng
                </p>
                <div className="detail-actions">
                  <div className="quantity">
                    <button
                      type="button"
                      onClick={() =>
                        setDetailQuantity(Math.max(detailQuantity - 1, 1))
                      }
                    >
                      −
                    </button>
                    <span>{detailQuantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDetailQuantity(
                          Math.min(detailQuantity + 1, selectedProduct.stock),
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="banner-button"
                    type="button"
                    onClick={() => {
                      addToCart(selectedProduct, detailQuantity);
                      closeProductDetail();
                    }}
                  >
                    Thêm vào giỏ hàng <span>→</span>
                  </button>
                </div>
                <button
                  className="buy-now"
                  type="button"
                  onClick={() => buyNow(selectedProduct, detailQuantity)}
                >
                  Mua ngay
                </button>
              </div>
            </article>
            <section className="detail-information">
              <h2>Thông tin sản phẩm</h2>
              <p>
                {selectedProduct.description ||
                  "Thiết bị máy tính chất lượng, được chọn để phù hợp với nhu cầu học tập, làm việc và giải trí."}
              </p>
              <div>
                <span>
                  Thương hiệu <b>{selectedProduct.brand || "Tài Computer"}</b>
                </span>
                <span>
                  Danh mục <b>{selectedProduct.category?.name}</b>
                </span>
                <span>
                  Tình trạng <b>Còn hàng</b>
                </span>
              </div>
            </section>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast">
          ✓ {toast}
          <button type="button" onClick={() => setCartOpen(true)}>
            Xem giỏ
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
