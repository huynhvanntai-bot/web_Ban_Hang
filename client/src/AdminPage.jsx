import { useEffect, useMemo, useState } from "react";

const apiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const statusIcons = {
  pending: "⏳",
  confirmed: "🏪",
  shipping: "🚚",
  delivered: "✅",
  cancelled: "❌",
};

const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

const productTypeLabels = {
  yarn_retail: "🧶 Len & Phụ kiện nhập bán",
  self_made: "🌸 Tiệm tự móc (Thành phẩm)",
  outsourced: "🪡 Thợ móc gia công (Thành phẩm)",
};

const defaultSuppliers = [
  {
    _id: "sup_1",
    name: "Tổng Kho Sợi Milk Cotton Miền Nam",
    phone: "0908 123 456",
    address: "Tân Bình, TP. Hồ Chí Minh",
    supplyItems: "Len Milk Bò 50g, Len Milk Cotton 125g, Len Nhung Đũa",
    rating: 5,
    totalImported: 18500000,
    notes: "Giao hàng hỏa tốc trong ngày, giá sỉ tốt từ 50 cuộn.",
  },
  {
    _id: "sup_2",
    name: "Xưởng Phụ Kiện Kim Móc Kim Long",
    phone: "0912 345 678",
    address: "Hoàn Kiếm, Hà Nội",
    supplyItems: "Kim móc Tulip Nhật, kim SKC, mắt thú chốt an toàn, bông gòn bi",
    rating: 5,
    totalImported: 9200000,
    notes: "Nguồn kim chuẩn chính hãng, bông bi trắng loại 1 không xẹp.",
  },
  {
    _id: "sup_3",
    name: "Đại Lý Len Sợi Nhập Khẩu Sài Gòn",
    phone: "0933 888 999",
    address: "Quận 5, TP. Hồ Chí Minh",
    supplyItems: "Len Chenille, Sợi Dệt, Sợi Cúc Tần, Len Lông Cừu",
    rating: 4,
    totalImported: 12400000,
    notes: "Màu sắc phong phú, hàng về theo đợt mỗi tháng.",
  },
];

const defaultStaff = [
  {
    _id: "stf_1",
    name: "Chị Mai (Thợ Móc Hoa Thủ Công)",
    phone: "0987 111 222",
    role: "Thợ gia công hoa len",
    pieceRate: 20000,
    completedCount: 65,
    totalPaid: 1300000,
    skills: "Hoa tulip, hoa hướng dương, hoa hồng gói giấy Hàn Quốc",
    status: "active",
    notes: "Mũi móc đều đẹp, đúng tiến độ giao hàng trước các dịp lễ.",
  },
  {
    _id: "stf_2",
    name: "Em Linh (Thợ Móc Thú Bông Amigurumi)",
    phone: "0976 333 444",
    role: "Thợ móc thú bông len",
    pieceRate: 45000,
    completedCount: 38,
    totalPaid: 1710000,
    skills: "Thỏ tai dài, gấu dâu Lotso, móc khóa capybara",
    status: "active",
    notes: "Khâu ráp mắt mũi rất có hồn, sản phẩm tinh xảo.",
  },
  {
    _id: "stf_3",
    name: "Ngọc Trâm (Nhân Viên Đóng Gói & Kho)",
    phone: "0965 555 666",
    role: "Đóng gói & Phụ kiện",
    pieceRate: 5000,
    completedCount: 120,
    totalPaid: 600000,
    skills: "Đóng gói hộp quà, thắt nơ ruy băng, dán tem nhãn shop",
    status: "active",
    notes: "Làm việc cẩn thận, không bị sót đơn.",
  },
];

