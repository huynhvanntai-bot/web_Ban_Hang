import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};
const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );

function AdminPage() {
  const [token, setToken] = useState(
    localStorage.getItem("tai-shop-token") || "",
  );
  const [login, setLogin] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({
    dashboard: {},
    products: [],
    categories: [],
    orders: [],
    customers: [],
    reports: { bestSelling: [], slowSelling: [], dailyRevenue: [] },
    promotions: [],
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [promotionForm, setPromotionForm] = useState({
    title: "",
    code: "",
    type: "percent",
    value: "",
    startAt: "",
    endAt: "",
    description: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    images: "",
    description: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

  async function request(path, options = {}) {
    const response = await fetch(`${apiUrl}/admin/${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Request thất bại");
    return result;
  }

  async function loginAdmin(event) {
    event.preventDefault();
    setLoginError("");
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      if (result.user.role !== "admin")
        throw new Error("Tài khoản này không có quyền admin");
      localStorage.setItem("tai-shop-token", result.token);
      localStorage.setItem("tai-shop-user", JSON.stringify(result.user));
      setToken(result.token);
    } catch (error) {
      setLoginError(error.message);
    }
  }

  async function loadAdmin() {
    try {
      const [
        dashboard,
        products,
        categories,
        orders,
        customers,
        reports,
        promotions,
      ] = await Promise.all([
        request("dashboard"),
        request("products"),
        request("categories"),
        request("orders"),
        request("customers"),
        request("reports"),
        request("promotions"),
      ]);
      setData({
        dashboard,
        products,
        categories,
        orders,
        customers,
        reports,
        promotions,
      });
    } catch (error) {
      setLoginError(error.message);
      setToken("");
    }
  }

  useEffect(() => {
    if (token) loadAdmin();
  }, [token]);

  async function addProduct(event) {
    event.preventDefault();
    if (uploadingImage) return;
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      images: productForm.images ? [productForm.images] : [],
      featured: true,
    };
    await request(
      editingProductId ? `products/${editingProductId}` : "products",
      {
        method: editingProductId ? "PUT" : "POST",
        body: JSON.stringify({
          ...payload,
        }),
      },
    );
    resetProductForm();
    loadAdmin();
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm({
      name: "",
      slug: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      images: "",
      description: "",
    });
    setUploadMessage("");
  }

  function editProduct(product) {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name || "",
      slug: product.slug || "",
      price: product.price || "",
      stock: product.stock || "",
      category: product.category?._id || product.category || "",
      brand: product.brand || "",
      images: product.images?.[0] || "",
      description: product.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadProductImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setUploadMessage("Đang upload ảnh lên Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${apiUrl}/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Upload thất bại");
      setProductForm((form) => ({ ...form, images: result.url }));
      setUploadMessage("Upload ảnh thành công");
    } catch (error) {
      setUploadMessage(error.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;
    await request(`products/${id}`, { method: "DELETE" });
    if (editingProductId === id) resetProductForm();
    loadAdmin();
  }
  async function updateOrderStatus(id, status) {
    await request(`orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    loadAdmin();
  }
  async function showOrder(id) {
    setSelectedOrder(await request(`orders/${id}`));
  }
  async function addPromotion(event) {
    event.preventDefault();
    await request("promotions", {
      method: "POST",
      body: JSON.stringify({
        ...promotionForm,
        value: Number(promotionForm.value),
        startAt: new Date(promotionForm.startAt).toISOString(),
        endAt: new Date(promotionForm.endAt).toISOString(),
      }),
    });
    setPromotionForm({
      title: "",
      code: "",
      type: "percent",
      value: "",
      startAt: "",
      endAt: "",
      description: "",
    });
    loadAdmin();
  }
  function logout() {
    localStorage.removeItem("tai-shop-token");
    localStorage.removeItem("tai-shop-user");
    setToken("");
  }

  if (!token)
    return (
      <main className="admin-login">
        <div className="admin-login-card">
          <p className="admin-kicker">TÀI COMPUTER SHOP</p>
          <h1>Admin Console</h1>
          <p>Đăng nhập bằng tài khoản quản trị để tiếp tục.</p>
          <form onSubmit={loginAdmin}>
            <input
              required
              type="email"
              placeholder="Email admin"
              value={login.email}
              onChange={(event) =>
                setLogin({ ...login, email: event.target.value })
              }
            />
            <input
              required
              type="password"
              placeholder="Mật khẩu"
              value={login.password}
              onChange={(event) =>
                setLogin({ ...login, password: event.target.value })
              }
            />
            <button type="submit">Đăng nhập quản trị →</button>
          </form>
          {loginError && <small>{loginError}</small>}
          <a href="/">← Về cửa hàng</a>
        </div>
      </main>
    );

  const dashboard = data.dashboard;
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          TÀI <span>COMPUTER</span>
        </a>
        <p className="admin-label">QUẢN TRỊ</p>
        {[
          ["overview", "Tổng quan"],
          ["products", "Sản phẩm"],
          ["orders", "Đơn hàng"],
          ["customers", "Khách hàng"],
          ["reports", "Báo cáo"],
          ["promotions", "Khuyến mãi"],
        ].map(([key, label]) => (
          <button
            className={activeTab === key ? "active" : ""}
            key={key}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
        <button className="admin-logout" onClick={logout}>
          Đăng xuất
        </button>
      </aside>
      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">TỔNG QUAN CỬA HÀNG</p>
            <h1>
              {activeTab === "overview"
                ? "Dashboard"
                : activeTab === "products"
                  ? "Quản lý sản phẩm"
                  : activeTab === "orders"
                    ? "Quản lý đơn hàng"
                    : activeTab === "customers"
                      ? "Khách hàng"
                      : activeTab === "reports"
                        ? "Báo cáo nâng cao"
                        : "Chương trình khuyến mãi"}
            </h1>
          </div>
          <a href="/">Xem cửa hàng ↗</a>
        </header>
        {activeTab === "overview" && (
          <>
            <div className="stat-grid">
              <div>
                <span>Sản phẩm</span>
                <strong>{dashboard.totalProducts || 0}</strong>
              </div>
              <div>
                <span>Đơn hàng</span>
                <strong>{dashboard.totalOrders || 0}</strong>
              </div>
              <div>
                <span>Khách hàng</span>
                <strong>{dashboard.totalCustomers || 0}</strong>
              </div>
              <div>
                <span>Doanh thu đã giao</span>
                <strong>{money(dashboard.revenue)}</strong>
              </div>
            </div>
            <section className="admin-panel">
              <h2>Đơn hàng mới nhất</h2>
              <OrderTable
                orders={data.orders.slice(0, 5)}
                onStatus={updateOrderStatus}
                onDetail={showOrder}
              />
            </section>
          </>
        )}
        {activeTab === "products" && (
          <section className="admin-panel">
            <div className="product-form-heading">
              <div>
                <p className="admin-kicker">KHO HÀNG</p>
                <h2>
                  {editingProductId
                    ? "Chỉnh sửa sản phẩm"
                    : "Thêm sản phẩm mới"}
                </h2>
                <p>
                  Điền thông tin bên dưới để sản phẩm hiển thị trên cửa hàng.
                </p>
              </div>
              {editingProductId && (
                <button
                  className="form-cancel"
                  type="button"
                  onClick={resetProductForm}
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>
            <form className="admin-product-form" onSubmit={addProduct}>
              <label>
                Tên sản phẩm
                <input
                  required
                  placeholder="Ví dụ: Logitech G102 Lightsync"
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm({ ...productForm, name: event.target.value })
                  }
                />
              </label>
              <label>
                Đường dẫn (slug)
                <input
                  required
                  placeholder="logitech-g102-lightsync"
                  value={productForm.slug}
                  onChange={(event) =>
                    setProductForm({ ...productForm, slug: event.target.value })
                  }
                />
              </label>
              <label>
                Giá bán (VNĐ)
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="399000"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      price: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Số lượng tồn kho
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="25"
                  value={productForm.stock}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      stock: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Danh mục
                <select
                  required
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      category: event.target.value,
                    })
                  }
                >
                  <option value="">Chọn danh mục</option>
                  {data.categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Thương hiệu
                <input
                  placeholder="Ví dụ: Logitech"
                  value={productForm.brand}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      brand: event.target.value,
                    })
                  }
                />
              </label>
              <label className="wide-field">
                URL ảnh Cloudinary
                <input
                  placeholder="https://res.cloudinary.com/..."
                  value={productForm.images}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      images: event.target.value,
                    })
                  }
                />
              </label>
              <label className="admin-upload-field">
                Hoặc chọn ảnh từ máy
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={uploadProductImage}
                />
                {uploadMessage && <small>{uploadMessage}</small>}
              </label>
              {productForm.images && (
                <img
                  className="admin-image-preview"
                  src={productForm.images}
                  alt="Ảnh sản phẩm xem trước"
                />
              )}
              <label className="wide-field">
                Mô tả sản phẩm
                <textarea
                  placeholder="Mô tả ngắn về sản phẩm, tính năng và bảo hành..."
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      description: event.target.value,
                    })
                  }
                />
              </label>
              <button type="submit">
                {editingProductId ? "Lưu thay đổi" : "+ Thêm sản phẩm"}
              </button>
            </form>
            <div className="product-list-heading">
              <div>
                <p className="admin-kicker">CATALOG</p>
                <h2>Danh sách sản phẩm</h2>
              </div>
              <span>{data.products.length} sản phẩm</span>
            </div>
            <div className="admin-product-list">
              {data.products.map((product) => (
                <div key={product._id}>
                  <img src={product.images?.[0]} alt="" />
                  <span>
                    <b>{product.name}</b>
                    <small>
                      {product.category?.name || "Chưa phân loại"} ·{" "}
                      {money(product.price)} · Tồn {product.stock}
                    </small>
                  </span>
                  <div>
                    <button
                      className="edit-product"
                      onClick={() => editProduct(product)}
                    >
                      Sửa
                    </button>
                    <button onClick={() => deleteProduct(product._id)}>
                      Xóa ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {activeTab === "orders" && (
          <section className="admin-panel">
            <h2>{data.orders.length} đơn hàng</h2>
            <OrderTable
              orders={data.orders}
              onStatus={updateOrderStatus}
              onDetail={showOrder}
            />
            {selectedOrder && (
              <InvoiceDetail
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
              />
            )}
          </section>
        )}
        {activeTab === "customers" && (
          <section className="admin-panel">
            <h2>{data.customers.length} khách hàng</h2>
            <table>
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Số đơn</th>
                  <th>Đã mua</th>
                  <th>Mua gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || "-"}</td>
                    <td>{customer.orderCount}</td>
                    <td>{money(customer.totalSpent)}</td>
                    <td>
                      {customer.lastOrderAt
                        ? new Date(customer.lastOrderAt).toLocaleDateString(
                            "vi-VN",
                          )
                        : "Chưa mua"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {activeTab === "reports" && (
          <section className="admin-panel">
            <h2>Báo cáo kinh doanh</h2>
            <div className="report-columns">
              <div>
                <h3>Bán chạy nhất</h3>
                {data.reports.bestSelling.map((item, index) => (
                  <ReportRow key={item._id} index={index} item={item} />
                ))}
              </div>
              <div>
                <h3>Bán chậm nhất</h3>
                {data.reports.slowSelling.map((item, index) => (
                  <ReportRow key={item._id} index={index} item={item} />
                ))}
              </div>
            </div>
            <h3>Doanh thu theo ngày</h3>
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Số đơn</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {data.reports.dailyRevenue.map((day) => (
                  <tr key={day._id}>
                    <td>{day._id}</td>
                    <td>{day.orders}</td>
                    <td>{money(day.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {activeTab === "promotions" && (
          <section className="admin-panel">
            <h2>Tạo chương trình khuyến mãi</h2>
            <form className="admin-product-form" onSubmit={addPromotion}>
              <input
                required
                placeholder="Tên chương trình"
                value={promotionForm.title}
                onChange={(event) =>
                  setPromotionForm({
                    ...promotionForm,
                    title: event.target.value,
                  })
                }
              />
              <input
                required
                placeholder="Mã giảm giá"
                value={promotionForm.code}
                onChange={(event) =>
                  setPromotionForm({
                    ...promotionForm,
                    code: event.target.value.toUpperCase(),
                  })
                }
              />
              <select
                value={promotionForm.type}
                onChange={(event) =>
                  setPromotionForm({
                    ...promotionForm,
                    type: event.target.value,
                  })
                }
              >
                <option value="percent">Giảm theo %</option>
                <option value="fixed">Giảm số tiền</option>
              </select>
              <input
                required
                type="number"
                min="0"
                placeholder="Giá trị giảm"
                value={promotionForm.value}
                onChange={(event) =>
                  setPromotionForm({
                    ...promotionForm,
                    value: event.target.value,
                  })
                }
              />
              <input
                required
                type="datetime-local"
                value={promotionForm.startAt}
                onChange={(event) =>
                  setPromotionForm({
                    ...promotionForm,
                    startAt: event.target.value,
                  })
                }
              />
              <input
                required
                type="datetime-local"
                value={promotionForm.endAt}
                onChange={(event) =>
                  setPromotionForm({
                    ...promotionForm,
                    endAt: event.target.value,
                  })
                }
              />
              <textarea
                placeholder="Mô tả ưu đãi"
                value={promotionForm.description}
                onChange={(event) =>
                  setPromotionForm({
                    ...promotionForm,
                    description: event.target.value,
                  })
                }
              />
              <button type="submit">+ Tạo khuyến mãi</button>
            </form>
            <h2>Chương trình đã tạo</h2>
            {data.promotions.map((promotion) => (
              <div className="promotion-row" key={promotion._id}>
                <span>
                  <b>{promotion.title}</b>
                  <small>
                    Mã: {promotion.code} ·{" "}
                    {promotion.type === "percent"
                      ? `${promotion.value}%`
                      : money(promotion.value)}
                  </small>
                </span>
                <em className={promotion.isActive ? "promotion-active" : ""}>
                  {promotion.isActive ? "Đang bật" : "Tắt"}
                </em>
              </div>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}

function OrderTable({ orders, onStatus, onDetail }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Mã đơn</th>
          <th>Khách hàng</th>
          <th>Tổng tiền</th>
          <th>Thanh toán</th>
          <th>Trạng thái</th>
          <th>Hóa đơn</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order._id}>
            <td>#{order._id.slice(-6).toUpperCase()}</td>
            <td>
              {order.customerName}
              <small>{order.phone}</small>
            </td>
            <td>
              <button
                className="invoice-button"
                type="button"
                onClick={() => onDetail(order._id)}
              >
                Xem chi tiết
              </button>
            </td>
            <td>{money(order.totalAmount)}</td>
            <td>{order.paymentMethod}</td>
            <td>
              <select
                value={order.status}
                onChange={(event) => onStatus(order._id, event.target.value)}
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReportRow({ index, item }) {
  return (
    <div className="report-row">
      <b>#{index + 1}</b>
      <span>
        {item.name}
        <small>
          {item.quantity} sản phẩm · {money(item.revenue)}
        </small>
      </span>
    </div>
  );
}
function InvoiceDetail({ order, onClose }) {
  return (
    <div className="invoice-detail">
      <div className="invoice-heading">
        <div>
          <p className="admin-kicker">HÓA ĐƠN ĐIỆN TỬ</p>
          <h2>#{order._id.slice(-6).toUpperCase()}</h2>
        </div>
        <button onClick={onClose}>Đóng</button>
      </div>
      <div className="invoice-customer">
        <span>
          <b>Khách hàng</b>
          {order.customerName}
          <small>{order.phone}</small>
        </span>
        <span>
          <b>Địa chỉ giao hàng</b>
          {order.address}
        </span>
        <span>
          <b>Thanh toán</b>
          {order.paymentMethod}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>SL</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.product}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{money(item.price)}</td>
              <td>{money(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="invoice-total">
        Tổng cộng <strong>{money(order.totalAmount)}</strong>
      </div>
    </div>
  );
}

export default AdminPage;