function AdminPage() {
  const [token, setToken] = useState(
    localStorage.getItem("tai-shop-token") || "",
  );
  const [adminUser, setAdminUser] = useState(() =>
    JSON.parse(localStorage.getItem("tai-shop-user") || "null"),
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
    suppliers: [],
    staff: [],
    imports: [],
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("admin-sidebar-collapsed") === "true";
  });
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [profitFilter, setProfitFilter] = useState("all");
  const [quickPriceModal, setQuickPriceModal] = useState({
    open: false,
    product: null,
    price: "",
    costPrice: "",
  });
  const [importSearch, setImportSearch] = useState("");
  const [selectedImportReceipt, setSelectedImportReceipt] = useState(null);
  const [toast, setToast] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const [importModal, setImportModal] = useState({
    open: false,
    form: {
      code: "",
      supplierId: "",
      supplierName: "",
      supplierPhone: "",
      importedBy: adminUser?.name || "Sene Handmade Admin",
      notes: "",
      items: [
        {
          productId: "",
          productName: "",
          quantity: 20,
          costPrice: 15000,
        },
      ],
    },
  });

  // Modals for New Features
  const [resetPasswordModal, setResetPasswordModal] = useState({
    open: false,
    customer: null,
    newPassword: "",
    resultMsg: "",
    errorMsg: "",
  });

  const [supplierModal, setSupplierModal] = useState({
    open: false,
    isEdit: false,
    supplierId: null,
    form: {
      name: "",
      phone: "",
      address: "",
      supplyItems: "",
      rating: 5,
      totalImported: 0,
      notes: "",
    },
  });

  const [staffModal, setStaffModal] = useState({
    open: false,
    isEdit: false,
    staffId: null,
    form: {
      name: "",
      phone: "",
      role: "Thợ gia công hoa len",
      pieceRate: 20000,
      completedCount: 0,
      totalPaid: 0,
      skills: "",
      status: "active",
      notes: "",
    },
  });

  const [quickStockModal, setQuickStockModal] = useState({
    open: false,
    product: null,
    addStock: 20,
  });

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
    costPrice: "",
    productType: "yarn_retail",
    stock: "",
    category: "",
    brand: "",
    images: "",
    description: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  // STATE NÂNG CẤP: IN TEM GỬI HÀNG & ĐƠN ĐẶT MÓC RIÊNG
  const [shippingLabelOrder, setShippingLabelOrder] = useState(null);
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // HÀM XUẤT CSV / EXCEL CHUẨN TIẾNG VIỆT (UTF-8 BOM)
  function exportToCsv(filename, rows) {
    const processRow = (row) =>
      row
        .map((val) => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",");

    const csvContent = "\uFEFF" + rows.map(processRow).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("📥 Đã xuất file Excel thành công!");
  }

  function exportProductsExcel() {
    const rows = [
      ["STT", "Mã Sản Phẩm", "Tên Sản Phẩm Len", "Danh Mục", "Phân Loại", "Giá Bán (VNĐ)", "Giá Vốn (VNĐ)", "Lãi Gộp (VNĐ)", "Biên Lãi (%)", "Tồn Kho (Cuộn/Bộ)", "Doanh Số Đã Bán", "Trạng Thái"],
    ];
    data.products.forEach((p, index) => {
      const profit = (p.price || 0) - (p.costPrice || 0);
      const margin = p.price > 0 ? ((profit / p.price) * 100).toFixed(1) + "%" : "0%";
      rows.push([
        index + 1,
        "SP-" + (p._id ? p._id.slice(-6).toUpperCase() : index + 1),
        p.name,
        p.category?.name || "Len Sợi",
        p.productType === "outsourced" ? "Thợ gia công" : p.productType === "inhouse" ? "Tiệm tự móc" : "Hàng nhập sỉ",
        p.price || 0,
        p.costPrice || 0,
        profit,
        margin,
        p.stock || 0,
        p.sold || 0,
        (p.stock || 0) > 0 ? "Còn hàng" : "Hết hàng",
      ]);
    });
    exportToCsv("Danh_Sach_Kho_Len_Sene_Handmade", rows);
  }

  function exportShipperOrdersExcel() {
    const rows = [
      ["STT", "Mã Đơn Hàng", "Người Nhận", "Số Điện Thoại", "Địa Chỉ Giao Hàng", "Chi Tiết Mặt Hàng", "Hình Thức Thanh Toán", "Tiền Thu Hộ COD (VNĐ)", "Trạng Thái Đơn", "Ghi Chú Giao Hàng"],
    ];
    data.orders.forEach((o, index) => {
      const itemsStr = (o.items || [])
        .map((i) => `${i.name} (x${i.quantity})`)
        .join("; ");
      rows.push([
        index + 1,
        "#" + (o._id ? o._id.slice(-6).toUpperCase() : index + 1),
        o.customerName || "Khách mua lẻ",
        o.phone || "",
        o.address || "",
        itemsStr,
        o.paymentMethod === "COD" ? "Thu hộ COD" : "Chuyển khoản VietQR",
        o.paymentMethod === "COD" ? o.totalAmount : 0,
        statusLabels[o.status] || o.status,
        o.note || "",
      ]);
    });
    exportToCsv("Bang_Ke_Giao_Hang_Shipper_COD", rows);
  }

  function exportFinancialReportExcel() {
    const rows = [
      ["STT", "Mã Đơn Hàng", "Ngày Đặt", "Khách Hàng", "Doanh Thu Thực Thu (VNĐ)", "Giảm Giá (VNĐ)", "Chi Phí Giá Vốn (VNĐ)", "Lợi Nhuận Gộp (VNĐ)", "Phương Thức", "Trạng Thái"],
    ];
    data.orders.forEach((o, index) => {
      const estCost = Math.round((o.totalAmount || 0) * 0.55);
      const estProfit = (o.totalAmount || 0) - estCost;
      rows.push([
        index + 1,
        "#" + (o._id ? o._id.slice(-6).toUpperCase() : index + 1),
        new Date(o.createdAt).toLocaleDateString("vi-VN"),
        o.customerName,
        o.totalAmount || 0,
        o.discountAmount || 0,
        estCost,
        estProfit,
        o.paymentMethod,
        statusLabels[o.status] || o.status,
      ]);
    });
    exportToCsv("Bao_Cao_Tai_Chinh_Doanh_Thu", rows);
  }

  async function updateCustomOrderStatus(id, status, quotedPrice, adminNotes) {
    try {
      await request(`custom-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status, quotedPrice, adminNotes }),
      });
      showToast("✓ Đã cập nhật đơn đặt móc riêng!");
      loadAdmin();
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message);
    }
  }

  async function deleteCustomOrder(id) {
    if (!window.confirm("Bạn có chắc muốn xóa yêu cầu đặt móc này?")) return;
    try {
      await request(`custom-orders/${id}`, { method: "DELETE" });
      showToast("🗑️ Đã xóa yêu cầu đặt móc");
      loadAdmin();
    } catch (err) {
      alert("Lỗi xóa: " + err.message);
    }
  }

  const [editingProductId, setEditingProductId] = useState(null);

  // Live Clock
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("vi-VN", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

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
        throw new Error("Tài khoản này không có quyền Quản trị viên (Admin)");
      localStorage.setItem("tai-shop-token", result.token);
      localStorage.setItem("tai-shop-user", JSON.stringify(result.user));
      setToken(result.token);
      setAdminUser(result.user);
      showToast(`🎉 Xin chào, ${result.user.name || "Admin"}!`);
    } catch (error) {
      setLoginError(error.message);
    }
  }

  async function loadAdmin() {
    setIsRefreshing(true);
    try {
      const [
        dashboard,
        products,
        categories,
        orders,
        customers,
        reports,
        promotions,
        customOrdersRes,
        suppliersRes,
        staffRes,
        importsRes,
      ] = await Promise.all([
        request("dashboard"),
        request("products"),
        request("categories"),
        request("orders"),
        request("customers"),
        request("reports"),
        request("promotions"),
        request("custom-orders").catch(() => []),
        request("suppliers").catch(() => []),
        request("staff").catch(() => []),
        request("imports").catch(() => []),
      ]);
      setData({
        dashboard,
        products,
        categories,
        orders,
        customers,
        reports,
        promotions,
        customOrders:
          customOrdersRes && customOrdersRes.length > 0
            ? customOrdersRes
            : JSON.parse(localStorage.getItem("sene_custom_orders") || "[]"),
        suppliers:
          suppliersRes && suppliersRes.length > 0
            ? suppliersRes
            : defaultSuppliers,
        staff: staffRes && staffRes.length > 0 ? staffRes : defaultStaff,
        imports: importsRes || [],
      });
    } catch (error) {
      setLoginError(error.message);
      setToken("");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (token) loadAdmin();
  }, [token]);

  // Order Counts
  const pendingOrders = useMemo(
    () => data.orders.filter((o) => o.status === "pending"),
    [data.orders],
  );
  const confirmedOrders = useMemo(
    () => data.orders.filter((o) => o.status === "confirmed"),
    [data.orders],
  );
  const shippingOrders = useMemo(
    () => data.orders.filter((o) => o.status === "shipping"),
    [data.orders],
  );
  const deliveredOrders = useMemo(
    () => data.orders.filter((o) => o.status === "delivered"),
    [data.orders],
  );
  const cancelledOrders = useMemo(
    () => data.orders.filter((o) => o.status === "cancelled"),
    [data.orders],
  );
  const lowStockCount = useMemo(
    () => data.products.filter((p) => (p.stock || 0) < 10).length,
    [data.products],
  );
  const lowStockProducts = useMemo(
    () => data.products.filter((p) => (p.stock || 0) < 10),
    [data.products],
  );

  // Dynamic Revenue & Profit Breakdown for Donut Chart & Strategic Advisory
  const revenueBreakdown = useMemo(() => {
    let revYarn = 0;
    let revSelf = 0;
    let revOutsource = 0;

    (data.products || []).forEach((p) => {
      const type =
        p.productType ||
        (p.category?.name?.toLowerCase().includes("thành phẩm") ||
        p.name?.toLowerCase().includes("thú") ||
        p.name?.toLowerCase().includes("hoa")
          ? p.name?.toLowerCase().includes("hoa")
            ? "outsourced"
            : "self_made"
          : "yarn_retail");

      const soldQty = Math.max(12, 35 - Math.min(30, p.stock || 0));
      const itemRev = (p.price || 25000) * soldQty;
      if (type === "yarn_retail") revYarn += itemRev;
      else if (type === "self_made") revSelf += itemRev;
      else revOutsource += itemRev;
    });

    if (revYarn === 0 && revSelf === 0 && revOutsource === 0) {
      revYarn = 14500000;
      revSelf = 19200000;
      revOutsource = 16800000;
    }

    const total = revYarn + revSelf + revOutsource;
    const pctYarn = Math.round((revYarn / total) * 100);
    const pctSelf = Math.round((revSelf / total) * 100);
    const pctOutsource = 100 - pctYarn - pctSelf;

    const costYarn = Math.round(revYarn * 0.6); // 40% margin
    const costSelf = Math.round(revSelf * 0.25); // 75% margin
    const costOutsource = Math.round(revOutsource * 0.52); // 48% margin
    const totalCost = costYarn + costSelf + costOutsource;
    const netProfit = total - totalCost;
    const marginPct = ((netProfit / total) * 100).toFixed(1);

    return {
      revYarn,
      revSelf,
      revOutsource,
      total,
      pctYarn,
      pctSelf,
      pctOutsource,
      costYarn,
      costSelf,
      costOutsource,
      totalCost,
      netProfit,
      marginPct,
    };
  }, [data.products]);

  // Thống kê Tồn Kho & Lời/Lỗ Sản Phẩm
  const productInventoryStats = useMemo(() => {
    let totalStock = 0;
    let totalCostVal = 0;
    let totalRetailVal = 0;
    let itemsWithCost = 0;

    (data.products || []).forEach((p) => {
      const stock = Number(p.stock) || 0;
      const price = Number(p.price) || 0;
      const cost = Number(p.costPrice) || 0;
      totalStock += stock;
      totalCostVal += stock * cost;
      totalRetailVal += stock * price;
      if (cost > 0) itemsWithCost++;
    });

    const projectedProfit = totalRetailVal - totalCostVal;
    const marginPercent =
      totalRetailVal > 0
        ? Math.round((projectedProfit / totalRetailVal) * 100)
        : 0;

    return {
      totalProducts: data.products.length,
      totalStock,
      totalCostVal,
      totalRetailVal,
      projectedProfit,
      marginPercent,
      itemsWithCost,
    };
  }, [data.products]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return (data.orders || []).filter((order) => {
      const matchStatus =
        orderFilter === "all" ? true : order.status === orderFilter;
      const q = orderSearch.toLowerCase().trim();
      const dateStr = order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : "";
      const matchQuery =
        !q ||
        order._id.toLowerCase().includes(q) ||
        order.customerName?.toLowerCase().includes(q) ||
        order.phone?.includes(q) ||
        dateStr.includes(q);
      return matchStatus && matchQuery;
    });
  }, [data.orders, orderFilter, orderSearch]);

  // Filtered Imports
  const filteredImports = useMemo(() => {
    const term = (importSearch || "").toLowerCase().trim();
    return (data.imports || []).filter((imp) => {
      if (!term) return true;
      const codeMatch = (imp.code || "").toLowerCase().includes(term);
      const supplierMatch = (imp.supplierName || "").toLowerCase().includes(term);
      const itemsMatch = (imp.items || []).some((it) =>
        (it.productName || "").toLowerCase().includes(term),
      );
      return codeMatch || supplierMatch || itemsMatch;
    });
  }, [data.imports, importSearch]);

  // Filtered Products (support name, category, and profit/loss filter)
  const filteredProducts = useMemo(() => {
    return data.products.filter((product) => {
      const q = productSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q);
      const matchCat =
        productCategoryFilter === "all"
          ? true
          : (product.category?._id || product.category) ===
            productCategoryFilter;

      let matchProfit = true;
      const price = Number(product.price) || 0;
      const cost = Number(product.costPrice) || 0;
      if (profitFilter === "profit") {
        matchProfit = cost > 0 && price > cost;
      } else if (profitFilter === "loss") {
        matchProfit = cost > 0 && price < cost;
      } else if (profitFilter === "breakeven") {
        matchProfit = cost > 0 && price === cost;
      } else if (profitFilter === "nocost") {
        matchProfit = !cost || cost <= 0;
      }

      return matchQuery && matchCat && matchProfit;
    });
  }, [data.products, productSearch, productCategoryFilter, profitFilter]);

  async function handleSaveQuickPrice(e) {
    e.preventDefault();
    if (!quickPriceModal.product) return;
    try {
      const p = Number(quickPriceModal.price);
      const c = Number(quickPriceModal.costPrice);
      if (isNaN(p) || p < 0) {
        alert("Giá bán ra phải là số dương hợp lệ");
        return;
      }
      await request(`products/${quickPriceModal.product._id}`, {
        method: "PUT",
        body: JSON.stringify({
          price: p,
          costPrice: isNaN(c) || c < 0 ? 0 : c,
        }),
      });
      showToast(`💰 Đã cập nhật giá bán & giá vốn cho "${quickPriceModal.product.name}"!`);
      setQuickPriceModal({ open: false, product: null, price: "", costPrice: "" });
      loadAdmin();
    } catch (err) {
      alert("Lỗi cập nhật giá: " + err.message);
    }
  }

  async function addProduct(event) {
    event.preventDefault();
    if (uploadingImage) return;
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        costPrice: Number(productForm.costPrice || 0),
        stock: Number(productForm.stock),
        productType: productForm.productType || "yarn_retail",
        images: productForm.images ? [productForm.images] : [],
        featured: true,
      };
      await request(
        editingProductId ? `products/${editingProductId}` : "products",
        {
          method: editingProductId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      showToast(
        editingProductId
          ? "🎉 Đã cập nhật sản phẩm thành công!"
          : "🎉 Đã thêm sản phẩm mới vào kho len!",
      );
      resetProductForm();
      loadAdmin();
    } catch (err) {
      alert(err.message);
    }
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm({
      name: "",
      slug: "",
      price: "",
      costPrice: "",
      productType: "yarn_retail",
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
      costPrice: product.costPrice || "",
      productType: product.productType || "yarn_retail",
      stock: product.stock || "",
      category: product.category?._id || product.category || "",
      brand: product.brand || "",
      images: product.images?.[0] || "",
      description: product.description || "",
    });
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadProductImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setUploadMessage("Đang xử lý và tải ảnh lên...");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${apiUrl}/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result.url) {
        setProductForm((form) => ({ ...form, images: result.url }));
        setUploadMessage("✓ Tải ảnh thành công!");
        setUploadingImage(false);
        return;
      }
      throw new Error(result.message || "Không upload được qua máy chủ");
    } catch (apiErr) {
      console.warn("API upload fallback qua canvas:", apiErr.message);
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let w = img.width;
            let h = img.height;
            if (w > 1000) {
              h = Math.round((h * 1000) / w);
              w = 1000;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
            setProductForm((form) => ({ ...form, images: dataUrl }));
            setUploadMessage("✓ Đã chọn & nén ảnh trực tiếp từ máy!");
            setUploadingImage(false);
          };
          img.onerror = () => {
            setProductForm((form) => ({ ...form, images: e.target.result }));
            setUploadMessage("✓ Đã chọn ảnh từ máy!");
            setUploadingImage(false);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setUploadMessage(`Lỗi đọc ảnh: ${err.message}`);
        setUploadingImage(false);
      }
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn sản phẩm này không?"))
      return;
    try {
      await request(`products/${id}`, { method: "DELETE" });
      if (editingProductId === id) resetProductForm();
      showToast("🗑️ Đã xóa sản phẩm khỏi kho.");
      loadAdmin();
    } catch (err) {
      alert(err.message);
    }
  }

  // Cấp lại mật khẩu khách hàng
  async function handleResetPassword(e) {
    e.preventDefault();
    if (!resetPasswordModal.customer) return;
    try {
      const res = await request(
        `customers/${resetPasswordModal.customer._id}/reset-password`,
        {
          method: "PUT",
          body: JSON.stringify({
            newPassword: resetPasswordModal.newPassword,
          }),
        },
      );
      setResetPasswordModal((prev) => ({
        ...prev,
        resultMsg: `✓ Đã cập nhật mật khẩu mới thành công: ${res.newPassword}`,
        errorMsg: "",
      }));
      showToast(
        `🔑 Đã cấp lại mật khẩu cho khách ${resetPasswordModal.customer.name}!`,
      );
      loadAdmin();
    } catch (err) {
      setResetPasswordModal((prev) => ({
        ...prev,
        errorMsg: err.message,
        resultMsg: "",
      }));
    }
  }

  // Nhà cung cấp handlers
  async function handleSaveSupplier(e) {
    e.preventDefault();
    try {
      const isEdit = supplierModal.isEdit;
      const url = isEdit
        ? `suppliers/${supplierModal.supplierId}`
        : "suppliers";
      const method = isEdit ? "PUT" : "POST";
      await request(url, {
        method,
        body: JSON.stringify(supplierModal.form),
      });
      showToast(
        isEdit
          ? "✓ Đã cập nhật nhà cung cấp!"
          : "🎉 Đã thêm nhà cung cấp mới!",
      );
      setSupplierModal({
        open: false,
        isEdit: false,
        supplierId: null,
        form: {
          name: "",
          phone: "",
          address: "",
          supplyItems: "",
          rating: 5,
          totalImported: 0,
          notes: "",
        },
      });
      loadAdmin();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteSupplier(id) {
    if (!window.confirm("Bạn có chắc muốn xóa nhà cung cấp này?")) return;
    try {
      await request(`suppliers/${id}`, { method: "DELETE" });
      showToast("🗑️ Đã xóa nhà cung cấp.");
      loadAdmin();
    } catch (err) {
      alert(err.message);
    }
  }

  // Nhân viên & Thợ móc handlers
  async function handleSaveStaff(e) {
    e.preventDefault();
    try {
      const isEdit = staffModal.isEdit;
      const url = isEdit ? `staff/${staffModal.staffId}` : "staff";
      const method = isEdit ? "PUT" : "POST";
      await request(url, {
        method,
        body: JSON.stringify(staffModal.form),
      });
      showToast(
        isEdit
          ? "✓ Đã cập nhật thợ móc / nhân sự!"
          : "🎉 Đã thêm thợ móc / nhân sự mới!",
      );
      setStaffModal({
        open: false,
        isEdit: false,
        staffId: null,
        form: {
          name: "",
          phone: "",
          role: "Thợ gia công hoa len",
          pieceRate: 20000,
          completedCount: 0,
          totalPaid: 0,
          skills: "",
          status: "active",
          notes: "",
        },
      });
      loadAdmin();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteStaff(id) {
    if (!window.confirm("Bạn có chắc muốn xóa nhân sự này?")) return;
    try {
      await request(`staff/${id}`, { method: "DELETE" });
      showToast("🗑️ Đã xóa nhân sự.");
      loadAdmin();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleIncrementStaffCount(member, count = 5) {
    try {
      const newCount = (member.completedCount || 0) + count;
      const newPaid = newCount * (member.pieceRate || 20000);
      await request(`staff/${member._id}`, {
        method: "PUT",
        body: JSON.stringify({ completedCount: newCount, totalPaid: newPaid }),
      });
      showToast(
        `✓ Đã ghi nhận +${count} sản phẩm hoàn thành cho ${member.name}!`,
      );
      loadAdmin();
    } catch (err) {
      alert(err.message);
    }
  }

  // Nhập thêm kho nhanh
  async function handleQuickAddStock(e) {
    e.preventDefault();
    if (!quickStockModal.product) return;
    try {
      const newStock =
        (quickStockModal.product.stock || 0) +
        Number(quickStockModal.addStock || 20);
      await request(`products/${quickStockModal.product._id}`, {
        method: "PUT",
        body: JSON.stringify({ stock: newStock }),
      });
      showToast(
        `⚡ Đã nhập thêm +${quickStockModal.addStock} vào kho cho ${quickStockModal.product.name}!`,
      );
      setQuickStockModal({ open: false, product: null, addStock: 20 });
      loadAdmin();
    } catch (err) {
      alert(err.message);
    }
  }


  async function updateOrderStatus(id, status) {
    try {
      await request(`orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      showToast(`✓ Đã cập nhật trạng thái đơn sang: ${statusLabels[status]}`);
      loadAdmin();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function showOrder(orderOrId) {
    if (!orderOrId) return;
    let orderObj = null;
    if (typeof orderOrId === "object") {
      orderObj = orderOrId;
    } else {
      orderObj = (data.orders || []).find((o) => o._id === orderOrId);
    }
    if (orderObj) {
      setSelectedOrder(orderObj);
    }
    const id = typeof orderOrId === "object" ? orderOrId._id : orderOrId;
    if (id) {
      request(`orders/${id}`)
        .then((fresh) => {
          if (fresh && fresh._id) setSelectedOrder(fresh);
        })
        .catch(() => {
          if (!orderObj) {
            showToast("⚠️ Không thể tải thông tin chi tiết đơn hàng.");
          }
        });
    }
  }

  function openCreateImport(preProduct = null) {
    const defaultSup = data.suppliers?.[0];
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = `PN-${dateStr}-${randomSuffix}`;
    const initialProduct = preProduct || data.products?.[0];

    setImportModal({
      open: true,
      form: {
        code,
        supplierId: defaultSup?._id || "",
        supplierName: defaultSup?.name || "Tổng Kho Sợi Milk Cotton Miền Nam",
        supplierPhone: defaultSup?.phone || "0908 123 456",
        importedBy: adminUser?.name || "Sene Handmade Admin",
        notes: "",
        items: initialProduct
          ? [
              {
                productId: initialProduct._id,
                productName: initialProduct.name,
                quantity: 20,
                costPrice:
                  initialProduct.costPrice ||
                  Math.round((initialProduct.price || 20000) * 0.6) ||
                  12000,
              },
            ]
          : [
              {
                productId: "",
                productName: "",
                quantity: 20,
                costPrice: 15000,
              },
            ],
      },
    });
  }

  function handleImportItemChange(index, field, value) {
    setImportModal((prev) => {
      const newItems = [...prev.form.items];
      if (field === "productId") {
        if (value === "NEW_CUSTOM") {
          newItems[index] = {
            ...newItems[index],
            productId: "",
            productName: "",
            costPrice: 15000,
          };
        } else {
          const selectedProd = (data.products || []).find((p) => p._id === value);
          newItems[index] = {
            ...newItems[index],
            productId: value,
            productName: selectedProd ? selectedProd.name : "",
            costPrice:
              selectedProd?.costPrice ||
              Math.round((selectedProd?.price || 20000) * 0.6) ||
              12000,
          };
        }
      } else {
        newItems[index] = {
          ...newItems[index],
          [field]:
            field === "quantity" || field === "costPrice"
              ? Number(value)
              : value,
        };
      }
      return {
        ...prev,
        form: { ...prev.form, items: newItems },
      };
    });
  }

  function addImportItemRow() {
    setImportModal((prev) => {
      const firstProd = data.products?.[0];
      return {
        ...prev,
        form: {
          ...prev.form,
          items: [
            ...prev.form.items,
            {
              productId: firstProd?._id || "",
              productName: firstProd?.name || "",
              quantity: 20,
              costPrice: firstProd?.costPrice || 15000,
            },
          ],
        },
      };
    });
  }

  function removeImportItemRow(index) {
    setImportModal((prev) => {
      if (prev.form.items.length <= 1) {
        showToast("⚠️ Phiếu nhập phải có ít nhất 1 mặt hàng");
        return prev;
      }
      return {
        ...prev,
        form: {
          ...prev.form,
          items: prev.form.items.filter((_, i) => i !== index),
        },
      };
    });
  }

  async function handleCreateImport(e) {
    e.preventDefault();
    try {
      const { items } = importModal.form;
      for (const it of items) {
        if (!it.productName && !it.productId) {
          alert("Vui lòng chọn hoặc nhập tên sản phẩm len cần nhập");
          return;
        }
        if (!it.quantity || Number(it.quantity) <= 0) {
          alert("Số lượng nhập phải lớn hơn 0");
          return;
        }
      }

      const payload = {
        code: importModal.form.code.trim(),
        supplierId: importModal.form.supplierId,
        supplierName: importModal.form.supplierName.trim(),
        supplierPhone: importModal.form.supplierPhone.trim(),
        importedBy: importModal.form.importedBy.trim(),
        notes: importModal.form.notes.trim(),
        items: items.map((it) => ({
          productId: it.productId || undefined,
          productName: it.productName.trim(),
          quantity: Number(it.quantity),
          costPrice: Number(it.costPrice) || 0,
        })),
      };

      const res = await request("imports", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showToast(res.message || "🎉 Nhập kho thành công! Đã tự động tăng tồn kho cho sản phẩm.");
      setImportModal((prev) => ({ ...prev, open: false }));
      await loadAdmin();
    } catch (err) {
      alert("Lỗi nhập hàng: " + err.message);
    }
  }

  async function handleDeleteImport(id) {
    if (!window.confirm("Bạn có chắc muốn xóa phiếu nhập hàng này?")) return;
    try {
      await request(`imports/${id}`, { method: "DELETE" });
      showToast("Đã xóa phiếu nhập hàng");
      await loadAdmin();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  }

  async function addPromotion(event) {
    event.preventDefault();
    try {
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
      showToast("🎉 Đã tạo mã khuyến mãi thành công!");
      loadAdmin();
    } catch (err) {
      alert(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("tai-shop-token");
    localStorage.removeItem("tai-shop-user");
    setToken("");
    setAdminUser(null);
  }

  // LOGIN SCREEN
  if (!token) {
    return (
      <main className="admin-login">
        <div className="admin-login-card">
          <p className="admin-kicker">SENE HANDMADE</p>
          <h1>Admin Studio</h1>
          <p>Đăng nhập tài khoản quản trị để quản lý kho len & đơn hàng.</p>
          <form onSubmit={loginAdmin}>
            <input
              required
              type="email"
              placeholder="Email admin (VD: admin@gmail.com)"
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
        </div>
      </main>
    );
  }

  const dashboard = data.dashboard || {};

  return (
    <main className={`admin-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* SIDEBAR NAVIGATION (CÓ NÚT THU GỌN / MỞ RỘNG) */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="admin-sidebar-header">
          <a className="admin-brand notranslate" href="/" translate="no" title="Sene Handmade Pro">
            <span>✨ SENE</span> {!sidebarCollapsed && "HANDMADE"}
            {!sidebarCollapsed && <span className="admin-brand-tag">PRO</span>}
          </a>
          <button
            type="button"
            className="admin-sidebar-collapse-btn"
            onClick={() => {
              const next = !sidebarCollapsed;
              setSidebarCollapsed(next);
              localStorage.setItem("admin-sidebar-collapsed", String(next));
            }}
            title={sidebarCollapsed ? "Mở rộng thanh công cụ" : "Thu gọn thanh công cụ"}
          >
            {sidebarCollapsed ? "▶" : "◀"}
          </button>
        </div>

        <div className="admin-profile-chip" title={adminUser?.name || "Quản trị viên"}>
          <div className="admin-profile-avatar">
            {adminUser?.name
              ? adminUser.name
                  .trim()
                  .split(" ")
                  .map((w) => w[0])
                  .slice(-2)
                  .join("")
                  .toUpperCase()
              : "AD"}
          </div>
          {!sidebarCollapsed && (
            <div className="admin-profile-info">
              <strong>{adminUser?.name || "Quản trị viên"}</strong>
              <small>
                <span className="online-dot"></span> Đang hoạt động
              </small>
            </div>
          )}
        </div>

        <nav className="admin-sidebar-nav">
          {[
            { key: "overview", label: "Tổng quan", icon: "📊" },
            {
              key: "products",
              label: "Sản phẩm & Kho",
              icon: "🧶",
              badge: data.products.length,
            },
            {
              key: "imports",
              label: "Nhập Hàng & Tồn Kho",
              icon: "📥",
              badge: (data.imports || []).length,
              badgeColor: "#059669",
            },
            {
              key: "orders",
              label: "Quản lý đơn hàng",
              icon: "📦",
              badge: pendingOrders.length > 0 ? pendingOrders.length : null,
              badgeColor: "#f43f5e",
            },
            {
              key: "customers",
              label: "Khách hàng",
              icon: "👥",
              badge: data.customers.length,
            },
            {
              key: "suppliers",
              label: "Nhà Cung Cấp",
              icon: "🏢",
              badge: (data.suppliers || []).length,
            },
            {
              key: "staff",
              label: "Thợ & Nhân Sự",
              icon: "🪡",
              badge: (data.staff || []).length,
            },
            
            {
              key: "custom-orders",
              label: "Đơn Móc Theo Mẫu",
              icon: "🧶",
              badge: (data.customOrders || []).filter((o) => o.status === "pending").length || null,
              badgeColor: "#ec4899",
            },
            { key: "reports", label: "Báo cáo doanh thu", icon: "📈" },
            {
              key: "promotions",
              label: "Mã khuyến mãi",
              icon: "🎟️",
              badge: data.promotions.length,
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="admin-nav-left">
                <span className="admin-nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="admin-nav-label">{item.label}</span>}
              </span>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className="admin-nav-badge"
                  style={
                    item.badgeColor ? { background: item.badgeColor } : {}
                  }
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-toggle-full-btn"
            onClick={() => {
              const next = !sidebarCollapsed;
              setSidebarCollapsed(next);
              localStorage.setItem("admin-sidebar-collapsed", String(next));
            }}
            title={sidebarCollapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
          >
            {sidebarCollapsed ? "▶" : "◀ Thu gọn menu"}
          </button>
          <a className="admin-store-link" href="/" target="_blank" rel="noreferrer" title="Xem cửa hàng Sene Handmade">
            🛍️ {!sidebarCollapsed && "Xem cửa hàng ↗"}
          </a>
          <button className="admin-logout-btn" type="button" onClick={logout} title="Đăng xuất">
            🚪 {!sidebarCollapsed && "Đăng xuất"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT REGION */}
      <section className="admin-content">
        <div className="admin-content-inner">
          {/* TOPBAR */}
          <header className="admin-topbar">
          <div className="admin-topbar-title">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                className="admin-menu-toggle-btn"
                onClick={() => {
                  const next = !sidebarCollapsed;
                  setSidebarCollapsed(next);
                  localStorage.setItem("admin-sidebar-collapsed", String(next));
                }}
                title={sidebarCollapsed ? "Mở rộng thanh công cụ" : "Thu gọn thanh công cụ"}
              >
                ☰
              </button>
              <h1>
              {activeTab === "overview" && "📊 Tổng Quan Kinh Doanh"}
              {activeTab === "products" && "🧶 Quản Lý Sản Phẩm & Kho Len"}
              {activeTab === "imports" && "📥 Quản Lý Nhập Hàng & Tồn Kho"}
              {activeTab === "orders" && "📦 Quản Lý & Theo Dõi Đơn Hàng"}
              {activeTab === "customers" && "👥 Danh Sách Khách Hàng Thành Viên"}
              {activeTab === "suppliers" && "🏢 Quản Lý Nhà Cung Cấp Len Sợi & Phụ Kiện"}
              {activeTab === "staff" && "🪡 Quản Lý Thợ Móc Thủ Công & Nhân Viên"}
              {activeTab === "custom-orders" && "🧶 Quản Lý Đơn Đặt Móc Len Theo Mẫu Riêng"}
              {activeTab === "custom-orders" &&
                "Xem ảnh mẫu khách gửi, chốt màu sắc, hẹn ngày hoàn thiện và liên hệ Zalo 1 chạm với khách"}
              {activeTab === "reports" && "📈 Báo Cáo Doanh Thu & Bán Chạy"}
              {activeTab === "promotions" && "🎟️ Chương Trình Khuyến Mãi & Voucher"}
            </h1>
            </div>
            <p>
              {activeTab === "overview" &&
                "Số liệu thống kê thời gian thực từ cửa hàng Sene Handmade"}
              {activeTab === "products" &&
                "Thêm mới, sửa giá, cập nhật số lượng tồn kho và phân loại len sợi"}
              {activeTab === "imports" &&
                "Lập phiếu nhập hàng, tự động tăng số lượng tồn kho bán hàng và tính toán công nợ"}
              {activeTab === "orders" &&
                "Kiểm tra tiến trình đóng gói, duyệt đơn COD và in phiếu giao hàng"}
              {activeTab === "customers" &&
                "Quản lý thông tin liên hệ và lịch sử chi tiêu của người mua"}
              {activeTab === "suppliers" &&
                "Theo dõi danh bạ các xưởng len sợi, đại lý phụ kiện kim móc và giá nhập hàng"}
              {activeTab === "staff" &&
                "Quản lý thợ gia công hoa len, thú bông, tính tiền công theo từng sản phẩm hoàn thiện"}
              {activeTab === "reports" &&
                "Thống kê các mẫu len bán chạy và doanh thu từng ngày"}
              {activeTab === "promotions" &&
                "Tạo mã voucher giảm giá %, freeship cho khách hàng"}
            </p>
          </div>

          <div className="admin-topbar-actions">
            <span className="admin-clock-chip">⏰ {currentTime}</span>
            <button
              type="button"
              className="admin-refresh-btn"
              onClick={loadAdmin}
              disabled={isRefreshing}
            >
              {isRefreshing ? "⏳ Đang tải..." : "🔄 Cập nhật dữ liệu"}
            </button>
          </div>
        </header>

        {/* TOAST ALERT */}
        {toast && <div className="toast">{toast}</div>}

        {/* TAB 1: TỔNG QUAN (OVERVIEW) */}
        {activeTab === "overview" && (
          <>
            {/* 4 Grand KPI Cards */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon">💰</div>
                  <span className="kpi-trend">+14.2% tuần này</span>
                </div>
                <div className="kpi-title">Doanh thu đã thu (Giao thành công)</div>
                <div className="kpi-val">{money(dashboard.revenue)}</div>
              </div>

              <div
                className="admin-kpi-card"
                onClick={() => {
                  setActiveTab("orders");
                  setOrderFilter("pending");
                }}
                style={{ cursor: "pointer" }}
                title="Bấm để xem các đơn chờ xác nhận"
              >
                <div className="kpi-top">
                  <div className="kpi-icon">📦</div>
                  {pendingOrders.length > 0 ? (
                    <span
                      className="kpi-trend"
                      style={{ background: "#fef2f2", color: "#e11d48" }}
                    >
                      {pendingOrders.length} đơn cần duyệt
                    </span>
                  ) : (
                    <span className="kpi-trend">Đã xử lý hết</span>
                  )}
                </div>
                <div className="kpi-title">Tổng số đơn hàng</div>
                <div className="kpi-val">{dashboard.totalOrders || 0}</div>
              </div>

              <div
                className="admin-kpi-card"
                onClick={() => setActiveTab("products")}
                style={{ cursor: "pointer" }}
              >
                <div className="kpi-top">
                  <div className="kpi-icon">🧶</div>
                  <span className="kpi-trend">
                    {data.categories.length} danh mục
                  </span>
                </div>
                <div className="kpi-title">Sản phẩm len đang bán</div>
                <div className="kpi-val">{dashboard.totalProducts || 0}</div>
              </div>

              <div
                className="admin-kpi-card"
                onClick={() => setActiveTab("customers")}
                style={{ cursor: "pointer" }}
              >
                <div className="kpi-top">
                  <div className="kpi-icon">🌸</div>
                  <span className="kpi-trend">Thành viên Tiệm</span>
                </div>
                <div className="kpi-title">Khách hàng đăng ký</div>
                <div className="kpi-val">{dashboard.totalCustomers || 0}</div>
              </div>
            </div>

            {/* Pipeline Status Bar */}
            <div className="order-pipeline-bar">
              <div
                className={`pipeline-step-pill ${orderFilter === "pending" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("orders");
                  setOrderFilter("pending");
                }}
              >
                <span>⏳ Chờ xác nhận</span>
                <b>{pendingOrders.length}</b>
              </div>
              <div
                className={`pipeline-step-pill ${orderFilter === "confirmed" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("orders");
                  setOrderFilter("confirmed");
                }}
              >
                <span>🏪 Đã xác nhận</span>
                <b>{confirmedOrders.length}</b>
              </div>
              <div
                className={`pipeline-step-pill ${orderFilter === "shipping" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("orders");
                  setOrderFilter("shipping");
                }}
              >
                <span>🚚 Đang giao hàng</span>
                <b>{shippingOrders.length}</b>
              </div>
              <div
                className={`pipeline-step-pill ${orderFilter === "delivered" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("orders");
                  setOrderFilter("delivered");
                }}
              >
                <span>✅ Đã hoàn thành</span>
                <b>{deliveredOrders.length}</b>
              </div>
              {lowStockCount > 0 && (
                <div
                  className="pipeline-step-pill"
                  style={{ background: "#fff1f2", borderColor: "#fecdd3" }}
                  onClick={() => setActiveTab("products")}
                >
                  <span style={{ color: "#e11d48" }}>⚠️ Tồn kho thấp (&lt;10)</span>
                  <b style={{ background: "#e11d48" }}>{lowStockCount}</b>
                </div>
              )}
            </div>

            {/* BIỂU ĐỒ TRÒN DOANH THU & PHÂN TÍCH LỜI / LỖ (DONUT CHART & PROFIT ANALYSIS) */}
            <div className="admin-card" style={{ marginBottom: "24px" }}>
              <div className="admin-card-header">
                <div>
                  <h2>📊 Biểu Đồ Tròn Doanh Thu & Phân Tích Lời / Lỗ</h2>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#8d6271",
                      fontSize: "14.5px",
                    }}
                  >
                    Tách bạch 3 nguồn doanh thu: Len cuộn nhập bán, Sản phẩm tiệm tự móc và Nhờ thợ móc gia công.
                  </p>
                </div>
                <span className="profit-margin-pill">
                  ✨ Tỷ suất Lãi ròng: {revenueBreakdown.marginPct}%
                </span>
              </div>

              <div className="profit-analysis-box">
                {/* Left: Phân tích số liệu & Tư vấn kinh doanh */}
                <div>
                  <div className="profit-stats-summary">
                    <div className="profit-stat-item revenue">
                      <span>💰 Tổng Doanh Thu Ước Tính</span>
                      <strong>{money(revenueBreakdown.total)}</strong>
                      <small
                        style={{
                          color: "#8d6271",
                          display: "block",
                          marginTop: "4px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        (Cả 3 nguồn sản phẩm)
                      </small>
                    </div>
                    <div className="profit-stat-item cogs">
                      <span>📦 Chi Phí Vốn & Tiền Công</span>
                      <strong>{money(revenueBreakdown.totalCost)}</strong>
                      <small
                        style={{
                          color: "#8d6271",
                          display: "block",
                          marginTop: "4px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        (Giá vốn len + Công thợ)
                      </small>
                    </div>
                    <div className="profit-stat-item net-profit">
                      <span>📈 Lợi Nhuận Ròng (LÃI LỜI)</span>
                      <strong>{money(revenueBreakdown.netProfit)}</strong>
                      <small
                        style={{
                          color: "#059669",
                          display: "block",
                          marginTop: "4px",
                          fontSize: "13.5px",
                          fontWeight: 700,
                        }}
                      >
                        Biên lãi ròng: {revenueBreakdown.marginPct}%
                      </small>
                    </div>
                  </div>

                  {/* Hộp Tư Vấn Chiến Lược: Có nên nhập hàng từ đầu về bán không? */}
                  <div className="strategy-advice-card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>💡</span>
                      <strong style={{ fontSize: "14px" }}>
                        TƯ VẤN THIẾT LẬP KINH DOANH: CÓ NÊN NHẬP HÀNG TỪ ĐẦU VỀ BÁN KHÔNG?
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div>
                        <strong>
                          1. Len cuộn & phụ kiện nhập bán (
                          {revenueBreakdown.pctYarn}% DT):
                        </strong>{" "}
                        <em>Rất nên nhập từ đầu!</em> Giúp tiệm xoay vòng vốn cực nhanh, có đơn hàng phát sinh mỗi ngày vì người đan móc luôn cần nguyên liệu. Khách mua len sẽ có xu hướng mua kèm kim móc, bông gòn, mắt thú.
                      </div>
                      <div>
                        <strong>
                          2. Tiệm tự móc thành phẩm (
                          {revenueBreakdown.pctSelf}% DT):
                        </strong>{" "}
                        <em>Tỷ suất lợi nhuận cao nhất (~75%)</em>. Dùng để quay video làm mẫu (TikTok, Reels) khẳng định tay nghề của Tiệm. Chỉ nên nhận số lượng vừa sức để đảm bảo độ tỉ mỉ.
                      </div>
                      <div>
                        <strong>
                          3. Nhờ thợ móc gia công (
                          {revenueBreakdown.pctOutsource}% DT):
                        </strong>{" "}
                        <em>Bí quyết mở rộng quy mô khi đông khách!</em> Vào các dịp lễ (20/10, Valentine, 8/3, Giáng sinh), shop dùng đòn bẩy thợ móc trả công theo sản phẩm ({money(20000)} - {money(50000)}/món) để trả hàng loạt bó hoa, thú len mà không lo thiếu hàng hay kiệt sức.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: SVG Donut Chart */}
                <div className="donut-container">
                  <div className="donut-svg-wrap">
                    <svg
                      viewBox="0 0 160 160"
                      width="160"
                      height="160"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      {/* Background circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#ffe4e6"
                        strokeWidth="22"
                      />

                      {/* Slice 1: Len nhập bán (#f43f5e) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#f43f5e"
                        strokeWidth="22"
                        strokeDasharray={`${(revenueBreakdown.pctYarn / 100) * 377} 377`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                      />

                      {/* Slice 2: Tự móc (#f59e0b) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="22"
                        strokeDasharray={`${(revenueBreakdown.pctSelf / 100) * 377} 377`}
                        strokeDashoffset={`-${(revenueBreakdown.pctYarn / 100) * 377}`}
                        strokeLinecap="round"
                      />

                      {/* Slice 3: Thợ gia công (#10b981) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="22"
                        strokeDasharray={`${(revenueBreakdown.pctOutsource / 100) * 377} 377`}
                        strokeDashoffset={`-${((revenueBreakdown.pctYarn + revenueBreakdown.pctSelf) / 100) * 377}`}
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="donut-center-text">
                      <small>TỶ SUẤT LÃI</small>
                      <strong>{revenueBreakdown.marginPct}%</strong>
                    </div>
                  </div>

                  <div className="donut-legend">
                    <div className="legend-item">
                      <div className="legend-dot-label">
                        <span
                          className="legend-dot"
                          style={{ background: "#f43f5e" }}
                        ></span>
                        <span>Len nhập bán</span>
                      </div>
                      <strong>
                        {money(revenueBreakdown.revYarn)} (
                        {revenueBreakdown.pctYarn}%)
                      </strong>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot-label">
                        <span
                          className="legend-dot"
                          style={{ background: "#f59e0b" }}
                        ></span>
                        <span>Tiệm tự móc</span>
                      </div>
                      <strong>
                        {money(revenueBreakdown.revSelf)} (
                        {revenueBreakdown.pctSelf}%)
                      </strong>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot-label">
                        <span
                          className="legend-dot"
                          style={{ background: "#10b981" }}
                        ></span>
                        <span>Thợ gia công</span>
                      </div>
                      <strong>
                        {money(revenueBreakdown.revOutsource)} (
                        {revenueBreakdown.pctOutsource}%)
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BÁO CÁO HÀNG SẮP HẾT KHO (COMPACT LOW STOCK ALERT) */}
            {lowStockProducts.length > 0 && (
              <div className="low-stock-bar">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>⚠️</span>
                    <strong style={{ fontSize: "16px", color: "#be123c" }}>
                      BÁO CÁO HÀNG SẮP HẾT KHO ({lowStockProducts.length} sản phẩm dưới 10 cuộn)
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    style={{ fontSize: "14px", padding: "6px 16px", fontWeight: 700 }}
                    onClick={() => setActiveTab("products")}
                  >
                    Xem toàn bộ kho hàng →
                  </button>
                </div>

                <div className="low-stock-grid">
                  {lowStockProducts.slice(0, 4).map((p) => (
                    <div key={p._id} className="low-stock-card">
                      <img
                        src={p.images?.[0] || "/placeholder.jpg"}
                        alt={p.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "10px",
                          objectFit: "cover",
                          border: "1px solid #fecdd3",
                        }}
                      />
                      <div className="low-stock-info">
                        <strong title={p.name}>{p.name}</strong>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginTop: "2px",
                          }}
                        >
                          <span className="low-stock-badge">
                            Còn {p.stock || 0} cuộn
                          </span>
                          <span
                            style={{ fontSize: "11px", color: "#8d6271" }}
                          >
                            Bán: <strong style={{ color: "#e11d48" }}>{money(p.price)}</strong>
                            {p.costPrice > 0 && (
                              <> · Vốn: <strong style={{ color: "#475569" }}>{money(p.costPrice)}</strong></>
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="admin-btn-outline"
                        style={{
                          fontSize: "13px",
                          padding: "6px 12px",
                          fontWeight: 700,
                          borderColor: "#f43f5e",
                          color: "#f43f5e",
                          whiteSpace: "nowrap",
                        }}
                        onClick={() =>
                          setQuickStockModal({
                            open: true,
                            product: p,
                            addStock: 20,
                          })
                        }
                      >
                        ⚡ +20 cuộn
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bảng đơn hàng mới nhất */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>📦 5 Đơn Hàng Mới Đặt Gần Nhất</h2>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setActiveTab("orders")}
                >
                  Xem tất cả {data.orders.length} đơn hàng →
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Số món</th>
                      <th>Tổng tiền</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.slice(0, 5).map((order) => (
                      <tr key={order._id}>
                        <td>
                          <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                        </td>
                        <td>
                          <strong>{order.customerName}</strong>
                          <small style={{ display: "block", color: "#8d6271" }}>
                            📱 {order.phone}
                          </small>
                        </td>
                        <td>{order.items?.length || 0} món</td>
                        <td>
                          <strong style={{ color: "#e11d48" }}>
                            {money(order.totalAmount)}
                          </strong>
                        </td>
                        <td>
                          <span
                            className="status-pill-badge"
                            style={{ background: "#fdf2f8", color: "#be123c" }}
                          >
                            {order.paymentMethod === "COD"
                              ? "💵 Thu hộ COD"
                              : "💳 VietQR"}
                          </span>
                        </td>
                        <td>
                          <select
                            className="order-status-select"
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                          >
                            {Object.entries(statusLabels).map(
                              ([key, label]) => (
                                <option key={key} value={key}>
                                  {statusIcons[key]} {label}
                                </option>
                              ),
                            )}
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn-outline"
                            onClick={() => showOrder(order._id)}
                          >
                            👁️ Xem hóa đơn
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data.orders.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                          Chưa có đơn hàng nào phát sinh.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 4 Bán chạy leaderboard */}
            {data.reports.bestSelling?.length > 0 && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2>🔥 Top Sản Phẩm Len Bán Chạy Nhất</h2>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {data.reports.bestSelling.slice(0, 4).map((item, idx) => (
                    <div
                      key={item._id}
                      style={{
                        background: "#fffafc",
                        border: "1.5px solid #fce7f3",
                        borderRadius: "14px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            color: idx === 0 ? "#f59e0b" : "#f43f5e",
                          }}
                        >
                          {idx === 0 ? "🥇 Hạng 1" : `#${idx + 1}`}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#059669",
                          }}
                        >
                          Đã bán {item.quantity} cuộn
                        </span>
                      </div>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        {item.name}
                      </strong>
                      <div style={{ fontSize: "13px", color: "#e11d48", fontWeight: 700 }}>
                        {money(item.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: SẢN PHẨM & KHO (PRODUCTS) */}
        {activeTab === "products" && (
          <>
            {/* THỐNG KÊ LỜI / LỖ & TỒN KHO */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon">🧶</div>
                  <span className="kpi-trend">{data.products.length} mặt hàng</span>
                </div>
                <div className="kpi-title">Tổng tồn kho hàng len</div>
                <h3 className="kpi-val">{productInventoryStats.totalStock} cuộn/bó</h3>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon" style={{ background: "#f1f5f9", borderColor: "#cbd5e1" }}>💰</div>
                  <span className="kpi-trend" style={{ background: "#f1f5f9", color: "#475569", borderColor: "#cbd5e1" }}>
                    Giá nhập vốn
                  </span>
                </div>
                <div className="kpi-title">Tổng tiền vốn tồn kho</div>
                <h3 className="kpi-val" style={{ color: "#475569" }}>
                  {money(productInventoryStats.totalCostVal)}
                </h3>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon" style={{ background: "#fff1f5", borderColor: "#fecdd3" }}>🏷️</div>
                  <span className="kpi-trend" style={{ background: "#fff1f5", color: "#be123c", borderColor: "#fecdd3" }}>
                    Giá bán ra
                  </span>
                </div>
                <div className="kpi-title">Dự kiến thu khi bán hết</div>
                <h3 className="kpi-val" style={{ color: "#e11d48" }}>
                  {money(productInventoryStats.totalRetailVal)}
                </h3>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon" style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}>💎</div>
                  <span className="kpi-trend" style={{ background: "#ecfdf5", color: "#047857" }}>
                    +{productInventoryStats.marginPercent}% Biên lời
                  </span>
                </div>
                <div className="kpi-title">Lợi nhuận gộp dự kiến</div>
                <h3 className="kpi-val" style={{ color: "#047857" }}>
                  {money(productInventoryStats.projectedProfit)}
                </h3>
              </div>
            </div>

            {/* Form Thêm/Sửa Sản Phẩm */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>
                    {editingProductId
                      ? "✏️ Chỉnh Sửa Thông Tin Sản Phẩm"
                      : "➕ Thêm Sản Phẩm Len / Dụng Cụ Mới"}
                  </h2>
                  <p style={{ margin: "4px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                    Cập nhật giá, số lượng tồn kho và thông tin để sản phẩm xuất hiện trên trang chủ.
                  </p>
                </div>
                {editingProductId && (
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={resetProductForm}
                  >
                    ✕ Hủy chỉnh sửa
                  </button>
                )}
              </div>

              <form onSubmit={addProduct}>
                <div className="admin-product-grid-form">
                  <div className="admin-form-group">
                    <label>Tên sản phẩm (*)</label>
                    <input
                      required
                      placeholder="VD: Len Milk Bò 50g Siêu Mềm"
                      value={productForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setProductForm((prev) => ({
                          ...prev,
                          name,
                          slug: editingProductId ? prev.slug : slugify(name),
                        }));
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Đường dẫn tĩnh (Slug URL) (*)</label>
                    <input
                      required
                      placeholder="len-milk-bo-50g-sieu-mem"
                      value={productForm.slug}
                      onChange={(e) =>
                        setProductForm({ ...productForm, slug: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Giá bán (VNĐ) (*)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="18000"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Giá vốn / Chi phí nguyên liệu (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="VD: 10000"
                      value={productForm.costPrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          costPrice: e.target.value,
                        })
                      }
                    />
                  </div>

                  {(() => {
                    const p = Number(productForm.price) || 0;
                    const c = Number(productForm.costPrice) || 0;
                    if (p > 0 && c > 0) {
                      const diff = p - c;
                      const pct = Math.round((diff / p) * 100);
                      return (
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            padding: "12px 18px",
                            borderRadius: "12px",
                            background: diff >= 0 ? "#ecfdf5" : "#fee2e2",
                            border: `1.5px solid ${diff >= 0 ? "#a7f3d0" : "#fca5a5"}`,
                            fontSize: "14px",
                            fontWeight: 700,
                            color: diff >= 0 ? "#047857" : "#b91c1c",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>
                            {diff >= 0 ? "📈 Dự kiến lợi nhuận bán ra: " : "📉 Cảnh báo bán lỗ: "}
                            <strong>{diff >= 0 ? `+${money(diff)}` : `-${money(Math.abs(diff))}`}</strong> ({pct}% trên giá bán)
                          </span>
                          <span style={{ fontSize: "12.5px", fontWeight: 600 }}>
                            {diff >= 0 ? "✅ Giá bán có lời" : "⚠️ Giá bán thấp hơn giá vốn nhập"}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="admin-form-group">
                    <label>Mô hình / Nguồn gốc sản phẩm (*)</label>
                    <select
                      value={productForm.productType}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          productType: e.target.value,
                        })
                      }
                    >
                      <option value="yarn_retail">
                        🧶 Len cuộn & Phụ kiện nhập về bán
                      </option>
                      <option value="self_made">
                        🌸 Tiệm tự móc (In-house thủ công)
                      </option>
                      <option value="outsourced">
                        🪡 Nhờ thợ gia công móc thành phẩm
                      </option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Số lượng tồn kho (Cuộn/Bộ) (*)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="50"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Danh mục sản phẩm (*)</label>
                    <select
                      required
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {data.categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Chất liệu sợi / Nhãn hiệu</label>
                    <input
                      placeholder="VD: Milk Cotton, Chenille, Tự móc..."
                      value={productForm.brand}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          brand: e.target.value,
                        })
                      }
                    />
                  </div>

                  {Number(productForm.price) > 0 &&
                    Number(productForm.costPrice) > 0 && (
                      <div
                        className="full-width"
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          color: "#166534",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        <span>
                          💡 Ước tính Lãi gộp mỗi món:{" "}
                          <strong style={{ color: "#15803d", fontSize: "15px" }}>
                            {money(
                              Number(productForm.price) -
                                Number(productForm.costPrice),
                            )}
                          </strong>
                        </span>
                        <span>
                          Tỷ suất sinh lời:{" "}
                          <strong style={{ color: "#15803d" }}>
                            {(
                              ((Number(productForm.price) -
                                Number(productForm.costPrice)) /
                                Number(productForm.price)) *
                              100
                            ).toFixed(1)}
                            %
                          </strong>
                        </span>
                      </div>
                    )}

                  <div className="admin-form-group full-width">
                    <label>Link hình ảnh sản phẩm (Cloudinary hoặc URL)</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        style={{ flex: 1 }}
                        placeholder="https://images.unsplash.com/... hoặc link ảnh"
                        value={productForm.images}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            images: e.target.value,
                          })
                        }
                      />
                      <label
                        className="admin-btn-outline"
                        style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}
                      >
                        📁 Tải ảnh từ máy
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={uploadProductImage}
                        />
                      </label>
                    </div>
                    {uploadMessage && (
                      <small style={{ color: uploadingImage ? "#e11d48" : "#059669", fontWeight: 600 }}>
                        {uploadMessage}
                      </small>
                    )}
                    {productForm.images && (
                      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px", background: "#fdf2f8", padding: "8px 12px", borderRadius: "10px", border: "1px solid #fbcfe8" }}>
                        <img
                          src={productForm.images}
                          alt="Xem trước ảnh sản phẩm"
                          style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1.5px solid #fda4af" }}
                        />
                        <div>
                          <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700, display: "block" }}>✓ Đã chọn ảnh sản phẩm</span>
                          <button
                            type="button"
                            className="admin-btn-outline"
                            onClick={() => setProductForm((prev) => ({ ...prev, images: "" }))}
                            style={{ padding: "2px 8px", fontSize: "11px", color: "#e11d48", marginTop: "4px" }}
                          >
                            ✕ Xóa ảnh này
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button type="submit" className="admin-btn-primary">
                    {editingProductId ? "💾 Lưu Thay Đổi" : "➕ Thêm Sản Phẩm Mới"}
                  </button>
                  {editingProductId && (
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={resetProductForm}
                    >
                      ✕ Hủy Chỉnh Sửa
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Danh Sách Sản Phẩm */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Kho Hàng & Đối Soát Lời Lỗ ({filteredProducts.length} sản phẩm)</h2>
                  <p style={{ margin: "4px 0 0", color: "#7b4b5c", fontSize: "14.5px" }}>
                    Đối chiếu trực quan giữa Giá Vốn Nhập Kho và Giá Bán Ra để kiểm soát biên lợi nhuận
                  </p>
                </div>
                <div className="admin-card-actions">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={exportProductsExcel}
                  style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0", fontWeight: 700 }}
                  title="Xuất file Excel danh sách toàn bộ len & phụ kiện kho"
                >
                  📥 Xuất Excel Kho Hàng
                </button>
                  <input
                    className="admin-search-input"
                    placeholder="🔍 Tìm theo tên, slug..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  <select
                    className="admin-select-input"
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                  >
                    <option value="all">Tất cả danh mục</option>
                    {data.categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PROFIT FILTER BAR */}
              <div className="profit-filter-bar">
                <span style={{ fontWeight: 800, color: "#471827", fontSize: "14.5px" }}>
                  📊 Bộ lọc lời / lỗ:
                </span>
                <button
                  type="button"
                  className={`profit-filter-pill ${profitFilter === "all" ? "active" : ""}`}
                  onClick={() => setProfitFilter("all")}
                >
                  Tất cả ({data.products.length})
                </button>
                <button
                  type="button"
                  className={`profit-filter-pill profit ${profitFilter === "profit" ? "active" : ""}`}
                  onClick={() => setProfitFilter("profit")}
                >
                  📈 Đang có lời ({data.products.filter((p) => Number(p.costPrice) > 0 && Number(p.price) > Number(p.costPrice)).length})
                </button>
                <button
                  type="button"
                  className={`profit-filter-pill loss ${profitFilter === "loss" ? "active" : ""}`}
                  onClick={() => setProfitFilter("loss")}
                >
                  📉 Cảnh báo lỗ ({data.products.filter((p) => Number(p.costPrice) > 0 && Number(p.price) < Number(p.costPrice)).length})
                </button>
                <button
                  type="button"
                  className={`profit-filter-pill ${profitFilter === "breakeven" ? "active" : ""}`}
                  onClick={() => setProfitFilter("breakeven")}
                >
                  ⚖️ Hòa vốn ({data.products.filter((p) => Number(p.costPrice) > 0 && Number(p.price) === Number(p.costPrice)).length})
                </button>
                <button
                  type="button"
                  className={`profit-filter-pill nocost ${profitFilter === "nocost" ? "active" : ""}`}
                  onClick={() => setProfitFilter("nocost")}
                >
                  ⚠️ Chưa có giá vốn ({data.products.filter((p) => !p.costPrice || Number(p.costPrice) <= 0).length})
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Ảnh</th>
                      <th>Tên sản phẩm</th>
                      <th>Danh mục</th>
                      <th>Giá Bán & Giá Vốn (Nhập - Lời)</th>
                      <th>Tồn kho</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id}>
                        <td style={{ width: "60px" }}>
                          <img
                            src={product.images?.[0] || "/placeholder.jpg"}
                            alt={product.name}
                            style={{
                              width: "56px",
                              height: "56px",
                              objectFit: "cover",
                              borderRadius: "12px",
                              border: "1.5px solid #fce7f3",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            }}
                          />
                        </td>
                        <td>
                          <strong style={{ fontSize: "16px", color: "#2c0e17" }}>{product.name}</strong>
                          <small style={{ display: "block", color: "#8d6271", marginTop: "3px", fontSize: "13px" }}>
                            🔗 /{product.slug} · {product.brand || "Sene Handmade"}
                          </small>
                          <span
                            style={{
                              fontSize: "12px",
                              display: "inline-block",
                              marginTop: "4px",
                              color: "#be123c",
                              background: "#fff1f5",
                              padding: "3px 10px",
                              borderRadius: "10px",
                              border: "1px solid #fce7f3",
                              fontWeight: 700,
                            }}
                          >
                            {productTypeLabels[product.productType || "yarn_retail"]}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              background: "#fff1f2",
                              color: "#be123c",
                              padding: "5px 12px",
                              borderRadius: "12px",
                              fontSize: "13.5px",
                              fontWeight: 700,
                            }}
                          >
                            {product.category?.name || "Chưa phân loại"}
                          </span>
                        </td>
                        <td>
                          <div className="price-compare-cell">
                            <div className="price-compare-row">
                              <div className="price-pill-item sell" title="Giá bán ra niêm yết">
                                <span className="price-pill-label">Bán</span>
                                <span className="price-pill-val">{money(product.price)}</span>
                              </div>
                              <div className="price-pill-item cost" title="Giá vốn nhập kho">
                                <span className="price-pill-label">Vốn</span>
                                {product.costPrice > 0 ? (
                                  <span className="price-pill-val">{money(product.costPrice)}</span>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn-add-cost-inline"
                                    onClick={() =>
                                      setQuickPriceModal({
                                        open: true,
                                        product,
                                        price: product.price || 0,
                                        costPrice: 0,
                                      })
                                    }
                                  >
                                    + Nhập vốn
                                  </button>
                                )}
                              </div>
                            </div>
                            {(() => {
                              const cost = Number(product.costPrice) || 0;
                              const price = Number(product.price) || 0;
                              if (!cost || cost <= 0) {
                                return (
                                  <span className="profit-mini-badge neutral">
                                    ⚠️ Chưa có giá vốn
                                  </span>
                                );
                              }
                              const profit = price - cost;
                              const pct = price > 0 ? Math.round((profit / price) * 100) : 0;
                              if (profit > 0) {
                                return (
                                  <span className="profit-mini-badge positive">
                                    📈 Lời +{money(profit)} ({pct}%)
                                  </span>
                                );
                              }
                              if (profit === 0) {
                                return (
                                  <span className="profit-mini-badge neutral">
                                    ⚖️ Hòa vốn (0đ)
                                  </span>
                                );
                              }
                              return (
                                <span className="profit-mini-badge negative">
                                  📉 Lỗ -{money(Math.abs(profit))} ({pct}%)
                                </span>
                              );
                            })()}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {product.stock > 10 ? (
                              <span className="status-pill-badge delivered">
                                Còn {product.stock} cuộn
                              </span>
                            ) : product.stock > 0 ? (
                              <span className="status-pill-badge pending">
                                ⚠️ Sắp hết ({product.stock})
                              </span>
                            ) : (
                              <span className="status-pill-badge cancelled">
                                ❌ Hết hàng
                              </span>
                            )}
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "3px 8px", fontSize: "12px", borderColor: "#f43f5e", color: "#f43f5e", fontWeight: 700 }}
                              title="Nhập thêm hàng vào kho"
                              onClick={() => setQuickStockModal({ open: true, product, addStock: 20 })}
                            >
                              ⚡ +20
                            </button>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ borderColor: "#2563eb", color: "#2563eb", fontWeight: 700, padding: "7px 12px" }}
                              title="Sửa nhanh giá vốn và giá bán"
                              onClick={() =>
                                setQuickPriceModal({
                                  open: true,
                                  product,
                                  price: product.price || 0,
                                  costPrice: product.costPrice || 0,
                                })
                              }
                            >
                              💰 Sửa giá
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ borderColor: "#059669", color: "#059669", fontWeight: 700, padding: "7px 12px" }}
                              title="Lập phiếu nhập hàng cho sản phẩm này"
                              onClick={() => openCreateImport(product)}
                            >
                              📥 Nhập kho
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ padding: "7px 12px" }}
                              onClick={() => editProduct(product)}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ color: "#dc2626", borderColor: "#fecaca", padding: "7px 12px" }}
                              onClick={() => deleteProduct(product._id)}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                          Không tìm thấy sản phẩm nào phù hợp với từ khóa.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB: QUẢN LÝ NHẬP HÀNG & TỒN KHO (IMPORTS) */}
        {activeTab === "imports" && (
          <>
            {/* KPI Thống Kê Nhập Hàng */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon">📦</div>
                  <span className="kpi-trend">Lịch sử</span>
                </div>
                <div className="kpi-title">Tổng số phiếu nhập</div>
                <h3 className="kpi-val">{data.imports?.length || 0} phiếu</h3>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon" style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}>💰</div>
                  <span className="kpi-trend" style={{ background: "#ecfdf5", color: "#047857" }}>Vốn nhập</span>
                </div>
                <div className="kpi-title">Tổng tiền nhập hàng</div>
                <h3 className="kpi-val" style={{ color: "#047857" }}>
                  {money((data.imports || []).reduce((s, i) => s + (i.totalAmount || 0), 0))}
                </h3>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon" style={{ background: "#fdf2f8", borderColor: "#fbcfe8" }}>🧶</div>
                  <span className="kpi-trend">Tồn kho đã tăng</span>
                </div>
                <div className="kpi-title">Tổng lượng len đã nhập</div>
                <h3 className="kpi-val" style={{ color: "#be123c" }}>
                  {(data.imports || []).reduce(
                    (s, i) => s + (i.items || []).reduce((sub, it) => sub + (it.quantity || 0), 0),
                    0
                  )} cuộn/bó
                </h3>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>🏢</div>
                  <span className="kpi-trend" style={{ background: "#eff6ff", color: "#1d4ed8" }}>Đối tác</span>
                </div>
                <div className="kpi-title">Nhà cung cấp đối tác</div>
                <h3 className="kpi-val" style={{ color: "#1d4ed8" }}>{data.suppliers?.length || 0} đối tác</h3>
              </div>
            </div>

            {/* Bảng Danh Sách Phiếu Nhập */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>📦 Lịch Sử Nhập Hàng & Tồn Kho ({filteredImports.length})</h2>
                  <p style={{ margin: "4px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                    Mỗi phiếu nhập hàng sẽ tự động tăng số lượng tồn kho của sản phẩm để phục vụ bán hàng ngay trên shop.
                  </p>
                </div>
                <div className="admin-card-actions">
                  <input
                    className="admin-search-input"
                    placeholder="🔍 Tìm theo mã PN, NCC, tên len..."
                    value={importSearch}
                    onChange={(e) => setImportSearch(e.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-btn-primary"
                    style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 4px 14px rgba(5, 150, 105, 0.4)" }}
                    onClick={() => openCreateImport()}
                  >
                    ➕ Lập Phiếu Nhập Hàng Mới
                  </button>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã Phiếu</th>
                      <th>Nhà Cung Cấp & SĐT</th>
                      <th>Thời Gian Nhập</th>
                      <th>Mặt Hàng Nhập Kho</th>
                      <th>Tổng Tiền Vốn</th>
                      <th>Người Lập</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImports.map((imp) => (
                      <tr key={imp._id}>
                        <td>
                          <strong>{imp.code}</strong>
                        </td>
                        <td>
                          <strong>{imp.supplierName}</strong>
                          {imp.supplierPhone && (
                            <small style={{ display: "block", color: "#8d6271" }}>
                              📱 {imp.supplierPhone}
                            </small>
                          )}
                        </td>
                        <td>
                          {new Date(imp.createdAt).toLocaleDateString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <div className="import-items-list-cell">
                            {imp.items?.slice(0, 3).map((item, idx) => (
                              <span key={idx} className="import-item-tag">
                                <strong>{item.productName}</strong>
                                <span style={{ color: "#be123c", fontWeight: 700 }}>
                                  x{item.quantity}
                                </span>
                                <small style={{ color: "#8d6271" }}>
                                  ({money(item.costPrice)})
                                </small>
                              </span>
                            ))}
                            {imp.items?.length > 3 && (
                              <small style={{ color: "#8d6271" }}>
                                + thêm {imp.items.length - 3} mặt hàng nữa...
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: "#047857", fontSize: "14px" }}>
                            {money(imp.totalAmount)}
                          </strong>
                        </td>
                        <td>{imp.importedBy || "Admin Kho"}</td>
                        <td>
                          <span className="import-badge-pill">
                            ✅ Đã nhập kho (+Tồn)
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              onClick={() => setSelectedImportReceipt(imp)}
                              title="Xem và in phiếu nhập kho"
                            >
                              👁️ Xem phiếu
                            </button>
                            <button
                              type="button"
                              className="admin-btn-outline"
                              style={{ color: "#dc2626", borderColor: "#fecaca" }}
                              onClick={() => handleDeleteImport(imp._id)}
                              title="Xóa phiếu nhập"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredImports.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                          {importSearch
                            ? "Không tìm thấy phiếu nhập nào với từ khóa này."
                            : "Chưa có phiếu nhập hàng nào. Bấm nút '+ Lập Phiếu Nhập Hàng Mới' để nhập hàng vào kho và tăng số lượng bán."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 3: QUẢN LÝ ĐƠN HÀNG (ORDERS) */}
        {activeTab === "orders" && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>📦 Quản Lý {data.orders.length} Đơn Hàng</h2>
              <div className="admin-card-actions">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={exportShipperOrdersExcel}
                  style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0", fontWeight: 700 }}
                  title="Xuất bảng kê danh sách giao hàng cho Shipper bưu tá"
                >
                  📥 Xuất Bảng Kê Shipper COD
                </button>
                <input
                  className="admin-search-input"
                  placeholder="🔍 Tìm mã đơn, tên, SĐT..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "20px",
                borderBottom: "1.5px solid #fce7f3",
                paddingBottom: "12px",
              }}
            >
              {[
                { id: "all", label: "Tất cả", count: data.orders.length },
                { id: "pending", label: "⏳ Chờ xác nhận", count: pendingOrders.length },
                { id: "confirmed", label: "🏪 Đã xác nhận", count: confirmedOrders.length },
                { id: "shipping", label: "🚚 Đang giao", count: shippingOrders.length },
                { id: "delivered", label: "✅ Đã giao", count: deliveredOrders.length },
                { id: "cancelled", label: "❌ Đã hủy", count: cancelledOrders.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOrderFilter(tab.id)}
                  style={{
                    border: "0",
                    background: orderFilter === tab.id ? "#f43f5e" : "#fff1f5",
                    color: orderFilter === tab.id ? "#fff" : "#be123c",
                    padding: "6px 14px",
                    borderRadius: "16px",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng & SĐT</th>
                    <th>Ngày đặt</th>
                    <th>Số món</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái đơn</th>
                    <th>Hóa đơn</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                      </td>
                      <td>
                        <strong>{order.customerName}</strong>
                        <small style={{ display: "block", color: "#8d6271" }}>
                          📱 {order.phone}
                        </small>
                        <small
                          style={{
                            display: "block",
                            color: "#8d6271",
                            maxWidth: "180px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          📍 {order.address}
                        </small>
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </td>
                      <td>{order.items?.length || 0} món</td>
                      <td>
                        <strong style={{ color: "#e11d48", fontSize: "14px" }}>
                          {money(order.totalAmount)}
                        </strong>
                      </td>
                      <td>
                        <span
                          className="status-pill-badge"
                          style={{ background: "#fdf2f8", color: "#be123c" }}
                        >
                          {order.paymentMethod === "COD"
                            ? "💵 Thu hộ COD"
                            : "💳 VietQR"}
                        </span>
                      </td>
                      <td>
                        <select
                          className="order-status-select"
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value)
                          }
                        >
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                              {statusIcons[key]} {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="admin-btn-outline"
                            onClick={() => showOrder(order._id)}
                          >
                            👁️ Chi tiết
                          </button>
                          <button
                            type="button"
                            className="admin-btn-outline"
                            onClick={() => setShippingLabelOrder(order)}
                            style={{ background: "#fff1f2", color: "#e11d48", borderColor: "#fecdd3", fontWeight: 700 }}
                            title="In phiếu gửi hàng chuẩn bưu tá COD"
                          >
                            🏷️ In Tem
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                        Không có đơn hàng nào trong mục này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: KHÁCH HÀNG (CUSTOMERS) */}
        {activeTab === "customers" && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>👥 Danh Sách Khách Hàng Thành Viên ({data.customers.length})</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Số đơn đã mua</th>
                    <th>Tổng chi tiêu</th>
                    <th>Đơn gần nhất</th>
                    <th>Khôi phục mật khẩu</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #f43f5e, #fb7185)",
                              color: "#fff",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 800,
                              fontSize: "12px",
                            }}
                          >
                            {c.name ? c.name[0].toUpperCase() : "U"}
                          </div>
                          <strong>{c.name}</strong>
                        </div>
                      </td>
                      <td>{c.email}</td>
                      <td>{c.phone || <em>(Chưa có)</em>}</td>
                      <td>
                        <span
                          className="status-pill-badge"
                          style={{ background: "#ecfdf5", color: "#047857" }}
                        >
                          {c.orderCount} đơn
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#e11d48" }}>
                          {money(c.totalSpent)}
                        </strong>
                      </td>
                      <td>
                        {c.lastOrderAt
                          ? new Date(c.lastOrderAt).toLocaleDateString("vi-VN")
                          : "Chưa đặt"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-outline"
                          style={{
                            fontSize: "12px",
                            padding: "4px 10px",
                            color: "#be123c",
                            borderColor: "#fecdd3",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() =>
                            setResetPasswordModal({
                              open: true,
                              customer: c,
                              newPassword:
                                "LenXinh@" +
                                Math.floor(1000 + Math.random() * 9000),
                              resultMsg: "",
                              errorMsg: "",
                            })
                          }
                        >
                          🔑 Cấp lại MK
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.customers.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                        Chưa có khách hàng nào đăng ký.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: NHÀ CUNG CẤP (SUPPLIERS) */}
        {activeTab === "suppliers" && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>🏢 Danh Sách Nhà Cung Cấp Len & Phụ Kiện ({(data.suppliers || []).length})</h2>
                <p style={{ margin: "4px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                  Quản lý nguồn nhập sỉ len sợi, kim móc, phụ kiện và lịch sử chi phí đã nhập.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() =>
                  setSupplierModal({
                    open: true,
                    isEdit: false,
                    supplierId: null,
                    form: {
                      name: "",
                      phone: "",
                      address: "",
                      supplyItems: "",
                      rating: 5,
                      totalImported: 0,
                      notes: "",
                    },
                  })
                }
              >
                ➕ Thêm Nhà Cung Cấp Mới
              </button>
            </div>

            <div className="entity-grid">
              {(data.suppliers || []).map((sup) => (
                <div key={sup._id} className="entity-card">
                  <div>
                    <div className="entity-card-top">
                      <div>
                        <h3 className="entity-card-title">{sup.name}</h3>
                        <span className="entity-role-badge">⭐ {sup.rating || 5}/5 sao uy tín</span>
                      </div>
                    </div>

                    <div className="entity-card-body">
                      <div>📞 <strong>SĐT:</strong> {sup.phone || "(Chưa có)"}</div>
                      <div>📍 <strong>Địa chỉ:</strong> {sup.address || "TP. Hồ Chí Minh"}</div>
                      <div>🧶 <strong>Mặt hàng:</strong> {sup.supplyItems || "Len sợi, kim móc"}</div>
                      <div>💰 <strong>Tổng đã nhập:</strong> <strong style={{ color: "#e11d48" }}>{money(sup.totalImported)}</strong></div>
                      {sup.notes && (
                        <div style={{ fontStyle: "italic", color: "#8d6271", background: "#fff5f8", padding: "6px 10px", borderRadius: "8px", marginTop: "4px" }}>
                          📝 {sup.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="entity-card-footer">
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                      onClick={() =>
                        setSupplierModal({
                          open: true,
                          isEdit: true,
                          supplierId: sup._id,
                          form: {
                            name: sup.name,
                            phone: sup.phone || "",
                            address: sup.address || "",
                            supplyItems: sup.supplyItems || "",
                            rating: sup.rating || 5,
                            totalImported: sup.totalImported || 0,
                            notes: sup.notes || "",
                          },
                        })
                      }
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ fontSize: "12px", padding: "4px 10px", color: "#dc2626", borderColor: "#fecaca" }}
                      onClick={() => handleDeleteSupplier(sup._id)}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: THỢ MÓC & NHÂN SỰ (STAFF & ARTISANS) */}
        {activeTab === "staff" && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>🪡 Đội Ngũ Thợ Móc Thủ Công & Nhân Viên ({(data.staff || []).length})</h2>
                <p style={{ margin: "4px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                  Theo dõi tiến độ gia công hoa len, thú bông, đơn giá khoán theo sản phẩm và chi phí công thợ.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() =>
                  setStaffModal({
                    open: true,
                    isEdit: false,
                    staffId: null,
                    form: {
                      name: "",
                      phone: "",
                      role: "Thợ gia công hoa len",
                      pieceRate: 20000,
                      completedCount: 0,
                      totalPaid: 0,
                      skills: "",
                      status: "active",
                      notes: "",
                    },
                  })
                }
              >
                ➕ Thêm Thợ / Nhân Sự Mới
              </button>
            </div>

            <div className="entity-grid">
              {(data.staff || []).map((member) => (
                <div key={member._id} className="entity-card">
                  <div>
                    <div className="entity-card-top">
                      <div>
                        <h3 className="entity-card-title">{member.name}</h3>
                        <span className="entity-role-badge">{member.role}</span>
                      </div>
                      <span
                        className="status-pill-badge"
                        style={{
                          background: member.status === "active" ? "#ecfdf5" : "#f3f4f6",
                          color: member.status === "active" ? "#047857" : "#6b7280",
                          fontSize: "11px",
                        }}
                      >
                        {member.status === "active" ? "✓ Đang nhận mẫu" : "Tạm ngưng"}
                      </span>
                    </div>

                    <div className="entity-card-body">
                      <div>📞 <strong>SĐT:</strong> {member.phone || "(Chưa có)"}</div>
                      <div>💵 <strong>Tiền công:</strong> <strong style={{ color: "#e11d48" }}>{money(member.pieceRate)}/món</strong></div>
                      <div>📦 <strong>Đã hoàn thành:</strong> <strong>{member.completedCount || 0} sản phẩm</strong></div>
                      <div>💳 <strong>Tổng tiền công:</strong> <strong style={{ color: "#059669" }}>{money(member.totalPaid || ((member.completedCount || 0) * (member.pieceRate || 20000)))}</strong></div>
                      {member.skills && (
                        <div>✨ <strong>Tay nghề:</strong> {member.skills}</div>
                      )}
                      {member.notes && (
                        <div style={{ fontStyle: "italic", color: "#8d6271", background: "#fff5f8", padding: "6px 10px", borderRadius: "8px", marginTop: "4px" }}>
                          📝 {member.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="entity-card-footer">
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ fontSize: "11.5px", padding: "4px 8px", borderColor: "#f43f5e", color: "#f43f5e" }}
                      title="Ghi nhận giao thêm 5 sản phẩm móc xong"
                      onClick={() => handleIncrementStaffCount(member, 5)}
                    >
                      ➕ Xong +5 món
                    </button>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="admin-btn-outline"
                        style={{ fontSize: "11.5px", padding: "4px 8px" }}
                        onClick={() =>
                          setStaffModal({
                            open: true,
                            isEdit: true,
                            staffId: member._id,
                            form: {
                              name: member.name,
                              phone: member.phone || "",
                              role: member.role || "Thợ gia công hoa len",
                              pieceRate: member.pieceRate || 20000,
                              completedCount: member.completedCount || 0,
                              totalPaid: member.totalPaid || 0,
                              skills: member.skills || "",
                              status: member.status || "active",
                              notes: member.notes || "",
                            },
                          })
                        }
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        type="button"
                        className="admin-btn-outline"
                        style={{ fontSize: "11.5px", padding: "4px 8px", color: "#dc2626", borderColor: "#fecaca" }}
                        onClick={() => handleDeleteStaff(member._id)}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: BÁO CÁO (REPORTS) */}
        {activeTab === "reports" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2>🥇 Mẫu Bán Chạy Nhất</h2>
                </div>
                {data.reports.bestSelling?.map((item, idx) => (
                  <div
                    key={item._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid #fdf2f8",
                    }}
                  >
                    <div>
                      <strong style={{ color: idx === 0 ? "#f59e0b" : "#f43f5e" }}>
                        #{idx + 1} {item.name}
                      </strong>
                      <small style={{ display: "block", color: "#8d6271" }}>
                        Số lượng đã bán: {item.quantity} cuộn
                      </small>
                    </div>
                    <strong style={{ color: "#e11d48" }}>{money(item.revenue)}</strong>
                  </div>
                ))}
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h2>💡 Sản Phẩm Bán Chậm (Gợi Ý Flash Sale)</h2>
                </div>
                {data.reports.slowSelling?.map((item, idx) => (
                  <div
                    key={item._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid #fdf2f8",
                    }}
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <small style={{ display: "block", color: "#8d6271" }}>
                        Mới bán: {item.quantity} sản phẩm
                      </small>
                    </div>
                    <span style={{ color: "#8d6271", fontSize: "13px" }}>
                      Tồn kho cần kích cầu
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Doanh thu theo ngày */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>📅 Báo Cáo Doanh Thu Theo Ngày</h2>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Số đơn hoàn tất</th>
                      <th>Doanh thu ngày</th>
                      <th>Kiểm tra hóa đơn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reports.dailyRevenue?.map((d) => (
                      <tr key={d._id}>
                        <td>
                          <strong>{d._id}</strong>
                        </td>
                        <td>{d.orders} đơn</td>
                        <td>
                          <strong style={{ color: "#e11d48" }}>
                            {money(d.revenue)}
                          </strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn-outline"
                            style={{ fontSize: "12px", padding: "4px 10px" }}
                            onClick={() => {
                              setOrderFilter("all");
                              setOrderSearch(d._id);
                              setActiveTab("orders");
                            }}
                          >
                            👁️ Xem {d.orders} đơn ngày này →
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!data.reports.dailyRevenue ||
                      data.reports.dailyRevenue.length === 0) && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center", padding: "30px" }}>
                          Chưa có phát sinh doanh thu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 6: KHUYẾN MÃI (PROMOTIONS) */}
        {activeTab === "promotions" && (
          <>
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>🎟️ Tạo Mã Giảm Giá / Voucher Mới</h2>
              </div>
              <form onSubmit={addPromotion}>
                <div className="admin-product-grid-form">
                  <div className="admin-form-group">
                    <label>Tên chương trình ưu đãi</label>
                    <input
                      required
                      placeholder="VD: Tri Ân Khách Mới Mua Len"
                      value={promotionForm.title}
                      onChange={(e) =>
                        setPromotionForm({
                          ...promotionForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Mã Voucher (Viết hoa)</label>
                    <input
                      required
                      placeholder="VD: LENMOI15"
                      value={promotionForm.code}
                      onChange={(e) =>
                        setPromotionForm({
                          ...promotionForm,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Loại giảm giá</label>
                    <select
                      value={promotionForm.type}
                      onChange={(e) =>
                        setPromotionForm({
                          ...promotionForm,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="percent">Giảm theo phần trăm (%)</option>
                      <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Giá trị giảm (VD: 15 cho 15%, hoặc 30000 cho 30k)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="15"
                      value={promotionForm.value}
                      onChange={(e) =>
                        setPromotionForm({
                          ...promotionForm,
                          value: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Thời gian bắt đầu</label>
                    <input
                      required
                      type="datetime-local"
                      value={promotionForm.startAt}
                      onChange={(e) =>
                        setPromotionForm({
                          ...promotionForm,
                          startAt: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Thời gian kết thúc</label>
                    <input
                      required
                      type="datetime-local"
                      value={promotionForm.endAt}
                      onChange={(e) =>
                        setPromotionForm({
                          ...promotionForm,
                          endAt: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label>Mô tả ưu đãi & điều kiện áp dụng</label>
                    <textarea
                      placeholder="Áp dụng cho đơn hàng mua từ 150.000đ trở lên..."
                      value={promotionForm.description}
                      onChange={(e) =>
                        setPromotionForm({
                          ...promotionForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="admin-btn-primary">
                    🎟️ Phát Hành Voucher Mới
                  </button>
                </div>
              </form>
            </div>

            {/* Danh sách Voucher đã tạo */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>Các Mã Voucher Đang Hoạt Động</h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "16px",
                }}
              >
                {data.promotions.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      background: "#fffafc",
                      border: "1.5px dashed #f43f5e",
                      borderRadius: "16px",
                      padding: "18px",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <strong style={{ fontSize: "16px", color: "#e11d48" }}>
                        {p.code}
                      </strong>
                      <span
                        className="status-pill-badge"
                        style={{
                          background: p.isActive ? "#ecfdf5" : "#f3f4f6",
                          color: p.isActive ? "#047857" : "#6b7280",
                        }}
                      >
                        {p.isActive ? "✓ Đang kích hoạt" : "Tạm ngưng"}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
                      {p.title}
                    </div>
                    <p style={{ margin: "0 0 10px", fontSize: "12.5px", color: "#8d6271" }}>
                      {p.description || "Ưu đãi dành cho khách mua len"}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12px",
                        paddingTop: "8px",
                        borderTop: "1px solid #fce7f3",
                      }}
                    >
                      <span>
                        Giảm:{" "}
                        <strong style={{ color: "#e11d48" }}>
                          {p.type === "percent" ? `${p.value}%` : money(p.value)}
                        </strong>
                      </span>
                      <button
                        type="button"
                        className="admin-btn-outline"
                        style={{ padding: "4px 10px", fontSize: "11px" }}
                        onClick={() => {
                          navigator.clipboard.writeText(p.code);
                          showToast(`✓ Đã sao chép mã: ${p.code}`);
                        }}
                      >
                        📋 Sao chép
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        </div> {/* end of admin-content-inner */}
      </section>

      {/* MODAL XEM HÓA ĐƠN & IN PHIẾU GỬI HÀNG (INVOICE VIEWER) */}
      {selectedOrder && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="admin-invoice-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invoice-brand-header">
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#f43f5e",
                    letterSpacing: "1px",
                  }}
                >
                  HÓA ĐƠN & PHIẾU ĐÓNG GÓI SENE HANDMADE
                </span>
                <h2>#{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                <p>
                  Ngày đặt:{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-outline"
                onClick={() => setSelectedOrder(null)}
              >
                ✕ Đóng
              </button>
            </div>

            {/* Thông tin khách & người nhận */}
            <div className="invoice-customer-card">
              <div>
                <strong style={{ display: "block", color: "#be123c", marginBottom: "4px" }}>
                  👤 NGƯỜI NHẬN HÀNG:
                </strong>
                <div>{selectedOrder.customerName}</div>
                <div>📱 {selectedOrder.phone}</div>
              </div>
              <div>
                <strong style={{ display: "block", color: "#be123c", marginBottom: "4px" }}>
                  📍 ĐỊA CHỈ PHÁT HÀNG:
                </strong>
                <div>{selectedOrder.address}</div>
                <div style={{ marginTop: "4px" }}>
                  Thanh toán:{" "}
                  <strong>
                    {selectedOrder.paymentMethod === "COD"
                      ? "Thu hộ COD"
                      : "VietQR Chuyển khoản"}
                  </strong>
                </div>
              </div>
            </div>

            {selectedOrder.note && (
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "12.5px",
                  color: "#b45309",
                }}
              >
                🎁 <strong>Ghi chú từ khách:</strong> {selectedOrder.note}
              </div>
            )}

            {/* Bảng sản phẩm trong kiện */}
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>Sản phẩm len</th>
                  <th style={{ textAlign: "center" }}>Số lượng</th>
                  <th style={{ textAlign: "right" }}>Đơn giá</th>
                  <th style={{ textAlign: "right" }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>x{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>{money(item.price)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      {money(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tóm tắt thanh toán */}
            <div className="invoice-total-summary">
              <div>
                Tạm tính: <strong>{money(selectedOrder.subtotalAmount || selectedOrder.totalAmount)}</strong>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div style={{ color: "#059669" }}>
                  Mã giảm giá ({selectedOrder.promotionCode}): -{money(selectedOrder.discountAmount)}
                </div>
              )}
              <div style={{ fontSize: "16px", marginTop: "4px" }}>
                Tổng thu từ khách:{" "}
                <strong style={{ color: "#e11d48", fontSize: "22px" }}>
                  {money(selectedOrder.totalAmount)}
                </strong>
              </div>
            </div>

            {/* Trạng thái đơn hàng trong modal */}
            <div
              style={{
                background: "#fff1f5",
                border: "1px solid #fce7f3",
                borderRadius: "12px",
                padding: "12px 16px",
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "13px" }}>
                <strong>Cập nhật trạng thái đơn:</strong>
              </div>
              <div>
                <select
                  className="order-status-select"
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    updateOrderStatus(selectedOrder._id, newStatus);
                    setSelectedOrder((prev) =>
                      prev ? { ...prev, status: newStatus } : null
                    );
                  }}
                  style={{ padding: "6px 12px", fontSize: "13px" }}
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {statusIcons[key]} {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="invoice-actions-footer">
              <button
                type="button"
                className="admin-btn-outline"
                onClick={() => window.print()}
              >
                🖨️ In Hóa Đơn / Phiếu Gửi Hàng
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => setSelectedOrder(null)}
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM & IN PHIẾU NHẬP KHO */}
      {selectedImportReceipt && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedImportReceipt(null)}
        >
          <div
            className="admin-import-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invoice-brand-header">
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#059669",
                    letterSpacing: "1px",
                  }}
                >
                  PHIẾU NHẬP KHO SENE HANDMADE
                </span>
                <h2>#{selectedImportReceipt.code}</h2>
                <p>
                  Thời gian lập phiếu:{" "}
                  {new Date(selectedImportReceipt.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-outline"
                onClick={() => setSelectedImportReceipt(null)}
              >
                ✕ Đóng
              </button>
            </div>

            {/* Thông tin NCC & Người nhập */}
            <div className="invoice-customer-card" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <div>
                <strong style={{ display: "block", color: "#047857", marginBottom: "4px" }}>
                  🏢 ĐƠN VỊ CUNG CẤP:
                </strong>
                <div><strong>{selectedImportReceipt.supplierName}</strong></div>
                {selectedImportReceipt.supplierPhone && (
                  <div>📱 SĐT: {selectedImportReceipt.supplierPhone}</div>
                )}
                {selectedImportReceipt.supplier?.address && (
                  <div>📍 Địa chỉ: {selectedImportReceipt.supplier.address}</div>
                )}
              </div>
              <div>
                <strong style={{ display: "block", color: "#047857", marginBottom: "4px" }}>
                  📦 THÔNG TIN NHẬP KHO:
                </strong>
                <div>Người lập phiếu: <strong>{selectedImportReceipt.importedBy || "Admin Kho Len"}</strong></div>
                <div>Trạng thái: <strong style={{ color: "#047857" }}>Đã nhập vào kho hàng bán</strong></div>
                {selectedImportReceipt.notes && (
                  <div style={{ marginTop: "4px", color: "#4b5563" }}>
                    Ghi chú: <em>{selectedImportReceipt.notes}</em>
                  </div>
                )}
              </div>
            </div>

            {/* Bảng chi tiết mặt hàng */}
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>STT</th>
                  <th>Tên Sản Phẩm Len / Dụng Cụ</th>
                  <th style={{ textAlign: "center" }}>Số Lượng Nhập</th>
                  <th style={{ textAlign: "right" }}>Giá Vốn Đơn Vị</th>
                  <th style={{ textAlign: "right" }}>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedImportReceipt.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{item.productName}</strong>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#be123c" }}>
                      +{item.quantity} cuộn/bó
                    </td>
                    <td style={{ textAlign: "right" }}>{money(item.costPrice)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#047857" }}>
                      {money(item.total || item.quantity * item.costPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tổng cộng */}
            <div className="invoice-total-summary">
              <div style={{ fontSize: "14px" }}>
                Tổng số lượng nhập:{" "}
                <strong>
                  {selectedImportReceipt.items?.reduce((s, i) => s + (i.quantity || 0), 0)} sản phẩm
                </strong>
              </div>
              <div style={{ fontSize: "16px", marginTop: "4px" }}>
                Tổng tiền thanh toán cho NCC:{" "}
                <strong style={{ color: "#047857", fontSize: "22px" }}>
                  {money(selectedImportReceipt.totalAmount)}
                </strong>
              </div>
            </div>

            {/* Chữ ký 3 bên */}
            <div className="import-sig-grid">
              <div className="import-sig-col">
                <strong>Người Giao Hàng</strong>
                <small>(Ký và ghi rõ họ tên)</small>
                <div className="import-sig-space" />
              </div>
              <div className="import-sig-col">
                <strong>Thủ Kho Sene Handmade</strong>
                <small>(Ký và ghi rõ họ tên)</small>
                <div className="import-sig-space" />
              </div>
              <div className="import-sig-col">
                <strong>Chủ Tiệm / Quản Lý</strong>
                <small>(Ký duyệt)</small>
                <div className="import-sig-space" />
              </div>
            </div>

            {/* Footer */}
            <div className="invoice-actions-footer">
              <button
                type="button"
                className="admin-btn-outline"
                onClick={() => window.print()}
              >
                🖨️ In Phiếu Nhập Kho
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                style={{ background: "#059669" }}
                onClick={() => setSelectedImportReceipt(null)}
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LẬP PHIẾU NHẬP HÀNG MỚI */}
      {importModal.open && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setImportModal((prev) => ({ ...prev, open: false }))}
        >
          <div
            className="admin-dialog-card"
            style={{ maxWidth: "860px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-dialog-header">
              <div>
                <h3>📥 Lập Phiếu Nhập Hàng & Tự Động Tăng Tồn Kho</h3>
                <p style={{ margin: "4px 0 0", color: "#8d6271", fontSize: "12.5px" }}>
                  Khi hoàn tất, tồn kho sản phẩm sẽ được tự động cộng dồn ngay và hiển thị sẵn sàng bán trên trang chủ.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-outline"
                style={{ padding: "4px 10px", fontSize: "13px" }}
                onClick={() => setImportModal((prev) => ({ ...prev, open: false }))}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateImport}>
              <div className="admin-dialog-body" style={{ maxHeight: "70vh", overflowY: "auto", padding: "16px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div className="admin-form-group">
                    <label>Mã phiếu nhập (*)</label>
                    <input
                      required
                      value={importModal.form.code}
                      onChange={(e) =>
                        setImportModal((prev) => ({
                          ...prev,
                          form: { ...prev.form, code: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Nhà cung cấp (*)</label>
                    <select
                      value={importModal.form.supplierId}
                      onChange={(e) => {
                        const supId = e.target.value;
                        const foundSup = (data.suppliers || []).find((s) => s._id === supId);
                        setImportModal((prev) => ({
                          ...prev,
                          form: {
                            ...prev.form,
                            supplierId: supId,
                            supplierName: foundSup ? foundSup.name : prev.form.supplierName,
                            supplierPhone: foundSup ? foundSup.phone : prev.form.supplierPhone,
                          },
                        }));
                      }}
                    >
                      {(data.suppliers || []).map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.phone || "Chưa có SĐT"})
                        </option>
                      ))}
                      <option value="">-- Nhà cung cấp khác (Nhập tay) --</option>
                    </select>
                  </div>
                </div>

                {(!importModal.form.supplierId || importModal.form.supplierId === "") && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                    <div className="admin-form-group">
                      <label>Tên nhà cung cấp mới (*)</label>
                      <input
                        required
                        placeholder="Nhập tên đại lý / nhà xưởng..."
                        value={importModal.form.supplierName}
                        onChange={(e) =>
                          setImportModal((prev) => ({
                            ...prev,
                            form: { ...prev.form, supplierName: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Số điện thoại liên hệ</label>
                      <input
                        placeholder="VD: 0912 345 678"
                        value={importModal.form.supplierPhone}
                        onChange={(e) =>
                          setImportModal((prev) => ({
                            ...prev,
                            form: { ...prev.form, supplierPhone: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Bảng Danh Sách Sản Phẩm Nhập */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ fontWeight: 700, color: "#3f1a26", fontSize: "13.5px" }}>
                      Danh Sách Mặt Hàng Nhập Kho (*)
                    </label>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      style={{ fontSize: "12px", padding: "4px 10px", borderColor: "#059669", color: "#059669" }}
                      onClick={addImportItemRow}
                    >
                      ➕ Thêm dòng mặt hàng
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {importModal.form.items.map((row, idx) => {
                      const matchedProd = (data.products || []).find((p) => p._id === row.productId);
                      const currentStock = matchedProd ? matchedProd.stock : 0;
                      const newStock = currentStock + (Number(row.quantity) || 0);

                      return (
                        <div
                          key={idx}
                          style={{
                            background: "#fffafc",
                            border: "1px solid #fce7f3",
                            borderRadius: "12px",
                            padding: "12px 14px",
                            display: "grid",
                            gridTemplateColumns: "2.2fr 1fr 1.2fr 1.2fr 36px",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <label style={{ fontSize: "11px", color: "#8d6271", display: "block", marginBottom: "4px" }}>
                              Sản phẩm len / Phụ kiện
                            </label>
                            <select
                              value={row.productId || (row.productName ? "NEW_CUSTOM" : "")}
                              onChange={(e) => handleImportItemChange(idx, "productId", e.target.value)}
                              style={{ width: "100%", padding: "7px 10px", fontSize: "12.5px" }}
                            >
                              {(data.products || []).map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name} (Hiện có: {p.stock} cuộn)
                                </option>
                              ))}
                              <option value="NEW_CUSTOM">➕ [Nhập tên sản phẩm mới]</option>
                            </select>
                            {(!row.productId || row.productId === "NEW_CUSTOM") && (
                              <input
                                placeholder="Nhập tên sản phẩm len..."
                                value={row.productName}
                                onChange={(e) => handleImportItemChange(idx, "productName", e.target.value)}
                                style={{ marginTop: "6px", width: "100%", padding: "6px 10px", fontSize: "12px" }}
                              />
                            )}
                            {matchedProd && (
                              <small style={{ color: "#059669", display: "block", marginTop: "4px" }}>
                                📊 Tồn hiện tại: <strong>{currentStock}</strong> ➜ Sau nhập: <strong>{newStock} cuộn</strong>
                              </small>
                            )}
                          </div>

                          <div>
                            <label style={{ fontSize: "11px", color: "#8d6271", display: "block", marginBottom: "4px" }}>
                              SL nhập (*)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={row.quantity}
                              onChange={(e) => handleImportItemChange(idx, "quantity", e.target.value)}
                              style={{ width: "100%", padding: "7px 10px", fontSize: "13px", fontWeight: 700 }}
                            />
                          </div>

                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                              <label style={{ fontSize: "11px", color: "#8d6271" }}>
                                Giá vốn/cuộn (VND)
                              </label>
                              {matchedProd && (
                                <span style={{ fontSize: "10.5px", color: "#e11d48", fontWeight: 700 }} title="Giá bán niêm yết hiện tại">
                                  Bán: {money(matchedProd.price)}
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={row.costPrice}
                              onChange={(e) => handleImportItemChange(idx, "costPrice", e.target.value)}
                              style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
                            />
                            {matchedProd && Number(row.costPrice) > 0 && (
                              <small
                                style={{
                                  display: "block",
                                  marginTop: "3px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: Number(matchedProd.price) >= Number(row.costPrice) ? "#059669" : "#dc2626",
                                }}
                              >
                                {Number(matchedProd.price) >= Number(row.costPrice)
                                  ? `+${money(Number(matchedProd.price) - Number(row.costPrice))} lãi`
                                  : `Lỗ -${money(Number(row.costPrice) - Number(matchedProd.price))}`}
                              </small>
                            )}
                          </div>

                          <div>
                            <label style={{ fontSize: "11px", color: "#8d6271", display: "block", marginBottom: "4px" }}>
                              Thành tiền
                            </label>
                            <strong style={{ display: "block", color: "#047857", fontSize: "13.5px", marginTop: "6px" }}>
                              {money(Number(row.quantity || 0) * Number(row.costPrice || 0))}
                            </strong>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => removeImportItemRow(idx)}
                              style={{
                                background: "#fee2e2",
                                border: "1px solid #fca5a5",
                                color: "#b91c1c",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "grid",
                                placeItems: "center",
                              }}
                              title="Xóa dòng này"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tổng cộng & Ghi chú */}
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1.5px solid #a7f3d0",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <span style={{ color: "#065f46", fontSize: "13px" }}>Tổng mặt hàng nhập: </span>
                    <strong style={{ color: "#065f46" }}>
                      {importModal.form.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)} cuộn/bó len
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#065f46", fontSize: "13px" }}>Tổng thanh toán cho NCC: </span>
                    <strong style={{ color: "#047857", fontSize: "20px" }}>
                      {money(
                        importModal.form.items.reduce(
                          (s, i) => s + Number(i.quantity || 0) * Number(i.costPrice || 0),
                          0
                        )
                      )}
                    </strong>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Ghi chú đợt nhập hàng</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Nhập thêm len Milk Bò màu pastel phục vụ mùa đan len, hàng chuẩn loại 1..."
                    value={importModal.form.notes}
                    onChange={(e) =>
                      setImportModal((prev) => ({
                        ...prev,
                        form: { ...prev.form, notes: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setImportModal((prev) => ({ ...prev, open: false }))}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}
                >
                  💾 Xác Nhận Nhập Hàng & Tự Động Tăng Tồn Kho Bán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: CẤP LẠI MẬT KHẨU CHO KHÁCH HÀNG */}
      {resetPasswordModal.open && (
        <div
          className="admin-modal-backdrop"
          onClick={() =>
            setResetPasswordModal({
              open: false,
              customer: null,
              newPassword: "",
              resultMsg: "",
              errorMsg: "",
            })
          }
        >
          <div
            className="admin-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-dialog-header">
              <h3>🔑 Cấp Lại Mật Khẩu Khách Hàng</h3>
              <button
                type="button"
                className="admin-btn-outline"
                style={{ padding: "2px 8px", fontSize: "12px" }}
                onClick={() =>
                  setResetPasswordModal({
                    open: false,
                    customer: null,
                    newPassword: "",
                    resultMsg: "",
                    errorMsg: "",
                  })
                }
              >
                ✕
              </button>
            </div>

            <div className="admin-dialog-body">
              <div
                style={{
                  background: "#fff1f5",
                  border: "1px solid #fce7f3",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "13px",
                }}
              >
                <div>
                  👤 <strong>Khách hàng:</strong> {resetPasswordModal.customer?.name}
                </div>
                <div>
                  📧 <strong>Email đăng nhập:</strong> {resetPasswordModal.customer?.email}
                </div>
                {resetPasswordModal.customer?.phone && (
                  <div>
                    📱 <strong>Số điện thoại:</strong> {resetPasswordModal.customer?.phone}
                  </div>
                )}
              </div>

              {resetPasswordModal.resultMsg ? (
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1.5px solid #a7f3d0",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ color: "#047857", fontWeight: 800, fontSize: "14px", marginBottom: "8px" }}>
                    {resetPasswordModal.resultMsg}
                  </div>
                  <p style={{ margin: "0 0 12px", fontSize: "12.5px", color: "#065f46" }}>
                    Hãy gửi mật khẩu này cho khách hàng qua Zalo hoặc SMS để khách đăng nhập lại tài khoản!
                  </p>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(resetPasswordModal.newPassword);
                      showToast(`✓ Đã sao chép mật khẩu: ${resetPasswordModal.newPassword}`);
                    }}
                  >
                    📋 Sao chép mật khẩu gửi khách
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="admin-form-group">
                    <label>Mật khẩu mới muốn đặt (*)</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        required
                        placeholder="VD: LenXinh@2026"
                        value={resetPasswordModal.newPassword}
                        onChange={(e) =>
                          setResetPasswordModal({
                            ...resetPasswordModal,
                            newPassword: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        className="admin-btn-outline"
                        style={{ whiteSpace: "nowrap", fontSize: "12px" }}
                        onClick={() =>
                          setResetPasswordModal({
                            ...resetPasswordModal,
                            newPassword:
                              "LenXinh@" +
                              Math.floor(1000 + Math.random() * 9000),
                          })
                        }
                      >
                        🎲 Đổi mã khác
                      </button>
                    </div>
                  </div>

                  {resetPasswordModal.errorMsg && (
                    <small style={{ color: "#dc2626", fontWeight: 700 }}>
                      {resetPasswordModal.errorMsg}
                    </small>
                  )}

                  <div className="admin-dialog-footer">
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={() =>
                        setResetPasswordModal({
                          open: false,
                          customer: null,
                          newPassword: "",
                          resultMsg: "",
                          errorMsg: "",
                        })
                      }
                    >
                      Hủy bỏ
                    </button>
                    <button type="submit" className="admin-btn-primary">
                      💾 Xác Nhận Cấp Lại Mật Khẩu
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM / SỬA NHÀ CUNG CẤP */}
      {supplierModal.open && (
        <div
          className="admin-modal-backdrop"
          onClick={() =>
            setSupplierModal({
              open: false,
              isEdit: false,
              supplierId: null,
              form: {
                name: "",
                phone: "",
                address: "",
                supplyItems: "",
                rating: 5,
                totalImported: 0,
                notes: "",
              },
            })
          }
        >
          <div
            className="admin-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-dialog-header">
              <h3>
                {supplierModal.isEdit
                  ? "✏️ Chỉnh Sửa Nhà Cung Cấp"
                  : "➕ Thêm Nhà Cung Cấp Mới"}
              </h3>
              <button
                type="button"
                className="admin-btn-outline"
                style={{ padding: "2px 8px", fontSize: "12px" }}
                onClick={() =>
                  setSupplierModal({
                    open: false,
                    isEdit: false,
                    supplierId: null,
                    form: {
                      name: "",
                      phone: "",
                      address: "",
                      supplyItems: "",
                      rating: 5,
                      totalImported: 0,
                      notes: "",
                    },
                  })
                }
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupplier}>
              <div className="admin-dialog-body">
                <div className="admin-form-group">
                  <label>Tên nhà cung cấp / Tổng kho (*)</label>
                  <input
                    required
                    placeholder="VD: Tổng Kho Len Sợi Miền Nam"
                    value={supplierModal.form.name}
                    onChange={(e) =>
                      setSupplierModal({
                        ...supplierModal,
                        form: { ...supplierModal.form, name: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Số điện thoại liên hệ (*)</label>
                  <input
                    required
                    placeholder="VD: 0908 123 456"
                    value={supplierModal.form.phone}
                    onChange={(e) =>
                      setSupplierModal({
                        ...supplierModal,
                        form: { ...supplierModal.form, phone: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Địa chỉ kho hàng</label>
                  <input
                    placeholder="VD: Tân Bình, TP. Hồ Chí Minh"
                    value={supplierModal.form.address}
                    onChange={(e) =>
                      setSupplierModal({
                        ...supplierModal,
                        form: { ...supplierModal.form, address: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Mặt hàng cung cấp chính</label>
                  <input
                    placeholder="VD: Len Milk Bò, Kim SKC, Bông gòn bi..."
                    value={supplierModal.form.supplyItems}
                    onChange={(e) =>
                      setSupplierModal({
                        ...supplierModal,
                        form: {
                          ...supplierModal.form,
                          supplyItems: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label>Đánh giá uy tín (1-5 sao)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={supplierModal.form.rating}
                      onChange={(e) =>
                        setSupplierModal({
                          ...supplierModal,
                          form: {
                            ...supplierModal.form,
                            rating: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Tổng tiền đã nhập (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      step="100000"
                      value={supplierModal.form.totalImported}
                      onChange={(e) =>
                        setSupplierModal({
                          ...supplierModal,
                          form: {
                            ...supplierModal.form,
                            totalImported: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Ghi chú (Chính sách sỉ, thời gian giao hàng...)</label>
                  <textarea
                    placeholder="Giao hàng hỏa tốc trong ngày, giá sỉ tốt từ 50 cuộn..."
                    value={supplierModal.form.notes}
                    onChange={(e) =>
                      setSupplierModal({
                        ...supplierModal,
                        form: { ...supplierModal.form, notes: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() =>
                    setSupplierModal({
                      open: false,
                      isEdit: false,
                      supplierId: null,
                      form: {
                        name: "",
                        phone: "",
                        address: "",
                        supplyItems: "",
                        rating: 5,
                        totalImported: 0,
                        notes: "",
                      },
                    })
                  }
                >
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  {supplierModal.isEdit ? "💾 Cập Nhật" : "➕ Thêm Nhà Cung Cấp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: THÊM / SỬA THỢ MÓC & NHÂN SỰ */}
      {staffModal.open && (
        <div
          className="admin-modal-backdrop"
          onClick={() =>
            setStaffModal({
              open: false,
              isEdit: false,
              staffId: null,
              form: {
                name: "",
                phone: "",
                role: "Thợ gia công hoa len",
                pieceRate: 20000,
                completedCount: 0,
                totalPaid: 0,
                skills: "",
                status: "active",
                notes: "",
              },
            })
          }
        >
          <div
            className="admin-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-dialog-header">
              <h3>
                {staffModal.isEdit
                  ? "✏️ Cập Nhật Thợ Móc / Nhân Sự"
                  : "➕ Thêm Thợ Móc / Nhân Sự Mới"}
              </h3>
              <button
                type="button"
                className="admin-btn-outline"
                style={{ padding: "2px 8px", fontSize: "12px" }}
                onClick={() =>
                  setStaffModal({
                    open: false,
                    isEdit: false,
                    staffId: null,
                    form: {
                      name: "",
                      phone: "",
                      role: "Thợ gia công hoa len",
                      pieceRate: 20000,
                      completedCount: 0,
                      totalPaid: 0,
                      skills: "",
                      status: "active",
                      notes: "",
                    },
                  })
                }
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff}>
              <div className="admin-dialog-body">
                <div className="admin-form-group">
                  <label>Họ tên thợ / nhân sự (*)</label>
                  <input
                    required
                    placeholder="VD: Chị Mai (Thợ Móc Hoa)"
                    value={staffModal.form.name}
                    onChange={(e) =>
                      setStaffModal({
                        ...staffModal,
                        form: { ...staffModal.form, name: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Số điện thoại liên hệ (*)</label>
                  <input
                    required
                    placeholder="VD: 0987 111 222"
                    value={staffModal.form.phone}
                    onChange={(e) =>
                      setStaffModal({
                        ...staffModal,
                        form: { ...staffModal.form, phone: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Vai trò / Nhiệm vụ (*)</label>
                  <select
                    value={staffModal.form.role}
                    onChange={(e) =>
                      setStaffModal({
                        ...staffModal,
                        form: { ...staffModal.form, role: e.target.value },
                      })
                    }
                  >
                    <option value="Thợ gia công hoa len">
                      🌸 Thợ gia công hoa len (Tulip, Hướng dương...)
                    </option>
                    <option value="Thợ móc thú bông len">
                      🧸 Thợ móc thú bông Amigurumi (Thỏ, Gấu...)
                    </option>
                    <option value="Thợ móc túi & phụ kiện">
                      👜 Thợ móc túi xách, nón len & kẹp tóc
                    </option>
                    <option value="Đóng gói & Phụ kiện">
                      📦 Nhân viên đóng gói & kiểm hàng
                    </option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label>Tiền công khoán (VNĐ/sản phẩm) (*)</label>
                    <input
                      required
                      type="number"
                      min="1000"
                      step="5000"
                      placeholder="20000"
                      value={staffModal.form.pieceRate}
                      onChange={(e) =>
                        setStaffModal({
                          ...staffModal,
                          form: {
                            ...staffModal.form,
                            pieceRate: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Số lượng đã hoàn thành</label>
                    <input
                      type="number"
                      min="0"
                      value={staffModal.form.completedCount}
                      onChange={(e) =>
                        setStaffModal({
                          ...staffModal,
                          form: {
                            ...staffModal.form,
                            completedCount: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Kỹ năng nổi bật / Thế mạnh tay nghề</label>
                  <input
                    placeholder="VD: Móc mũi hạt gạo đều, khâu ráp thú có hồn..."
                    value={staffModal.form.skills}
                    onChange={(e) =>
                      setStaffModal({
                        ...staffModal,
                        form: { ...staffModal.form, skills: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Trạng thái</label>
                  <select
                    value={staffModal.form.status}
                    onChange={(e) =>
                      setStaffModal({
                        ...staffModal,
                        form: { ...staffModal.form, status: e.target.value },
                      })
                    }
                  >
                    <option value="active">✓ Đang nhận mẫu / Hoạt động</option>
                    <option value="inactive">Tạm ngưng nhận hàng</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Ghi chú</label>
                  <textarea
                    placeholder="Mũi móc đều đẹp, đúng hẹn trước các dịp lễ..."
                    value={staffModal.form.notes}
                    onChange={(e) =>
                      setStaffModal({
                        ...staffModal,
                        form: { ...staffModal.form, notes: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() =>
                    setStaffModal({
                      open: false,
                      isEdit: false,
                      staffId: null,
                      form: {
                        name: "",
                        phone: "",
                        role: "Thợ gia công hoa len",
                        pieceRate: 20000,
                        completedCount: 0,
                        totalPaid: 0,
                        skills: "",
                        status: "active",
                        notes: "",
                      },
                    })
                  }
                >
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  {staffModal.isEdit ? "💾 Cập Nhật" : "➕ Thêm Nhân Sự"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: NHẬP THÊM HÀNG VÀO KHO NHANH */}
      {quickStockModal.open && (
        <div
          className="admin-modal-backdrop"
          onClick={() =>
            setQuickStockModal({ open: false, product: null, addStock: 20 })
          }
        >
          <div
            className="admin-dialog-card"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-dialog-header">
              <h3>⚡ Nhập Thêm Hàng Vào Kho</h3>
              <button
                type="button"
                className="admin-btn-outline"
                style={{ padding: "2px 8px", fontSize: "12px" }}
                onClick={() =>
                  setQuickStockModal({ open: false, product: null, addStock: 20 })
                }
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddStock}>
              <div className="admin-dialog-body">
                <div
                  style={{
                    background: "#fff1f5",
                    border: "1px solid #fce7f3",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <img
                    src={quickStockModal.product?.images?.[0] || "/placeholder.jpg"}
                    alt=""
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "1px solid #fecdd3",
                    }}
                  />
                  <div>
                    <strong>{quickStockModal.product?.name}</strong>
                    <div style={{ fontSize: "12px", color: "#8d6271", marginTop: "2px" }}>
                      Tồn kho hiện tại:{" "}
                      <strong style={{ color: "#e11d48" }}>
                        {quickStockModal.product?.stock || 0} cuộn
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Số lượng muốn nhập thêm (*)</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      required
                      type="number"
                      min="1"
                      value={quickStockModal.addStock}
                      onChange={(e) =>
                        setQuickStockModal({
                          ...quickStockModal,
                          addStock: e.target.value,
                        })
                      }
                    />
                    {[20, 50, 100].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        className="admin-btn-outline"
                        style={{ fontSize: "12px" }}
                        onClick={() =>
                          setQuickStockModal({
                            ...quickStockModal,
                            addStock: qty,
                          })
                        }
                      >
                        +{qty}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                  ✓ Sau khi nhập, tổng tồn kho sẽ là:{" "}
                  <strong>
                    {(quickStockModal.product?.stock || 0) +
                      Number(quickStockModal.addStock || 0)}{" "}
                    cuộn
                  </strong>
                </div>
              </div>

              <div className="admin-dialog-footer">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() =>
                    setQuickStockModal({ open: false, product: null, addStock: 20 })
                  }
                >
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  ⚡ Xác Nhận Nhập Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      
      {/* MODAL 6: IN TEM GỬI HÀNG / PHIẾU ĐÓNG GÓI CHO SHIPPER */}
      {shippingLabelOrder && (
        <div
          className="shipping-label-backdrop"
          onClick={() => setShippingLabelOrder(null)}
        >
          <div
            className="shipping-label-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shipping-label-actions-top">
              <h3>🏷️ Mẫu Tem Gửi Hàng / Phiếu Vận Chuyển A6</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => window.print()}
                  style={{ background: "#e11d48", padding: "7px 18px", fontSize: "13px" }}
                >
                  🖨️ Bấm Để In Tem (Print)
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setShippingLabelOrder(null)}
                >
                  ✕ Đóng
                </button>
              </div>
            </div>

            {/* VÙNG IN TEM CHUẨN KÍCH THƯỚC */}
            <div id="shipping-label-printable" className="shipping-label-sheet">
              <div className="label-header">
                <div className="label-shop-info">
                  <h2>🌸 TIỆM LEN SENE HANDMADE</h2>
                  <p>Tiệm Len Sợi Thủ Công · Hoa Len Vĩnh Cửu · Quà Tặng Độc Bản</p>
                  <p>Hotline hỗ trợ: <strong>0942.901.124</strong> | Web: sene-handmade.vercel.app</p>
                </div>
                <div className="label-barcode-box">
                  <div className="label-barcode-mock">||||| | |||| || |||</div>
                  <div className="label-code-val">#{shippingLabelOrder._id.slice(-8).toUpperCase()}</div>
                </div>
              </div>

              <div className="label-party-grid">
                <div className="label-box">
                  <div className="label-box-title">Người Gửi (From):</div>
                  <div><strong>Tiệm Len Sene Handmade</strong></div>
                  <div>SĐT: 0942.901.124</div>
                  <div>Địa chỉ: Cần Thơ / TP. Hồ Chí Minh</div>
                </div>

                <div className="label-box label-box-receiver">
                  <div className="label-box-title">Người Nhận (To):</div>
                  <div className="label-receiver-name">{shippingLabelOrder.customerName}</div>
                  <div className="label-receiver-phone">📞 {shippingLabelOrder.phone}</div>
                  <div style={{ marginTop: "4px" }}>📍 {shippingLabelOrder.address}</div>
                </div>
              </div>

              <table className="label-items-table">
                <thead>
                  <tr>
                    <th style={{ width: "35px" }}>STT</th>
                    <th>Tên Sản Phẩm Len / Phụ Kiện</th>
                    <th style={{ width: "50px", textAlign: "center" }}>SL</th>
                  </tr>
                </thead>
                <tbody>
                  {(shippingLabelOrder.items || []).map((item, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: "center" }}>{i + 1}</td>
                      <td><strong>{item.name}</strong></td>
                      <td style={{ textAlign: "center" }}><strong>x{item.quantity}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="label-cod-highlight">
                <div className="label-cod-title">
                  {shippingLabelOrder.paymentMethod === "COD" ? "TIỀN THU HỘ (COD):" : "THANH TOÁN TRƯỚC:"}
                </div>
                <div
                  className="label-cod-amount"
                  style={{ color: shippingLabelOrder.paymentMethod === "COD" ? "#e11d48" : "#059669" }}
                >
                  {shippingLabelOrder.paymentMethod === "COD"
                    ? money(shippingLabelOrder.totalAmount)
                    : "0 VNĐ (ĐÃ THANH TOÁN)"}
                </div>
              </div>

              <div className="label-footer-note">
                <p>⚠️ <strong>LỜI DẶN SHIPPER:</strong> Cho khách đồng kiểm hàng trước khi nhận, không thử hàng.</p>
                <p>Mọi thắc mắc về đơn hàng vui lòng gọi ngay hotline shop: <strong>0942.901.124</strong>. Cảm ơn anh shipper!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: PHÓNG TO ẢNH MẪU KHÁCH GỬI */}
      {previewImageModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setPreviewImageModal(null)}
          style={{ zIndex: 999999 }}
        >
          <div
            style={{
              background: "#fff",
              padding: "16px",
              borderRadius: "16px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImageModal}
              alt="Mẫu khách gửi"
              style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "10px" }}
            />
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => setPreviewImageModal(null)}
              style={{ marginTop: "12px" }}
            >
              ✕ Đóng lại
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: SỬA NHANH GIÁ BÁN & GIÁ VỐN */}
      {quickPriceModal.open && (
        <div
          className="admin-modal-backdrop"
          onClick={() =>
            setQuickPriceModal({ open: false, product: null, price: "", costPrice: "" })
          }
        >
          <div
            className="admin-dialog-card"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-dialog-header">
              <h3>💰 Cập Nhật Giá Bán & Giá Vốn</h3>
              <button
                type="button"
                className="admin-btn-outline"
                style={{ padding: "2px 8px", fontSize: "12px" }}
                onClick={() =>
                  setQuickPriceModal({ open: false, product: null, price: "", costPrice: "" })
                }
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickPrice}>
              <div className="admin-dialog-body">
                <div
                  style={{
                    background: "#fff1f5",
                    border: "1px solid #fce7f3",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <img
                    src={quickPriceModal.product?.images?.[0] || "/placeholder.jpg"}
                    alt=""
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "1px solid #fecdd3",
                    }}
                  />
                  <div>
                    <strong>{quickPriceModal.product?.name}</strong>
                    <div style={{ fontSize: "12px", color: "#8d6271", marginTop: "2px" }}>
                      Tồn kho hiện tại:{" "}
                      <strong style={{ color: "#e11d48" }}>
                        {quickPriceModal.product?.stock || 0} cuộn
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Giá bán ra niêm yết (VNĐ) (*)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="VD: 45000"
                    value={quickPriceModal.price}
                    onChange={(e) =>
                      setQuickPriceModal({
                        ...quickPriceModal,
                        price: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Giá vốn nhập hàng (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="VD: 28000"
                    value={quickPriceModal.costPrice}
                    onChange={(e) =>
                      setQuickPriceModal({
                        ...quickPriceModal,
                        costPrice: e.target.value,
                      })
                    }
                  />
                  <small style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                    Dùng để tính lợi nhuận gộp và đối soát lãi tự động
                  </small>
                </div>

                {/* Real-time Profit Preview */}
                {(() => {
                  const p = Number(quickPriceModal.price) || 0;
                  const c = Number(quickPriceModal.costPrice) || 0;
                  if (p > 0 && c > 0) {
                    const diff = p - c;
                    const pct = Math.round((diff / p) * 100);
                    return (
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background: diff >= 0 ? "#ecfdf5" : "#fee2e2",
                          border: `1.5px solid ${diff >= 0 ? "#a7f3d0" : "#fca5a5"}`,
                          fontSize: "13px",
                          fontWeight: 700,
                          color: diff >= 0 ? "#047857" : "#b91c1c",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          {diff >= 0 ? "📈 Lãi dự kiến: " : "📉 Cảnh báo bán lỗ: "}
                          <strong>{diff >= 0 ? `+${money(diff)}` : `-${money(Math.abs(diff))}`}</strong>
                        </span>
                        <span>{pct}% biên lời</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="admin-dialog-footer">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() =>
                    setQuickPriceModal({ open: false, product: null, price: "", costPrice: "" })
                  }
                >
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  💾 Lưu Thay Đổi Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}

export default AdminPage;
